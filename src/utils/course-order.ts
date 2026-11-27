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

/** 講座のタグページで1回に取る記事の上限。講座のタグは cursor でページを送らない */
export const COURSE_TAG_FETCH_LIMIT = 100;

export interface TagPager {
	/** 「最初のページ」へのリンクを出すか */
	showFirst: boolean;
	/** 「次へ」のリンクに使う cursor。出さないときは null */
	next: string | null;
	/** 講座のタグで上限を超えたときの警告。無ければ null */
	warning: string | null;
}

/**
 * タグページのページ送り。講座のタグは1回で全部取って講座の順番に並べるので、
 * cursor を使わず「次へ」も出さない。上限を超えて続きがあるときは、並べきれていないことを警告で知らせる。
 */
export function tagPager(opts: {
	isCourse: boolean;
	termSlug: string;
	cursor: string | undefined;
	nextCursor: string | null | undefined;
}): TagPager {
	if (opts.isCourse) {
		return {
			showFirst: false,
			next: null,
			warning: opts.nextCursor
				? `[tag/${opts.termSlug}] 講座のタグの記事が ${COURSE_TAG_FETCH_LIMIT} 本を超えました。${COURSE_TAG_FETCH_LIMIT + 1} 本目以降は表示していません（src/utils/course-order.ts の COURSE_TAG_FETCH_LIMIT）`
				: null,
		};
	}
	return { showFirst: Boolean(opts.cursor), next: opts.nextCursor || null, warning: null };
}
