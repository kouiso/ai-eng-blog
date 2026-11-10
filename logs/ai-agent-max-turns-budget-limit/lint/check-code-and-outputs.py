#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ファイルとログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/ai-agent-safe-file-tool/lint/check-code-and-outputs.py を写し、期待する並びをこの記事に合わせた。
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>>
"""
import re
import sys

art, logdir = sys.argv[1], sys.argv[2]
text = open(art, encoding="utf-8").read()
blocks = re.findall(r"^```(\w*)\n(.*?)\n```$", text, flags=re.M | re.S)

def strip1(s):
    # 末尾の改行を1つだけ外す。console.log が足した空行などは残して比べる
    return s[:-1] if s.endswith("\n") else s

def out(n):
    t = open(f"{logdir}/run/{n}.log", encoding="utf-8").read()
    return strip1(t.split("--- output (stdout+stderr) ---\n", 1)[1].rsplit("--- exit=", 1)[0])

def cmd(n):
    t = open(f"{logdir}/run/{n}.log", encoding="utf-8").read()
    return t.split("command: ", 1)[1].split("\n", 1)[0]

def code(name):
    return strip1(open(f"{logdir}/code/{name}", encoding="utf-8").read())

# 記事に出てくる順に、期待するもの。("cmd", n) は run/n.log の command 行と同じこと
install = ("mkdir agent-limits\ncd agent-limits\nnpm init -y > /dev/null\nnpm pkg set type=module\n"
           "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322\ncat package.json")
expected = [
    ("bash", "cmd", "01"), ("text", "out", "01"),
    ("bash", "lit", install), ("text", "out", "02"),
    ("ts", "code", "setup.ts"),
    ("bash", "cmd", "03"), ("text", "out", "03"),
    ("ts", "code", "run-agent.ts"),
    ("ts", "code", "turns-limit.ts"),
    ("bash", "cmd", "04"), ("text", "out", "04"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("ts", "code", "budget-limit.ts"),
    ("bash", "cmd", "06"), ("text", "out", "06"),
    ("bash", "cmd", "07"), ("text", "out", "07"),
    ("bash", "cmd", "13"), ("text", "out", "13"),
    ("ts", "code", "no-catch.ts"),
    ("bash", "cmd", "08"), ("text", "out", "08"),
    ("bash", "cmd", "09"), ("text", "out", "09"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}"); ok = False; continue
    if kind == "code":
        same = body == code(ref)
    elif kind == "out":
        same = body == out(ref)
    elif kind == "cmd":
        same = body == cmd(ref)
    else:
        same = body == ref
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {ref if kind != 'lit' else '(インストールの手順)'}")
    ok &= same
# インストールの手順は run/02.log では && でつないで1行で実行した。並びが同じことを確かめる
joined = cmd("02")
print(f"run/02.log command: {joined}")
same_steps = joined.split(" && ") == ["npm init -y > /dev/null", "npm pkg set type=module",
                                      "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322",
                                      "cat package.json"]
print(f"{'OK' if same_steps else 'NG'} install steps in run/02.log match the article (mkdir/cd は run-all.sh が行う)")
ok &= same_steps
print("ALL OK" if ok else "SOMETHING DIFFERS")
