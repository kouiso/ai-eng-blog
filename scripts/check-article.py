#!/usr/bin/env python3
"""記事ごとの検査を1本にまとめたスクリプト（issue #42）。標準ライブラリだけで動く。

使い方（リポジトリのルートで）:
    python3 scripts/check-article.py <slug> [<slug> ...]
    python3 scripts/check-article.py --all
    python3 scripts/check-article.py --only prose|outputs <slug>
    python3 scripts/check-article.py --root DIR --exceptions FILE <slug>

終了コード: 0 = 記事ごとの「確定」の検査がすべて通った。1 = 確定の検査に1件以上落ちた。2 = 使い方の誤り、
または記事ファイルが無い。「候補」は一覧に出すだけで、終了コードには影響しない。

検査は2群。どの検査も docs/tech-writing-pack/checklist.md の1行に対応づけ、その行を表示に出す。
checklist とガイドに無い除外は入れない。数えないものは次のとおりで、どれも根拠を持ち、数を出力する。
  - フェンスで囲んだコードブロックの中身（全検査）。
  - C30 から C32 では、インラインコードの中の記号も数えない（guides/03-anti-ai.md 372行）。
  - C25 では、セルの中身がちょうど URL 1つだけの表のセルは数えない（文ではなく、URL は句読点で切れない。
    出典の表に URL を置く規約がある）。URL と語が混じるセル、地の文、箇条書き、見出し、表の中の文、
    frontmatter の読者に見える文字列、sources の title、インラインコード（1字ずつ）はすべて数える。
    数えなかったセルの件数と、60字を超えるものの行を [SKIP C25-URL] として出力する。
  - C17 の文の並びは、地の文と箇条書きの文。見出しと表のセルは並びに入れない。
実行はしない。LLM も呼ばない。

行ID は .claude/skills/write-article/SKILL.md 付録 B の C01 から C39 に合わせる。

  確定（落ちたら exit 1）
    C17  同じ語尾が3回以上連続していない        (guides/03-anti-ai.md「語尾の反復チェック」)
    C25  60字超の文がない                        (guides/05-technical-writing.md 1節: 60字超で分割)
    C30  `**` が残っていない（コードとインラインコードの外）  (guides/03-anti-ai.md 記号)
    C31  em-dash `—` と罫線 `─` を使っていない    (同上)
    C32  `：`+半角スペース、`／` を使っていない    (同上)
    OUTPUT  記事の出力ブロック（```text）が、run ログの出力部分に1字も違わず載っている
  候補（一覧に出すだけ）
    C16  文長に緩急がある                        (guides/03-anti-ai.md 4節「リズムの不在」)
    C26  用語が統一されている                    (guides/05-technical-writing.md「用語の統一」「表記の統一」)
    C28  AND/OR が明確（「AやB」）               (guides/05-technical-writing.md「AやB」は曖昧)
"""
import argparse
import json
import os
import re
import sys

ARTICLES = "content/articles"
LOGS = "logs"
DEFAULT_EXCEPTIONS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "check-article-exceptions.json")

# frontmatter のうち読者に見える文字列。sources の title も数える。
FM_TEXT_KEYS = ("title:", "description:", "cost_estimate:", "run_environment:")
FM_SOURCE_TITLE = re.compile(r"^\s+title:")

C25_LIMIT = 60          # checklist C25「60字超」
C17_RUN = 3             # checklist C17「3回以上連続」
C16_RUN = 5             # guides/03 4節「30〜50字の文がずっと続く」。5文以上を候補にする
C16_RANGE = (30, 50)

# C17 の語尾は2通りで見て、どちらかに当たれば数える。
#  (1) 末尾3字の一致
#  (2) 文末の形の一致。形ごとに別の語尾で、「です」「ます」「ました」が混ざる並びは同じ語尾とは数えない。
#      形はデータ。guides/03-anti-ai.md 409行（〜ましょう、〜でしょう、〜です、〜ません）と、
#      193行（〜です。〜です。〜です。の3連続）に加え、丁寧体の基本形のます、ました、でした。長い形を先に書く。
ENDING_FORMS = ("でしょう", "ましょう", "ません", "ました", "でした", "です", "ます")
ENDING_CLASS = re.compile("(" + "|".join(ENDING_FORMS) + ")$")

# C26 の表記ゆれ候補（guides/05「一概念一用語」「技術用語の表記」）。データ。
C26_PAIRS = [
    (r"サーバー", r"サーバ(?!ー)"),
    (r"ユーザー", r"ユーザ(?!ー)"),
    (r"パラメーター", r"パラメータ(?!ー)"),
    (r"ブラウザー", r"ブラウザ(?!ー)"),
    (r"ライブラリー", r"ライブラリ(?!ー)"),
    (r"コンピューター", r"コンピュータ(?!ー)"),
    (r"フォルダ", r"ディレクトリ"),
    (r"関数", r"ファンクション"),
]

C28_PATTERN = re.compile(r"[^\s、。]{1,12}や[^\s、。]{1,12}")
INLINE_CODE = re.compile(r"(`+)(?!`).+?(?<!`)\1(?!`)")
C31_CHARS = "—―─"   # — ― ─（── は ─ の連続）
URL_ONLY = re.compile(r"https?://\S+")
OUTPUT_HEADER = re.compile(r"^-{3,5} [^\n]*(?:stdout|stderr|output)[^\n]* -{3,5}$")
END_MARKER = re.compile(r"^-{3,5} (?:exit\b|command\b)")


class Result:
    def __init__(self, slug):
        self.slug = slug
        self.hard = []        # (check, where, message)
        self.cands = []
        self.info = []

    def fail(self, check, where, msg):
        self.hard.append((check, where, msg))

    def cand(self, check, where, msg):
        self.cands.append((check, where, msg))


def split_sentences(text):
    return [p.strip() for p in re.findall(r"[^。]+。?", text) if p.strip()]


def parse_article(text):
    """本文を (行番号, 種類, 文字列) に分ける。種類は fm / heading / cell / prose。
    コードブロックの中身は数えず、行数だけ返す。非コード行は plain_lines に残す。"""
    segs, plain_lines = [], []
    code_lines = 0
    in_fm = False
    in_code = False
    for i, raw in enumerate(text.split("\n"), 1):
        if i == 1 and raw == "---":
            in_fm = True
            plain_lines.append((i, raw))
            continue
        if in_fm:
            plain_lines.append((i, raw))
            if raw == "---":
                in_fm = False
            elif raw.startswith(FM_TEXT_KEYS) or FM_SOURCE_TITLE.match(raw):
                segs.append((i, "fm", raw.split(":", 1)[1].strip().strip('"')))
            continue
        if raw.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            code_lines += 1
            continue
        plain_lines.append((i, raw))
        s = raw.strip()
        if not s:
            continue
        if s.startswith("|"):
            if re.fullmatch(r"\|[-| :]+\|", s):
                continue
            for cell in [c.strip() for c in s.strip("|").split("|")]:
                if cell:
                    segs.append((i, "url-cell" if URL_ONLY.fullmatch(cell) else "cell", cell))
            continue
        if s.startswith("#"):
            segs.append((i, "heading", s.lstrip("#").strip()))
            continue
        segs.append((i, "prose", s))
    sents = [(i, k, p) for i, k, t in segs for p in split_sentences(t)]
    return sents, plain_lines, code_lines


def ending3(s):
    s = s.rstrip("。")
    s = re.sub(r"（[^（）]*）$", "", s)
    return s


def check_prose(res, path):
    text = open(path, encoding="utf-8").read()
    sents, plain_lines, code_lines = parse_article(text)
    name = os.path.basename(path)
    res.info.append(f"prose: 文 {len(sents)}、数えなかったコードブロックの行 {code_lines}")

    # C25 60字超（フェンス外の文。地の文、箇条書き、見出し、表の中の文、frontmatter の読者に見える文字列を数え、種類を付けて出す。
    # 数えない URL だけのセルは、下の説明のとおり。）
    # セルの中身がちょうど URL 1つだけのとき（URL と語が混じるセルは数える）は、文ではない（URL は句読点で切れない）
    # ので数えず、件数を出す。60字を超えるものは行番号を [SKIP C25-URL] の名前で並べる。
    url_cells = [x for x in sents if x[1] == "url-cell"]
    res.info.append(f"C25 で数えなかった URL だけの表のセル（セル全体が URL 1つ）: {len(url_cells)}件")
    for i, _k, u in url_cells:
        if len(u) > C25_LIMIT:
            res.info.append(f"  [SKIP C25-URL] {name}:{i} {len(u)}字 {u}")
    for i, kind, s in sents:
        if kind != "url-cell" and len(s) > C25_LIMIT:
            res.fail("C25", f"{name}:{i}", f"{len(s)}字 [{kind}] {s}")

    # C17 同じ語尾が3回以上連続（語尾3字の一致、または丁寧語尾の種類の一致）。
    # 文の取り方は pack の writing-lint.py（sentences_with_lines）に合わせる。
    body = [x for x in sents if x[1] == "prose"]   # 地の文と箇条書き。見出しと表のセルは並びに入れない
    flagged = []
    for k in range(len(body) - C17_RUN + 1):
        win = body[k:k + C17_RUN]
        ends = [ending3(x[2]) for x in win]
        tails = [e[-3:] for e in ends]
        classes = [ENDING_CLASS.search(e) for e in ends]
        same_tail = len(set(tails)) == 1
        same_class = all(classes) and len({c.group(1) for c in classes}) == 1
        if same_tail or same_class:
            flagged.append((k, f"語尾「{tails[0]}」" if same_tail else f"語尾「{classes[0].group(1)}」"))
    # 重なる窓は1つの連続区間にまとめて1件と数える（窓の数も出す）
    j = 0
    while j < len(flagged):
        e = j
        while e + 1 < len(flagged) and flagged[e + 1][0] == flagged[e][0] + 1:
            e += 1
        first, last = body[flagged[j][0]], body[flagged[e][0] + C17_RUN - 1]
        n = flagged[e][0] + C17_RUN - flagged[j][0]
        res.fail("C17", f"{name}:{first[0]}-{last[0]}", f"{flagged[j][1]}が{n}文連続（{n - C17_RUN + 1}窓）")
        j = e + 1

    # C16 文長の緩急（候補）: 30〜50字の文が5文以上続く区間
    lo, hi = C16_RANGE
    run = []
    for x in body + [None]:
        if x is not None and lo <= len(x[2]) <= hi:
            run.append(x)
            continue
        if len(run) >= C16_RUN:
            res.cand("C16", f"{name}:{run[0][0]}-{run[-1][0]}", f"{lo}〜{hi}字の文が{len(run)}文続く")
        run = []

    # C26 用語の統一（候補）
    alltext = [(i, s) for i, _k, s in sents]
    for a, b in C26_PAIRS:
        la = [i for i, s in alltext if re.search(a, s)]
        lb = [i for i, s in alltext if re.search(b, s)]
        if la and lb:
            res.cand("C26", name, f"表記が混在: /{a}/ {len(la)}件（行 {la[:5]}）と /{b}/ {len(lb)}件（行 {lb[:5]}）")

    # C28 AND/OR（候補）
    for i, _k, s in sents:
        for m in C28_PATTERN.finditer(s):
            res.cand("C28", f"{name}:{i}", f"「{m.group(0)}」")

    # C30 / C31 / C32: コードブロックとインラインコードの中の記号は対象外
    # （docs/tech-writing-pack/guides/03-anti-ai.md 372行「コードは原文のままが正しい」）。frontmatter は数える。
    for i, raw0 in plain_lines:
        raw = INLINE_CODE.sub("", raw0)
        if "**" in raw:
            res.fail("C30", f"{name}:{i}", f"`**` が残っている: {raw.strip()[:70]}")
        for ch in C31_CHARS:
            if ch in raw:
                res.fail("C31", f"{name}:{i}", f"U+{ord(ch):04X} {ch}: {raw.strip()[:70]}")
        if "： " in raw:
            res.fail("C32", f"{name}:{i}", f"「： 」: {raw.strip()[:70]}")
        if "／" in raw:
            res.fail("C32", f"{name}:{i}", f"「／」: {raw.strip()[:70]}")


# --- 出力ブロックの照合 -------------------------------------------------------

def fences_of(text):
    """(開始行, 情報文字列, 本文の行リスト) をコードブロックごとに返す。"""
    out, cur = [], None
    for i, raw in enumerate(text.split("\n"), 1):
        if raw.startswith("```"):
            if cur is None:
                cur = (i, raw[3:].strip(), [])
            else:
                out.append(cur)
                cur = None
        elif cur is not None:
            cur[2].append(raw.rstrip("\r"))
    return out


def log_regions(text):
    """run ログの出力部分を行リストの列で返す。出力の見出しが1つも無ければ None。
    出力部分は、出力の見出し（`--- stdout+stderr ---` `--- output ---` など）の次の行から、
    終了コードの行（`--- exit=N`）か `--- command ---` の行の手前まで。途中の `--- server stderr ---` のような
    見出しは出力の一部として残す（記事の出力ブロックがそれを含むことがある）。"""
    regions, cur = [], None
    found = False
    for raw in text.split("\n"):
        line = raw.rstrip("\r")
        if cur is None:
            if OUTPUT_HEADER.match(line):
                found = True
                cur = []
        elif END_MARKER.match(line):
            regions.append(cur)
            cur = None
        else:
            cur.append(line)
    if cur is not None:
        regions.append(cur)
    if not found:
        return legacy_regions(text)
    return [r[:-1] if r and r[-1] == "" else r for r in regions]


def legacy_regions(text):
    """古い書式のログ（promptfoo の記事のログ）: `$ コマンド` の行のあと、`----` だけの行が2本あり、
    その間が出力、2本目のあとが `exit=N`。`----` がちょうど2本のログだけを読み、それ以外は書式違反のままにする。"""
    lines = [x.rstrip("\r") for x in text.split("\n")]
    seps = [k for k, x in enumerate(lines) if x == "----"]
    if len(seps) != 2 or not any(x.startswith("$ ") for x in lines[:seps[0]]):
        return None
    region = lines[seps[0] + 1:seps[1]]
    return [region[:-1] if region and region[-1] == "" else region]


def contains_block(region, block):
    n = len(block)
    return n > 0 and any(region[k:k + n] == block for k in range(len(region) - n + 1))


def load_exceptions(path, slug, res):
    if not os.path.exists(path):
        return []
    data = json.load(open(path, encoding="utf-8"))
    items = data.get(slug, [])
    for e in items:
        if not str(e.get("reason", "")).strip() or not e.get("first_line"):
            res.fail("OUTPUT", "exceptions", f"例外には first_line と reason が要る: {e}")
    return items


def check_outputs(res, root, slug, exceptions_path):
    art = os.path.join(root, ARTICLES, slug + ".md")
    run_dir = os.path.join(root, LOGS, slug, "run")
    name = slug + ".md"
    blocks = [f for f in fences_of(open(art, encoding="utf-8").read()) if f[1] == "text"]
    exceptions = load_exceptions(exceptions_path, slug, res)
    if not os.path.isdir(run_dir):
        res.fail("OUTPUT", run_dir, "run ディレクトリが無い")
        return
    logs = sorted(f for f in os.listdir(run_dir) if f.endswith(".log"))
    if not logs:
        res.fail("OUTPUT", run_dir, "*.log が1つも無い")
        return
    regions = []
    for f in logs:
        r = log_regions(open(os.path.join(run_dir, f), encoding="utf-8").read())
        if r is None:
            res.fail("OUTPUT", f"run/{f}", "出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない")
        else:
            regions.extend(r)
    used = set()
    matched = 0
    for i, _info, body in blocks:
        block = body[:-1] if body and body[-1] == "" else body
        if any(contains_block(r, block) for r in regions):
            matched += 1
            continue
        first = body[0] if body else ""
        hit = [e for e in exceptions if e.get("first_line") == first]
        if hit:
            used.add(first)
            continue
        res.fail("OUTPUT", f"{name}:{i}", f"出力ブロック（{len(block)}行、先頭「{first[:50]}」）がどの run ログにも無い")
    for e in exceptions:
        if e.get("first_line") not in used:
            res.fail("OUTPUT", "exceptions", f"例外が記事のどのブロックにも当たらない（古い）: {e.get('first_line')}")
    res.info.append(
        f"outputs: ```text {len(blocks)}件、ログに一致 {matched}件、例外 {len(used)}件、"
        f"ログ {len(logs)}本（出力部分 {len(regions)}か所）"
    )
    for e in exceptions:
        if e.get("first_line") in used:
            res.info.append(f"  例外: 「{e['first_line'][:40]}」 理由: {e['reason']}")


def main(argv=None):
    ap = argparse.ArgumentParser(description="記事の検査（C16/C17/C25/C26/C28/C30-C32 と出力ブロックの照合）")
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--only", choices=["prose", "outputs"])
    ap.add_argument("--root", default=".")
    ap.add_argument("--exceptions", default=DEFAULT_EXCEPTIONS)
    a = ap.parse_args(argv)
    slugs = list(a.slugs)
    if a.all:
        d = os.path.join(a.root, ARTICLES)
        slugs += sorted(f[:-3] for f in os.listdir(d) if f.endswith(".md"))
    if not slugs:
        ap.error("slug か --all を指定してください")
    code = 0
    for slug in slugs:
        art = os.path.join(a.root, ARTICLES, slug + ".md")
        if not os.path.isfile(art):
            print(f"== {slug}\n[ERROR] 記事が無い: {art}")
            code = max(code, 2)
            continue
        res = Result(slug)
        if a.only != "outputs":
            check_prose(res, art)
        if a.only != "prose":
            check_outputs(res, a.root, slug, a.exceptions)
        print(f"== {slug}")
        for line in res.info:
            print(f"  {line}")
        for c, w, m in res.hard:
            print(f"[FAIL {c}] {w} {m}")
        for c, w, m in res.cands:
            print(f"[候補 {c}] {w} {m}")
        counts = {}
        for c, _w, _m in res.hard:
            counts[c] = counts.get(c, 0) + 1
        ccounts = {}
        for c, _w, _m in res.cands:
            ccounts[c] = ccounts.get(c, 0) + 1
        print(f"SUMMARY {slug}: 確定 {len(res.hard)} {json.dumps(counts, ensure_ascii=False)} / 候補 {len(res.cands)} {json.dumps(ccounts, ensure_ascii=False)}")
        if res.hard:
            code = max(code, 1)
    return code


if __name__ == "__main__":
    sys.exit(main())
