# LinoCon Digital

Marketing site for LinoCon Digital — websites, SEO setup, and backlinks.

Live at https://linocondigital.com. Code lives in GitHub `linocondigital-214/linocon-digital-website` and deploys from `main` through the LinoCon Vercel account (moved from maplesheetco on October 30, 2026).

## Stack

React + Vite, Tailwind CSS v4, Framer Motion for scroll animations.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

After Vite builds the site, `scripts/prerender.mjs` saves every page listed in `public/sitemap.xml` as its own HTML file (for example `dist/services/seo-setup/index.html`), with that page's title, description, canonical link, share tags and text already in it. Google reads these straight away instead of waiting for the JavaScript. Pages not in the sitemap (admin, clients, finance) load the normal way. Adding a page to the sitemap is all it takes to prerender it.
