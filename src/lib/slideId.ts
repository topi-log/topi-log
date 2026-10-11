/**
 * スライドのディレクトリ名（yyyymmdd-名前）から URL 用の slug と発表日を求める
 */
export function parseSlideId(id: string): { slug: string; date: Date } {
	const match = id.match(/^(\d{4})(\d{2})(\d{2})-(.+)$/);
	if (!match) throw new Error(`スライドのディレクトリ名は yyyymmdd-名前 にしてください: ${id}`);
	const [, yyyy, mm, dd, slug] = match;
	return { slug, date: new Date(`${yyyy}-${mm}-${dd}T00:00:00`) };
}
