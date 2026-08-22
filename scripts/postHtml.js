/**
 * Post bodies are authored as HTML fragments. This turns an authored fragment into
 * the markup the app injects: code blocks handed to shiki, everything else verbatim.
 *
 * Authoring in HTML rather than markdown is the whole point of the pipeline — a post
 * can reach for a figure, a grid, a scoped <style> block, whatever it needs — so the
 * job here is to leave the markup alone and only check for the mistakes that would
 * otherwise fail silently.
 */

const { JSDOM } = require('jsdom');

const CLASS_PREFIX = 'language-';
const PLAIN_LANGUAGES = ['text', 'plain', 'plaintext', 'txt'];

const FRAGMENT_REASON =
  'post bodies are fragments dropped into a page that already exists, not whole documents';

const FORBIDDEN_TAGS = [
  ['html', FRAGMENT_REASON],
  ['head', FRAGMENT_REASON],
  ['body', FRAGMENT_REASON],
  ['script', 'scripts never run when markup is injected with innerHTML, so it would do nothing'],
  ['h1', 'the page already renders the post title as its only h1 — start sections at h2'],
];

/**
 * Checked against the source text rather than the parsed tree: jsdom silently discards
 * a nested <html> or <body> while parsing, so by the time there is a DOM to query the
 * mistake has already disappeared. Example markup inside <code> has to be written as
 * &lt;script&gt; to render at all, so it never matches here.
 */
function assertNoForbiddenTags(source, filename) {
  for (const [tag, reason] of FORBIDDEN_TAGS) {
    if (new RegExp(`<${tag}[\\s/>]`, 'i').test(source)) {
      throw new Error(`${filename} contains <${tag}> — ${reason}`);
    }
  }
}

/**
 * Lets a code block be indented to line up with the markup around it. Every character
 * inside a <pre> is literal, so without this the shared leading indentation would be
 * part of the rendered code.
 */
function dedent(text) {
  const lines = text.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)[0].length);

  const shared = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(shared)).join('\n');
}

/**
 * Replaces every <pre><code class="language-x"> with shiki's markup. The language name
 * has to be one the highlighter was built with — a typo fails the build rather than
 * quietly shipping an unhighlighted block that looks like a styling bug.
 */
function highlightCodeBlocks(document, highlighter, filename) {
  const loaded = highlighter.getLoadedLanguages();

  for (const code of [...document.body.querySelectorAll('pre > code')]) {
    const declared = [...code.classList]
      .find((name) => name.startsWith(CLASS_PREFIX))
      ?.slice(CLASS_PREFIX.length);

    const plain = !declared || PLAIN_LANGUAGES.includes(declared);
    if (!plain && !loaded.includes(declared)) {
      throw new Error(
        `${filename} has a code block in "${declared}", which the highlighter was not ` +
          `built with — add it to the langs array in scripts/buildPosts.js`,
      );
    }

    code.parentElement.outerHTML = highlighter.codeToHtml(dedent(code.textContent), {
      lang: plain ? 'text' : declared,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
  }
}

/**
 * @param source the authored fragment, frontmatter already stripped.
 * @param filename used only for error messages.
 * @returns the fragment with code blocks highlighted.
 */
function renderPostHtml(source, highlighter, filename) {
  assertNoForbiddenTags(source, filename);

  const { window } = new JSDOM(`<!doctype html><body>${source}`);
  highlightCodeBlocks(window.document, highlighter, filename);

  return window.document.body.innerHTML;
}

/** Rendered HTML reduced to the words in it — for reading time and the search index. */
function toPlainText(html) {
  return html
    .replace(/<pre[\s\S]*?<\/pre>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { renderPostHtml, toPlainText };
