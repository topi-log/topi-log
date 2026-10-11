import { describe, expect, test } from 'bun:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { remarkSlides } from './remarkSlides.mjs';

function transform(source: string) {
	const processor = unified().use(remarkParse).use(remarkMdx).use(remarkSlides);
	return processor.runSync(processor.parse(source)) as any;
}

function slides(tree: any) {
	return tree.children.filter((n: any) => n.type === 'mdxJsxFlowElement' && n.name === 'section');
}

function attr(node: any, name: string) {
	return node.attributes.find((a: any) => a.name === name)?.value;
}

describe('remarkSlides', () => {
	test('--- ごとに section に分割する', () => {
		const tree = transform('# A\n\n---\n\n# B\n\n---\n\n# C');
		const sections = slides(tree);
		expect(sections).toHaveLength(3);
		expect(sections[1].children[0].children[0].value).toBe('B');
	});

	test('layout 未指定は default', () => {
		const [section] = slides(transform('# A'));
		expect(attr(section, 'data-layout')).toBe('default');
		expect(attr(section, 'class')).toBe('slide slide--default');
	});

	test('先頭のコメントで layout を指定し、コメントは取り除く', () => {
		const [section] = slides(transform('{/* layout: section */}\n\n# A'));
		expect(attr(section, 'data-layout')).toBe('section');
		expect(section.children).toHaveLength(1);
		expect(section.children[0].type).toBe('heading');
	});

	test('import 文はトップレベルに残す', () => {
		const tree = transform("import x from './x.png';\n\n# A\n\n---\n\n# B");
		expect(tree.children[0].type).toBe('mdxjsEsm');
		expect(slides(tree)).toHaveLength(2);
	});

	test('空のスライドは作らない', () => {
		expect(slides(transform('# A\n\n---\n\n---\n\n# B\n\n---\n'))).toHaveLength(2);
	});

	test('未知の layout はエラー', () => {
		expect(() => transform('{/* layout: unknown */}\n\n# A')).toThrow(/unknown/);
	});

	test('image layout は画像の alt をキャプションとして追加する', () => {
		const [section] = slides(transform('{/* layout: image */}\n\n![スコア推移](./a.png)'));
		const caption = section.children.at(-1);
		expect(caption.name).toBe('p');
		expect(attr(caption, 'class')).toBe('slide-caption');
		expect(caption.children[0].value).toBe('スコア推移');
	});
});
