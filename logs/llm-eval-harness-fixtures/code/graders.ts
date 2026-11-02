export type Grader =
  | { type: "exact"; expected: string }
  | { type: "contains"; keywords: string[] }
  | { type: "regex"; pattern: string };

export type GradeResult = { pass: boolean; reason: string };

export function normalize(text: string): string {
  return text.normalize("NFKC").trim().toLowerCase();
}

export function grade(answer: string, grader: Grader): GradeResult {
  const text = normalize(answer);
  switch (grader.type) {
    case "exact": {
      const expected = normalize(grader.expected);
      return text === expected
        ? { pass: true, reason: "完全一致" }
        : { pass: false, reason: `期待した答え "${expected}" と違う` };
    }
    case "contains": {
      const missing = grader.keywords.filter((k) => !text.includes(normalize(k)));
      return missing.length === 0
        ? { pass: true, reason: "キーワードをすべて含む" }
        : { pass: false, reason: `足りないキーワード: ${missing.join(", ")}` };
    }
    case "regex": {
      const matched = new RegExp(grader.pattern).test(text);
      return matched
        ? { pass: true, reason: `/${grader.pattern}/ に合う` }
        : { pass: false, reason: `/${grader.pattern}/ に合わない` };
    }
  }
}
