/**
 * View and like counts for blog.ryan-brock.com.
 *
 * The only live service the blog has. If it is unreachable the post still reads
 * fine — the counter component renders nothing rather than an error.
 *
 *   GET  /api/counts/:slug   -> { views, likes, liked }
 *   POST /api/views/:slug    -> { views }        increments once per visitor per day
 *   POST /api/likes/:slug    -> { likes, liked } toggles, one like per visitor
 *
 * KV keys:
 *   views:<slug>              counter
 *   likes:<slug>              counter
 *   like:<slug>:<visitor>     idempotency guard for likes
 *   view:<slug>:<visitor>     24h guard so a refresh does not inflate views
 */

export interface Env {
  COUNTERS: KVNamespace;
  ALLOWED_ORIGIN: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VIEW_WINDOW_SECONDS = 60 * 60 * 24;
const LIKE_TTL_SECONDS = 60 * 60 * 24 * 365;

// Counting crawlers would make the numbers meaningless on a blog built to be crawled.
const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discord|google|baidu|bing|yandex|duckduck|semrush|ahrefs|lighthouse|headless/i;

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(env) },
  });
}

/**
 * A stable-but-anonymous visitor id. The IP is hashed with the slug so the same
 * value cannot be correlated across posts, and the raw IP is never stored.
 */
async function visitorId(request: Request, slug: string): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const agent = request.headers.get('User-Agent') ?? '';
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${slug}:${ip}:${agent}`),
  );

  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function readCount(env: Env, key: string): Promise<number> {
  const value = await env.COUNTERS.get(key);
  return value ? Number(value) : 0;
}

async function bumpCount(env: Env, key: string, delta: number): Promise<number> {
  const next = Math.max(0, (await readCount(env, key)) + delta);
  await env.COUNTERS.put(key, String(next));
  return next;
}

async function handleGet(env: Env, slug: string, visitor: string): Promise<Response> {
  const [views, likes, liked] = await Promise.all([
    readCount(env, `views:${slug}`),
    readCount(env, `likes:${slug}`),
    env.COUNTERS.get(`like:${slug}:${visitor}`),
  ]);

  return json({ views, likes, liked: liked !== null }, env);
}

async function handleView(
  request: Request,
  env: Env,
  slug: string,
  visitor: string,
): Promise<Response> {
  if (BOT_PATTERN.test(request.headers.get('User-Agent') ?? '')) {
    return json({ views: await readCount(env, `views:${slug}`) }, env);
  }

  const guard = `view:${slug}:${visitor}`;
  if (await env.COUNTERS.get(guard)) {
    return json({ views: await readCount(env, `views:${slug}`) }, env);
  }

  await env.COUNTERS.put(guard, '1', { expirationTtl: VIEW_WINDOW_SECONDS });
  return json({ views: await bumpCount(env, `views:${slug}`, 1) }, env);
}

async function handleLike(env: Env, slug: string, visitor: string): Promise<Response> {
  const guard = `like:${slug}:${visitor}`;
  const alreadyLiked = (await env.COUNTERS.get(guard)) !== null;

  if (alreadyLiked) {
    await env.COUNTERS.delete(guard);
    return json({ likes: await bumpCount(env, `likes:${slug}`, -1), liked: false }, env);
  }

  await env.COUNTERS.put(guard, '1', { expirationTtl: LIKE_TTL_SECONDS });
  return json({ likes: await bumpCount(env, `likes:${slug}`, 1), liked: true }, env);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    const match = /^\/api\/(counts|views|likes)\/([^/]+)$/.exec(url.pathname);

    if (!match) {
      return json({ error: 'not found' }, env, 404);
    }

    const [, action, slug] = match;
    if (!SLUG_PATTERN.test(slug)) {
      return json({ error: 'bad slug' }, env, 400);
    }

    const visitor = await visitorId(request, slug);

    if (request.method === 'GET' && action === 'counts') {
      return handleGet(env, slug, visitor);
    }
    if (request.method === 'POST' && action === 'views') {
      return handleView(request, env, slug, visitor);
    }
    if (request.method === 'POST' && action === 'likes') {
      return handleLike(env, slug, visitor);
    }

    return json({ error: 'method not allowed' }, env, 405);
  },
};
