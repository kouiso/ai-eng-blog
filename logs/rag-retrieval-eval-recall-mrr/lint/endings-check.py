# C19・C29 の補助。地の文（見出し、表、箇条書き、コードブロック、frontmatter を除く段落）の文末を調べ、
# ですます調（です、ます、でした、ました、ません、ください、ますか 等）以外の文末を出す。
import re, sys
lines = open(sys.argv[1], encoding="utf-8").read().split("\n")
in_fm = in_code = False
bad = 0; total = 0
for i, raw in enumerate(lines, 1):
    if i == 1 and raw == "---":
        in_fm = True; continue
    if in_fm:
        if raw == "---": in_fm = False
        continue
    if raw.startswith("```"):
        in_code = not in_code; continue
    s = raw.strip()
    if in_code or not s or s[0] in "#|-":
        continue
    for sent in re.findall(r"[^。]+。|[^。]+？$", s):  # 引用符の中の「？」では切らない
        total += 1
        t = re.sub(r"（[^（）]*）$", "", sent.rstrip("。？"))
        if not re.search(r"(です|ます|でした|ました|ません|ください|ますか|ませんでした|でしょうか)$", t):
            bad += 1
            print("NON-DESUMASU", i, sent)
print(f"sentences {total}, non-desumasu {bad}")
