# Learn Space

One repository for everything Learn Space runs.

```
apps/
  website/      learnspace.ng: Astro marketing site (see apps/website/README.md)
  backoffice/   Staff back office: Next.js, Google sign-in, per-section access
packages/
  db/           Postgres schema and client (Drizzle), shared by the apps
```

## Getting started

```bash
npm install
npm run db:migrate     # create/update the tables (needs a local Postgres, see below)
npm run dev:website    # http://localhost:4321
npm run dev:backoffice # http://localhost:4400
```

The back office expects a local Postgres on port 5432 with a database called `learnspace`
(`createdb learnspace`). To use something else, set `DATABASE_URL` in `apps/backoffice/.env.local`.

Before pushing: `npm run verify` (type checks, lint and builds for every app, plus formatting).

## Back office

### Signing in

Staff sign in with their Learn Space Google account. Only addresses on `ALLOWED_EMAIL_DOMAINS` get in,
and that is checked on every sign-in and every request.

To set up Google sign-in, create an OAuth client in the Google Cloud console (APIs & Services → Credentials
→ OAuth client ID → Web application) with the redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google`,
then copy `apps/backoffice/.env.example` to `apps/backoffice/.env.local` and fill it in.

For local work before Google is set up, `DEV_LOGIN=true` shows an email and password form. It is ignored
in production.

### Access (RBAC)

The back office is one app with sections: **Website**, **Bookings**, **Projects** and **Team & access**.
Each person has a role per section:

| Role    | Can                            |
| ------- | ------------------------------ |
| Viewer  | See everything in the section  |
| Editor  | Add and change things          |
| Manager | Everything, including deleting |

No role means the section is hidden and its pages refuse access. Every page and action checks the role on
the server (`requireSection()` in `apps/backoffice/src/lib/viewer.ts`).

The first admins come from `BOOTSTRAP_ADMIN_EMAILS`: they become managers of every section the first time
they sign in. After that, managers of **Team & access** give everyone else access from that screen,
including people who haven't signed in yet. There is always at least one team manager, and you can't
remove your own.

To add a section: add it to `sectionEnum` in `packages/db/src/schema.ts`, run `npm run db:generate` and
`npm run db:migrate`, then add it to `SECTIONS` in `apps/backoffice/src/lib/sections.ts`.

## Deploying (Vercel)

Each app is its own Vercel project pointing at this repo:

- **Website:** root directory `apps/website` (Astro is detected automatically).
- **Back office:** root directory `apps/backoffice`, with the environment variables from `.env.example`
  and `DATABASE_URL` set to a hosted Postgres such as Neon. Run `npm run db:migrate` against it (with
  `DATABASE_URL` set) whenever the schema changes.
