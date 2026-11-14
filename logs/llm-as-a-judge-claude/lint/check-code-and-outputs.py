#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
抜き出し（excerpt）は run/31.log の出力の行のうち、c の判定の行とその次の reason の行の2行だけ。
diff は extra/grade-first.ts と grade.ts で違う1行ずつ。
表の点は、規則を書いた基準が run/34〜38、2行の基準が run/39〜43 の判定の行から
実行した順に並べた値と一致するかを見る。2026-11-11 に judge.ts へ strictMcpConfig: true を足して run-fix.sh で
run/26〜46 を取り直し、記事の出力と数字はすべてこの回のログに合わせた（run/01〜25 は直す前のコードのログとして残す）。
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

install = "mkdir llm-judge\ncd llm-judge\n" + cmd("28") + "\n" + cmd("29")
expected = [
    ("bash", "cmd", "27"), ("text", "out", "27"),
    ("bash", "literal", install), ("text", "out", "29"),
    ("bash", "cmd", "30"), ("text", "out", "30"),
    ("markdown", "code", "rubric.md"),
    ("ts", "code", "judge.ts"),
    ("ts", "code", "grade.ts"),
    ("bash", "cmd", "34"), ("text", "out", "34"),
    ("text", "literal", excerpt("31", "c")),
    ("diff", "literal", diff_c()),
    ("markdown", "code", "rubric-vague.md"),
    ("bash", "cmd", "39"),
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

# 表の点が、規則を書いた基準の5回（34〜38）と2行の基準の5回（39〜43）の判定と、実行した順に一致するか
def scores(n):
    return {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"^(\w) 人=(\d) 判定=(\d)", out(n), flags=re.M)}
detailed_runs = ("34", "35", "36", "37", "38")
vague_runs = ("39", "40", "41", "42", "43")
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
    ("34", "total_cost_usd の合計（見積もり）: 0.0018"),
    ("39", "人の採点との一致: 2/5"),
    ("40", "人の採点との一致: 3/5"),
    ("41", "人の採点との一致: 2/5"),
    ("42", "人の採点との一致: 2/5"),
    ("43", "人の採点との一致: 2/5"),
    ("34", "人の採点との一致: 5/5"),
    ("35", "人の採点との一致: 5/5"),
    ("36", "人の採点との一致: 5/5"),
    ("37", "人の採点との一致: 5/5"),
    ("38", "人の採点との一致: 5/5"),
    ("39", "返品送料がお客様負担であることも触れられていません"),
    ("34", "a 人=5 判定=5 一致 apiKeySource=none\n  reason: 規則1（食い違い）"),
    ("35", "a 人=5 判定=5 一致 apiKeySource=none\n  reason: 規則5に当てはまります。"),
    ("44", "init model=claude-haiku-5-5 apiKeySource=none"),
    ("44", "mcp_tools=0 mcp_servers=0"),
]
for n, q in quotes:
    found = q in out(n)
    print(f"{'OK' if found else 'NG'} quote run/{n}: {q}")
    ok &= found
# 規則を書いた基準の5回で点が5件とも同じか、変更前の c（run/31〜33）がすべて 2 か
for n in detailed_runs[1:]:
    same = sd[n] == sd["34"]
    print(f"{'OK' if same else 'NG'} run/34 と run/{n} の点が5件とも同じ: {same}")
    ok &= same
for n in ("31", "32", "33"):
    c = scores(n)["c"]
    print(f"{'OK' if c == ('3', '2') else 'NG'} run/{n} c: human={c[0]} judge={c[1]}")
    ok &= c == ("3", "2")

# 終了コード（31〜33 と 39〜43 は不一致があるので 1 になるのが記事の記述どおり）
want_exit = {n: "0" for n in ("26", "27", "28", "29", "30", "34", "35", "36", "37", "38", "44", "45", "46")}
want_exit.update({n: "1" for n in ("31", "32", "33", "39", "40", "41", "42", "43")})
# 2026-11-11 の取り直しのモデルを呼んだログが、すべてプランのログイン（apiKeySource=none）で動いたか
for n in [str(k) for k in range(31, 46)]:
    keys = set(re.findall(r"apiKeySource=(\S+)", out(n)))
    print(f"{'OK' if keys == {'none'} else 'NG'} run/{n} apiKeySource={sorted(keys)} ANTHROPIC_API_KEY unset={'ANTHROPIC_API_KEY: unset' in log(n)}")
    ok &= keys == {"none"} and "ANTHROPIC_API_KEY: unset" in log(n)
for n, w in sorted(want_exit.items()):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == w else 'NG'} run/{n}.log exit={code_} (want {w})")
    ok &= code_ == w
print("ALL OK" if ok else "SOMETHING DIFFERS")
