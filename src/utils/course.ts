/**
 * 入門ステップ講座の並び。CLAUDE.md の「読者と講座の順番」と同じ6語で、
 * slug は seed/seed.json の tag タクソノミーの term と一致させている。
 */
export interface CourseStep {
	no: string;
	slug: string;
	name: string;
	desc: string;
	lead: string;
	/**
	 * このステップの記事の slug。content/plan.md の計画表の番号順（公開の順番と同じ並び）。
	 * 公開済みかどうかは見ない。表示側が公開済みの記事だけに絞って使う。
	 */
	articles: readonly string[];
}

export const COURSE_STEPS: readonly CourseStep[] = [
	{
		no: "01",
		slug: "llm-api",
		name: "LLM API",
		desc: "Claude の月額プランで、最初の1回を呼ぶ",
		lead: "自分の Claude の月額プランのログインで、API キーを使わずに claude -p と Agent SDK から LLM を呼ぶところから始めます。応答のストリーミング表示、OpenAI の料金の見積もり、429・529 のリトライ、従量課金になる原因の直し方まで読めます。",
		articles: [
			"claude-p-script-first-call",
			"claude-agent-sdk-streaming",
			"llm-api-cost-estimate-js-tiktoken",
			"llm-api-429-retry-sdk-mock",
			"claude-code-api-key-billing-auth",
		],
	},
	{
		no: "02",
		slug: "structured-output",
		name: "構造化出力",
		desc: "返答を JSON で受け取り、型で検証する",
		lead: "LLM の返事を JSON で受け取り、型で検証してからアプリで使う作り方の記事です。上から順に読むと、返事の形が崩れたときの扱いまで一通り書けます。",
		articles: [
			"claude-agent-sdk-structured-output",
			"zod-validate-llm-json-output",
			"zod-to-json-schema-tool-definition",
			"llm-json-parse-error-fix",
			"structured-output-methods-compare",
		],
	},
	{
		no: "03",
		slug: "rag",
		name: "RAG",
		desc: "自分のデータを検索して答えさせる",
		lead: "自分のデータを検索して、その結果をもとに AI に答えさせる作り方の記事です。上から順に読むと、検索の部分から答えを出す部分まで一通り作れます。",
		articles: [
			"rag-bm25-search-typescript",
			"rag-chunking-japanese-text",
			"rag-local-embeddings-transformers-js",
			"rag-answer-with-citations-claude",
			"rag-hybrid-search-rrf",
		],
	},
	{
		no: "04",
		slug: "ai-agent",
		name: "AIエージェント",
		desc: "ツールを呼びながら作業を進めさせる",
		lead: "LLM にツールを呼ばせながら、何手かに分けて作業を進めさせる作り方の記事です。上から順に読むと、ツールの定義から止めどころの決め方まで作れます。",
		articles: [
			"ai-agent-custom-tools-agent-sdk",
			"claude-agent-sdk-first-agent",
			"ai-agent-max-turns-budget-limit",
			"ai-agent-safe-file-tool",
			"ai-agent-vs-workflow",
		],
	},
	{
		no: "05",
		slug: "mcp-server",
		name: "MCPサーバー",
		desc: "自分のツールを AI から使えるようにする",
		lead: "自分で書いたツールを MCP サーバーにして、AI から呼べるようにする記事です。上から順に読むと、サーバーを立てて Claude からつなぐところまで動かせます。",
		articles: [
			"mcp-server-typescript-stdio",
			"mcp-server-streamable-http",
			"mcp-inspector-debug",
			"mcp-server-resources-prompts",
			"mcp-connection-closed-fix",
		],
	},
	{
		no: "06",
		slug: "llm-eval",
		name: "LLM 評価",
		desc: "答えの質を測って、本番に出せるか判断する",
		lead: "LLM の答えの質を測り、本番に出してよいかを判断する方法の記事です。上から順に読むと、評価用のデータを作って結果を比べるところまでできます。",
		articles: [
			"llm-eval-harness-fixtures",
			"llm-as-a-judge-claude",
			"rag-retrieval-eval-recall-mrr",
			"promptfoo-llm-eval-intro",
			"llm-eval-dataset-from-logs",
		],
	},
];

/** 講座ステップの記事 slug を、計画の順番のまま返す。知らないステップは空配列 */
export function courseArticleSlugs(stepSlug: string | null | undefined): readonly string[] {
	return findCourseStep(stepSlug)?.step.articles ?? [];
}

export function findCourseStep(slug: string | null | undefined): {
	step: CourseStep;
	prev: CourseStep | null;
	next: CourseStep | null;
} | null {
	if (!slug) return null;
	const index = COURSE_STEPS.findIndex((s) => s.slug === slug);
	if (index === -1) return null;
	return {
		step: COURSE_STEPS[index]!,
		prev: COURSE_STEPS[index - 1] ?? null,
		next: COURSE_STEPS[index + 1] ?? null,
	};
}

/** 記事に付いたタグのうち、最初に見つかった講座ステップを返す */
export function courseStepForTags(
	tags: readonly { slug: string }[],
): ReturnType<typeof findCourseStep> {
	for (const tag of tags) {
		const found = findCourseStep(tag.slug);
		if (found) return found;
	}
	return null;
}

export function formatDateJa(date: Date): string {
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "Asia/Tokyo",
	});
}
