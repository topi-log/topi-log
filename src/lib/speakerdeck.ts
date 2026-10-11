import { z } from 'astro/zod';

// Pages CMS は任意項目を空文字で保存することがあるため、未指定として扱う
const optionalText = z
	.string()
	.optional()
	.transform((v) => (v ? v : undefined));

const schema = z.object({
	slides: z
		.array(
			z.object({
				title: z.string().min(1),
				date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '発表日は YYYY-MM-DD 形式にしてください'),
				url: z.string().url().startsWith('https://speakerdeck.com/'),
				event: optionalText,
				eventUrl: optionalText.pipe(z.string().url().optional()),
				description: optionalText,
			}),
		)
		.default([]),
});

export type SpeakerDeckSlide = {
	title: string;
	date: Date;
	url: string;
	event?: string;
	eventUrl?: string;
	description?: string;
};

export function parseSpeakerDeckSlides(data: unknown): SpeakerDeckSlide[] {
	return schema.parse(data).slides.map((s) => ({ ...s, date: new Date(`${s.date}T00:00:00`) }));
}
