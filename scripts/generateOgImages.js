/**
 * Renders a 1200x630 social card per post into public/og/.
 *
 * Cards are laid out with satori (JSX-free, plain element objects) and rasterised
 * with resvg. Fonts come from @fontsource/inter rather than a committed binary,
 * and rendering never touches system fonts, so CI output matches local output.
 */

const fs = require('fs');
const path = require('path');
const satori = require('satori').default ?? require('satori');
const { Resvg } = require('@resvg/resvg-js');

const WIDTH = 1200;
const HEIGHT = 630;

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'public', 'og');
const fontDirectory = path.join(projectRoot, 'node_modules', '@fontsource', 'inter', 'files');
const site = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'site.config.json'), 'utf8'),
);

const INK = '#101816';
const GROUND = '#f7f8f6';
const ACCENT = '#17605a';
const MUTED = '#5f6b64';

function font(weight) {
  return {
    name: 'Inter',
    weight,
    style: 'normal',
    data: fs.readFileSync(path.join(fontDirectory, `inter-latin-${weight}-normal.woff`)),
  };
}

function el(type, props, ...children) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

function truncate(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, text.lastIndexOf(' ', limit))}…`;
}

function card(title, description, meta) {
  return el(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: GROUND,
        padding: '68px 72px',
        borderTop: `16px solid ${ACCENT}`,
        fontFamily: 'Inter',
      },
    },
    el(
      'div',
      {
        style: {
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ACCENT,
        },
      },
      site.title,
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '28px' } },
      el(
        'div',
        {
          style: {
            fontSize: title.length > 42 ? 64 : 78,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            color: INK,
          },
        },
        truncate(title, 90),
      ),
      el(
        'div',
        { style: { fontSize: 30, lineHeight: 1.4, color: MUTED } },
        truncate(description, 130),
      ),
    ),
    el(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: 26,
          color: MUTED,
          borderTop: `2px solid #dcdfd9`,
          paddingTop: '24px',
        },
      },
      meta,
    ),
  );
}

async function render(node, fonts) {
  const svg = await satori(node, { width: WIDTH, height: HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}

/** @param posts [{ meta, html }] published posts. Skips any post with an explicit ogImage. */
async function generateOgImages(posts) {
  const fonts = [font(600), font(700)];

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  fs.writeFileSync(
    path.join(outputDirectory, 'default.png'),
    await render(
      card(site.tagline, site.description, site.url.replace('https://', '')),
      fonts,
    ),
  );

  let generated = 1;

  for (const { meta } of posts) {
    if (meta.ogImage) {
      continue;
    }

    const date = new Date(`${meta.date}T12:00:00Z`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    fs.writeFileSync(
      path.join(outputDirectory, `${meta.slug}.png`),
      await render(
        card(meta.title, meta.description, `${date}  ·  ${meta.readingTime} min read`),
        fonts,
      ),
    );
    generated++;
  }

  console.log(`  generateOgImages: ${generated} cards`);
}

module.exports = { generateOgImages };
