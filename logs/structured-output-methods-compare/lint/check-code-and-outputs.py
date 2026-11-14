#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
draft-7 のエラーは本文の地の文で触れるだけで、コードブロックには載せていない（run/09.log の内容は下の checks で確かめる）。
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

install = "mkdir structured-compare\ncd structured-compare\n" + cmd("03") + "\n" + cmd("04")
expected = [
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "literal", install), ("text", "out", "04"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("ts", "code", "cases.ts"),
    ("ts", "code", "common.ts"),
    ("ts", "code", "a-prompt.ts"),
    ("ts", "code", "b-tool.ts"),
    ("ts", "code", "c-output-format.ts"),
    ("ts", "code", "compare.ts"),
    ("bash", "cmd", "06"), ("text", "out", "06"),
    ("bash", "cmd", "07"), ("text", "out", "07"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}"); ok = False; continue
    if kind == "line09":
        # run/09.log の "error: " の後ろの文字列のうち、"stderr: " より後ろと一致する1行
        lines = [l.split("stderr: ", 1)[1] for l in out(ref).split("\n") if "stderr: " in l]
        same = body in lines
        print(f"{'OK' if same else 'NG'} #{i}: {lang} line of run/{ref}.log")
        ok &= same
        continue
    want = {"code": code, "out": out, "cmd": cmd}.get(kind, lambda r: r)(ref)
    same = body == want
    label = ref if kind != "literal" else "mkdir/cd + run/03 + run/04 command"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
for n in ("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
# 本文の数字の根拠になる行が、ログにそのまま入っているか
checks = [
    ("06", "apiKeySource: none"), ("11", "apiKeySource: none"),
    ("10", "tsc_exit=0"), ("09", "draft-7: http://json-schema.org/draft-07/schema#"), ("09", "error: Claude Code process exited with code 1"),
    ("08", "no-strict init.mcp_servers=25 turns=2 cacheCreationInputTokens=164969 total_cost_usd=0.16560"),
    ("11", "== a-prompt: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10"),
    ("11", "== b-tool: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10"),
    ("11", "== c-output-format: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10"),
]
for n, needle in checks:
    hit = needle in out(n)
    print(f"{'OK' if hit else 'NG'} run/{n}.log contains {needle[:60]!r}")
    ok &= hit
print("ALL OK" if ok else "SOMETHING DIFFERS")
