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

The `slug` is frozen in frontmatter and never derived from the title, so retitling a post
does not break its URL.

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
