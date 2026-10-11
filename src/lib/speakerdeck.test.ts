import { describe, expect, test } from 'bun:test';
import { parseSpeakerDeckSlides } from './speakerdeck';

describe('parseSpeakerDeckSlides', () => {
	test('日付を Date にして返す', () => {
		const [slide] = parseSpeakerDeckSlides({
			slides: [{ title: 'A', date: '2025-09-20', url: 'https://speakerdeck.com/topi/a', event: 'LT会' }],
		});
		expect(slide.title).toBe('A');
		expect(slide.date).toEqual(new Date('2025-09-20T00:00:00'));
		expect(slide.event).toBe('LT会');
	});

	test('任意項目の空文字は未指定として扱う', () => {
		const [slide] = parseSpeakerDeckSlides({
			slides: [{ title: 'A', date: '2025-09-20', url: 'https://speakerdeck.com/topi/a', event: '', eventUrl: '' }],
		});
		expect(slide.event).toBeUndefined();
		expect(slide.eventUrl).toBeUndefined();
	});

	test('slides が無ければ空配列', () => {
		expect(parseSpeakerDeckSlides({})).toEqual([]);
	});

	test('Speaker Deck 以外の URL はエラー', () => {
		expect(() =>
			parseSpeakerDeckSlides({ slides: [{ title: 'A', date: '2025-09-20', url: 'https://example.com/a' }] }),
		).toThrow();
	});

	test('日付の形式が違うとエラー', () => {
		expect(() =>
			parseSpeakerDeckSlides({ slides: [{ title: 'A', date: '2025/09/20', url: 'https://speakerdeck.com/topi/a' }] }),
		).toThrow();
	});
});
