import { getCollection, type CollectionEntry } from 'astro:content';
import { getExternalPosts } from '@/lib/externalPosts';

export type UnifiedPost = {
	type: 'internal' | 'zenn' | 'hatenablog' | 'note';
	title: string;
	pubDate: Date;
	excerpt: string;
	url: string;
	// internal only
	id?: string;
	tags?: string[];
};

/**
 * ファイル名（yyyymmddhh または yyyymmdd）から公開日時を生成する
 */
function parsePubDateFromId(id: string): Date {
	const match = id.match(/(\d{4})(\d{2})(\d{2})(\d{2})?/);
	if (!match) throw new Error(`ブログファイル名が不正です: ${id}`);
	const [, yyyy, mm, dd, hh = '00'] = match;
	return new Date(`${yyyy}-${mm}-${dd}T${hh}:00:00`);
}

function getExcerpt(body: string): string {
	return (body ?? '')
		.replace(/^---[\s\S]*?---/, '')
		.replace(/#+\s+/g, '')
		.replace(/[*_`>\-]/g, '')
		.replace(/\n+/g, ' ')
		.trim()
		.slice(0, 100);
}

/**
 * 公開済みブログ記事を取得する（draft除外・日付降順）
 */
export async function getBlogPosts() {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || data.draft !== true);
	return posts
		.map((post) => ({
			...post,
			data: {
				...post.data,
				pubDate: parsePubDateFromId(post.id),
			},
		}))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * ピン留め記事を取得する（1件のみ）
 */
export async function getPinnedPost() {
	const posts = await getBlogPosts();
	return posts.find((post) => post.data.pinned === true) ?? null;
}

/**
 * 開発環境専用記事を取得する（DEV時のみ）
 */
export async function getDevPosts(): Promise<CollectionEntry<'dev'>[]> {
	if (!import.meta.env.DEV) return [];
	return getCollection('dev');
}

/**
 * 内部記事＋外部記事をマージして日付降順で返す
 */
export async function getAllPosts(): Promise<UnifiedPost[]> {
	const [internalPosts, externalPosts] = await Promise.all([
		getBlogPosts(),
		getExternalPosts(),
	]);

	const internal: UnifiedPost[] = internalPosts.map((post) => ({
		type: 'internal',
		title: post.data.title,
		pubDate: post.data.pubDate,
		excerpt: getExcerpt(post.body ?? ''),
		url: `/articles/${post.id}`,
		id: post.id,
		tags: post.data.tags,
	}));

	const external: UnifiedPost[] = externalPosts.map((p) => ({
		type: p.type,
		title: p.title,
		pubDate: p.pubDate,
		excerpt: p.excerpt,
		url: p.url,
	}));

	return [...internal, ...external].sort(
		(a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
	);
}
