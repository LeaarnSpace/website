// Helpers for reading the blog and news collections in a consistent order and format.
import { getCollection, type CollectionEntry } from "astro:content";
import { backofficeCategories, usesBackoffice } from "./backoffice";

/** The filter categories while that kind still comes from the Markdown files rather than the back office */
const FILE_CATEGORIES = {
  news: ["Teachers", "Research", "Policy", "Digital", "Finance"],
  blog: ["Homes", "Teachers", "Students", "Policy", "Culture"],
};

/** Category filters for the News or Blog page, in order */
export const getCategories = async (kind: "news" | "blog"): Promise<string[]> =>
  (await usesBackoffice(kind)) ? backofficeCategories(kind) : FILE_CATEGORIES[kind];

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getPosts(limit?: number): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).sort(byOrder).slice(0, limit);
}

/** Today in Lagos, YYYY-MM-DD */
const lagosToday = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

/** Roles with a page: not hidden, and not past their closing date (a role closing today is still open) */
export async function getOpenRoles(): Promise<CollectionEntry<"roles">[]> {
  const today = lagosToday();
  return (await getCollection("roles", (r) => !r.data.hidden && (!r.data.closesOn || r.data.closesOn >= today))).sort(
    byOrder,
  );
}

/** Roles on the Work With Us list (link-only roles have a page but aren't listed) */
export async function getRoles(): Promise<CollectionEntry<"roles">[]> {
  return (await getOpenRoles()).filter((r) => r.data.listed);
}

/** A role's page */
export const rolePath = (role: CollectionEntry<"roles">) => `/work-with-us/${role.id}`;

export async function getNews(limit?: number): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort(byOrder).slice(0, limit);
}

/** Newest first (dates are YYYY-MM-DD or YYYY-MM strings, so they sort as text) */
export async function getNewsByDate(): Promise<CollectionEntry<"news">[]> {
  return (await getCollection("news")).sort((a, b) => b.data.date.localeCompare(a.data.date));
}

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
