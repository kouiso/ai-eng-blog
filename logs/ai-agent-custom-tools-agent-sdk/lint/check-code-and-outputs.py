#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected と後半の確認をこの記事に合わせた。
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

diagram = text.split("```text\n", 1)[1].split("\n```", 1)[0]
install = "mkdir custom-tools\ncd custom-tools\n" + cmd("03") + "\n" + cmd("04")
expected = [
    ("text", "literal", diagram),
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "literal", install), ("text", "out", "04"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("ts", "code", "shop-agent.ts"),
    ("bash", "cmd", "06"), ("text", "out", "06"),
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
    label = ref if kind != "literal" else ("diagram (no run; compared with itself)" if i == 1 else "mkdir/cd + run/03 + run/04 command")
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
# 実行ログの終了コードがすべて 0 か
for n in ("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
# 本文の数値の裏付け
init08 = [l for l in out("08").split("\n") if l.startswith("[system/init]")][0]
builtins = [t for t in init08.split("tools=", 1)[1].split(",") if not t.startswith("mcp__")]
print(f"run/08 builtins={len(builtins)} (article says 25) firstcall_ToolSearch={'] ToolSearch ' in out('08')} num_turns6={'num_turns=6' in out('08')}")
ok &= len(builtins) == 25
print(f"run/11 hidden756={'other_mcp_tools_hidden=756' in out('11') if '--- output (stdout+stderr) ---' in log('11') else 'other_mcp_tools_hidden=756' in log('11')}")
print(f"run/12 three runs hidden=0: {log('12').count('other_mcp_tools_hidden=0')}")
same_calls = [l for l in out("06").split("\n") if "tool_" in l] == [l for l in out("07").split("\n") if "tool_" in l]
print(f"run/06 vs run/07 tool lines identical={same_calls} 660 in both={'660円' in out('06') and '660円' in out('07')}")
ok &= same_calls
print("ALL OK" if ok else "SOMETHING DIFFERS")
