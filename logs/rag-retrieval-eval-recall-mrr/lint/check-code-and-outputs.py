# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事のコマンドが記事にあり、ログのコマンドと同じ引数であること、
# 記事に載せた実行結果が run/ のログから機械的に取り出したものと一致することを調べる。
# logs/rag-bm25-search-typescript/lint/check-code-and-outputs.py を、この記事のファイル名と
# ログの書式（code/extra/run.sh の出力）に合わせて書き換えたもの。
# 使い方: python3 logs/rag-retrieval-eval-recall-mrr/lint/check-code-and-outputs.py（リポジトリのルートで）
# 2026-11-10: 環境変数 RUN_DIR でログを読むフォルダを替えられるようにした（既定は run/）。
# CASES_REC=skip のときは run/cases-written-at.txt との比較をせず、cases.ts の今の sha256 と、
# git の HEAD から cases.ts が変わっていないかだけを出す。
import hashlib, os, re, subprocess

L = "logs/rag-retrieval-eval-recall-mrr/"
article = open("content/articles/rag-retrieval-eval-recall-mrr.md", encoding="utf-8").read()
RUN = os.environ.get("RUN_DIR", L + "run/").rstrip("/") + "/"
fences = [b for _, b in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)]

def run(n):
    t = open(RUN + f"{n:02d}.log", encoding="utf-8").read()
    cmd = re.search(r"^command: (.*)$", t, re.M).group(1)
    code = re.search(r"^exit: (\d+)$", t, re.M).group(1)
    out = t.split("--- stdout+stderr ---\n", 1)[1].rstrip("\n")
    return cmd, out, code

ok = True
files = ["package.json", "metrics.ts", "check-metrics.ts", "cases.ts", "tokenize.ts", "bm25.ts",
         "docs.ts", "embed.ts", "vector-search.ts", "rrf.ts", "eval.ts"]
for f in files:
    code = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    hit = code in fences
    ok &= hit
    print(f"code {f}: {hit}")

# cases.ts が、検索器を動かす前に記録したハッシュから変わっていないこと
now = hashlib.sha256(open(L + "code/cases.ts", "rb").read()).hexdigest()
if os.environ.get("CASES_REC") == "skip":
    clean = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", L + "code/cases.ts"]).returncode == 0
    ok &= clean
    print(f"cases.ts sha256 now: {now} (comparison with run/cases-written-at.txt skipped)")
    print(f"cases.ts unchanged since git HEAD: {clean}")
else:
    rec = open(L + "run/cases-written-at.txt", encoding="utf-8").read().split()[3]
    ok &= rec == now
    print(f"cases.ts sha256 unchanged since run/cases-written-at.txt: {rec == now}")

# 記事のコマンド → ログの番号とログに残るコマンド
cmds = [("mkdir retrieval-eval\ncd retrieval-eval", None, None),
        ("npm install", 3, "npm install"),
        ("node check-metrics.ts", 6, "node check-metrics.ts"),
        ("node eval.ts", 8, "node eval.ts"),
        ("node eval.ts 1 | tail -n 4", 18, 'bash -c "node eval.ts 1 | tail -n 4"'),
        ("node eval.ts 5 | tail -n 4", 19, 'bash -c "node eval.ts 5 | tail -n 4"'),
        ("node eval.ts 3 0", 12, "node eval.ts 3 0")]
for cmd, n, logged in cmds:
    hit = cmd in fences
    ok &= hit
    print(f"command '{cmd.splitlines()[0]}' in article: {hit}")
    if n is not None:
        same = run(n)[0] == logged
        ok &= same
        print(f"  run/{n:02d}.log command matches: {same} ({run(n)[0]})")

for n in [6, 8, 18, 19, 12]:
    hit = run(n)[1] in fences
    ok &= hit
    print(f"output run/{n:02d}.log in article: {hit}")

# オフラインの再実行（run/16.log）の出力が、オンラインの実行と同じこと
off = run(16)[1]
for n, label in [(6, "node check-metrics.ts"), (8, "node eval.ts"), (10, "node eval.ts 1"), (11, "node eval.ts 5"), (12, "node eval.ts 3 0")]:
    block = off.split(f"$ {label}\n", 1)[1].split("\nexit=", 1)[0]
    same = block == run(n)[1]
    ok &= same
    print(f"offline output of '{label}' equals run/{n:02d}.log: {same}")

# 記事に載せた末尾4行（run/18, 19）が、全部を出した実行（run/10, 11）の末尾4行と同じこと
for a, b in [(18, 10), (19, 11)]:
    same = run(a)[1] == "\n".join(run(b)[1].splitlines()[-4:])
    ok &= same
    print(f"run/{a:02d}.log equals last 4 lines of run/{b:02d}.log: {same}")

for n in range(1, 23):
    print(f"run {n:02d} exit={run(n)[2]}" if n != 20 else f"run 20 exit={re.search(r'^exit: (\d+)$', open(RUN + '20.log', encoding='utf-8').read(), re.M).group(1)}")
print("ALL OK" if ok else "MISMATCH")
