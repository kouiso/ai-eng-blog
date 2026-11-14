#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
あわせて、#11 から写した3ファイルが logs/rag-bm25-search-typescript/code/ と同じかを確かめる。
2026-11-11 の再実行（strictMcpConfig を足した ask.ts）で、インストールと ask.ts の出力の照合先を run/21〜26 に変えた。
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

install = "mkdir rag-citations\ncd rag-citations\n" + cmd("21") + "\n" + cmd("22")
expected = [
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "literal", install), ("text", "out", "22"),
    ("ts", "code", "tokenize.ts"), ("ts", "code", "bm25.ts"), ("ts", "code", "docs.ts"),
    ("ts", "code", "verify.ts"),
    ("ts", "code", "check-sample.ts"),
    ("bash", "cmd", "06"), ("text", "out", "06"),
    ("ts", "code", "ask.ts"),
    ("bash", "cmd", "24"), ("text", "out", "24"),
    ("bash", "cmd", "25"), ("text", "out", "25"),
    ("bash", "cmd", "26"), ("text", "out", "26"),
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
    label = ref if kind != "literal" else "mkdir/cd + run/21 + run/22 command"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same
for name in ("tokenize.ts", "bm25.ts", "docs.ts"):
    a = open(f"{logdir}/code/{name}", encoding="utf-8").read()
    b = open(f"{logdir}/../rag-bm25-search-typescript/code/{name}", encoding="utf-8").read()
    print(f"{'OK' if a == b else 'NG'} {name} == logs/rag-bm25-search-typescript/code/{name}")
    ok &= a == b
for n in [f"{i:02d}" for i in range(1, 36)]:
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"
print("ALL OK" if ok else "SOMETHING DIFFERS")
