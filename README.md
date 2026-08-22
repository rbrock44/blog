# Blog

> A prerendered Angular blog, written in HTML<br/>
> [Live - Blog](https://blog.ryan-brock.com/)

---

## 📚 Table of Contents

- [What's My Purpose?](#-whats-my-purpose)
- [Writing a Post](#-writing-a-post)
- [Technologies](#-technologies)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
  - [Run Locally](#run-locally)
  - [Test](#test)
  - [Build](#build)
  - [Deploy](#deploy)
- [How to Contribute](#-how-to-contribute)

---

## 🧠 What's My Purpose?

To write things down somewhere I own, and have them show up properly when shared or searched for.

Every route is prerendered to real HTML at build time, so crawlers and link-unfurl bots
get finished markup instead of an empty `<div>`. Readers get a normal SPA after first paint.

---

## ✍️ Writing a Post

Posts live in `src/content/posts/` as HTML with YAML frontmatter. Add a file, push, done.

```yaml
---
slug: why-angular-still-wins   # frozen — retitling never breaks the URL
title: Why Angular Still Wins
date: 2026-08-16               # a future date publishes itself via the daily cron
updated: 2026-09-02            # optional
draft: false                   # true keeps it out of the build
categories: [tech]             # required, one or more, from site.config.json
tags: [angular, ssg]
description: One sentence, written for a search result.
ogImage: ./custom-card.png     # optional — otherwise a card is generated
series:                        # optional
  name: Static Angular
  part: 2
---
```

`slug`, `title`, `date`, `description` and `categories` are required — the build fails
loudly rather than shipping a post with no meta description. Reading time is computed
from the text of the rendered body, never authored.

### The body

Everything after the closing `---` is a plain HTML fragment, passed through to the page
as written. Classes, `<figure>`, a grid, an inline `<style>` block — if it works in a
browser it works in a post, which is the reason posts are HTML and not markdown.

Three things fail the build, because all three would otherwise fail silently:

- `<html>`, `<head>` or `<body>` — a post is a fragment inside a page that already exists
- `<script>` — bodies are injected with `innerHTML`, where scripts never execute
- `<h1>` — the page already renders the title as its one `h1`, so sections start at `h2`

A `<style>` block in a post is global once that post is open, so scope it with a class of
your own rather than styling bare tags. Shared body styles belong in
[`src/styles/_prose.scss`](src/styles/_prose.scss) instead.

### Code blocks

`<pre><code>` is handed to [shiki](https://shiki.style) at build time and comes out with
both a light and a dark theme baked in. Name the language with a `language-` class:

```html
<pre><code class="language-typescript">
  const greet = (name: string) =&gt; `hi ${name}`;
</code></pre>
```

Indentation shared by every line is stripped, so a block can line up with the markup
around it. `<` and `&` still have to be written as `&lt;` and `&amp;` — it is HTML.

A language the highlighter was not built with fails the build; add it to the `langs`
array in [`scripts/buildPosts.js`](scripts/buildPosts.js). Omit the class (or use
`language-text`) for a block with no highlighting.

### Categories vs tags

**Categories** are the site's structure — a closed set defined in `src/site.config.json`,
shown in the header, each with its own archive page and RSS feed. A post needs at least
one, and a category not in that list fails the build, so a typo can't quietly create a
ghost section. Currently: Tech, Woodworking, Automobile, Home Repair.

**Tags** are free-form topic labels, as many per post as you like, shown as inline
metadata. They get archive pages but no navigation.

A category only appears in the nav, the sitemap, and the feed list once at least one post
uses it — so adding a category to the config does nothing visible until you write in it.
Add one by appending to the `categories` array with a `slug`, `label` and `description`
(the description becomes the archive page's meta description, so make it a real sentence).

To preview scheduled posts locally:

```bash
INCLUDE_FUTURE=1 npm run posts:build
```

---

## ⚙️ One-time Setup

Both Cloudflare workers live in the [`scripts`](https://github.com/rbrock44/scripts) repo
under `cloudflare-workers/`, and are deployed from the Cloudflare dashboard.

### 1. Let the subdomain through (required — the site is dark without it)

`blog` has been added to `allowedSubdomains` in `unknown-subdomain-redirect.ts`, but that
worker has to be **redeployed** for it to take effect. Until then every request to
`blog.ryan-brock.com` is redirected to `lost.ryan-brock.com`, no matter how correct DNS
and Pages are.

### 2. DNS

A proxied `CNAME` for `blog` pointing at `rbrock44.github.io`, orange cloud on so the
worker route fires. Then add `blog.ryan-brock.com` as the custom domain in this repo's
GitHub Pages settings.

### 3. Counters (optional)

Deploy `blog-counters.ts` from the scripts repo, then in Cloudflare:

- Bind a KV namespace as `COUNTERS`
- Add a worker route of `blog.ryan-brock.com/api/*`

That route is more specific than `*.ryan-brock.com/*`, so it takes precedence and the
redirect worker never sees `/api/` traffic. Then set `"countersApi": "/api"` in
`src/site.config.json` and rebuild. Renders nothing until set.

### 4. Comments (optional)

Enable GitHub Discussions on this repo, install the
[giscus app](https://github.com/apps/giscus), then paste `repoId` and `categoryId` from
[giscus.app](https://giscus.app) into `src/site.config.json`. Renders nothing until both
are set.

### 5. Keepalive

Register this repo with `Keep-Repo-Active.ps1` from the scripts repo so GitHub does not
disable the scheduled workflow after 60 quiet days.

---

## 🛠️ Technologies

- `Angular 22` - zoneless, standalone components, `outputMode: 'static'`
- `GitHub Pages` - static hosting at `blog.ryan-brock.com`
- `Cloudflare Worker + KV` - view and like counts, the only live service
  ([`blog-counters.ts`](https://github.com/rbrock44/scripts) in the scripts repo)

---

## 🚀 Getting Started (Local Setup)

```bash
npm install
```

### Run Locally

```bash
npm start
```

### Test

```bash
npm test
```

### Build

```bash
npm run build
```

Prerendered output lands in `dist/blog/browser`.

### Deploy

Pushing to `master` builds and deploys via GitHub Actions.

> ⚠️ `blog` must be present in the `allowedSubdomains` array in
> [`scripts/cloudflare-workers/unknown-subdomain-redirect.ts`](https://github.com/rbrock44/scripts)
> or every request is redirected to `lost.ryan-brock.com`.

---

## 🤝 How to Contribute

Found a typo or a small, obvious fix? Open a PR directly.
Want to change behavior or add something bigger? Open an issue first so we can talk it through before you put in the work.
