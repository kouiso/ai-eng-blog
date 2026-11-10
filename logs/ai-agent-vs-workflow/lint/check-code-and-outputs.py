#!/usr/bin/env python3
"""記事のコードブロックを順に取り出し、code/ のファイルと run/ のログ（command と出力）に1文字も違わず一致するかを確かめる。
出力はログの末尾の改行1つだけを除いて比べる。
エージェント版は書き直した版（code/agent.ts）で、出力は2回目の実行の run/21.log と比べる。"""
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
    ("run/02 command", log(2)[0] + "\n"),
    ("run/02 output", log(2)[1]),
    ("mkdir+cd + run/03 command + run/04 command", "mkdir vs-workflow\ncd vs-workflow\n" + log(3)[0] + "\n" + log(4)[0] + "\n"),
    ("run/04 output", log(4)[1]),
    ("run/05 command", log(5)[0] + "\n"),
    ("run/05 output", log(5)[1]),
    ("code/setup-tickets.sh (= run/06 command)", f("setup-tickets.sh")),
    ("run/06 output", log(6)[1]),
    ("code/workflow.ts", f("workflow.ts")),
    ("run/07 command", log(7)[0] + "\n"),
    ("run/07 output", log(7)[1]),
    ("run/10 output", log(10)[1]),
    ("code/agent.ts", f("agent.ts")),
    ("run/21 command", log(21)[0] + "\n"),
    ("run/21 output", log(21)[1]),
]
ok = True
assert f("setup-tickets.sh").rstrip("\n") == log(6)[0], "setup-tickets.sh != run/06 command"
print(f"blocks in article={len(blocks)} expected={len(exp)}")
if len(blocks) != len(exp): ok = False
for i, (b, (name, e)) in enumerate(zip(blocks, exp), 1):
    same = b == e
    ok &= same
    print(f"{i:2d} {'OK ' if same else 'NG '} {name}")
for n in range(1, 23):
    print(f"run/{n:02d}.log exit={log(n)[2]}")
print("ALL OK" if ok else "MISMATCH")
# 2回目の実行（run/14〜18）の準備のコマンドが、記事のコマンド（1回目の run/02〜06）と同じか
same2 = all(log(a)[0] == log(b)[0] for a, b in [(14, 2), (15, 3), (16, 4), (17, 5), (18, 6)])
print("round2 setup commands == round1:", "OK" if same2 else "NG")
