# CIPWE Website (Next.js + TypeScript)

A comprehensive marketing + docs website for CIPWE, built with **Next.js App Router** and **TypeScript**.

## What this includes

- High-conversion landing page focused on npm CLI adoption
- Consistent visual theme (glass UI + gradient system)
- Dedicated docs hub with multiple guides
- Dynamic docs routes (`/docs/[slug]`) with static generation
- Changelog page
- Public roadmap page
- SEO-ready metadata, sitemap, and robots
- Responsive layout for desktop/mobile

## Project structure

- `app/page.tsx` → Landing page
- `app/docs/page.tsx` → Docs index
- `app/docs/[slug]/page.tsx` → Dynamic docs pages
- `app/changelog/page.tsx` → Release highlights
- `app/roadmap/page.tsx` → Product roadmap
- `app/sitemap.ts` → Dynamic sitemap generation
- `app/robots.ts` → robots.txt generation
- `components/` → Reusable UI blocks
- `lib/docs.ts` → Full docs content model
- `lib/site-content.ts` → Marketing content, FAQ, roadmap, changelog

## Getting started

```bash
cd website
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build & production

```bash
npm run build
npm run start
```

## Quality checks

```bash
npm run lint
npm run typecheck
```

## Content updates

### Add or edit docs pages

Update `lib/docs.ts`:

- Add a new object in `docs`
- Set `slug`, `title`, `description`
- Add one or more `sections`

Routes are generated automatically.

### Update landing page messaging

Update `lib/site-content.ts`:

- `commands` for copyable CLI commands
- `features` for value cards
- `testimonials` for social proof
- `faqs` for objection handling

## Recommended next upgrades

- Add MDX support for long-form docs editing
- Add analytics (posthog/plausible) for CTA tracking
- Add OpenGraph image generation
- Add blog pages for product education
- Add search for docs navigation

## Deployment

Deploy on Vercel (recommended):

1. Import `website` directory as project root
2. Build command: `npm run build`
3. Output: default Next.js

Or deploy to any Node host supporting Next.js.
