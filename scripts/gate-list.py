#!/usr/bin/env python3
"""全記事の公開前ゲート（G01〜G11）の合否を1つの表で出す（issue #17、#44）。

各記事の `logs/<slug>/gate.md` の末尾にある「## 機械で読む合否」の節の、次の形の1行を読む。

    gate: G01=OK G02=OK G03=OK G04=OK G05=OK G06=OK G07=OK G08=OK G09=OK G10=OK G11=未判定

判定は OK・NG・未判定 の3つ。この行は、上の表と日付つきの追記で決まった今の判定を写したもの。
表や追記で判定を変えたときは、同じ commit でこの行も直す（write-article スキルの手順8）。

使い方:
    python3 scripts/gate-list.py            # 全記事の一覧（Markdown の表）
    python3 scripts/gate-list.py --tsv      # タブ区切り
    python3 scripts/gate-list.py <slug>...  # 指定した記事だけ

終了コード: 一覧を出せたら 0（NG や未判定があっても 0）。行が無い・形が違う gate.md が1つでもあれば 1。
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

GATES = [f"G{i:02d}" for i in range(1, 12)]
VERDICTS = ("OK", "NG", "未判定")
HEADING = "## 機械で読む合否"
LINE_RE = re.compile(r"^gate:(.*)$")
TOKEN_RE = re.compile(r"^(G\d{2})=(\S+)$")


class GateError(Exception):
    pass


def parse_gate_md(text: str) -> dict[str, str]:
    """gate.md の本文から、機械で読む合否の行を読んで {G01: "OK", ...} を返す。形が違えば GateError。"""
    lines = text.splitlines()
    try:
        start = lines.index(HEADING)
    except ValueError:
        raise GateError(f"「{HEADING}」の節がありません") from None
    if lines.count(HEADING) > 1:
        raise GateError(f"「{HEADING}」の節が2つ以上あります")
    section: list[str] = []
    for line in lines[start + 1 :]:
        if line.startswith("## "):
            raise GateError(f"「{HEADING}」の節はファイルの最後に置きます（後ろに「{line}」があります）")
        section.append(line)
    found = [m.group(1) for line in section if (m := LINE_RE.match(line))]
    # 節の外に gate: の行があると、どちらが今の判定か分からなくなる
    outside = [line for line in lines[:start] if LINE_RE.match(line)]
    if outside:
        raise GateError("「gate:」の行が節の外にもあります")
    if len(found) != 1:
        raise GateError(f"節の中に「gate:」の行が {len(found)} 行あります（1行だけにします）")
    result: dict[str, str] = {}
    for token in found[0].split():
        m = TOKEN_RE.match(token)
        if not m:
            raise GateError(f"読めない項目「{token}」（G01=OK の形で書きます）")
        gate, verdict = m.group(1), m.group(2)
        if gate not in GATES:
            raise GateError(f"知らない項目「{gate}」（G01〜G11 だけを書きます）")
        if gate in result:
            raise GateError(f"{gate} が2回あります")
        if verdict not in VERDICTS:
            raise GateError(f"{gate} の判定「{verdict}」は OK・NG・未判定 のどれでもありません")
        result[gate] = verdict
    missing = [g for g in GATES if g not in result]
    if missing:
        raise GateError(f"{'、'.join(missing)} がありません")
    order = [g for g in result]
    if order != GATES:
        raise GateError("G01 から G11 の順に並べます")
    return result


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="全記事の公開前ゲート（G01〜G11）の合否を一覧にする")
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument("--tsv", action="store_true", help="タブ区切りで出す")
    args = ap.parse_args(argv)

    logs = Path(args.root) / "logs"
    slugs = args.slugs or sorted(p.parent.name for p in logs.glob("*/gate.md"))
    if not slugs:
        print(f"gate-list: {logs} に gate.md がありません", file=sys.stderr)
        return 1

    rows: list[tuple[str, dict[str, str]]] = []
    errors: list[str] = []
    for slug in slugs:
        path = logs / slug / "gate.md"
        try:
            rows.append((slug, parse_gate_md(path.read_text(encoding="utf-8"))))
        except FileNotFoundError:
            errors.append(f"{slug}: {path} がありません")
        except GateError as e:
            errors.append(f"{slug}: {e}")

    sep = "\t" if args.tsv else " | "
    head = ["slug", *GATES, "合否"]
    if args.tsv:
        print(sep.join(head))
    else:
        print("| " + sep.join(head) + " |")
        print("|" + "---|" * len(head))
    passed = 0
    for slug, verdicts in rows:
        ok = all(v == "OK" for v in verdicts.values())
        passed += ok
        cells = [slug, *(verdicts[g] for g in GATES), "合格" if ok else "不合格"]
        print(sep.join(cells) if args.tsv else "| " + sep.join(cells) + " |")

    print()
    counts = {g: sum(1 for _, v in rows if v[g] == "OK") for g in GATES}
    print(f"{len(rows)}本のうち、G01〜G11 がすべて OK の記事: {passed}本")
    print("項目ごとの OK の本数: " + "、".join(f"{g} {counts[g]}" for g in GATES))
    for e in errors:
        print(f"[ERROR] {e}", file=sys.stderr)
    if errors:
        print(f"gate-list: {len(errors)}本の gate.md が読めませんでした", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
