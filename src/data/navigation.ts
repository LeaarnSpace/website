// Every page address on the site, so links are never typed out by hand in components.
export const routes = {
  home: "/",
  ourWork: "/our-work",
  insights: "/insights",
  whoWeAre: "/who-we-are",
  theProblem: "/the-problem",
  workWithUs: "/work-with-us",
  governance: "/governance",
  privacy: "/privacy",
  terms: "/terms",
  news: "/news",
  blog: "/blog",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

/** Header menu */
export const mainNav: NavLink[] = [
  { label: "Our Work", href: routes.ourWork },
  { label: "Insights", href: routes.insights },
  { label: "Who We Are", href: routes.whoWeAre },
];

/** Footer link columns (accordions on phones) */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Organisation",
    links: [
      { label: "About us", href: routes.whoWeAre },
      { label: "Work with us", href: routes.workWithUs },
      { label: "Careers", href: `${routes.workWithUs}#open-roles` },
      { label: "Governance & Safeguarding", href: routes.governance },
    ],
  },
  {
    // TODO: these have no pages in the Figma file yet
    title: "Partner",
    links: [
      { label: "Advisory", href: routes.workWithUs },
      { label: "Research partnership", href: routes.workWithUs },
      { label: "Programme design", href: routes.workWithUs },
      { label: "Advocacy", href: routes.workWithUs },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: routes.privacy },
      { label: "Data and consent", href: `${routes.privacy}#data-and-consent` },
      { label: "Terms", href: routes.terms },
    ],
  },
];

/** Where the podcast/video episodes can be followed ("Take us with you" on the Blog pages) */
// TODO: replace with the real channel links
export const podcastLinks = {
  youtube: "https://www.youtube.com/",
  spotify: "https://open.spotify.com/",
};
