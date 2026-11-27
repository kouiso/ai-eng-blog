#!/usr/bin/env python3
"""全記事の公開前ゲート（G01〜G11）の合否を1つの表で出す（issue #17、#44）。

各記事の `logs/<slug>/gate.md` の末尾にある「## 機械で読む合否」の節の、次の形の1行を読む。

    gate: G01=OK G02=OK G03=OK G04=OK G05=OK G06=OK G07=OK G08=OK G09=OK G10=OK G11=未判定

判定は OK・NG・未判定 の3つ。この行は、上の表と日付つきの追記で決まった今の判定を写したもの。
表や追記で判定を変えたときは、同じ commit でこの行も直す（write-article スキルの手順8）。
写し忘れに気づけるよう、表に `| G07 | … | OK | … |` の行がある項目は、ファイルの中で最後の行の判定と
この行の判定が違えば、読めない gate.md として扱う。

使い方:
    python3 scripts/gate-list.py            # 全記事の一覧（Markdown の表）
    python3 scripts/gate-list.py --tsv      # タブ区切り
    python3 scripts/gate-list.py <slug>...  # 指定した記事だけ

合否の欄は3つの値になる。G01〜G11 がすべて OK なら「合格」、NG が1つでもあれば「不合格」、
NG は無いが未判定が1つ以上あれば「未判定あり」。

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
# コードフェンスの行。1組目が ``` か ~~~ の並び、2組目がその後ろの文字。
# リストの項目や引用の中のフェンス（"- ```"、"1. ```"、"> ```"）も開く。gate.md には字下げのコードブロックを書かないので、字下げの数は問わない。
# 開く行は、字下げのあとに「リストの印（-*+ か 1. 1)）と空白」や「>」が並んでもよい
FENCE_OPEN_RE = re.compile(r"^[ \t]*(?:(?:[-*+]|\d+[.)])[ \t]+|>[ \t]*)*(`{3,}|~{3,})(.*)$")
# 閉じる行は、字下げと「>」のあとに ``` か ~~~ が並ぶだけ
FENCE_CLOSE_RE = re.compile(r"^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})(.*)$")
# 公開前ゲートの表の行。| G07 | 条件 | 確かめ方 | 判定 | 根拠 | の4列目が判定
TABLE_ROW_RE = re.compile(r"^\|\s*(G\d{2})\s*\|")


class GateError(Exception):
    pass


def outside_fences(lines: list[str]) -> list[str]:
    """コードフェンス（``` か ~~~。3つ以上並べる。リストの項目や引用の中、字下げつきも含む）の中の行を空行に置きかえる。
    行の番号を変えずに、見出し・gate: の行・表の行をフェンスの外だけで探せるようにする。"""
    result: list[str] = []
    fence: tuple[str, int] | None = None
    for line in lines:
        if fence is None:
            m = FENCE_OPEN_RE.match(line)
            # CommonMark と同じく、``` の開きの後ろ（info string）に ` があれば、フェンスではなくインラインのコード。~~~ は ` があってもよい
            if m and not (m.group(1)[0] == "`" and "`" in m.group(2)):
                fence = (m.group(1)[0], len(m.group(1)))
                result.append("")
            else:
                result.append(line)
            continue
        # 閉じるフェンスは、同じ字を同じ数以上並べただけの行（後ろに文字を置かない。全角の空白は文字として数える）
        m = FENCE_CLOSE_RE.match(line)
        if m and m.group(1)[0] == fence[0] and len(m.group(1)) >= fence[1] and not m.group(2).strip(" \t"):
            fence = None
        result.append("")
    return result


def parse_gate_md(text: str) -> dict[str, str]:
    """gate.md の本文から、機械で読む合否の行を読んで {G01: "OK", ...} を返す。形が違えば GateError。"""
    # 行末は半角の空白とタブだけ落とす（全角の空白を落とすと、フェンスの後ろの全角空白が消えて閉じる行に見えてしまう）
    lines = outside_fences([line.rstrip(" \t") for line in text.lstrip("\ufeff").splitlines()])
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
    for gate, verdict in table_verdicts(lines[:start]).items():
        if verdict != result[gate]:
            raise GateError(f"{gate} が表の最後の行では {verdict}、機械で読む行では {result[gate]} です（どちらかを直します）")
    return result


def normalize(cell: str) -> str | None:
    """表の判定の欄を OK・NG・未判定 にそろえる。「OK（注記あり）」は OK。読めなければ None。"""
    cell = cell.strip()
    for verdict in VERDICTS:
        if cell.startswith(verdict):
            return verdict
    return None


def table_verdicts(lines: list[str]) -> dict[str, str]:
    """公開前ゲートの表（A）の行から、項目ごとに、ファイルの中で最後の行の判定を返す。読めない行は飛ばす。"""
    found: dict[str, str] = {}
    for line in lines:
        m = TABLE_ROW_RE.match(line)
        if not m or m.group(1) not in GATES:
            continue
        cells = line.strip().strip("|").split("|")
        if len(cells) < 4:
            continue
        verdict = normalize(cells[3])
        if verdict:
            found[m.group(1)] = verdict
    return found


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="全記事の公開前ゲート（G01〜G11）の合否を一覧にする")
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument("--tsv", action="store_true", help="タブ区切りで出す")
    args = ap.parse_args(argv)

    logs = Path(args.root) / "logs"
    slugs = list(dict.fromkeys(args.slugs)) or sorted(p.parent.name for p in logs.glob("*/gate.md"))
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
        except (OSError, UnicodeDecodeError) as e:
            errors.append(f"{slug}: {path} を読めません（{e.__class__.__name__}）")
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
    pending = 0
    for slug, verdicts in rows:
        values = verdicts.values()
        if "NG" in values:
            overall = "不合格"
        elif "未判定" in values:
            overall = "未判定あり"
            pending += 1
        else:
            overall = "合格"
            passed += 1
        cells = [slug, *(verdicts[g] for g in GATES), overall]
        print(sep.join(cells) if args.tsv else "| " + sep.join(cells) + " |")

    # --tsv のときは表だけを標準出力に出し、まとめの行は標準エラーに出す
    summary = sys.stderr if args.tsv else sys.stdout
    counts = {g: sum(1 for _, v in rows if v[g] == "OK") for g in GATES}
    print(file=summary)
    print(f"{len(rows)}本のうち、G01〜G11 がすべて OK の記事: {passed}本、NG は無いが未判定がある記事: {pending}本、NG がある記事: {len(rows) - passed - pending}本", file=summary)
    print("項目ごとの OK の本数: " + "、".join(f"{g} {counts[g]}" for g in GATES), file=summary)
    for e in errors:
        print(f"[ERROR] {e}", file=sys.stderr)
    if errors:
        print(f"gate-list: {len(errors)}本の gate.md が読めませんでした", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
