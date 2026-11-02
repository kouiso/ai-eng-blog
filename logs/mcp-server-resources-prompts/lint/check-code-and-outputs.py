#!/usr/bin/env python3
"""記事のコードブロックと logs の code/、run/ を突き合わせる（gate.md の G04、C08 の根拠）。

1. 記事の json/ts のコードブロックを、直前の段落で最初に名前を挙げたファイル（code/ の同名ファイル）と1文字ずつ比べる
2. 記事の bash のコードブロック（中身全体）が、run/NN.log の command と1文字も違わないかを確かめ、終了コードが 0 であることを見る
3. bash のブロックの直後にある最初の text ブロックを、そのログの出力部分と1文字ずつ比べる
4. それ以外の text ブロックは、全行がどれかのログの出力にそのまま含まれるか（抜き出しか）を調べて一覧に出す
使い方: python3 check-code-and-outputs.py <原稿.md> <logs/<slug> のパス>
"""
import re
import sys
from pathlib import Path

art = Path(sys.argv[1]).read_text(encoding="utf-8")
logs = Path(sys.argv[2])
blocks = [(m.group(1), m.group(2), art[:m.start()]) for m in
          re.finditer(r"^```(\w+)\n(.*?)^```$", art, flags=re.S | re.M)]

runs = {}
for f in sorted((logs / "run").glob("*.log")):
    t = f.read_text(encoding="utf-8")
    cmd_part = t.split("command:\n", 1)[1].split("--- output (stdout+stderr) ---\n", 1)[0]
    cmd = "\n".join(l[2:] for l in cmd_part.rstrip("\n").split("\n")) + "\n"
    out = t.split("--- output (stdout+stderr) ---\n", 1)[1].rsplit("--- exit=", 1)[0]
    code = re.search(r"--- exit=(\d+)", t).group(1)
    runs[cmd] = (f.name, out, code)

ok = True
last = None
used_text = True
for lang, body, before in blocks:
    if lang in ("ts", "json"):
        para = [p for p in before.split("\n\n") if p.strip()][-1]
        names = re.findall(r"`([\w.-]+\.(?:ts|json))`", para)
        name = names[0] if names else None
        src = (logs / "code" / name).read_text(encoding="utf-8") if name else None
        same = src == body
        ok &= same
        print(f"CODE {name}: {'SAME' if same else 'DIFF'}")
    elif lang == "bash":
        if body in runs:
            last = runs[body]
            used_text = False
            print(f"CMD {body.strip()!r}: run/{last[0]} exit={last[2]}")
            ok &= last[2] == "0"
        else:
            print(f"CMD {body.strip()!r}: NOT FOUND")
            ok = False
    elif lang == "text":
        if last is not None and not used_text:
            same = last[1] == body
            ok &= same
            used_text = True
            print(f"OUT after run/{last[0]}: {'SAME' if same else 'DIFF'}")
        else:
            found = [name for name, out, _ in runs.values()
                     if all(line in out.split("\n") for line in body.rstrip("\n").split("\n"))]
            where = f"抜き出し（全行が run/{found[0]} の出力にある）" if found else "実行結果ではない"
            print(f"TEXT {body.splitlines()[0]!r} ほか {len(body.splitlines())} 行: {where}")

print("ALL OK" if ok else "NG")
