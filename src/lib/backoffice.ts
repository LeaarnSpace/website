// Content edited in the back office, read once per build from its /api/website-content endpoint. Visitors never
// reach the back office: the site stays static, and publishing there starts a new build. If the back office can't
// be reached, the build fails and the current site stays live.
import type { Loader } from "astro/loaders";
import { loadEnv } from "vite";

// Settings from the host, or from .env / .env.local when building on your machine (Astro doesn't put those in
// process.env, so they're read here)
const env = { ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""), ...process.env };
const url = env.BACKOFFICE_URL;
const secret = env.WEBSITE_CONTENT_SECRET;

/** True when the build should read from the back office rather than the Markdown files */
export const fromBackoffice = Boolean(url && secret);

type Item = { id: string; [field: string]: unknown };

interface BackofficeContent {
  /** Each role's `description` is Markdown, rendered as the entry's content */
  roles: (Item & { description?: string })[];
  /** Each story's and post's `body` is Markdown, rendered as the entry's content; `image` is a full URL */
  news: (Item & { body?: string })[];
  blog: (Item & { body?: string })[];
  /** Category names in the order set in the back office, for the filters */
  categories: { news: string[]; blog: string[] };
}

type Collection = "roles" | "news" | "blog";

/** Which field holds each collection's Markdown */
const MARKDOWN_FIELD: Record<Collection, string> = { roles: "description", news: "body", blog: "body" };

let cached: Promise<BackofficeContent> | undefined;

async function load(): Promise<BackofficeContent> {
  const endpoint = new URL("/api/website-content", url);
  const res = await fetch(endpoint, {
    headers: { authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok)
    throw new Error(`Couldn't read content from the back office (${endpoint}): ${res.status} ${res.statusText}`);
  return res.json();
}

/** Every collection's content, fetched once however many collections ask */
export const backofficeContent = () => (cached ??= load());

/** A content collection filled from the back office, with each item's Markdown as its body */
export function backofficeLoader(collection: Collection): Loader {
  return {
    name: `backoffice-${collection}`,
    load: async ({ store, parseData, renderMarkdown }) => {
      const items = (await backofficeContent())[collection];
      store.clear();
      for (const item of items) {
        const { [MARKDOWN_FIELD[collection]]: markdown, ...fields } = item;
        const body = typeof markdown === "string" ? markdown : "";
        const data = await parseData({ id: item.id, data: fields });
        store.set({ id: item.id, data, body, rendered: await renderMarkdown(body) });
      }
    },
  };
}

/** The filter categories for news or the blog, in the back office's order */
export const backofficeCategories = async (kind: "news" | "blog") => (await backofficeContent()).categories[kind];
