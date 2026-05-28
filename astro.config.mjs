// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkCodeTitles from 'remark-code-titles';
import remarkBreaks from 'remark-breaks';
import { remarkLinkCard } from './src/lib/remarkLinkCard.mjs';
import { remarkMermaid } from './src/lib/remarkMermaid.mjs';

/** 複数の空行をその数だけ <br> に変換するプラグイン */
function remarkMultipleBreaks() {
  return (tree, file) => {
    const children = tree.children;
    const inserts = [];

    for (let i = 0; i < children.length - 1; i++) {
      const cur = children[i];
      const next = children[i + 1];
      if (!cur.position || !next.position) continue;

      const blankLines = next.position.start.line - cur.position.end.line - 1;
      if (blankLines > 1) {
        inserts.push({ index: i + 1, count: blankLines - 1 });
      }
    }

    // 後ろから挿入してindexがずれないようにする
    for (const { index, count } of inserts.reverse()) {
      const brs = Array.from({ length: count }, () => ({ type: 'html', value: '<br>' }));
      children.splice(index, 0, ...brs);
    }
  };
}
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://topi-log.com',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkCodeTitles, remarkBreaks, remarkMultipleBreaks, remarkLinkCard],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },

  adapter: cloudflare(),
});