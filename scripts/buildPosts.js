/**
 * Turns src/content/posts/*.html into generated TypeScript the app imports.
 *
 * Emits:
 *   src/app/data/generated/posts-index.ts   metadata for every published post
 *   src/app/data/generated/post-bodies.ts   slug -> lazy import of the rendered HTML
 *   src/app/data/generated/bodies/<slug>.ts one rendered post, its own lazy chunk
 *
 * Bodies are split out so the metadata index stays small. A post's HTML is only
 * downloaded when someone actually opens that post.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { createHighlighter } = require('shiki');
const { generateFeeds } = require('./generateFeeds');
const { generateOgImages } = require('./generateOgImages');
const { generateSearchIndex } = require('./generateSearchIndex');
const { renderPostHtml, toPlainText } = require('./postHtml');

const REQUIRED_FIELDS = ['slug', 'title', 'date', 'description'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 200;

const projectRoot = path.resolve(__dirname, '..');
const site = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'site.config.json'), 'utf8'),
);
const KNOWN_CATEGORIES = site.categories.map((category) => category.slug);
const contentDirectory = path.join(projectRoot, 'src', 'content', 'posts');
const aboutPath = path.join(projectRoot, 'src', 'content', 'about.html');
const outputDirectory = path.join(projectRoot, 'src', 'app', 'data', 'generated');
const bodiesDirectory = path.join(outputDirectory, 'bodies');

const includeFuture = process.env.INCLUDE_FUTURE === '1';

function fail(message) {
  console.error(`\n  buildPosts: ${message}\n`);
  process.exit(1);
}

function readPostFiles() {
  if (!fs.existsSync(contentDirectory)) {
    fail(`no content directory at ${path.relative(projectRoot, contentDirectory)}`);
  }

  return fs
    .readdirSync(contentDirectory)
    .filter((name) => name.endsWith('.html'))
    .sort();
}

function validate(data, filename) {
  const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
  if (missing.length) {
    fail(`${filename} is missing required frontmatter: ${missing.join(', ')}`);
  }

  if (!SLUG_PATTERN.test(data.slug)) {
    fail(`${filename} has slug "${data.slug}" — use lowercase words separated by hyphens`);
  }

  if (Number.isNaN(Date.parse(data.date))) {
    fail(`${filename} has an unparseable date: "${data.date}"`);
  }

  // A closed set, checked here so a typo fails the build instead of quietly
  // creating a category page nothing else links to.
  const categories = Array.isArray(data.categories) ? data.categories : [];
  if (!categories.length) {
    fail(
      `${filename} has no categories — pick at least one of: ${KNOWN_CATEGORIES.join(', ')}`,
    );
  }

  const unknown = categories.filter((category) => !KNOWN_CATEGORIES.includes(category));
  if (unknown.length) {
    fail(
      `${filename} uses unknown categor${unknown.length === 1 ? 'y' : 'ies'} ` +
        `${unknown.map((c) => `"${c}"`).join(', ')} — ` +
        `add to site.config.json or use one of: ${KNOWN_CATEGORIES.join(', ')}`,
    );
  }
}

/** @param html rendered body — counted as text, so tags and code blocks do not inflate it. */
function readingTimeOf(html) {
  const words = toPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function toIsoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

async function buildPosts() {
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['typescript', 'javascript', 'html', 'scss', 'css', 'json', 'bash', 'yaml', 'kotlin', 'sql'],
  });

  const today = toIsoDate(Date.now());
  const seenSlugs = new Map();
  const published = [];
  let skippedDrafts = 0;
  let skippedFuture = 0;

  for (const filename of readPostFiles()) {
    const raw = fs.readFileSync(path.join(contentDirectory, filename), 'utf8');
    const { data, content } = matter(raw);

    validate(data, filename);

    if (seenSlugs.has(data.slug)) {
      fail(`slug "${data.slug}" is used by both ${seenSlugs.get(data.slug)} and ${filename}`);
    }
    seenSlugs.set(data.slug, filename);

    if (data.draft === true) {
      skippedDrafts++;
      continue;
    }

    const date = toIsoDate(data.date);
    if (date > today && !includeFuture) {
      skippedFuture++;
      continue;
    }

    const html = renderPostHtml(content, highlighter, filename);

    published.push({
      meta: {
        slug: data.slug,
        title: data.title,
        date,
        updated: data.updated ? toIsoDate(data.updated) : undefined,
        description: data.description.trim(),
        categories: KNOWN_CATEGORIES.filter((slug) => data.categories.includes(slug)),
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: readingTimeOf(html),
        ogImage: data.ogImage,
        series: data.series,
      },
      html,
    });
  }

  published.sort((a, b) => b.meta.date.localeCompare(a.meta.date));

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(bodiesDirectory, { recursive: true });

  const banner = '// Generated by scripts/buildPosts.js. Do not edit.\n';

  for (const post of published) {
    fs.writeFileSync(
      path.join(bodiesDirectory, `${post.meta.slug}.ts`),
      `${banner}export default ${JSON.stringify(post.html)};\n`,
    );
  }

  const index = published.map((post) =>
    Object.fromEntries(Object.entries(post.meta).filter(([, value]) => value !== undefined)),
  );

  fs.writeFileSync(
    path.join(outputDirectory, 'posts-index.ts'),
    `${banner}import { PostMeta } from '../../models/post';\n\n` +
      `export const POSTS_INDEX: PostMeta[] = ${JSON.stringify(index, null, 2)};\n`,
  );

  const entries = published
    .map((post) => `  '${post.meta.slug}': () => import('./bodies/${post.meta.slug}'),`)
    .join('\n');

  fs.writeFileSync(
    path.join(outputDirectory, 'post-bodies.ts'),
    `${banner}export const POST_BODIES: Record<string, () => Promise<{ default: string }>> = {\n` +
      `${entries}\n};\n`,
  );

  // The about page goes through the same renderer, so it is authored the same way.
  const about = matter(fs.readFileSync(aboutPath, 'utf8'));
  fs.writeFileSync(
    path.join(outputDirectory, 'about.ts'),
    `${banner}export const ABOUT = ${JSON.stringify(
      {
        title: about.data.title ?? 'About',
        description: about.data.description ?? '',
        html: renderPostHtml(about.content, highlighter, 'about.html'),
      },
      null,
      2,
    )};\n`,
  );

  generateFeeds(published);
  generateSearchIndex(published);
  await generateOgImages(published);

  const skipped = [
    skippedDrafts ? `${skippedDrafts} draft` : null,
    skippedFuture ? `${skippedFuture} scheduled` : null,
  ]
    .filter(Boolean)
    .join(', ');

  console.log(
    `  buildPosts: ${published.length} published${skipped ? ` (skipped ${skipped})` : ''}`,
  );
}

buildPosts().catch((error) => fail(error.message));
