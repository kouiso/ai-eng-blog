#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/claude-agent-sdk-first-agent/lint/check-code-and-outputs.py を写し、expected をこの記事に合わせた。
抜き出し（excerpt）は run/06.log の出力の行のうち、c の判定の行とその次の reason の行の2行だけ。
diff は extra/grade-first.ts と grade.ts で違う1行ずつ。
表（2行の基準の点）は run/09.log と run/11.log の判定の行から作った値と一致するかを見る。
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

# 表の点が run/09.log（規則を書いた基準）と run/11.log（2行の基準）の判定と一致するか
def scores(n):
    return {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"^(\w) 人=(\d) 判定=(\d)", out(n), flags=re.M)}
s9, s11 = scores("09"), scores("11")
rows = re.findall(r"^\| ([a-e]) \| (\d) \| (\d) \| (\d) \|$", text, flags=re.M)
print(f"table rows: {len(rows)}")
for cid, human, detailed, vague in rows:
    same = s9[cid] == (human, detailed) and s11[cid] == (human, vague)
    print(f"{'OK' if same else 'NG'} table {cid}: human={human} detailed={detailed}(run/09 {s9[cid]}) vague={vague}(run/11 {s11[cid]})")
    ok &= same
ok &= len(rows) == 5

# 本文に引いた出力の文字列がログにあるか
quotes = [
    ("09", "total_cost_usd の合計（見積もり）: 0.0026"),
    ("11", "人の採点との一致: 2/5"),
    ("11", "返品送料はお客様負担という情報も省略されています"),
    ("09", "  reason: 該当した規則: 5点。"),
    ("10", "  reason: 規則5に当てはまります。"),
    ("13", 'tools=["StructuredOutput"]'),
    ("13", "assistant tool_use name=StructuredOutput"),
    ("13", "num_turns=2"),
]
for n, q in quotes:
    found = q in out(n)
    print(f"{'OK' if found else 'NG'} quote run/{n}: {q}")
    ok &= found
# 点が run/09 と run/10 で同じか、run/06〜08 の c がすべて 2 か
s10 = scores("10")
same910 = s9 == s10
print(f"{'OK' if same910 else 'NG'} run/09 と run/10 の点が5件とも同じ: {s9 == s10}")
ok &= same910
for n in ("06", "07", "08"):
    c = scores(n)["c"]
    print(f"{'OK' if c == ('3', '2') else 'NG'} run/{n} c: human={c[0]} judge={c[1]}")
    ok &= c == ("3", "2")

# 終了コード（06〜08 と 11 は不一致があるので 1 になるのが記事の記述どおり）
want_exit = {n: "0" for n in ("01", "02", "03", "04", "05", "09", "10", "12", "13", "14")}
want_exit.update({"06": "1", "07": "1", "08": "1", "11": "1"})
for n, w in sorted(want_exit.items()):
    code_ = log(n).rsplit("--- exit=", 1)[1].strip()
    print(f"{'OK' if code_ == w else 'NG'} run/{n}.log exit={code_} (want {w})")
    ok &= code_ == w
print("ALL OK" if ok else "SOMETHING DIFFERS")
