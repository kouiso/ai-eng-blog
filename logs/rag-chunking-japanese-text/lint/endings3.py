# 語尾の3連続（guides/03 症状⑥「〜です。〜です。〜です。」と「語尾の反復チェック」）を、
# 文末の助動詞の形で比べる。prose-check.py の SAME3（末尾3文字の一致）では
# 「形です／本文です／ものです」を同じ語尾と数えられないため、こちらを C17 の判定に使う。
# 比べる単位: 地の文の段落の文（見出し、コードブロック、表、箇条書きで列が切れる）。
# 段落をまたいでも、間に見出し・コードブロック・表・箇条書きが無ければ続けて数える。
import re, sys
CLASSES = ["ましょう", "でしょう", "ません", "ました", "でした", "ます", "です"]
def ending(s):
    s = s.strip().rstrip("。")
    s = re.sub(r"（[^（）]*）$", "", s)
    for c in CLASSES:
        if s.endswith(c):
            return c
    return s[-2:]
def split_sents(s):
    # かぎ括弧と丸括弧の内側の「。」「？」では切らない（引用の中の句点を文の終わりにしない）
    out, buf, depth = [], "", 0
    for ch in s:
        buf += ch
        if ch in "「『（(": depth += 1
        elif ch in "」』）)" and depth > 0: depth -= 1
        elif ch in "。？" and depth == 0:
            out.append(buf.strip()); buf = ""
    if buf.strip(): out.append(buf.strip())
    return out
lines = open(sys.argv[1], encoding="utf-8").read().split("\n")
runs, cur = [], []
in_fm = in_code = False
for i, raw in enumerate(lines, 1):
    if i == 1 and raw == "---":
        in_fm = True; continue
    if in_fm:
        if raw == "---": in_fm = False
        continue
    if raw.startswith("```"):
        in_code = not in_code
        if cur: runs.append(cur); cur = []
        continue
    if in_code: continue
    s = raw.strip()
    if not s: continue
    if s.startswith(("#", "|", "- ")) or re.match(r"\d+\. ", s):
        if cur: runs.append(cur); cur = []
        continue
    for part in split_sents(s):
        cur.append((i, part))
if cur: runs.append(cur)
n = sum(len(r) for r in runs)
hits = 0
for r in runs:
    for k in range(len(r) - 2):
        e = [ending(x[1]) for x in r[k:k + 3]]
        if e[0] == e[1] == e[2]:
            hits += 1
            print(f"SAME3 lines {r[k][0]}-{r[k+2][0]} ending={e[0]}: " + " / ".join(x[1][-12:] for x in r[k:k+3]))
print(f"prose sentences: {n} in {len(runs)} runs")
print("SAME3:", hits)
