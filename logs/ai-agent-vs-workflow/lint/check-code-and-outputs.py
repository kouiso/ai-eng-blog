#!/usr/bin/env python3
"""記事のコードブロックを順に取り出し、code/ のファイルと run/ のログ（command と出力）に1文字も違わず一致するかを確かめる。
出力はログの末尾の改行1つだけを除いて比べる。
エージェント版は書き直した版（code/agent.ts）で、出力は2回目の実行の run/31.log と比べる。
2026-11-11 に settingSources: [] と strictMcpConfig: true を足して動かし直した3回目の実行（run/23〜35）と比べる。"""
import re, sys, pathlib
base = pathlib.Path(__file__).resolve().parent.parent
art = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
blocks = re.findall(r"^```[a-z]*\n(.*?)^```$", art, flags=re.S | re.M)
def log(n):
    t = (base / "run" / f"{n:02d}.log").read_text(encoding="utf-8")
    cmd = t.split("command: ", 1)[1].split("\n--- output (stdout+stderr) ---\n", 1)[0]
    out = t.split("\n--- output (stdout+stderr) ---\n", 1)[1].rsplit("--- exit=", 1)[0]
    code = t.rsplit("--- exit=", 1)[1].strip()
    return cmd, out, code
def f(name): return (base / "code" / name).read_text(encoding="utf-8")
exp = [
    ("run/23 command", log(23)[0] + "\n"),
    ("run/23 output", log(23)[1]),
    ("mkdir+cd + run/24 command + run/25 command", "mkdir vs-workflow\ncd vs-workflow\n" + log(24)[0] + "\n" + log(25)[0] + "\n"),
    ("run/25 output", log(25)[1]),
    ("run/26 command", log(26)[0] + "\n"),
    ("run/26 output", log(26)[1]),
    ("code/setup-tickets.sh (= run/27 command)", f("setup-tickets.sh")),
    ("run/27 output", log(27)[1]),
    ("code/workflow.ts", f("workflow.ts")),
    ("run/28 command", log(28)[0] + "\n"),
    ("run/28 output", log(28)[1]),
    ("run/29 output", log(29)[1]),
    ("code/agent.ts", f("agent.ts")),
    ("run/31 command", log(31)[0] + "\n"),
    ("run/31 output", log(31)[1]),
]
ok = True
assert f("setup-tickets.sh").rstrip("\n") == log(27)[0], "setup-tickets.sh != run/27 command"
print(f"blocks in article={len(blocks)} expected={len(exp)}")
if len(blocks) != len(exp): ok = False
for i, (b, (name, e)) in enumerate(zip(blocks, exp), 1):
    same = b == e
    ok &= same
    print(f"{i:2d} {'OK ' if same else 'NG '} {name}")
for n in range(1, 36):
    print(f"run/{n:02d}.log exit={log(n)[2]}")
print("ALL OK" if ok else "MISMATCH")
# 2回目（run/14〜18）と1回目（run/02〜06）の準備のコマンドが、記事に載せた3回目（run/23〜27）と同じか
same2 = all(log(a)[0] == log(b)[0] for a, b in [(14, 23), (15, 24), (16, 25), (17, 26), (18, 27), (2, 23), (3, 24), (4, 25), (5, 26), (6, 27)])
print("round1/round2 setup commands == round3:", "OK" if same2 else "NG")
