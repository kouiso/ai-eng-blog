import { describe, expect, it } from "vitest";
import { bodyOf, inventory, simulate } from "../scripts/markdown-inventory.mjs";

describe("markdown-inventory", () => {
	it("frontmatter を除いて、書き方ごとに数える", async () => {
		const md = [
			"---",
			"title: x",
			"---",
			"## 見出し",
			"",
			"本文の `code` と [リンク](/posts/a) です。",
			"",
			"| a | b |",
			"|---|---|",
			"| `x` | y\\|z |",
			"",
			"```ts",
			"| not a table |",
			"```",
		].join("\n");
		const { counts, langs } = inventory(bodyOf(md)) as { counts: Record<string, number>; langs: Record<string, number> };
		expect(counts["見出し h2"]).toBe(1);
		expect(counts["表（パイプの表）"]).toBe(1);
		expect(counts["表の行（見出し行を含む）"]).toBe(2);
		expect(counts["表のセル: インラインコード"]).toBe(1);
		expect(counts["表: エスケープしたパイプ（\\|）を含む行"]).toBe(1);
		expect(counts["リンク [text](url)"]).toBe(1);
		expect(counts["コードブロック（```）"]).toBe(1);
		expect(langs.ts).toBe(1);
		const sim = (await simulate(bodyOf(md))) as Record<string, number>;
		expect(sim["block:code"]).toBe(1);
	});
});
