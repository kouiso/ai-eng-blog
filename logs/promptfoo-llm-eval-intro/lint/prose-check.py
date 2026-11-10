"""原稿の地の文を機械的に確かめる補助スクリプト（checklist C25・C19・C29・C30〜C32・C17 の判定材料）。

除外するのはコードフェンスの中だけ。インラインコード、表、リスト、見出し、frontmatter の値も文として数える
（スキル「ゲートの項目はガイドを読んでから判定する」の、除外を足さない決まりに従う）。
文の区切りは「。」「？」と、句点の無い行末（表のセル、見出し、リスト項目）。
"""
import re
import sys

path = sys.argv[1]
lines = open(path, encoding="utf-8").read().split("\n")

in_fence = False
sentences = []  # (行番号, 文)
issues = []
url_cells = 0
fm_end = next(i for i in range(1, len(lines)) if lines[i] == "---") + 1
for no, line in enumerate(lines, 1):
    if no <= fm_end:
        # frontmatter は title と description の値だけを文として数える（記事ページに出る文）
        m = re.match(r'^(title|description):\s*"(.*)"$', line)
        if m:
            for part in re.split(r"(?<=[。？])", m.group(2)):
                if part.strip():
                    sentences.append((no, part.strip()))
        continue
    if line.startswith("```"):
        in_fence = not in_fence
        continue
    if in_fence:
        continue
    if "**" in line:
        issues.append((no, "C30 アスタリスク2つ", line))
    for mark in ["—", "──", "――", "─"]:
        if mark in line:
            issues.append((no, f"C31 {mark}", line))
    if re.search(r"：\s", line):
        issues.append((no, "C32 全角コロン+空白", line))
    if "／" in line:
        issues.append((no, "C32 全角スラッシュ", line))
    text = line.strip()
    if not text or text == "---":
        continue
    cells = [c.strip() for c in text.strip("|").split("|")] if text.startswith("|") else [text]
    for cell in cells:
        if not cell or set(cell) <= set("-: "):
            continue
        if re.fullmatch(r"https?://\S+", cell):
            url_cells += 1  # URL だけの表のセルは文ではないので数えない（出典の表）
            continue
        for part in re.split(r"(?<=[。？])", cell):
            part = part.strip()
            if part:
                sentences.append((no, part))

long_count = 0
for no, s in sentences:
    if len(s) > 60:
        long_count += 1
        issues.append((no, f"C25 {len(s)}字", s))

# 文末（ですます）の確認：。で終わる文のうち、です・ます系で終わらないもの
plain = 0
endings = []
for no, s in sentences:
    if not s.endswith("。"):
        continue
    body = s[:-1]
    body = re.sub(r"（[^（）]*）$", "", body)
    ok = re.search(r"(です|ます|ません|でした|ました|ましょう|ください|でしょう|ませんでした|ますか|ですか)$", body)
    endings.append((no, "polite" if ok else "plain"))
    if not ok:
        plain += 1
        issues.append((no, "C19 常体の疑い", s))

# 同じ語尾の3連続（C17）：直前2文と同じ語尾（末尾3字）
run = 0
prev = None
for no, s in sentences:
    if not s.endswith("。"):
        prev = None
        run = 0
        continue
    tail = re.sub(r"（[^（）]*）$", "", s[:-1])[-3:]
    if tail == prev:
        run += 1
        if run >= 2:
            issues.append((no, f"C17 語尾「{tail}」3連続", s))
    else:
        run = 0
    prev = tail

for no, kind, s in issues:
    print(f"{no}\t{kind}\t{s}")
print(f"sentences={len(sentences)} long(>60)={long_count} max={max(len(x) for _, x in sentences)} plain={plain} url_only_cells_excluded={url_cells} issues={len(issues)}")
