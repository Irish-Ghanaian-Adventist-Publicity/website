# How to update the IGAC website

You do not need to know anything technical to use this. If you can use Facebook or fill in
a form, you can do this.

---

## Signing in

1. Go to **your-website-address/admin/**
   (for example `www.igac.ie/admin/` — bookmark it now)
2. Click **Login**
3. Sign in with the account you were given

If it will not let you in, you have not been added as an editor yet. Ask whoever set the
site up.

---

## What you'll see

Down the left-hand side:

| Section | What lives there |
|---|---|
| **Gatherings** | Fellowship Sabbaths, weeks of prayer, newcomers' afternoons — anything with a date |
| **News & Notices** | Announcements and reports |
| **What we do** | Worship & study, youth, children & families, welfare, music |
| **The Team** | The volunteers who coordinate the community |
| **Support Guides** | The "New to Ireland" guides |
| **Pages** | Home page, About, Get involved, Contact |
| **Site Settings** | Community name, email, the menu, social links, the banner |

Click a section, then click an item to edit it — or the **New** button to add one.

---

## Adding a gathering

1. **Gatherings** → **New Gathering**
2. Fill in the name and the date. Everything else is optional
3. Turn on **"Show on the home page"** if it is something big
4. Click **Publish**

It moves from "Coming up" to "Previously" **by itself** once the date has passed. You never
have to go back and tidy up.

One thing to know: that switch happens when the site next rebuilds, not at midnight on the
day. Publishing anything rebuilds it. If a past gathering is still showing under "Coming
up", it just means nothing has been published since.

## Writing news

1. **News & Notices** → **New Post**
2. Headline, date, and the article
3. The **Short summary** is what people see in the list — write one or two clear sentences
4. **Pin to the top** keeps something at the top of the page. Use it sparingly; if
   everything is pinned, nothing is

## Changing the home page

**Pages** → **Home page**. The big heading, the introduction, the two buttons, the three
cards and the photograph are all here.

The **main photograph** is the one behind the heading. A wide, landscape group shot works
best — anything tall or square will be cropped hard. Resize it before uploading (see below).

## Changing the menu, email or name

**Site Settings** → *Name, contact & social links*. The menu is a list you can add to,
reorder by dragging, or remove from.

Adding a menu link does **not** create the page it points at — that needs someone technical.

## The banner across the top

Same place, at the bottom: **Site-wide banner**. Type a message to show it; **delete the
text entirely** to make it disappear.

Best used for one thing at a time — a special Sabbath, a cancelled service, a venue change.

## Adding photos

Anywhere you see an image field, click it and either upload a file or pick one already
uploaded.

**Before you upload:** make the photo smaller first. Photos straight from a phone are very
large and make the site slow for people on mobile data. Any phone's built-in "resize" or
"email small" option is enough.

**Consent matters.** Get permission before putting recognisable photographs of people
online, and always for children. If anyone asks for a photo to be removed, remove it — no
questions.

---

## Saving and publishing

Two buttons, and the difference matters:

- **Save** — keeps your work as a draft. Nobody else sees it. Come back to it later
- **Publish** — puts it on the live website

After publishing, the site takes **about a minute or two** to update. Refresh the page if
you do not see the change straight away. It is not broken; it is rebuilding.

If your site uses the review setting, **Publish** sends your work to *Ready* for someone
else to approve first. You will see it under the **Workflow** tab at the top.

---

## Formatting text

The text boxes have a small toolbar — **bold**, *italic*, headings, lists and links, like
any word processor.

Two habits worth keeping:

- Use **Heading** for section titles rather than making the text bold and large
- When adding a link, select the words first, then click the link button

---

## Getting things wrong

**You cannot break this website.** Every change is recorded, and any of them can be undone.
If something looks wrong, tell whoever manages the site — they can put it back exactly as
it was in under a minute.

The one thing to be careful with is **Delete**, which removes an item from the site. It can
still be recovered, but it takes someone technical to do it. If you are unsure, ask first.

---

## Quick answers

**I published but nothing changed.** Wait two minutes and refresh. If it is still not
there, check you clicked *Publish* and not just *Save*.

**I cannot log in.** Your access may not be set up. Ask the site administrator.

**Can I edit on my phone?** Yes, though a laptop is far easier for anything long.

**I want a whole new page.** That needs someone technical — it is a small job, but not one
you can do from here. Part two below tells them how.

**Something looks broken.** Take a screenshot and send it on. That is genuinely the most
useful thing you can do.

---
---

# Part two: editing it directly (for a technical reader)

Everything above works through the CMS. You can also bypass it entirely and edit the files,
which is faster once you know your way around and is the only way to do some things — new
page types, layout changes, anything structural.

The CMS and the files are the same thing. Decap just makes commits on your behalf.

## Run it locally

```bash
npm install
npm run dev     # site → localhost:8080, CMS → localhost:8080/admin/
```

`npm run dev` runs Eleventy's dev server *and* `decap-server` together. That local proxy is
what makes `local_backend: true` work: the CMS at `localhost:8080/admin/` writes straight to
your working copy with **no login and no GitHub round-trip**. It is the fastest way to test a
config change before pushing it.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server + local CMS proxy |
| `npm start` | Dev server only |
| `npm run build` | Runs `check`, then builds to `_site/` |
| `npm run check` | Verifies `admin/config.yml` matches the content files |
| `npm run clean` | Deletes `_site/` |

## Where things live

```
admin/config.yml       Every field an editor sees. The important file.
src/_data/             site.json, home.json — global data, also CMS-editable
src/_includes/
  layouts/             Page shells (base, page, event, post, guide, ministry, about, join, contact)
  partials/            header, footer, event-card, icon
src/content/           Markdown content, one folder per collection
  <folder>/<folder>.json   Directory data file: sets layout, tags and permalink for that folder
src/*.njk              Listing pages (index, events, news, ministries, support, sitemap, robots)
src/assets/            CSS, JS, images; uploads/ is where CMS images land
src/static/            Copied to the site root as-is (.nojekyll)
scripts/check-cms.js   The config/content consistency check
eleventy.config.js     Filters, collections, passthrough, path-prefix transform
```

## How a collection is wired

Three things must line up, or content silently stops appearing:

1. **The directory data file** — `src/content/events/events.json` gives every `.md` in that
   folder its `layout`, `tags` and `permalink`. This is why event files need no boilerplate.
   `team.json` sets `"permalink": false`, so members render only inside the About page and
   get no page of their own.
2. **The collection** — either from the tag directly (`collections.ministries`,
   `collections.resources`) or built in `eleventy.config.js` when it needs sorting or
   filtering.
3. **`admin/config.yml`** — field names here must match the front-matter keys exactly.

That third point is the one that bites. Rename a field in `config.yml` but not in the
content and nothing errors — the CMS just writes a key no template reads. `npm run check`
catches it, and `npm run build` runs it first so it cannot reach production.

## Custom filters

Defined in [eleventy.config.js](eleventy.config.js). All dates are formatted in `en-IE`
and forced to UTC, so an event on the 12th never renders as the 11th for someone in a
different timezone.

| Filter | Output |
|---|---|
| `longDate` | `12 September 2026` |
| `shortDate` | `Sat 12 Sep` |
| `monthAbbr` / `dayNum` | `SEP` / `12` |
| `isoDate` | `2026-09-12` — for `<time datetime="…">` |
| `excerpt(n)` | Strips markdown and HTML to an `n`-character teaser |
| `limit(n)` | First `n` items of an array |
| `year` | Current year, for the footer |

## Collections available to templates

| Collection | Contents |
|---|---|
| `collections.upcomingEvents` | `event_date` today or later, soonest first |
| `collections.pastEvents` | Earlier than today, most recent first |
| `collections.newsPosts` | Newest first |
| `collections.teamMembers` | Sorted by `order` |
| `collections.ministries` | Tag-based — sort in the template with `\| sort(false, false, "data.order")` |
| `collections.resources` | Same |

Upcoming/past is computed from `startOfToday()` in UTC at **build time**, not in the
browser. An event does not move to "Previously" on its own — it moves on the next build.
Pushing any change rebuilds. If the diary ever looks stale, trigger a run from the Actions
tab.

## Common jobs

**Change the theme colour** — one variable, `--accent`, at the top of
[src/assets/css/style.css](src/assets/css/style.css). `--accent-hover`, `--accent-deep` and
`--accent-soft` are its darker and tinted companions. Everything else is ink and paper
neutrals.

**Add a menu item** — `nav` in [src/_data/site.json](src/_data/site.json), or Site Settings
in the CMS. Adding it does not create the page.

**Add a page** — a `.njk` file in `src/` with `permalink`, `title` and
`layout: layouts/base.njk` (or reuse `layouts/page.njk` for a plain prose page). Add
`eleventyExcludeFromCollections: true` so it stays out of the sitemap's content listing.

**Add a field to an existing type** — add it to the collection's `fields` in
`admin/config.yml`, add it to the front matter of every existing file in that folder, use it
in the layout, then `npm run check`. Skipping the middle step is what the check exists for.

**Add a whole new type** (sermons, photo albums) — four steps: the folder with its
directory data file; a layout; a listing page; and a collection block in `admin/config.yml`.
Copy `ministries` throughout, it is the simplest complete example.

## Images

CMS uploads land in `src/assets/uploads/` at whatever size they were uploaded. There is no
build-time image pipeline, so oversized files ship as-is. The original of the home page
photo was 6.2 MB; it is served at 420 KB. `sips` is enough:

```bash
sips -c <height> <width> --cropOffset <y> <x> in.jpg --out crop.jpg
sips -Z 2000 crop.jpg --out out.jpg                    # longest edge 2000px
sips -s format jpeg -s formatOptions 45 out.jpg --out out.jpg
```

Aim under about 400 KB for a full-width image. If uploads start bloating the repo, that is
the point to add `@11ty/eleventy-img` — deliberately not there yet, since it adds a build
dependency for a site that gets a handful of new photos a year.

## The path prefix

The site is served from `/website/`, so `PATH_PREFIX=/website/` is set in
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) and Eleventy's `pathPrefix`
picks it up.

Templates must therefore run **every** internal link through the `url` filter:
`{{ '/about/' | url }}`. Markdown bodies cannot do that, so a transform in
`eleventy.config.js` rewrites root-relative `href`/`src` attributes in the output HTML that
the filter never saw. It skips anything already prefixed, so it will not double up.

To test the deployed URL shape locally:

```bash
PATH_PREFIX=/website/ npm run build && npx http-server _site -p 8080
```

Moving to a custom domain means deleting the `PATH_PREFIX` line, and changing `logo_url` in
`admin/config.yml` back to `/assets/img/logo.svg`.

## Deploying

Push to `main`. The workflow builds and publishes; roughly a minute. There is no separate
deploy step and no server to log into.

Because every change is a commit, anything can be undone:

```bash
git revert <sha>        # undo one change, keeping the history
git log -- <path>       # what happened to this file
```

If an editor breaks something through the CMS, reverting their commit is the fix — do not
hand-repair the files.

## Two things worth knowing before you change much

**`publish_mode: editorial_workflow`** means CMS edits become branches and pull requests
rather than direct commits to `main`. Drafts appear under the CMS **Workflow** tab. Delete
that line from `config.yml` if the committee would rather changes go live immediately.

**The `.md` files are the database.** There is no CMS server holding state — Decap reads and
writes this repository through the GitHub API. Anything you can do in the CMS you can do
with an editor and a commit, and the two cannot drift apart.
