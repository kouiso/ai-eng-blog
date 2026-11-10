#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ファイルとログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
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

def code(name):
    return strip1(open(f"{logdir}/code/{name}", encoding="utf-8").read())

# 記事に出てくる順に、期待するもの
expected = [
    ("bash", None, "node -v"), ("text", "out", "01"),
    ("bash", None, "mkdir safe-file-tool\ncd safe-file-tool"),
    ("json", "code", "package.json"),
    ("ts", "code", "setup.ts"),
    ("bash", None, "node setup.ts"), ("text", "out", "02"),
    ("text", None, None),  # 配置の図（実行結果ではない）
    ("ts", "code", "naive-tool.ts"), ("ts", "code", "try-naive.ts"),
    ("bash", None, "node try-naive.ts"), ("text", "out", "03"),
    ("ts", "code", "safe-file-tools.ts"),
    ("bash", None, None), ("text", "out", "07"),
    ("ts", "code", "try-safe.ts"),
    ("bash", None, "node try-safe.ts"), ("text", "out", "04"),
    ("ts", "code", "naive-write.ts"),
    ("bash", None, "node naive-write.ts"), ("text", "out", "05"),
    ("ts", "code", "tools.ts"),
    ("bash", None, None), ("text", "out", "08"),
    ("ts", "code", "try-tools.ts"),
    ("bash", None, "node try-tools.ts"), ("text", "out", "06"),
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
    elif ref is not None:
        same = body == ref
    else:
        same = True
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind or 'cmd'} {ref if ref else '(図またはワンライナー)'}")
    ok &= same
# ワンライナーは run/07.log と run/08.log の command 行と同じか
for n in ("07", "08"):
    cmd = open(f"{logdir}/run/{n}.log", encoding="utf-8").read().split("command: ", 1)[1].split("\n", 1)[0]
    hit = any(body == cmd for lang, body in blocks if lang == "bash")
    print(f"{'OK' if hit else 'NG'} one-liner run/{n}.log command appears verbatim in article")
    ok &= hit
print("ALL OK" if ok else "SOMETHING DIFFERS")
