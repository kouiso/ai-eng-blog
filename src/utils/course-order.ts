/**
 * 講座のタグページの並び。公開日ではなく、講座の slug の並び（COURSE_STEPS の articles）で並べる。
 * 並びの表に無い記事は末尾に、公開日の古い順で置く。公開されていない slug は読み飛ばすので、
 * 未公開の番号は詰めて表示される。
 */
export interface OrderableEntry {
	id: string;
	data: { publishedAt?: Date | null };
}

export function orderByCourse<T extends OrderableEntry>(
	entries: readonly T[],
	courseSlugs: readonly string[],
): T[] {
	const rank = new Map<string, number>();
	courseSlugs.forEach((slug, i) => {
		if (!rank.has(slug)) rank.set(slug, i);
	});
	const time = (e: T) => e.data.publishedAt?.getTime() ?? Number.POSITIVE_INFINITY;
	return [...entries].sort((a, b) => {
		const ra = rank.get(a.id);
		const rb = rank.get(b.id);
		if (ra !== undefined && rb !== undefined) return ra - rb;
		if (ra !== undefined) return -1;
		if (rb !== undefined) return 1;
		return time(a) - time(b);
	});
}
