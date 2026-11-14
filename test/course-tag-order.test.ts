import { describe, expect, it } from "vitest";
import { orderByCourse } from "../src/utils/course-order";
import { courseArticleSlugs } from "../src/utils/course";

const post = (id: string, date?: string) => ({
	id,
	data: { publishedAt: date ? new Date(date) : null },
});

describe("orderByCourse", () => {
	const slugs = ["a", "b", "c", "d"];

	it("公開日ではなく講座の順番で並べる", () => {
		const posts = [post("c", "2026-01-01"), post("d", "2026-01-02"), post("a", "2026-01-03")];
		expect(orderByCourse(posts, slugs).map((p) => p.id)).toEqual(["a", "c", "d"]);
	});

	it("公開日を入れ替えても並びが変わらない", () => {
		const asc = [post("a", "2026-01-01"), post("b", "2026-01-02"), post("c", "2026-01-03")];
		const desc = [post("a", "2026-01-03"), post("b", "2026-01-02"), post("c", "2026-01-01")];
		expect(orderByCourse(asc, slugs).map((p) => p.id)).toEqual(["a", "b", "c"]);
		expect(orderByCourse(desc, slugs).map((p) => p.id)).toEqual(["a", "b", "c"]);
	});

	it("未公開の番号は詰める", () => {
		expect(orderByCourse([post("d", "2026-01-01"), post("b", "2026-01-02")], slugs).map((p) => p.id)).toEqual([
			"b",
			"d",
		]);
	});

	it("表に無い記事は末尾に公開日の古い順で置く", () => {
		const posts = [post("x", "2026-03-01"), post("b", "2026-05-01"), post("y", "2026-02-01"), post("a", "2026-06-01")];
		expect(orderByCourse(posts, slugs).map((p) => p.id)).toEqual(["a", "b", "y", "x"]);
	});

	it("入力を書き換えない", () => {
		const posts = [post("b"), post("a")];
		orderByCourse(posts, slugs);
		expect(posts.map((p) => p.id)).toEqual(["b", "a"]);
	});

	it("講座のタグでなければ表は空で、公開日の古い順になる", () => {
		const posts = [post("q", "2026-02-01"), post("p", "2026-01-01")];
		expect(orderByCourse(posts, courseArticleSlugs("not-a-course")).map((p) => p.id)).toEqual(["p", "q"]);
	});
});
