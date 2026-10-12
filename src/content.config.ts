// Content collections: each blog post / news story lives in its own Markdown file under
// src/content/, and these schemas check the required fields when the site builds.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** "2024-05-24" or "2022-03" (month only, when the day isn't known) */
const partialDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "Use YYYY-MM-DD or YYYY-MM");

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      image: image(),
      category: z.enum(["Homes", "Teachers", "Students", "Policy", "Culture"]).optional(),
      date: partialDate.optional(),
      /** Video or podcast episodes show a play icon and their length, e.g. "1h 20m" */
      duration: z.string().optional(),
      /** Lower numbers come first in lists */
      order: z.number().default(100),
    }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(["Teachers", "Research", "Policy", "Digital", "Finance"]),
      date: partialDate,
      image: image().optional(),
      /** The original publisher and link (news stories come from other sites) */
      source: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      summary: z.string().optional(),
      /** Lower numbers come first in lists */
      order: z.number().default(100),
    }),
});

export const collections = { blog, news };
