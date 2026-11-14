#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイル（blocks/*.sh、ask.ts、exec-file.ts）と1文字も違わないこと、
記事の実行結果が run/ のログの出力と1文字も違わないこと（ログの末尾の改行1つだけを除く。
コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を元に、ログの形式とこの記事のブロックに合わせた。
本文の表の数字が run/16.log と一致することも確かめる。
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>>
"""
import glob
import os
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


def block(n):
    path = glob.glob(f"{logdir}/code/blocks/{n}-*.sh")[0]
    body = strip1(open(path, encoding="utf-8").read())
    # the log must have run exactly this file
    logged = log(n).split("--- command ---\n", 1)[1].split("--- output", 1)[0]
    assert strip1(logged) == body, f"run/{n}.log command differs from {os.path.basename(path)}"
    return body


def code(name):
    return strip1(open(f"{logdir}/code/{name}", encoding="utf-8").read())


expected = []
for n in ("01", "02", "03", "04"):
    expected += [("bash", "block", n), ("text", "out", n)]
expected += [("bash", "block", "05")]
for n in ("06", "07", "08", "09", "10", "11"):
    expected += [("bash", "block", n), ("text", "out", n)]
expected += [("bash", "block", "12"), ("bash", "block", "13"), ("text", "out", "13")]
expected += [("ts", "code", "exec-file.ts"), ("bash", "block", "14"), ("text", "out", "14")]
expected += [("ts", "code", "ask.ts"), ("bash", "block", "15"), ("text", "out", "15")]

ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}")
        ok = False
        continue
    want = {"code": code, "out": out, "block": block}[kind](ref)
    same = body == want
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {ref}")
    ok &= same

for n in [f"{i:02d}" for i in range(1, 16)]:
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == '0' else 'NG'} run/{n}.log exit={code_}")
    ok &= code_ == "0"

# table numbers vs run/16.log
m16 = log("16")
rows = {
    "no isolation flags": ("94,062", "0.01681166"),
    '--setting-sources "" only': ("18,173", "0.00147332"),
    "all three flags": ("3,776", "0.00063319"),
}
for label, (tokens, cost) in rows.items():
    line = next(l for l in m16.splitlines() if l.startswith(f"[{label}]"))
    t = re.search(r"prompt_tokens=(\d+)", line).group(1)
    c = float(re.search(r"total_cost_usd=([0-9.e-]+)", line).group(1))
    good = f"{int(t):,}" == tokens and f"{c:.8f}" == cost and f"| {tokens} | {cost} |" in text
    print(f"{'OK' if good else 'NG'} table row {label}: {tokens} {cost} (log {t} {c})")
    ok &= good

print("ALL OK" if ok else "SOMETHING DIFFERS")
