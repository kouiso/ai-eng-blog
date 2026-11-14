/**
 * トップの「新着の記事」に出す記事を選ぶ。公開日の新しい順に並べ、上位の数本だけ返す。
 * 公開日が無い記事（下書き）は含めない。記事が0本なら空配列で、トップは節ごと隠す。
 */
export const LATEST_POSTS_LIMIT = 5;

export interface LatestPostCandidate {
	data: { publishedAt?: Date | null };
}

export function selectLatestPosts<T extends LatestPostCandidate>(
	entries: readonly T[],
	limit: number = LATEST_POSTS_LIMIT,
): T[] {
	if (limit <= 0) return [];
	return entries
		.filter((e): e is T & { data: { publishedAt: Date } } => Boolean(e.data.publishedAt))
		.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
		.slice(0, limit);
}
