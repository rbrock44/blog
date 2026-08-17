---
slug: hello-world
title: Hello World
date: 2026-08-16
description: Why this blog is a prerendered Angular app on GitHub Pages, and what that buys over a plain SPA.
categories: [tech]
tags: [meta, angular]
---

Every other thing I've built lives at some `*.ryan-brock.com` subdomain, deployed to GitHub
Pages out of an Angular repo. This one is no different, with one addition that matters more
than it sounds: every route here is prerendered to real HTML at build time.

## The problem with a plain SPA blog

A client-rendered single-page app ships an empty `<div>` and fills it in with JavaScript.
Google will eventually run that JavaScript. The bots that generate link previews — Slack,
LinkedIn, Discord, iMessage — will not.

So on a normal Angular SPA, every post I share produces the same blank preview card. For a
format whose entire distribution model is *someone shares a link*, that's the whole game.

## What fixes it

Angular's static output mode prerenders each route to its own `index.html`, then hydrates
into a normal SPA once loaded:

```json
{
  "outputMode": "static",
  "server": "src/main.server.ts"
}
```

Posts are markdown files in this repo. A build script parses the frontmatter, renders the
body, and splits each post's HTML into its own lazy chunk so the index stays small:

```javascript
const { data, content } = matter(raw);
const html = await marked.parse(content);
```

The nice side effect is that prerendered routes produce real file paths on disk, so GitHub
Pages serves deep links natively — no `404.html` redirect hack needed for anything that
actually exists.

If you're reading this in view-source with JavaScript disabled, it worked.
