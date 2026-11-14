#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。run/27（1回目は run/10）は1行の抜粋なので、その行がログの出力に含まれることを確かめる。
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

# 2回目の実行（strictMcpConfig に揃えた版、run/18〜33）と照らし合わせる。run/18〜33 は 1回目の run/01〜16 と同じ順番
install = "mkdir structured-output\ncd structured-output\n" + cmd("20") + "\n" + cmd("21")
expected = [
    ("bash", "cmd", "19"), ("text", "out", "19"),
    ("bash", "literal", install), ("text", "out", "21"),
    ("bash", "cmd", "22"), ("text", "out", "22"),
    ("ts", "code", "classify.ts"),
    ("bash", "cmd", "23"), ("text", "out", "23"),
    ("ts", "code", "impossible.ts"),
    ("bash", "cmd", "24"), ("text", "out", "24"),
    ("bash", "cmd", "25"), ("text", "out", "25"),
    ("ts", "code", "classify-zod.ts"),
    ("bash", "cmd", "26"), ("text", "out", "26"),
    ("text", "excerpt", "27"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}"); ok = False; continue
    if kind == "excerpt":
        same = "\n" not in body and body in out(ref).split("\n")
        print(f"{'OK' if same else 'NG'} #{i}: {lang} excerpt (1 line of run/{ref}.log output)")
        ok &= same
        continue
    want = {"code": code, "out": out, "cmd": cmd}.get(kind, lambda r: r)(ref)
    same = body == want
    label = ref if kind != "literal" else "mkdir/cd + run/20 + run/21 command"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
# 実行ログの終了コード。27 はスキーマの版が合わず止まるのが期待どおり
for n in ("18","19","20","21","22","23","24","25","26","28","29","30","31","32","33"):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
for n, want_code, want_text in (("27","1","not a valid JSON Schema"),("28","0","tsc_exit=0"),("23","0","apiKeySource=none"),("25","0","error_max_structured_output_retries"),("31","0","mcp_tools=0"),("32","0","mcp_tools=0"),("33","0","mcp_tools=0")):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    hit = want_text in out(n)
    good = code_ == want_code and hit
    print(f"{'OK' if good else 'NG'} run/{n}.log exit={code_} (want {want_code}) contains {want_text!r}={hit}")
    ok &= good
print("ALL OK" if ok else "SOMETHING DIFFERS")
