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
    ("bash", "cmd", "01"), ("text", "out", "01"),
    ("bash", "cmd", "02"), ("text", "out", "02"),
    ("bash", "cmd", "03"), ("text", "out", "03"),
    ("text", "in", "09"),
    ("yaml", "code", "promptfooconfig.yaml"),
    ("bash", "cmd", "04"), ("text", "out", "04"),
    ("ts", "code", "show-failures.ts"),
    ("bash", "cmd", "05"), ("text", "out", "05"),
    ("text", "in", "07"),
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
    ("04", "Total Tokens: 17,489"), ("04", "16,050 prompt"), ("04", "✓ 3 passed (50.00%)"),
    ("04", "Running 6 test cases"),
    ("06", "Total Tokens: 17,201"), ("06", "✓ 3 passed (50.00%)"), ("06", "Writing output to results.jsonl\n100"),
    ("04", "Writing output to results.jsonl\n100"),
    ("07", "合格 3 / 6"),
    ("08", "Total Tokens: 31,477"), ("08", "29,913 prompt"), ("08", "✓ 3 passed (50.00%)"),
    ("12", "total_cost_usd=0.00236732"), ("12", "costBasis=claude-haiku-5-5:list"),
    ("13", "apiKeySource=none"), ("13", "model=claude-haiku-5-5"), ("13", "claude_code_version=2.1.322"),
    ("13", "\n0.125.1"), ("10", "tsc_exit=0"), ("10", "Version 7.0.2"),
]
for n, needle in facts:
    hit = needle in out(n)
    print(f"{'OK' if hit else 'NG'} run/{n}.log contains {needle!r}")
    ok &= hit

# 終了コード（08 は不合格ありの eval なので 100 が正しい）
want_exit = {n: "0" for n in ["01", "02", "03", "04", "05", "06", "07", "09", "10", "11", "12", "13"]}
want_exit["08"] = "100"
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
