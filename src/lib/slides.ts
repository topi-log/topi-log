import { getCollection } from 'astro:content';
import { parseSlideId } from '@/lib/slideId';
import { parseSpeakerDeckSlides } from '@/lib/speakerdeck';
import speakerdeck from '@/data/speakerdeck.json';

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

export type SlideListItem = {
	type: 'internal' | 'speakerdeck';
	title: string;
	date: Date;
	url: string;
	event?: string;
	description?: string;
	draft?: boolean;
};

/**
 * リポジトリ内のスライドと Speaker Deck のスライドをまとめて日付降順で返す
 */
export async function getSlideList(): Promise<SlideListItem[]> {
	const internal: SlideListItem[] = (await getSlides()).map(({ slug, date, entry }) => ({
		type: 'internal',
		title: entry.data.title,
		date,
		url: `/slides/${slug}`,
		event: entry.data.event,
		description: entry.data.description,
		draft: entry.data.draft,
	}));

	const external: SlideListItem[] = parseSpeakerDeckSlides(speakerdeck).map((s) => ({
		type: 'speakerdeck',
		title: s.title,
		date: s.date,
		url: s.url,
		event: s.event,
		description: s.description,
	}));

	return [...internal, ...external].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
