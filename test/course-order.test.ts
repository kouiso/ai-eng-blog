import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COURSE_STEPS, courseArticleSlugs } from "../src/utils/course";

const root = new URL("../", import.meta.url);
const plan = readFileSync(new URL("content/plan.md", root), "utf8");

/** plan.md の指定した節にある表から、(ステップ番号, slug) を上から順に取り出す */
function planRows(heading: string): { step: number; slug: string }[] {
	const rows: { step: number; slug: string }[] = [];
	let inSection = false;
	for (const line of plan.split("\n")) {
		if (line.startsWith("## ")) inSection = line.startsWith(heading);
		if (!inSection) continue;
		const m = line.match(/^\| \d+ \| (\d) \|(?: [^|]+\|)? `([a-z0-9-]+)`/);
		if (m) rows.push({ step: Number(m[1]), slug: m[2]! });
	}
	return rows;
}

const planTable = planRows("## 計画表");
const publishOrder = planRows("## 公開の順番");

describe("COURSE_STEPS の articles", () => {
	it("plan.md の表を読み取れている（30本）", () => {
		expect(planTable).toHaveLength(30);
		expect(publishOrder.map((r) => r.slug)).toEqual(planTable.map((r) => r.slug));
	});

	it("どの slug にも content/articles/<slug>.md がある", () => {
		for (const step of COURSE_STEPS) {
			for (const slug of step.articles) {
				expect(existsSync(new URL(`content/articles/${slug}.md`, root)), `${step.slug}: ${slug}`).toBe(true);
			}
		}
	});

	it("各ステップの並びが plan.md の番号順と同じ", () => {
		COURSE_STEPS.forEach((step, i) => {
			const expected = planTable.filter((r) => r.step === i + 1).map((r) => r.slug);
			expect(step.articles, step.slug).toEqual(expected);
		});
	});

	it("計画の30本がちょうど1回ずつ入っている", () => {
		const all = COURSE_STEPS.flatMap((s) => s.articles);
		expect(new Set(all).size).toBe(all.length);
		expect([...all].sort()).toEqual(planTable.map((r) => r.slug).sort());
	});

	it("courseArticleSlugs はステップの並びを返し、知らないステップは空", () => {
		expect(courseArticleSlugs("llm-api")[0]).toBe("claude-p-script-first-call");
		expect(courseArticleSlugs("llm-eval").at(-1)).toBe("llm-eval-dataset-from-logs");
		expect(courseArticleSlugs("nope")).toEqual([]);
		expect(courseArticleSlugs(null)).toEqual([]);
	});
});
