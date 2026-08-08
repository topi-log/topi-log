import { visit } from 'unist-util-visit';

const cache = new Map();

export async function fetchOgp(url) {
	if (cache.has(url)) return cache.get(url);

	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; topi-log-bot/1.0)' },
			signal: AbortSignal.timeout(5000),
		});
		const html = await res.text();

		function getMeta(...patterns) {
			for (const pattern of patterns) {
				const m = html.match(new RegExp(`<meta[^>]+${pattern}[^>]*>`, 'i'));
				if (m) {
					const content = m[0].match(/content=["']([^"']*)/i)?.[1];
					if (content) return content;
				}
			}
			return '';
		}

		const title =
			getMeta('property=["\']og:title["\']', 'name=["\']twitter:title["\']') ||
			html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
			url;
		const description = getMeta(
			'property=["\']og:description["\']',
			'name=["\']description["\']'
		);
		const image = getMeta('property=["\']og:image["\']', 'name=["\']twitter:image["\']');
		const siteName =
			getMeta('property=["\']og:site_name["\']') || new URL(url).hostname;

		const result = { title, description, image, siteName };
		cache.set(url, result);
		return result;
	} catch {
		const result = { title: url, description: '', image: '', siteName: new URL(url).hostname };
		cache.set(url, result);
		return result;
	}
}

export function buildCard(url, ogp) {
	const imageHtml = ogp.image
		? `<div class="link-card-image"><img src="${ogp.image}" alt="" loading="lazy"></div>`
		: '';
	const descHtml = ogp.description
		? `<p class="link-card-description">${ogp.description}</p>`
		: '';

	return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-card">
  <div class="link-card-inner">
    <div class="link-card-content">
      <p class="link-card-title">${ogp.title}</p>
      ${descHtml}
      <p class="link-card-hostname">${ogp.siteName}</p>
    </div>
    ${imageHtml}
  </div>
</a>`;
}

export function remarkLinkCard() {
	return async (tree) => {
		const targets = [];

		visit(tree, 'paragraph', (node, index, parent) => {
			if (node.children.length !== 1) return;
			const child = node.children[0];

			// テキストのみのURL（remark-breaks前）
			if (child.type === 'text' && /^https?:\/\/\S+$/.test(child.value.trim())) {
				targets.push({ index, parent, url: child.value.trim() });
				return;
			}

			// remarkのGFMが自動リンク化したURL（link.url === link text）
			if (
				child.type === 'link' &&
				child.children.length === 1 &&
				child.children[0].type === 'text' &&
				child.children[0].value === child.url
			) {
				targets.push({ index, parent, url: child.url });
			}
		});

		await Promise.all(
			targets.map(async ({ index, parent, url }) => {
				const ogp = await fetchOgp(url);
				parent.children[index] = { type: 'html', value: buildCard(url, ogp) };
			})
		);
	};
}
