import { describe, expect, test } from 'bun:test';
import { parseSlideId } from './slideId';

describe('parseSlideId', () => {
	test('日付と名前に分ける', () => {
		const { slug, date } = parseSlideId('20261020-isucon-review');
		expect(slug).toBe('isucon-review');
		expect(date).toEqual(new Date('2026-10-20T00:00:00'));
	});

	test('名前部分がないとエラー', () => {
		expect(() => parseSlideId('20261020')).toThrow();
	});

	test('日付が先頭にないとエラー', () => {
		expect(() => parseSlideId('isucon-review')).toThrow();
	});
});
