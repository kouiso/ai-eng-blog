#!/usr/bin/env python3
"""run/12.log（画面の操作の記録）に、本文の「5. 画面で調べる」節が書いた表示が出ているかを確かめる。
使い方: python3 check-web-ui.py <logs/<slug> のパス>
"""
import sys
from pathlib import Path

t = Path(sys.argv[1], "run", "12.log").read_text(encoding="utf-8")
sections = t.split("=== ")
def sec(prefix):
    return next(s for s in sections if s.startswith(prefix))

checks = [
    ("開いた直後は Disconnected", "Disconnected" in sec("1.")),
    ("開いた直後に node のスイッチ", 'switch "Connect or disconnect \\"node\\""' in sec("1.")),
    ("開いた直後に Read-only session の表示", 'alert "Read-only session"' in sec("1.")),
    ("スイッチのあと Connected", "paragraph: Connected" in sec("2.")),
    ("スイッチのあと上に Tools が出る", 'radio "Tools"' in sec("2.")),
    ("Protocol に initialize", "OK initialize" in sec("2.")),
    ("Protocol に notifications/initialized", "notifications/initialized" in sec("2.")),
    ("Protocol に tools/list", "OK tools/list" in sec("2.")),
    ("count_chars を選ぶと text の欄と Execute Tool", 'textbox "text"' in sec("3.") and 'button "Execute Tool"' in sec("3.")),
    ("Results に 文字数: 4 / 行数: 1", 'heading "Results"' in sec("4.") and "文字数: 4 / 行数: 1" in sec("4.")),
    ("Protocol に tools/call", "OK tools/call" in sec("4.")),
    ("Console にサーバーの stderr の行", "Server Console" in sec("5.") and "char-count MCP server started (stdio)" in sec("5.")),
    ("終了コード 0", t.rstrip().endswith("--- exit=0")),
]
for name, passed in checks:
    print(("PASS " if passed else "FAIL ") + name)
print("ALL OK" if all(p for _, p in checks) else "NG")
