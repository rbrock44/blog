/**
 * Writes sitemap.xml, rss.xml and robots.txt into public/ so the Angular build
 * copies them to the site root. Every absolute URL comes from site.config.json.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const publicDirectory = path.join(projectRoot, 'public');
const site = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'site.config.json'), 'utf8'),
);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date) {
  return new Date(`${date}T12:00:00Z`).toUTCString();
}

function sitemap(posts, tags) {
  const urls = [
    { loc: site.url, lastmod: posts[0]?.updated ?? posts[0]?.date, priority: '1.0' },
    { loc: `${site.url}/about`, priority: '0.6' },
    ...posts.map((post) => ({
      loc: `${site.url}/posts/${post.slug}`,
      lastmod: post.updated ?? post.date,
      priority: '0.8',
    })),
    ...tags.map((tag) => ({
      loc: `${site.url}/tags/${tag}`,
      priority: '0.5',
    })),
  ];

  const entries = urls
    .map(({ loc, lastmod, priority }) =>
      [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function rss(posts) {
  const items = posts
    .map((post) =>
      [
        '    <item>',
        `      <title>${escapeXml(post.meta.title)}</title>`,
        `      <link>${site.url}/posts/${post.meta.slug}</link>`,
        `      <guid isPermaLink="true">${site.url}/posts/${post.meta.slug}</guid>`,
        `      <pubDate>${rfc822(post.meta.date)}</pubDate>`,
        `      <description>${escapeXml(post.meta.description)}</description>`,
        ...post.meta.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        `      <content:encoded><![CDATA[${post.html.replace(/]]>/g, ']]&gt;')}]]></content:encoded>`,
        '    </item>',
      ].join('\n'),
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${escapeXml(site.title)}</title>`,
    `    <link>${site.url}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <language>${site.language}</language>`,
    `    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>`,
    posts[0] ? `    <lastBuildDate>${rfc822(posts[0].meta.date)}</lastBuildDate>` : '',
    items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;
}

/** @param posts [{ meta, html }] already filtered to published posts, newest first. */
function generateFeeds(posts) {
  fs.mkdirSync(publicDirectory, { recursive: true });

  const metas = posts.map((post) => post.meta);
  const tags = [...new Set(metas.flatMap((meta) => meta.tags))].sort();

  fs.writeFileSync(path.join(publicDirectory, 'sitemap.xml'), sitemap(metas, tags));
  fs.writeFileSync(path.join(publicDirectory, 'rss.xml'), rss(posts));
  fs.writeFileSync(path.join(publicDirectory, 'robots.txt'), robots());

  console.log(`  generateFeeds: sitemap (${metas.length + tags.length + 1} urls), rss, robots`);
}

module.exports = { generateFeeds };
