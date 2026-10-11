import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		updatedDate: z.coerce.date().optional(),
		pinned: z.boolean().optional(),
		pinnedOrder: z.number().int().positive().optional(),
		tags: z.array(z.string()).optional(),
		draft: z.boolean().optional(),
		koukanblogList: z.boolean().optional(),
		isuconEntries: z.array(z.object({
			title: z.string().min(1),
			member: z.enum(['とぴ', 'sora', 'wabi']),
			link: z.string().url(),
		})).optional(),
	}),
});

const dev = defineCollection({
	loader: glob({ base: './src/content/dev', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()).optional(),
	}),
});

const slides = defineCollection({
	loader: glob({
		base: './src/content/slides',
		pattern: '*/index.mdx',
		generateId: ({ entry }) => entry.split('/')[0],
	}),
	schema: z.object({
		title: z.string(),
		event: z.string().optional(),
		eventUrl: z.string().url().optional(),
		description: z.string().optional(),
		draft: z.boolean().optional(),
	}),
});

export const collections = { blog, dev, slides };
