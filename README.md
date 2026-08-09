# Irish-Ghanaian Adventist Community (IGAC) — website

A static website built with [Eleventy](https://www.11ty.dev/), published free on **GitHub
Pages**, and edited through **[Decap CMS](https://decapcms.org/)** so that people who do not
write code can add events, news, ministries and photos themselves.

- **Editors** — you want [EDITING-GUIDE.md](EDITING-GUIDE.md). Nothing on this page.
- **Whoever sets it up** — read on. Budget about half an hour.

---

## What's in here

```
admin/              The Decap CMS editing interface (/admin on the live site)
  config.yml        Defines every field an editor sees — the important file
src/
  _data/            site.json (name, service times, menu) + home.json — CMS-editable
  _includes/        Page layouts and partials
  assets/           CSS, JS, images, and uploads/ where CMS images land
  content/          The editable content
    events/         One file per event
    news/           One file per news post
    ministries/     Sabbath School, AY, Pathfinders, Music, Health, Women's Ministries
    resources/      The "New to Ireland" guides
    team/           Church officers
    pages/          About, Get involved, Contact
  *.njk             The listing pages (home, events, worship, ministries, …)
.github/workflows/  Builds and publishes automatically on every change
```

---

## Running it on your own machine

```bash
npm install
npm run dev      # site on http://localhost:8080, CMS on http://localhost:8080/admin/
```

`npm run dev` also starts a small local proxy so the CMS works **without any login** on your
machine — edits save straight to the files on disk. This is the easiest way to try things
out before going live.

`npm run build` produces the finished site in `_site/`.

---

## Setup, step by step

### 1. Put the code on GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Use a **GitHub Organisation** rather than a personal account if you can — then committee
members come and go without the site belonging to one individual.

### 2. Turn on GitHub Pages

Repo → **Settings** → **Pages** → under *Build and deployment*, set **Source** to
**GitHub Actions**.

Push to `main` and the included workflow builds and publishes the site. Watch it under the
**Actions** tab; it takes about a minute.

**If your site lives at `username.github.io/repo-name`** (a "project page"), open
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) and uncomment the
`PATH_PREFIX` line, setting it to `/repo-name/`. Skip this if you are using a custom
domain or a `username.github.io` repo.

### 3. Give the CMS a way to log people in

This is the only fiddly part, and it is a one-off.

GitHub Pages serves plain files, so it cannot run the small piece of server code that
exchanges a GitHub login for an access token. You need a free external helper. Pick one:

<details>
<summary><strong>Option A — Cloudflare Workers (recommended, free, ~10 minutes)</strong></summary>

1. Create a **GitHub OAuth App**: GitHub → Settings → Developer settings → **OAuth Apps**
   → *New OAuth App*.
   - **Homepage URL**: your site's address
   - **Authorization callback URL**: `https://YOUR-WORKER.workers.dev/callback`
   - Save the **Client ID**, then generate and save a **Client Secret**.
2. Deploy a Decap OAuth worker to Cloudflare. Several maintained open-source ones exist —
   search for "decap-cms-github-oauth cloudflare worker" and use one you have read. Set the
   Client ID and Client Secret as Worker environment variables (the secret must be a
   **secret**, never committed to this repo).
3. Put the worker's address into `base_url` in [admin/config.yml](admin/config.yml).

</details>

<details>
<summary><strong>Option B — Netlify hosting instead of GitHub Pages</strong></summary>

If the OAuth step is more than you want to take on, host the site on Netlify instead. The
code stays on GitHub exactly as it is; Netlify provides the login service built in.

Connect the repo to Netlify (build command `npm run build`, publish directory `_site`),
enable **Netlify Identity** with **Git Gateway**, and in `admin/config.yml` replace the
whole `backend:` block with:

```yaml
backend:
  name: git-gateway
  branch: main
```

Then invite editors by email from the Netlify dashboard — they never need a GitHub account
at all. This is the gentlest option for a non-technical committee.

</details>

### 4. Fill in your own details

In [admin/config.yml](admin/config.yml), replace every line marked `# <-- CHANGE ME`:

| Setting | What to put |
|---|---|
| `repo` | `your-org/your-repo` |
| `base_url` | your OAuth helper address (Option A only — delete for Option B) |
| `site_url` / `display_url` | your live website address |

Then set the real name, email, venue and service times — either by editing
[src/\_data/site.json](src/_data/site.json) directly, or through the CMS under
**Site Settings** once it is running.

### 5. Give editors access

- **Option A (GitHub):** add each editor as a **collaborator** on the repo with *Write*
  permission. They sign in at `/admin/` with their GitHub account.
- **Option B (Netlify):** invite them by email from Netlify Identity. No GitHub account
  needed.

---

## How publishing works

An editor saves a change at `/admin/` → Decap commits it to GitHub → the Actions workflow
rebuilds → the live site updates. Usually under two minutes.

`publish_mode: editorial_workflow` is switched on, so edits start as **drafts** that
someone can review before they go live. If the committee would rather have changes appear
immediately, delete that line from `admin/config.yml`.

Because everything is a git commit, **nothing can be permanently lost.** Any bad edit can
be undone from the repo's history.

---

## Things worth knowing

- **A custom domain** (e.g. `igac.ie`) can be pointed at GitHub Pages under Settings →
  Pages → Custom domain. Do this before sharing the address widely — it saves reprinting
  everything later.
- **Photographs of people**, especially children, need consent. Adventist congregations
  and Irish/UK data protection law both take this seriously. Agree a policy before
  uploading, and honour any request to take a photo down without asking why.
- **Images**: resize before uploading. A 6MB phone photo makes the page slow on mobile
  data; the CMS caps event posters at 4MB.
- **The support guides** in `src/content/resources/` state rules that change. Review them
  once or twice a year, and keep the "check the official source" links at the bottom of
  each.
- **Placeholder content**: the officer entries under **Church Officers** all read *"Name to
  be added"*, and the venue is *"Venue to be added"*. Replace those before launch.

---

## Adding a new page type

Say you want sermons. Three steps:

1. `src/content/sermons/sermons.json` — set `layout`, `tags: "sermons"` and a `permalink`
   (copy `src/content/ministries/ministries.json`).
2. A layout in `src/_includes/layouts/`, and a listing page like `src/ministries.njk`.
3. A matching collection block in `admin/config.yml` so editors can create them.

The field names in `config.yml` must exactly match the front-matter names the layout reads.
That is the one thing that reliably breaks.

---

Built with [Eleventy](https://www.11ty.dev/) and [Decap CMS](https://decapcms.org/).
