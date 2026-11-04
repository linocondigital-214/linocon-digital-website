# Publishing a weekly article

Articles live in `src/content/articles/`. Each Markdown (`.md`) file is one article, and the file name becomes its web address:

`what-is-seo-setup.md` → `linocondigital.com/articles/what-is-seo-setup`

## Add a new article

1. Copy `src/content/articles/_TEMPLATE.md.example` to a new file, for example `google-business-profile-guide.md`. Use lowercase words separated by hyphens.
2. Fill in the section between the `---` lines:
   - `title`: the headline (also used as the Google title).
   - `description`: one or two sentences shown in Google results and on the Articles page.
   - `date`: when it goes live, for example `2026-10-20T09:00:00-07:00` (9 AM Pacific; use `-08:00` from November to mid-March).
   - `category`: for example `SEO`, `Websites`, or `Backlinks`.
   - `image` and `imageAlt` (optional): a cover image. Save it as two WebP files in `public/articles/`, named `<slug>-1600.webp` (1600 px wide) and `<slug>-800.webp` (800 px wide), and set `image: /articles/<slug>`.
   - `draft: true` keeps it hidden. Remove that line when it's ready.
3. Write the article below the second `---` using Markdown (`## Heading`, `**bold**`, `- bullet`, `[link](/articles/other-slug)`).
4. Commit and push. The article appears once the site redeploys.

## Scheduling

Articles with a future `date` are hidden and appear on their own at that date and time, with no redeploy needed. So you can push several weeks of articles at once.

To check a scheduled article before it goes live, add `?preview` to its address, for example `/articles/what-is-seo-setup?preview`.

## Weekly routine

- **Pick the topic:** a question a customer asked you this week, or one from the idea list below.
- **One question per article:** answer it clearly in 800 to 1,500 words.
- **Link to one or two other articles** and end with the strategy call invitation.
- **Publish the same day each week** (Tuesdays at 9 AM Pacific so far) so the section stays fresh.

## Topic ideas

- How to set up a Google Business Profile (step by step)
- How to get more Google reviews without being pushy
- Website vs. social media: does a small business need both?
- What makes a website convert visitors into customers?
- How long does SEO take to work?
- Local SEO checklist for service businesses
- Do I need a blog on my business website?
- How to choose a domain name for your business
- 5 signs your website is costing you customers
- What is a landing page, and when do you need one?
- How to measure if your website is working (simple metrics)
- Website redesign checklist: what to do before you start
