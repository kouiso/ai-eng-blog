# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事に載せた実行結果が run/ のログの出力部分（"--- stdout+stderr ---" の後ろ）と一致することを調べる。
# 使い方: python3 logs/llm-api-cost-estimate-js-tiktoken/lint/check-code-and-outputs.py（リポジトリのルートで）
import re

L = "logs/llm-api-cost-estimate-js-tiktoken/"
article = open("content/articles/llm-api-cost-estimate-js-tiktoken.md", encoding="utf-8").read()
fences = [b for _, b in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)]

def log(n):
    t = open(L + f"run/{n}.log", encoding="utf-8").read()
    head, out = t.split("--- stdout+stderr ---\n", 1)
    cmd = re.search(r"^command: (.*)$", head, re.M).group(1)
    code = re.search(r"^exit: (\d+)$", head, re.M).group(1)
    return cmd, code, out.strip("\n")

ok = True
for f in ["package.json", "count.ts", "estimate.ts", "unknown-model.ts"]:
    code = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    hit = code in fences
    ok &= hit
    print(f"code {f}: {hit}")
# 2026-11-10 の再実行（run/10〜17）を照合する。01〜09 は 2026-10-31 の実行で、記録として残している。
expect = {"10": "mkdir token-cost-estimate", "11": "npm install", "12": "node count.ts",
          "13": "node estimate.ts", "14": "node unknown-model.ts"}
for n, cmd in expect.items():
    c, e, out = log(n)
    same_cmd = c == cmd and e == "0"
    ok &= same_cmd
    print(f"run {n} command == article command ({cmd}) and exit 0: {same_cmd}")
    if n != "10":
        hit = out in fences
        ok &= hit
        print(f"  output of run {n} appears verbatim in article: {hit}")
lead = log("13")[2].split("\n")[0]
hit = lead in fences
ok &= hit
print(f"lead line (run 13 first line) in article: {hit}")
off = log("17")[2]
same_offline = all(log(n)[2] in off for n in ["12", "13", "14"]) and "network: unreachable" in off
ok &= same_offline
print(f"run 17 (no network) reproduces 12/13/14 outputs: {same_offline}")
notype = log("16")
warn_ok = notype[0] == "node count.ts" and notype[1] == "0" and "MODULE_TYPELESS_PACKAGE_JSON" in notype[2] and log("12")[2] in notype[2]
ok &= warn_ok
print(f"run 16 (no \"type\") warns MODULE_TYPELESS_PACKAGE_JSON with the same counts: {warn_ok}")
t15 = log("15")[2]
real = re.search(r"real\t0m([\d.]+)s", t15).group(1)
time_ok = log("13")[2] in t15 and f"手元で{round(float(real), 1)}秒" in article
ok &= time_ok
print(f"run 15 real {real}s matches article seconds: {time_ok}")
print("ALL OK" if ok else "MISMATCH")
