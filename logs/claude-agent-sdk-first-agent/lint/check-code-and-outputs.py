#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/ai-agent-safe-file-tool/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>>
"""
import re
import sys

art, logdir = sys.argv[1], sys.argv[2]
text = open(art, encoding="utf-8").read()
blocks = re.findall(r"^```(\w*)\n(.*?)\n```$", text, flags=re.M | re.S)

def strip1(s):
    return s[:-1] if s.endswith("\n") else s

def log(n):
    return open(f"{logdir}/run/{n}.log", encoding="utf-8").read()

def out(n):
    return strip1(log(n).split("--- output (stdout+stderr) ---\n", 1)[1].rsplit("--- exit=", 1)[0])

def cmd(n):
    return log(n).split("command: ", 1)[1].split("\n--- output", 1)[0]

def code(name):
    return strip1(open(f"{logdir}/code/{name}", encoding="utf-8").read())

install = "mkdir first-agent\ncd first-agent\n" + cmd("03") + "\n" + cmd("04")
expected = [
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "literal", install), ("text", "out", "04"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("bash", "cmd", "06"), ("text", "out", "06"),
    ("ts", "code", "hello.ts"),
    ("bash", "cmd", "07"), ("text", "out", "07"),
    ("bash", "code", "setup-tasks.sh"),
    ("ts", "code", "agent.ts"),
    ("bash", "cmd", "09"), ("text", "out", "09"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}"); ok = False; continue
    want = {"code": code, "out": out, "cmd": cmd}.get(kind, lambda r: r)(ref)
    same = body == want
    label = ref if kind != "literal" else "mkdir/cd + run/03 + run/04 command"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
# 実行ログの終了コードがすべて 0 か
for n in ("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
# 前提の Node.js の版の確認（run-node-versions.sh）。12 は Node.js 20 で失敗するのが期待どおり
for n, want_code, want_text in (("12", "1", "ERR_UNKNOWN_FILE_EXTENSION"), ("13", "0", "[result/success]"), ("14", "0", "claude-agent-sdk-darwin-arm64")):
    body = log(n)
    code_ = body.rsplit("--- exit=", 1)[1].strip()
    hit = want_text in out(n)
    good = code_ == want_code and hit
    print(f"{'OK' if good else 'NG'} run/{n}.log exit={code_} (want {want_code}) contains {want_text!r}={hit}")
    ok &= good
print("ALL OK" if ok else "SOMETHING DIFFERS")
