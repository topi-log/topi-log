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
		tags: z.array(z.string()).optional(),
		draft: z.boolean().optional(),
		koukanblogList: z.boolean().optional(),
	}),
});

const dev = defineCollection({
	loader: glob({ base: './src/content/dev', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, dev };
