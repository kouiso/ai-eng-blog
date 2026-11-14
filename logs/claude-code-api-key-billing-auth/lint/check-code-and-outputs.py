#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
2026-11-11 の2回目（strictMcpConfig と --strict-mcp-config を足したあと）の run/14〜26 を見るように番号を変えた。
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

expected = [
    ("bash", "cmd", "14"), ("text", "out", "14"),
    ("bash", "cmd", "15"), ("text", "out", "15"),
    ("bash", "cmd", "16"), ("text", "out", "16"),
    ("bash", "cmd", "17"), ("text", "out", "17"),
    ("ts", "code", "check-auth.ts"),
    ("bash", "cmd", "18"), ("text", "out", "18"),
    ("bash", "cmd", "19"), ("text", "out", "19"),
    ("bash", "cmd", "20"), ("text", "out", "20"),
    ("bash", "cmd", "21"), ("text", "out", "21"),
    ("ts", "code", "plan-only.ts"),
    ("bash", "cmd", "22"), ("text", "out", "22"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}"); ok = False; continue
    want = {"code": code, "out": out, "cmd": cmd}[kind](ref)
    same = body == want
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {ref}")
    ok &= same
# 記事のコマンドのファイル（code/*.sh）と run/ の command 行が同じか
for n, name in (("14", "check-env.sh"), ("15", "auth-status.sh"), ("16", "repro-cli.sh"), ("17", "setup.sh"), ("20", "make-env.sh")):
    same = cmd(n) == code(name)
    print(f"{'OK' if same else 'NG'} run/{n}.log command == code/{name}")
    ok &= same
# 実行ログの終了コードがすべて 0 か（16 と 24 の中の claude -p は exit=1 を echo で出すのが期待どおり）
for n in ("14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
# 期待する中身
checks = (
    ("15", '"authMethod": "claude.ai"'), ("16", '"apiKeySource": "ANTHROPIC_API_KEY"'), ("16", "exit=1"),
    ("18", "apiKeySource: none"), ("19", "apiKeySource: ANTHROPIC_API_KEY"), ("21", "apiKeySource: ANTHROPIC_API_KEY"),
    ("22", "apiKeySource: none"), ("23", '"total_cost_usd":0,"input_tokens":0,"output_tokens":0'),
    ("24", "Invalid API key · Fix external API key"), ("25", "apiKeySource: none"), ("26", "tsc_exit=0"),
)
for n, want in checks:
    hit = want in out(n)
    print(f"{'OK' if hit else 'NG'} run/{n}.log contains {want!r}")
    ok &= hit
print("ALL OK" if ok else "SOMETHING DIFFERS")
