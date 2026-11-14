#!/usr/bin/env python3
"""記事のコードブロックが code/ のファイルと1文字も違わないこと、記事の実行結果が run/ のログの出力と
1文字も違わないこと（抜き出して載せた2か所は、ログの出力に同じ文字列がそのまま含まれること）を確かめる。
本文で引いた数値がログにあることも確かめる（gate.md の G04、G05、C08 の根拠）。
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug>>
"""
import re
import sys

art, logdir = sys.argv[1], sys.argv[2]
text = open(art, encoding="utf-8").read()
blocks = re.findall(r"^```(\w*)\n(.*?)\n```$", text, flags=re.M | re.S)


def log(n):
    return open(f"{logdir}/run/{n}.log", encoding="utf-8").read()


def parts(n):
    body = log(n)
    head, rest = body.split("\n----\n", 1)
    output, tail = rest.rsplit("\n----\n", 1)
    command = head.split("\n$ ", 1)[1]
    return command, output, tail.strip()


def cmd(n):
    return parts(n)[0]


def out(n):
    return parts(n)[1]


def code(name):
    s = open(f"{logdir}/code/{name}", encoding="utf-8").read()
    return s[:-1] if s.endswith("\n") else s


expected = [
    ("bash", "cmd", "14"), ("text", "out", "14"),
    ("bash", "cmd", "15"), ("text", "out", "15"),
    ("bash", "cmd", "16"), ("text", "out", "16"),
    ("text", "in", "25"),
    ("yaml", "code", "promptfooconfig.yaml"),
    ("bash", "cmd", "17"), ("text", "out", "17"),
    ("ts", "code", "show-failures.ts"),
    ("bash", "cmd", "18"), ("text", "out", "18"),
    ("text", "in", "20"),
]
ok = True
print(f"blocks in article: {len(blocks)} / expected: {len(expected)}")
if len(blocks) != len(expected):
    ok = False
for i, ((lang, body), (elang, kind, ref)) in enumerate(zip(blocks, expected), 1):
    if lang != elang:
        print(f"NG #{i}: lang {lang} != {elang}")
        ok = False
        continue
    if kind == "in":
        same = body in out(ref)
    else:
        same = body == {"code": code, "out": out, "cmd": cmd}[kind](ref)
    print(f"{'OK' if same else 'NG'} #{i}: {lang} {kind} {ref}")
    ok &= same

# 本文で引いた値がログにあるか
facts = [
    ("17", "Total Tokens: 8,185"), ("17", "7,841 prompt"), ("17", "✓ 3 passed (50.00%)"),
    ("17", "Running 6 test cases"),
    ("19", "Total Tokens: 8,129"), ("19", "✓ 3 passed (50.00%)"), ("19", "Writing output to results.jsonl\n100"),
    ("17", "Writing output to results.jsonl\n100"),
    ("20", "合格 3 / 6"),
    ("22", "Total Tokens: 28,013"), ("22", "27,745 prompt"), ("22", "✓ 3 passed (50.00%)"),
    ("21", "total_cost_usd=0.00133430"), ("21", "costBasis=claude-haiku-5-5:list"),
    ("23", "apiKeySource=none"), ("23", "model=claude-haiku-5-5"), ("23", "claude_code_version=2.1.322"),
    ("23", "tools=0 mcp_servers=0"), ("23", "\n0.125.1"), ("26", "tsc_exit=0"), ("26", "Version 7.0.2"),
]
for n, needle in facts:
    hit = needle in out(n)
    print(f"{'OK' if hit else 'NG'} run/{n}.log contains {needle!r}")
    ok &= hit

# 終了コード（08 と 22 は不合格ありの eval なので 100 が正しい）
want_exit = {n: "0" for n in ["01", "02", "03", "04", "05", "06", "07", "09", "10", "11", "12", "13",
                               "14", "15", "16", "17", "18", "19", "20", "21", "23", "24", "25", "26", "27"]}
want_exit["08"] = "100"
want_exit["25"] = "1"  # npm audit は脆弱性があると 1 を返す
want_exit["22"] = "100"
for n, w in want_exit.items():
    got = parts(n)[2]
    print(f"{'OK' if got == 'exit=' + w else 'NG'} run/{n}.log {got} (want exit={w})")
    ok &= got == "exit=" + w

# セッションの ID らしき UUID がログに残っていないか
uuid = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
for n in want_exit:
    found = bool(uuid.search(log(n)))
    print(f"{'NG' if found else 'OK'} run/{n}.log uuid={'found' if found else 'none'}")
    ok &= not found
print("ALL OK" if ok else "SOMETHING DIFFERS")
