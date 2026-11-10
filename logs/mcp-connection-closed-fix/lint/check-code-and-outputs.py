#!/usr/bin/env python3
"""記事のコードブロックが code/ と run/ のログに1文字も違わず一致するかを確かめる（gate.md の G04、C08 の根拠）。

使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>/code> <run ログのフォルダ>

- json と ts のブロックは、記事に出てくる順に、次のファイルと比べる。
  全文のブロックはファイル全体と完全一致、抜き出したブロックはファイルの中に連続した行として含まれることを確かめる。
- bash のブロックは、記事に出てくる順に run/NN.log の command と比べる（行頭の2字の字下げを外して完全一致）。
- bash のブロックの直後にある text のブロックは、その実行の出力（--- output の行から --- exit の行の手前まで）と完全一致を確かめる。
  initialize を送るブロックは、server.ts を直す前（10）と後（11）の2回実行し、出力の text ブロックも2つある。
"""
import re
import sys
from pathlib import Path

article, code_dir, run_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
text = article.read_text(encoding="utf-8")
blocks = [(m.group(1), m.group(2)) for m in re.finditer(r"^```(\w*)\n(.*?)^```$", text, flags=re.S | re.M)]

ok = True
def report(name, passed, detail=""):
    global ok
    ok = ok and passed
    print(f"{'PASS' if passed else 'FAIL'} {name} {detail}")

# 1. json と ts
expect_files = [
    ("json", "full", code_dir / "package.json"),
    ("ts", "full", code_dir / "server.ts"),
    ("ts", "full", code_dir / "check.ts"),
    ("ts", "part", code_dir / "check.ts"),          # 変更前
    ("ts", "part", code_dir / "after" / "check.ts"),  # 変更後
    ("ts", "part", code_dir / "server.ts"),         # 原因3で消す1行
]
code_blocks = [(lang, body) for lang, body in blocks if lang in ("json", "ts")]
report("code block count", len(code_blocks) == len(expect_files), f"{len(code_blocks)} vs {len(expect_files)}")
for i, ((lang, body), (elang, kind, path)) in enumerate(zip(code_blocks, expect_files), 1):
    src = path.read_text(encoding="utf-8")
    passed = lang == elang and (body == src if kind == "full" else body in src)
    report(f"code#{i} {lang} {kind} == {path.relative_to(code_dir)}", passed)

# 変更後の check.ts は、変更前に env の1行を足しただけか
before = (code_dir / "check.ts").read_text(encoding="utf-8").split("\n")
after = (code_dir / "after" / "check.ts").read_text(encoding="utf-8").split("\n")
added = [l for l in after if l not in before]
report("after/check.ts = check.ts + 1 line", len(after) == len(before) + 1 and added == ['  env: { NOTES_DIR: process.env.NOTES_DIR ?? "" },'], str(added))

# 2. bash と直後の text
def log_parts(n):
    lines = (run_dir / f"{n}.log").read_text(encoding="utf-8").split("\n")
    c0 = lines.index("command:") + 1
    o0 = lines.index("--- output (stdout+stderr) ---")
    e0 = max(i for i, l in enumerate(lines) if l.startswith("--- exit="))
    cmd = "\n".join(l[2:] for l in lines[c0:o0])
    out = "\n".join(lines[o0 + 1:e0])
    return cmd, out, lines[e0]

bash_logs = [["02"], ["03"], ["04"], ["05"], ["06"], ["07"], ["08"], ["09"], ["10", "11"]]
seq = []  # (bash の本文, 直後の text の本文のリスト)
for i, (lang, body) in enumerate(blocks):
    if lang == "bash":
        outs = []
        j = i + 1
        while j < len(blocks) and blocks[j][0] == "text":
            outs.append(blocks[j][1])
            j += 1
        seq.append((body, outs))
report("bash block count", len(seq) == len(bash_logs), f"{len(seq)} vs {len(bash_logs)}")
for k, ((body, outs), logs) in enumerate(zip(seq, bash_logs), 1):
    for n in logs:
        cmd, out, ex = log_parts(n)
        report(f"bash#{k} command == run/{n}.log", body.rstrip("\n") == cmd.rstrip("\n"), ex)
    if logs == ["02"]:
        report("bash#1 has no output block (mkdir/touch)", outs == [] or outs[0].startswith("notes-mcp/"))
        continue
    for idx, n in enumerate(logs):
        _, out, _ = log_parts(n)
        got = outs[idx].rstrip("\n") if idx < len(outs) else None
        report(f"bash#{k} output#{idx + 1} == run/{n}.log output", got == out.rstrip("\n").lstrip("\n") or got == out.rstrip("\n"))

print("ALL OK" if ok else "SOME FAILED")
sys.exit(0 if ok else 1)
