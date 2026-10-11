const LAYOUTS = ['default', 'section', 'center', 'image', 'end'];
const LAYOUT_COMMENT = /^\s*\/\*\s*layout:\s*([\w-]+)\s*\*\/\s*$/;

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });

function findImage(node) {
	if (node.type === 'image') return node;
	for (const child of node.children ?? []) {
		const found = findImage(child);
		if (found) return found;
	}
	return undefined;
}

/** MDX をルート直下の `---` で区切り、1枚ずつ <section class="slide"> に包む */
export function remarkSlides() {
	/** @param {import('mdast').Root} tree @param {import('vfile').VFile} file */
	return (tree, file) => {
		// import/export と frontmatter はモジュールのトップレベルに置く必要がある
		const hoisted = [];
		const groups = [[]];

		for (const node of tree.children) {
			if (node.type === 'mdxjsEsm' || node.type === 'yaml') hoisted.push(node);
			else if (node.type === 'thematicBreak') groups.push([]);
			else groups.at(-1).push(node);
		}

		const sections = groups
			.filter((children) => children.length > 0)
			.map((children) => {
				let layout = 'default';
				const match = children[0].type === 'mdxFlowExpression' && children[0].value.match(LAYOUT_COMMENT);
				if (match) {
					layout = match[1];
					children = children.slice(1);
				}
				if (!LAYOUTS.includes(layout)) {
					throw new Error(`未知のスライド layout です: ${layout}（${file.path ?? ''}）`);
				}

				if (layout === 'image') {
					const image = children.map(findImage).find(Boolean);
					if (image?.alt) {
						children.push({
							type: 'mdxJsxFlowElement',
							name: 'p',
							attributes: [attr('class', 'slide-caption')],
							children: [{ type: 'text', value: image.alt }],
						});
					}
				}

				return {
					type: 'mdxJsxFlowElement',
					name: 'section',
					attributes: [attr('class', `slide slide--${layout}`), attr('data-layout', layout)],
					children,
				};
			});

		tree.children = [...hoisted, ...sections];
	};
}
