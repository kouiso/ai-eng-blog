# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事に載せた実行結果が run/ のログから機械的に取り出したものと一致することを調べる。
# 使い方: python3 logs/mcp-server-typescript-stdio/lint/check-code-and-outputs.py（リポジトリのルートで）
import re

L = "logs/mcp-server-typescript-stdio/"
article = open("content/articles/mcp-server-typescript-stdio.md", encoding="utf-8").read()
fences = [b for _, b in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)]

def blocks(n):
    t = open(L + f"run/{n}.log", encoding="utf-8").read()
    return re.findall(r"^command: ([^\n]*)\n----- stdout\+stderr -----\n(.*?)\n----- exit=(\d+) -----", t, re.M | re.S)

def out(n, cmd):
    return next(o for c, o, e in blocks(n) if c == cmd).strip("\n")

ok = True
for f in ["package.json", "tsconfig.json", "src/server.ts", "src/check.ts", "compare.mjs"]:
    code = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    hit = code in fences
    ok &= hit
    print(f"code {f}: {hit}")
checks = {
    "13 npm install": out(13, "npm install"),
    "14 npm run check": out(14, "npm run check"),
    "15 node compare.mjs": out(15, "node compare.mjs"),
    "17 npm run check (console.log)": out(17, "npm run check"),
    "lead ok line (14)": next(l for l in out(14, "npm run check").split("\n") if l.startswith("ok:")),
}
for name, text in checks.items():
    hit = text in fences
    ok &= hit
    print(f"output {name}: {hit}")
# 記事は run/20 の claude mcp の結果を、コマンド（bash ブロック）と出力（text ブロック）の組で載せる
for c, o, e in blocks(20):
    hit = c in fences and o.strip("\n") in fences
    ok &= hit
    print(f"output run/20 {c!r} command+output in article: {hit}")
same = out(19, "npm run check") == out(14, "npm run check")
ok &= same
print(f"19 (reverted) check output == 14: {same}")
print("ALL OK" if ok else "MISMATCH")
