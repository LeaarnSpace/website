// Helpers for reading the blog and news collections in a consistent order and format.
import { getCollection, type CollectionEntry } from "astro:content";

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getPosts(limit?: number): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).sort(byOrder).slice(0, limit);
}

export async function getRoles(): Promise<CollectionEntry<"roles">[]> {
  return (await getCollection("roles")).sort(byOrder);
}

export async function getNews(limit?: number): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort(byOrder).slice(0, limit);
}

/** Newest first (dates are YYYY-MM-DD or YYYY-MM strings, so they sort as text) */
export async function getNewsByDate(): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort((a, b) => b.data.date.localeCompare(a.data.date));
}

/** "2024-05-24" → "2024.05.24", "2022-03" → "2022.03" (the format used on the site) */
export const formatDotDate = (date: string) => date.replaceAll("-", ".");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-28" → { dayMonth: "28 Sep", year: "2026" } (month-only dates show just the month) */
export function splitDate(date: string) {
  const [year, month, day] = date.split("-");
  const mon = MONTHS[Number(month) - 1];
  return { dayMonth: day ? `${Number(day)} ${mon}` : mon, year };
}

/** "2026-10-02" → "2 Oct 2026" */
export const formatLongDate = (date: string) => {
  const { dayMonth, year } = splitDate(date);
  return `${dayMonth} ${year}`;
};
