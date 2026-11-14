#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected と確かめるログをこの記事に合わせた。
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>>
2026-11-11 に strictMcpConfig を足したコードで撮り直したため、確かめるログを run/09〜16（と run/17）に替えた。run/01〜08 は足す前の記録として残している。
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

install = "mkdir stream-demo\ncd stream-demo\n" + cmd("11") + "\n" + cmd("12")
expected = [
    ("bash", "cmd", "10"), ("text", "out", "10"),
    ("bash", "literal", install), ("text", "out", "12"),
    ("ts", "code", "stream.ts"),
    ("bash", "cmd", "13"), ("text", "out", "13"),
    ("ts", "code", "timing.ts"),
    ("bash", "cmd", "14"), ("text", "out", "14"),
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
    label = ref if kind != "literal" else "mkdir/cd + run/11 + run/12 command"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
# 実行ログの終了コードがすべて 0 か
for n in ("09", "10", "11", "12", "13", "14", "15", "16", "17"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
# モデルを呼んだログが API キーなしで動いたか、型の確認が通ったか
for n, want_text in (("14", "apiKeySource=none"), ("15", "apiKeySource=none"), ("16", "tsc_exit=0")):
    hit = want_text in out(n)
    print(f"{'OK' if hit else 'NG'} run/{n}.log contains {want_text!r}")
    ok &= hit
# 記事のコードの query() すべてに strictMcpConfig: true があるか
n_query = text.count("for await (const message of query({")
n_strict = text.count("    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない\n")
print(f"{'OK' if n_query == n_strict and n_query > 0 else 'NG'} query() {n_query} / strictMcpConfig {n_strict}")
ok &= n_query == n_strict and n_query > 0
# run/17.log: strictMcpConfig=true の実行はすべて mcp_servers=0
o17 = out("17").splitlines()
strict_lines = [l for l in o17 if l.startswith("strictMcpConfig=true")]
s17 = len(strict_lines) > 0 and all("mcp_servers=0 " in l and "apiKeySource=none" in l for l in strict_lines)
print(f"{'OK' if s17 else 'NG'} run/17.log strictMcpConfig=true runs={len(strict_lines)} all mcp_servers=0 and apiKeySource=none")
ok &= s17
print("ALL OK" if ok else "SOMETHING DIFFERS")
