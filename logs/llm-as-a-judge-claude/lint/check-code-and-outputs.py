#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
抜き出し（excerpt）は run/06.log の出力の行のうち、c の判定の行とその次の reason の行の2行だけ。
diff は extra/grade-first.ts と grade.ts で違う1行ずつ。
表の点は、規則を書いた基準が run/09、10、19、20、21、2行の基準が run/11、22、23、24、25 の判定の行から
実行した順に並べた値と一致するかを見る（2026-11-10 の再実行 run-recheck.sh で run/15〜25 を足した）。
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

def excerpt(n, case_id):
    lines = out(n).split("\n")
    i = next(k for k, l in enumerate(lines) if l.startswith(f"{case_id} 人="))
    return "\n".join(lines[i:i + 2])

def diff_c():
    old = [l for l in code("extra/grade-first.ts").split("\n") if l.startswith('  { id: "c"')]
    new = [l for l in code("grade.ts").split("\n") if l.startswith('  { id: "c"')]
    assert len(old) == 1 and len(new) == 1
    return f"-{old[0]}\n+{new[0]}"

install = "mkdir llm-judge\ncd llm-judge\n" + cmd("03") + "\n" + cmd("04")
expected = [
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "literal", install), ("text", "out", "04"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("markdown", "code", "rubric.md"),
    ("ts", "code", "judge.ts"),
    ("ts", "code", "grade.ts"),
    ("bash", "cmd", "09"), ("text", "out", "09"),
    ("text", "literal", excerpt("06", "c")),
    ("diff", "literal", diff_c()),
    ("markdown", "code", "rubric-vague.md"),
    ("bash", "cmd", "11"),
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
    label = ref if kind != "literal" else f"literal ({len(ref)} chars)"
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {label}")
    ok &= same

# 表の点が、規則を書いた基準の5回（09、10、19、20、21）と2行の基準の5回（11、22〜25）の判定と、実行した順に一致するか
def scores(n):
    return {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"^(\w) 人=(\d) 判定=(\d)", out(n), flags=re.M)}
detailed_runs = ("09", "10", "19", "20", "21")
vague_runs = ("11", "22", "23", "24", "25")
sd = {n: scores(n) for n in detailed_runs}
sv = {n: scores(n) for n in vague_runs}
rows = re.findall(r"^\| ([a-e]) \| (\d) \| ([\d, ]+) \| ([\d, ]+) \|$", text, flags=re.M)
print(f"table rows: {len(rows)}")
for cid, human, detailed, vague in rows:
    want_d = ", ".join(sd[n][cid][1] for n in detailed_runs)
    want_v = ", ".join(sv[n][cid][1] for n in vague_runs)
    humans = {sd[n][cid][0] for n in detailed_runs} | {sv[n][cid][0] for n in vague_runs}
    same = detailed == want_d and vague == want_v and humans == {human}
    print(f"{'OK' if same else 'NG'} table {cid}: human={human} detailed={detailed} (logs {want_d}) vague={vague} (logs {want_v})")
    ok &= same
ok &= len(rows) == 5

# 本文に引いた出力の文字列がログにあるか
quotes = [
    ("09", "total_cost_usd の合計（見積もり）: 0.0026"),
    ("11", "人の採点との一致: 2/5"),
    ("22", "人の採点との一致: 1/5"),
    ("23", "人の採点との一致: 2/5"),
    ("24", "人の採点との一致: 2/5"),
    ("25", "人の採点との一致: 2/5"),
    ("19", "人の採点との一致: 5/5"),
    ("20", "人の採点との一致: 5/5"),
    ("21", "人の採点との一致: 5/5"),
    ("11", "返品送料はお客様負担という情報も省略されています"),
    ("09", "  reason: 該当した規則: 5点。"),
    ("10", "  reason: 規則5に当てはまります。"),
    ("13", "init model=claude-haiku-5-5"),
]
for n, q in quotes:
    found = q in out(n)
    print(f"{'OK' if found else 'NG'} quote run/{n}: {q}")
    ok &= found
# 規則を書いた基準の5回で点が5件とも同じか、変更前の c（run/06〜08、16〜18）がすべて 2 か
for n in detailed_runs[1:]:
    same = sd[n] == sd["09"]
    print(f"{'OK' if same else 'NG'} run/09 と run/{n} の点が5件とも同じ: {same}")
    ok &= same
for n in ("06", "07", "08", "16", "17", "18"):
    c = scores(n)["c"]
    print(f"{'OK' if c == ('3', '2') else 'NG'} run/{n} c: human={c[0]} judge={c[1]}")
    ok &= c == ("3", "2")

# 終了コード（06〜08 と 11 は不一致があるので 1 になるのが記事の記述どおり）
want_exit = {n: "0" for n in ("01", "02", "03", "04", "05", "09", "10", "12", "13", "14", "15", "19", "20", "21")}
want_exit.update({n: "1" for n in ("06", "07", "08", "11", "16", "17", "18", "22", "23", "24", "25")})
for n, w in sorted(want_exit.items()):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == w else 'NG'} run/{n}.log exit={code_} (want {w})")
    ok &= code_ == w
print("ALL OK" if ok else "SOMETHING DIFFERS")
