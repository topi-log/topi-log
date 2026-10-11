import { visit } from 'unist-util-visit';

/** @param {{ mdx?: boolean }} [options] MDX は html ノードを扱えないため JSX 要素で出力する */
export function remarkMermaid({ mdx = false } = {}) {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid') return;

      if (mdx) {
        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [{ type: 'mdxJsxAttribute', name: 'class', value: 'mermaid-pending' }],
          children: [{ type: 'text', value: node.value }],
        };
        return;
      }

      const escaped = node.value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid-pending">${escaped}</div>`,
      };
    });
  };
}
