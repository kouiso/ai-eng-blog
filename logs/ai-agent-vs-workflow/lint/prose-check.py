#!/usr/bin/env python3
"""C16/C17/C19/C25/C28/C30-C32 と NG 語の補助チェック。
コードフェンスの中だけを外し、インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書き、
frontmatter の title と description は書かれたとおりに数える。
URL だけが入った表のセル（出典の表の URL 列）は文を含まないので文として数えない。"""
import re, sys
path = sys.argv[1]
lines = open(path, encoding="utf-8").read().split("\n")
# frontmatter
end = lines[1:].index("---") + 1
units = []  # (lineno, kind, text)
for i in range(1, end):
    m = re.match(r'^(title|description): "(.*)"$', lines[i])
    if m: units.append((i + 1, "fm-" + m.group(1), m.group(2)))
    m = re.match(r'^\s+title: "(.*)"$', lines[i])
    if m: units.append((i + 1, "fm-src-title", m.group(1)))
infence = False
prose_lines = []
for i in range(end + 1, len(lines)):
    l = lines[i]
    if l.startswith("```"):
        infence = not infence; continue
    if infence or not l.strip(): continue
    prose_lines.append((i + 1, l))
    if l.startswith("#"):
        units.append((i + 1, "heading", l.lstrip("# ")))
    elif l.startswith("|"):
        if re.match(r"^\|[-| ]+\|$", l): continue
        for c in [c.strip() for c in l.strip("|").split("|")]:
            if re.fullmatch(r"https?://\S+", c) or not c: continue
            units.append((i + 1, "cell", c))
    elif l.startswith("- "):
        units.append((i + 1, "bullet", l[2:]))
    else:
        units.append((i + 1, "para", l))
sents = []
for ln, kind, text in units:
    for s in re.findall(r"[^。？]*[。？]|[^。？]+$", text):
        s = s.strip()
        if s: sents.append((ln, kind, s))
over = [(ln, len(s), s) for ln, k, s in sents if len(s) > 60]
print(f"C25 over60={len(over)} max={max(len(s) for _,_,s in sents)}")
for o in over: print("  OVER", o)
body = [(ln, s) for ln, k, s in sents if k in ("para", "bullet", "fm-description") and s.endswith("。")]
lens = [len(s) for _, s in body]
print(f"C16 prose sentences={len(lens)} min={min(lens)} max={max(lens)} le20={sum(1 for x in lens if x<=20)} 41-60={sum(1 for x in lens if 41<=x<=60)}")
ok_end = re.compile(r"(です|ます|ません|でした|ました|ください|ましょう|ですか|ますか)。$|(（出典[0-9、出典]+）)。$")
def core(s):
    return re.sub(r"（出典[0-9、出典]+）(?=。$)", "", s)
nd = [(ln, s) for ln, s in body if not re.search(r"(です|ます|ません|でした|ました|ください|ますか|ですか)。$", core(s))]
print(f"C19 non-desumasu={len(nd)}")
for x in nd: print("  ND", x)
# C17: 3 consecutive identical last-3-char endings within prose paragraphs/bullets
ends = [(ln, core(s)[-4:-1]) for ln, s in body]
run = []
for a, b, c in zip(ends, ends[1:], ends[2:]):
    if a[1] == b[1] == c[1]: run.append((a[0], b[0], c[0], a[1]))
print(f"C17 same-ending3 (last3)={len(run)}")
for r in run: print("  RUN", r)
text = "\n".join(l for _, l in prose_lines) + "\n" + "\n".join(t for _, k, t in units if k.startswith("fm"))
pats = {"bold **": r"\*\*", "em-dash": "—", "罫線": "─", "U+2015": "―", "全角コロン": "：", "全角スラッシュ": "／",
        "や並列": r"[^\s`]や[、\s]|[ぁ-んァ-ン一-龥A-Za-z0-9）」`]や[ァ-ン一-龥A-Za-z「`]",
        "でしょう": "でしょう", "かもしれ": "かもしれ", "可能性があります": "可能性があります",
        "解説します": "解説します", "紹介します": "紹介します", "見ていき": "見ていき", "ここでは": "ここでは",
        "ここから": "ここから", "ここまで": "ここまで", "次は": "次は", "まとめ": "まとめ", "整理": "整理",
        "地図": "地図", "仕様書": "仕様書", "設計書": "設計書", "レシピ": "レシピ", "徹底解説": "徹底解説", "完全ガイド": "完全ガイド",
        "ではなく": "ではなく", "ではありません": "ではありません", "じゃない": "じゃない", "まず最初": "まず最初", "など": "など"}
for k, p in pats.items():
    hits = [ln for ln, l in prose_lines if re.search(p, re.sub(r"`[^`]*`", "", l))] + \
           [ln for ln, kd, t in units if kd.startswith("fm") and re.search(p, t)]
    print(f"PAT {k}: {len(hits)} {hits}")
