import { describe, expect, it } from "vitest";
import { LATEST_POSTS_LIMIT, selectLatestPosts } from "../src/utils/latest-posts";

const post = (id: string, publishedAt: string | null) => ({
	id,
	data: { publishedAt: publishedAt ? new Date(publishedAt) : null },
});

describe("selectLatestPosts", () => {
	it("記事が0本なら空配列を返す（トップは節ごと隠す）", () => {
		expect(selectLatestPosts([])).toEqual([]);
	});

	it("公開日の新しい順に並べる", () => {
		const out = selectLatestPosts([
			post("a", "2026-11-01T00:00:00Z"),
			post("c", "2026-11-03T00:00:00Z"),
			post("b", "2026-11-02T00:00:00Z"),
		]);
		expect(out.map((p) => p.id)).toEqual(["c", "b", "a"]);
	});

	it("公開日が無い記事（下書き）は含めない", () => {
		const out = selectLatestPosts([post("draft", null), post("a", "2026-11-01T00:00:00Z")]);
		expect(out.map((p) => p.id)).toEqual(["a"]);
	});

	it("既定で5本までに絞る", () => {
		expect(LATEST_POSTS_LIMIT).toBe(5);
		const many = Array.from({ length: 8 }, (_, i) => post(`p${i}`, `2026-11-0${i + 1}T00:00:00Z`));
		const out = selectLatestPosts(many);
		expect(out).toHaveLength(5);
		expect(out[0]!.id).toBe("p7");
	});

	it("limit を指定できる。0以下は空配列", () => {
		const many = [post("a", "2026-11-01T00:00:00Z"), post("b", "2026-11-02T00:00:00Z")];
		expect(selectLatestPosts(many, 1).map((p) => p.id)).toEqual(["b"]);
		expect(selectLatestPosts(many, 0)).toEqual([]);
	});

	it("元の配列を並べ替えない", () => {
		const input = [post("a", "2026-11-01T00:00:00Z"), post("b", "2026-11-02T00:00:00Z")];
		selectLatestPosts(input);
		expect(input.map((p) => p.id)).toEqual(["a", "b"]);
	});
});
