# blog-counters

View and like counts for [blog.ryan-brock.com](https://blog.ryan-brock.com). Runs on
Cloudflare Workers with a KV namespace, alongside the existing
`unknown-subdomain-redirect` worker on this domain.

The blog reads perfectly without it. If this worker is down, blocked, or simply not
configured, the counter component renders nothing at all.

## Endpoints

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/api/counts/:slug` | `{ views, likes, liked }` |
| `POST` | `/api/views/:slug` | `{ views }` |
| `POST` | `/api/likes/:slug` | `{ likes, liked }` |

## Why it is more than a counter

- **Likes are idempotent.** A hashed visitor id is stored in KV, so holding the button
  does nothing after the first press. Pressing again un-likes.
- **Views are deduplicated** for 24 hours per visitor, and known crawler user-agents are
  ignored entirely — otherwise an SEO-optimised blog mostly counts Googlebot.
- **CORS is locked** to `ALLOWED_ORIGIN`, so nobody else can write to the counters.
- **No raw IPs are stored.** The visitor id is a truncated SHA-256 of slug + IP + agent,
  salted per slug so it cannot be correlated across posts.

## Setup

```bash
cd worker
npx wrangler kv namespace create COUNTERS   # paste the id into wrangler.toml
npx wrangler deploy
```

Then set `countersApi` in `src/site.config.json` to the deployed worker URL and rebuild.
