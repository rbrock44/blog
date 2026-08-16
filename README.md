# Blog

> A prerendered Angular blog, written in markdown<br/>
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

---

## 🧠 What's My Purpose?

To write things down somewhere I own, and have them show up properly when shared or searched for.

Every route is prerendered to real HTML at build time, so crawlers and link-unfurl bots
get finished markup instead of an empty `<div>`. Readers get a normal SPA after first paint.

---

## ✍️ Writing a Post

Posts live in `src/content/posts/` as markdown with frontmatter. Add a file, push, done.

```yaml
---
slug: why-angular-still-wins   # frozen — retitling never breaks the URL
title: Why Angular Still Wins
date: 2026-08-16               # a future date publishes itself via the daily cron
updated: 2026-09-02            # optional
draft: false                   # true keeps it out of the build
tags: [angular, ssg]
description: One sentence, written for a search result.
ogImage: ./custom-card.png     # optional — otherwise a card is generated
series:                        # optional
  name: Static Angular
  part: 2
---
```

`slug`, `title`, `date` and `description` are required — the build fails loudly rather
than shipping a post with no meta description. Reading time is computed, never authored.

To preview scheduled posts locally:

```bash
INCLUDE_FUTURE=1 npm run posts:build
```

---

## ⚙️ One-time Setup

Three things are built but inert until configured:

1. **Cloudflare Worker allowlist** — `blog` has been added to `allowedSubdomains` in the
   `scripts` repo, but the worker still needs deploying to Cloudflare. Until then every
   request to `blog.ryan-brock.com` redirects to `lost.ryan-brock.com`.
2. **Comments** — enable GitHub Discussions on this repo, install the
   [giscus app](https://github.com/apps/giscus), then paste `repoId` and `categoryId`
   from [giscus.app](https://giscus.app) into `src/site.config.json`. Renders nothing
   until both are set.
3. **Counters** — see [`worker/README.md`](worker/README.md), then set `countersApi` in
   `src/site.config.json`. Renders nothing until set.

Also register this repo with `Keep-Repo-Active.ps1` from the `scripts` repo so GitHub
does not disable the scheduled workflow after 60 quiet days.

---

## 🛠️ Technologies

- `Angular 22` - zoneless, standalone components, `outputMode: 'static'`
- `GitHub Pages` - static hosting at `blog.ryan-brock.com`
- `Cloudflare Worker + KV` - view and like counts, the only live service

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
