import { getCollection } from 'astro:content';
import { parseSlideId } from '@/lib/slideId';

/**
 * 公開済みスライドを取得する（draft除外・日付降順）
 */
export async function getSlides() {
	const entries = await getCollection('slides', ({ data }) => import.meta.env.DEV || data.draft !== true);
	const slides = entries
		.map((entry) => ({ entry, ...parseSlideId(entry.id) }))
		.sort((a, b) => b.date.valueOf() - a.date.valueOf());

	const seen = new Map<string, string>();
	for (const { slug, entry } of slides) {
		const other = seen.get(slug);
		if (other) throw new Error(`スライドの URL が重複しています: ${other} と ${entry.id}`);
		seen.set(slug, entry.id);
	}

	return slides;
}
