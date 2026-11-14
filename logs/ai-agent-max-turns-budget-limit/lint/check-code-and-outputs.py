#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（ファイルとログの末尾の改行1つだけを除く。コードブロックの閉じフェンスの前の改行に当たる）を確かめる（gate.md の G04、C08 の根拠）。
logs/ai-agent-safe-file-tool/lint/check-code-and-outputs.py を写し、期待する並びをこの記事に合わせた。
3版目（2026-11-11）は strictMcpConfig を足して動かし直した run/15.log 以降と比べる。
"cmd_first"/"out_first" は、同じコマンドを ; でつないで続けて動かしたログ（run/33.log）の1回目と比べる。
4版目（2026-11-11 の直し）で 0.00066 の出力のコードブロックを、6回の結果の表に替えた。表の6行（subtype と total_cost_usd）は
run/31.log の 0.00066 の3回と run/33.log の3回の順に、ログの値と比べる。
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

def cmd_first(n):
    return cmd(n).split("; ", 1)[0]

def out_first(n):
    # 1回目の出力。2回目は先頭の行（"maxBudgetUsd: ..."）がもう一度出たところから始まる
    o = out(n)
    head = o.split("\n", 1)[0]
    second = o.find("\n" + head + "\n", 1)
    return o if second < 0 else o[:second]

def code(name):
    return strip1(open(f"{logdir}/code/{name}", encoding="utf-8").read())

# 記事に出てくる順に、期待するもの。("cmd", n) は run/n.log の command 行と同じこと
install = ("mkdir agent-limits\ncd agent-limits\nnpm init -y > /dev/null\nnpm pkg set type=module\n"
           "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322\ncat package.json")
expected = [
    ("bash", "cmd", "15"), ("text", "out", "15"),
    ("bash", "lit", install), ("text", "out", "16"),
    ("ts", "code", "setup.ts"),
    ("bash", "cmd", "18"), ("text", "out", "18"),
    ("ts", "code", "run-agent.ts"),
    ("ts", "code", "turns-limit.ts"),
    ("bash", "cmd", "19"), ("text", "out", "19"),
    ("bash", "cmd", "20"), ("text", "out", "20"),
    ("ts", "code", "budget-limit.ts"),
    ("bash", "cmd", "21"), ("text", "out", "21"),
    ("bash", "cmd", "23"), ("text", "out", "23"),
    ("bash", "cmd_first", "33"),
    ("ts", "code", "no-catch.ts"),
    ("bash", "cmd", "24"), ("text", "out", "24"),
    ("bash", "cmd", "25"), ("text", "out", "25"),
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
    elif kind == "cmd_first":
        same = body == cmd_first(ref)
    elif kind == "out_first":
        same = body == out_first(ref)
    else:
        same = body == ref
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {ref if kind != 'lit' else '(インストールの手順)'}")
    ok &= same
# インストールの手順は run/16.log では && でつないで1行で実行した。並びが同じことを確かめる
joined = cmd("16")
print(f"run/16.log command: {joined}")
same_steps = joined.split(" && ") == ["npm init -y > /dev/null", "npm pkg set type=module",
                                      "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322",
                                      "cat package.json"]
print(f"{'OK' if same_steps else 'NG'} install steps in run/16.log match the article (mkdir/cd は run-strict.sh が行う)")
ok &= same_steps
# 0.00066 の6回の表。ログの側は run/31.log の 0.00066 の RESULT 3つと run/33.log の subtype/total_cost_usd 3つ
log31 = open(f"{logdir}/run/31.log", encoding="utf-8").read()
want = [("確認用", s, float(c)) for b, s, c in re.findall(
    r"maxBudgetUsd: ([\d.]+)\n(?:.*\n)*?RESULT (\w+) / num_turns \d+ / total_cost_usd ([\d.e-]+)", log31) if b == "0.00066"]
log33 = out("33")
want += [("`budget-limit.ts`", s, float(c)) for s, c in re.findall(
    r"subtype: (\w+)\n.*\n.*\ntotal_cost_usd: ([\d.e-]+)", log33)]
rows = re.findall(r"^\| (\d) \| (確認用|`budget-limit.ts`) \| `(\w+)` \| ([\d.]+) \|", text, flags=re.M)
got = [(w, s, float(c)) for _, w, s, c in rows]
same_table = len(want) == 6 and len(got) == 6 and all(
    g[0] == w[0] and g[1] == w[1] and round(g[2], 12) == round(w[2], 12) for g, w in zip(got, want))
print(f"{'OK' if same_table else 'NG'} 0.00066 table: {len(got)} rows in article / {len(want)} runs in run/31.log + run/33.log")
ok &= same_table
print("ALL OK" if ok else "SOMETHING DIFFERS")
