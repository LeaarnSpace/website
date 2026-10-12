// Helpers for reading the blog and news collections in a consistent order and format.
import { getCollection, type CollectionEntry } from "astro:content";

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getPosts(limit?: number): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).sort(byOrder).slice(0, limit);
}

export async function getNews(limit?: number): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort(byOrder).slice(0, limit);
}

/** "2024-05-24" → "2024.05.24", "2022-03" → "2022.03" (the format used on the site) */
export const formatDotDate = (date: string) => date.replaceAll("-", ".");
