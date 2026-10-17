# Learn Space website

Marketing site for Learn Space, built with [Astro](https://astro.build), [GSAP](https://gsap.com) and
[Lenis](https://lenis.darkroom.engineering). Designs live in the LS-Website Figma file.

## Running it

From the repository root:

```bash
npm install
npm run dev:website                              # local dev server with live reload
npm run build -- --filter=@learnspace/website    # production build into apps/website/dist/
```

## Before you push

```bash
npm run verify     # (repo root) type checks, lint, builds and formatting for every app
npm run format     # (repo root) auto-fix formatting
```

## Where things live

```
src/
  pages/              One file per page address (index.astro → /, 404.astro → not-found page)
  layouts/            Base.astro: <head>, fonts, page-transition curtain, motion script
  components/
    layout/           Site-wide pieces: Nav, Footer, StayClose ("Stay close to us"), Logo
    ui/               Reusable building blocks: Button, Illustration
    home/             Homepage sections: Hero, Problem, Approach, OurWork, BlogNews
  content/            Blog posts and news stories, one Markdown file each
  content.config.ts   Required fields for blog and news entries (checked at build time)
  data/
    navigation.ts     Every page address + header/footer links. Change links here, not in components
    illustrations.json  Line-drawing pieces and their Figma animation timings
  lib/content.ts      Helpers for reading blog/news in order and formatting their dates
  scripts/motion/     All animation, one file per effect; index.ts wires them up
  styles/
    tokens.css        Design tokens from Figma: colours, spacing, radii, fonts
    global.css        Base styles and shared layout classes
  assets/             Icons, images and illustration pieces (optimised at build time)
```

## Adding content

**A news story:** add a Markdown file to `src/content/news/`. The file name becomes its address
(`nelfund-student-loan-portal.md` → `/news/nelfund-student-loan-portal`).

```md
---
title: "Headline"
category: Policy # Teachers | Research | Policy | Digital | Finance
date: "2026-10-02" # or "2026-10" if only the month is known
order: 1 # lower numbers come first
---
```

**A blog post:** same idea in `src/content/blog/`, with `title`, `excerpt` and `image` (a path to a file in
`src/assets/images/`). The build fails with a clear message if a required field is missing.

## Motion

Each effect in `src/scripts/motion/` only acts on pages that contain its markup (its `data-*` attribute), so
the one script is safe on every page. When a visitor has "reduce motion" switched on, everything is shown in
place without animation.

| Effect                         | Markup hook                    | File                  |
| ------------------------------ | ------------------------------ | --------------------- |
| Headline lines slide up        | `data-lines`                   | `lines.ts`            |
| Line drawings draw on          | `data-illustration`            | `illustrations.ts`    |
| Approach diagram               | `data-approach`                | `approach.ts`         |
| Our work cards fan out + float | `data-float`                   | `work-cards.ts`       |
| Contact/Newsletter icon tiles  | `data-icon-anim`               | `icon-tiles.ts`       |
| Panel zooms in on scroll       | `data-zoom-in`                 | `zoom-in.ts`          |
| Footer reveal + card rise      | `data-footer`                  | `footer.ts`           |
| Carousel buttons + progress    | `data-carousel`                | `carousel.ts`         |
| Page transitions               | `data-curtain` (in the layout) | `page-transitions.ts` |

## Deploying

Vercel detects Astro automatically. Since the move into the monorepo, the Vercel project's **Root
Directory** must be `apps/website`. Pushing to `main` redeploys the live site.
