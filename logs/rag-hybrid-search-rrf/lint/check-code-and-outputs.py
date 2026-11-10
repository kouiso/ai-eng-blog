# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事に載せた実行結果が run/ のログから機械的に取り出したものと一致することを調べる。
# logs/rag-bm25-search-typescript/lint/check-code-and-outputs.py を、この記事のファイル名と
# ログの書式（code/extra/run.sh の出力。空白を含む引数は "" でくくって記録）に合わせて書き換えたもの。
# 使い方: python3 logs/rag-hybrid-search-rrf/lint/check-code-and-outputs.py（リポジトリのルートで）
import re

L = "logs/rag-hybrid-search-rrf/"
article = open("content/articles/rag-hybrid-search-rrf.md", encoding="utf-8").read()
fences = [b for _, b in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)]

def run(n):
    t = open(L + f"run/{n:02d}.log", encoding="utf-8").read()
    cmd = re.search(r"^command: (.*)$", t, re.M).group(1)
    code = re.search(r"^exit: (\d+)$", t, re.M).group(1)
    out = t.split("--- stdout+stderr ---\n", 1)[1].rstrip("\n")
    return cmd, out, code

ok = True
files = ["package.json", "tokenize.ts", "bm25.ts", "docs.ts", "embed.ts", "vector-search.ts", "rrf.ts", "hybrid.ts"]
for f in files:
    code = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    hit = code in fences
    ok &= hit
    print(f"code {f}: {hit}")

# 記事のコードブロックのうち、ts/json はすべて code/ のどれかと一致するか（記事にだけあるコードが無いか）
codes = {open(L + "code/" + f, encoding="utf-8").read().rstrip("\n") for f in files}
for lang, body in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S):
    if lang in ("ts", "json"):
        hit = body in codes
        ok &= hit
        print(f"fence {lang} {body.splitlines()[0][:40]!r} in code/: {hit}")

cmds = {3: "npm install", 6: "node hybrid.ts 利用限度額", 8: "node hybrid.ts 5営業日",
        9: 'node hybrid.ts "E1021 が出た"', 10: "node hybrid.ts 届くのが遅い",
        11: "node hybrid.ts 届くのが遅い 0.1 1", 12: "node hybrid.ts 届くのが遅い 0.7",
        16: "node hybrid.ts 返金はいつ？", 17: "node hybrid.ts 返金はいつ？ 0"}
hit = "mkdir hybrid-search\ncd hybrid-search" in fences
ok &= hit
print(f"command 'mkdir hybrid-search / cd hybrid-search' in article: {hit}")
print(f"run/01.log command: {run(1)[0]}")
for n, cmd in cmds.items():
    in_article = cmd in fences
    logged = run(n)[0]
    same = cmd == logged
    ok &= in_article and same
    print(f"run/{n:02d}.log command in article: {in_article}, matches log: {same} ({logged})")

# 3行の bash ブロック（下限 0.7 で前の3つの質問を実行し直す）は、1行ずつ run/13〜15.log のコマンドと同じか
multi = {13: "node hybrid.ts 利用限度額 0.7", 14: "node hybrid.ts 5営業日 0.7", 15: 'node hybrid.ts "E1021 が出た" 0.7'}
block = "\n".join(multi.values())
hit = block in fences
ok &= hit
print(f"3-line bash block in article: {hit}")
for n, cmd in multi.items():
    same = run(n)[0] == cmd
    ok &= same
    print(f"run/{n:02d}.log command matches block line: {same} ({run(n)[0]})")

for n in [6, 8, 9, 10, 11, 12, 16, 17]:
    hit = run(n)[1] in fences
    ok &= hit
    print(f"output run/{n:02d}.log in article: {hit}")

# 表「下限 0.1 の上位3件／下限 0.7 の上位3件」の各行が、ログの合わせた上位3件の id と一致するか
def top3(n):
    return [l.split()[1] for l in run(n)[1].splitlines() if re.match(r"^\d\.\d{5} ", l)]
rows = {"利用限度額": (6, 13), "5営業日": (8, 14), "E1021 が出た": (9, 15)}
for q, (a, b) in rows.items():
    m = re.search(r"^\| " + re.escape(q) + r" \| (.*?) \| (.*?) \|$", article, re.M)
    cells = [[x.strip("`") for x in c.split("、")] for c in m.groups()] if m else None
    same = cells == [top3(a), top3(b)]
    ok &= same
    print(f"table row {q}: {same} (log {top3(a)} / {top3(b)})")
for n in range(1, 24):
    print(f"run {n:02d} exit={run(n)[2]}")
print("ALL OK" if ok else "MISMATCH")
