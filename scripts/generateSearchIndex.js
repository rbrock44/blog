/**
 * Writes public/search-index.json — enough text to search across every post,
 * fetched by the client only when someone actually opens the search box.
 */

const fs = require('fs');
const path = require('path');
const { toPlainText } = require('./postHtml');

const MAX_BODY_CHARS = 2000;

const projectRoot = path.resolve(__dirname, '..');
const publicDirectory = path.join(projectRoot, 'public');

/** @param posts [{ meta, html }] published posts, newest first. */
function generateSearchIndex(posts) {
  fs.mkdirSync(publicDirectory, { recursive: true });

  const index = posts.map(({ meta, html }) => ({
    slug: meta.slug,
    title: meta.title,
    date: meta.date,
    description: meta.description,
    categories: meta.categories,
    tags: meta.tags,
    readingTime: meta.readingTime,
    body: toPlainText(html).slice(0, MAX_BODY_CHARS),
  }));

  const outputPath = path.join(publicDirectory, 'search-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(index));

  const kb = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`  generateSearchIndex: ${index.length} entries (${kb} kB)`);
}

module.exports = { generateSearchIndex };
