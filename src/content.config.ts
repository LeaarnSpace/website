// Content collections, checked against these schemas when the site builds. Job roles, news and blog posts come from
// the back office (see backoffice.ts) when BACKOFFICE_URL and WEBSITE_CONTENT_SECRET are set, as they are on the host;
// without them (e.g. local work on the site) they come from the Markdown files under src/content/. Photos from the
// back office are full URLs (downloaded and resized by the build); in the files they're paths to local images.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { backofficeLoader, fromBackoffice } from "./lib/backoffice";

/** "2024-05-24" or "2022-03" (month only, when the day isn't known) */
const partialDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "Use YYYY-MM-DD or YYYY-MM");

/** A photo: a URL from the back office, or a local image next to a Markdown file */
const photo = (image: () => z.ZodType<ImageMetadata>) => (fromBackoffice ? z.string().url() : image());

const blog = defineCollection({
  loader: fromBackoffice ? backofficeLoader("blog") : glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      image: photo(image),
      /** Categories are edited in the back office */
      category: z.string().optional(),
      date: partialDate.optional(),
      /** Video or podcast episodes show a play icon and their length, e.g. "1h 20m" */
      duration: z.string().optional(),
      /** Lower numbers come first in lists */
      order: z.number().default(100),
    }),
});

const news = defineCollection({
  loader: fromBackoffice ? backofficeLoader("news") : glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Categories are edited in the back office */
      category: z.string(),
      date: partialDate,
      image: photo(image).optional(),
      /** The original publisher and link (news stories come from other sites) */
      source: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      summary: z.string().optional(),
      /** Who wrote / reviewed our commentary (shown under the headline when there is one) */
      author: z.string().optional(),
      reviewer: z.string().optional(),
      /** Cards under "Related from LearnSpace" on the story page */
      related: z
        .array(
          z.object({
            type: z.enum(["Podcast", "Insights", "Blog", "Report"]),
            title: z.string(),
            linkLabel: z.string(),
            href: z.string(),
          }),
        )
        .default([]),
      /** Lower numbers come first in lists */
      order: z.number().default(100),
    }),
});

const roles = defineCollection({
  // From the back office the entry id is the page's random code; from the files it's the file name. Either way
  // the role's page is /work-with-us/<id>, with the description (or the file's body) as its content.
  loader: fromBackoffice ? backofficeLoader("roles") : glob({ pattern: "**/*.md", base: "./src/content/roles" }),
  schema: z.object({
    title: z.string(),
    /** Teams are edited in the back office */
    team: z.string(),
    /** Where the team comes in the filters (lower first) */
    teamOrder: z.number().default(100),
    posted: partialDate,
    location: z.string(),
    arrangement: z.enum(["Remote", "Hybrid", "On-site"]),
    employmentType: z.string().default("Full-time"),
    salary: z.string().optional(),
    /** Who the role reports to, e.g. "Head of Research" */
    reportsTo: z.string().optional(),
    /** Last day to apply; the role leaves the site at the first build after it */
    closesOn: partialDate.optional(),
    /** One or two lines at the top of the role's page */
    summary: z.string().default(""),
    /** Where "Apply" leads, or else the email applications go to; without either, the page's general link */
    applyUrl: z.string().url().optional(),
    applyEmail: z.string().email().optional(),
    /** false: the role has its page but isn't in the list (shared by link) */
    listed: z.boolean().default(true),
    order: z.number().default(100),
    /** true keeps the role in the project but off the site */
    hidden: z.boolean().default(false),
  }),
});

export const collections = { blog, news, roles };
