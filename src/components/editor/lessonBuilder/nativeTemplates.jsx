// nativeTemplates.js
// ----------------------------------------------------------------------------
// Native block-tree templates for the Visual Lesson Builder.
//
// Each template is defined as a *factory* that returns an array of native
// blocks (the same shape `createBlock` produces). When a template is applied,
// the SlideEditor serialises this block array via `blocksToHtml` into a
// canonical HTML string with `data-lesson-block="…"` markers. On reopen, the
// builder's `htmlToBlocks` reads those markers and reconstructs the SAME
// native blocks — so EVERY field (heading, paragraph, list item, quote,
// caption, image, table cell, column child) remains individually editable.
//
// Zero `legacy-html` blocks are produced by any template here.
//
// IMPORTANT: This module is the *single* source of truth for builder
// templates. It replaces the HTML-string SLIDE_TEMPLATES map that used to
// live in `SlideEditor.jsx`. The shape `{ name, icon, category, buildBlocks }`
// is what `SlideEditor` reads.

import { createBlock } from './blockTypes';

// ── Small block builders — keep template definitions readable ─────────────
const p   = (html = '')                => createBlock('paragraph',   { html });
const h1  = (text = '')                => createBlock('heading-1',   { text });
const h2  = (text = '')                => createBlock('heading-2',   { text });
const h3  = (text = '')                => createBlock('heading-3',   { text });
const ul  = (items = [''])             => createBlock('bullet-list', { items });
const ol  = (items = [''])             => createBlock('numbered-list', { items });
const quote = (html = '', cite = '')   => createBlock('quote',       { html, cite });
const divider = ()                     => createBlock('divider');
const definition = (term, def)         => createBlock('definition',  { term, definition: def });
const callout = (variant, html)        => createBlock('callout',     { variant, html });

// Placeholder image — uses a transparent placeholder so the figure renders
// without a network round-trip until the tutor replaces it. The tutor can
// open the block's settings panel and paste a real URL / open the image
// picker; everything else (alt, caption, credit, width, fit) is editable.
const PLACEHOLDER_IMG = 'https://placehold.co/1200x675/E5E7EB/9CA3AF?text=Add+image';
const PLACEHOLDER_PORTRAIT = 'https://placehold.co/800x1000/E5E7EB/9CA3AF?text=Portrait';
const PLACEHOLDER_WIDE = 'https://placehold.co/1600x600/E5E7EB/9CA3AF?text=Hero+image';

const image = (overrides = {}) => createBlock('image', {
  url: PLACEHOLDER_IMG,
  alt: 'Replace this image',
  caption: '',
  credit: '',
  align: 'center',
  widthUnit: 'percent',
  width: 100,
  fit: 'contain',
  lockAspect: true,
  ...overrides,
});

const imageText = (overrides = {}) => createBlock('image-text', {
  url: PLACEHOLDER_IMG,
  alt: 'Replace this image',
  html: '<p>Replace this body copy. Use the toolbar to add headings, lists, and inline formatting.</p>',
  side: 'left',
  ...overrides,
});

// Two/Three-column container. `leftBlocks` / `middleBlocks` / `rightBlocks`
// are arrays of native child blocks — each one stays individually editable
// inside the TwoColumnsBlock UI.
const cols = (columnCount, leftBlocks, middleBlocks, rightBlocks, overrides = {}) =>
  createBlock('two-columns', {
    columnCount,
    leftBlocks: leftBlocks || [],
    middleBlocks: middleBlocks || [],
    rightBlocks: rightBlocks || [],
    ratio: 0.5,
    gap: 24,
    verticalAlign: 'top',
    stackOnMobile: true,
    ...overrides,
  });

const table = (rows, opts = {}) => createBlock('table', {
  header: true,
  stripe: false,
  caption: '',
  bordered: true,
  compact: false,
  rows: rows.map(row => row.map(cell =>
    typeof cell === 'string'
      ? { content: cell, align: 'left', bg: null, color: null, border: 'default', rowSpan: 1, colSpan: 1, hidden: false }
      : { align: 'left', bg: null, color: null, border: 'default', rowSpan: 1, colSpan: 1, hidden: false, ...cell }
  )),
  ...opts,
});

// ── Template registry ──────────────────────────────────────────────────────
// Each entry: { name, icon, category, buildBlocks: () => Block[] }.
// Categories drive the searchable, grouped picker UI in the gallery.
export const TEMPLATE_CATEGORIES = [
  'Basics',
  'Article',
  'Image layouts',
  'Editorial',
  'Quote & explain',
  'Data',
];

export const NATIVE_TEMPLATES = {
  // ── Basics ──────────────────────────────────────────────────────────────
  blank: {
    name: 'Blank',
    icon: '📄',
    category: 'Basics',
    buildBlocks: () => [
      p('Start writing your content here…'),
    ],
  },
  title: {
    name: 'Title',
    icon: '📌',
    category: 'Basics',
    buildBlocks: () => [
      h1('Main Lesson Title'),
      h2('Subtitle or Key Concept'),
    ],
  },

  // ── Article ─────────────────────────────────────────────────────────────
  singleColumnArticle: {
    name: 'Single-column article',
    icon: '📝',
    category: 'Article',
    buildBlocks: () => [
      h1('Article headline'),
      p('<em>Introduction paragraph — set the scene and hook the reader in one or two sentences.</em>'),
      h2('Section heading'),
      p('Body copy with clear, accessible explanation. Use plain language and short paragraphs to keep the reader with you.'),
      p('Continue developing the idea here. Add evidence, examples or quotations as needed.'),
      h2('A second section'),
      ul(['First key point', 'Second key point', 'Third key point']),
    ],
  },
  twoColumnArticle: {
    name: 'Two-column article',
    icon: '📰',
    category: 'Article',
    buildBlocks: () => [
      h1('Article headline'),
      p('<em>Standfirst — a single sentence that summarises the piece.</em>'),
      cols(2,
        [
          h3('Left column'),
          p('Lead the reader into the main idea here.'),
          p('Use a short, focused paragraph.'),
        ],
        [],
        [
          h3('Right column'),
          p('Continue the argument or develop a parallel theme.'),
          ul(['Supporting point one', 'Supporting point two']),
        ],
        { ratio: 0.5, gap: 24, verticalAlign: 'top' },
      ),
    ],
  },
  threeColumnEditorial: {
    name: 'Three-column editorial',
    icon: '🗞️',
    category: 'Editorial',
    buildBlocks: () => [
      h1('Editorial headline'),
      p('<em>Short standfirst that frames the editorial argument.</em>'),
      cols(3,
        [
          h3('Premise'),
          p('Set out the question or claim being explored.'),
        ],
        [
          h3('Evidence'),
          p('Marshal the supporting facts, quotes or data.'),
          ul(['Fact one', 'Fact two']),
        ],
        [
          h3('Conclusion'),
          p('Close with the editorial position and call to action.'),
        ],
        { gap: 24, verticalAlign: 'top' },
      ),
    ],
  },

  // ── Image layouts ───────────────────────────────────────────────────────
  imageLeftTextRight: {
    name: 'Image left + text right',
    icon: '🖼️',
    category: 'Image layouts',
    buildBlocks: () => [
      imageText({
        side: 'left',
        url: PLACEHOLDER_IMG,
        html: '<h2 style="font-size:24px; font-weight:700; color:#1A3C5A; margin:0 0 8px;">Section heading</h2><p>Body copy explaining the image. The image and this text share a single block — both fields stay editable.</p>',
      }),
    ],
  },
  textLeftImageRight: {
    name: 'Text left + image right',
    icon: '🖼️',
    category: 'Image layouts',
    buildBlocks: () => [
      imageText({
        side: 'right',
        url: PLACEHOLDER_IMG,
        html: '<h2 style="font-size:24px; font-weight:700; color:#1A3C5A; margin:0 0 8px;">Section heading</h2><p>Body copy explaining the image. The image and this text share a single block — both fields stay editable.</p>',
      }),
    ],
  },
  imageTopText: {
    name: 'Image top + text',
    icon: '🖼️',
    category: 'Image layouts',
    buildBlocks: () => [
      image({ caption: 'Optional caption' }),
      h2('Heading underneath'),
      p('Body copy that expands on the image above.'),
    ],
  },
  fullWidthImageCaption: {
    name: 'Full-width image with caption',
    icon: '🌅',
    category: 'Image layouts',
    buildBlocks: () => [
      image({
        url: PLACEHOLDER_WIDE,
        align: 'full',
        widthUnit: 'percent',
        width: 100,
        fit: 'cover',
        caption: 'Write the caption that appears under the image.',
        credit: 'Photographer / source',
      }),
    ],
  },

  // ── Editorial layouts ──────────────────────────────────────────────────
  newspaperFrontPage: {
    name: 'Newspaper front page',
    icon: '🗞️',
    category: 'Editorial',
    buildBlocks: () => [
      h1('THE DAILY HEADLINE'),
      p('<em>Late edition — the lead story of the day.</em>'),
      divider(),
      cols(3,
        [
          h3('Lead story'),
          p('Top-of-page story summary. Two or three short sentences.'),
        ],
        [
          image({ caption: 'Front-page photograph' }),
        ],
        [
          h3('Also today'),
          ul(['Second-lead headline', 'Third-lead headline', 'Brief news item']),
        ],
        { gap: 24, verticalAlign: 'top' },
      ),
    ],
  },
  newspaperArticle: {
    name: 'Newspaper article',
    icon: '📰',
    category: 'Editorial',
    buildBlocks: () => [
      h1('Article headline goes here'),
      p('<em>Standfirst sentence summarising the article in one line.</em>'),
      p('<strong>By Reporter Name</strong> — Section, Date'),
      cols(2,
        [
          p('Opening paragraph. Lead with the most important facts: who, what, when, where, why.'),
          p('Second paragraph develops the story with quotes or additional context.'),
          p('Third paragraph adds further detail and supporting evidence.'),
        ],
        [],
        [
          image({ caption: 'Main photograph for the article' }),
          p('Continuation of the article on the right column.'),
        ],
        { ratio: 0.55, gap: 24, verticalAlign: 'top' },
      ),
    ],
  },
  tabloidCover: {
    name: 'Tabloid cover',
    icon: '📣',
    category: 'Editorial',
    buildBlocks: () => [
      h1('SHOCKING HEADLINE!'),
      h2('Punchy subhead that draws the reader in'),
      image({ caption: 'Cover photograph' }),
      ul(['Story tease one — page 5', 'Story tease two — page 8', 'Story tease three — page 12']),
    ],
  },
  tabloidStory: {
    name: 'Tabloid story',
    icon: '📰',
    category: 'Editorial',
    buildBlocks: () => [
      h1('Big punchy headline'),
      h3('A snappy deck under the headline'),
      imageText({
        side: 'left',
        html: '<p><strong>OPENING SENTENCE</strong> in capitals to grab attention, then settle into a punchy lead paragraph that tells the story in a tabloid voice.</p><p>Continue with short, sharp paragraphs.</p>',
      }),
      p('Closing paragraph and call to action.'),
    ],
  },

  // ── Blog ────────────────────────────────────────────────────────────────
  blogHero: {
    name: 'Blog hero',
    icon: '✨',
    category: 'Article',
    buildBlocks: () => [
      image({
        url: PLACEHOLDER_WIDE,
        align: 'full',
        widthUnit: 'percent',
        width: 100,
        fit: 'cover',
      }),
      h1('Blog post title'),
      h3('A subtitle that previews the post'),
      p('<em>By Author · Date · Reading time</em>'),
    ],
  },
  blogArticle: {
    name: 'Blog article',
    icon: '📝',
    category: 'Article',
    buildBlocks: () => [
      h1('Blog post title'),
      p('<em>By Author · Date</em>'),
      p('Opening hook — one or two sentences that promise the value of the post.'),
      h2('First section heading'),
      p('Body copy for the first section. Keep paragraphs to 2–3 sentences for readability.'),
      image({ caption: 'Supporting image with caption' }),
      h2('Second section heading'),
      ul(['Key takeaway one', 'Key takeaway two', 'Key takeaway three']),
      h2('Conclusion'),
      p('Wrap up with the key insight and what the reader should do next.'),
    ],
  },
  featureProfile: {
    name: 'Feature profile / interview',
    icon: '👤',
    category: 'Article',
    buildBlocks: () => [
      h1('Subject name'),
      h3('Role · Organisation'),
      imageText({
        side: 'left',
        url: PLACEHOLDER_PORTRAIT,
        html: '<p><strong>Q:</strong> First interview question?</p><p><strong>A:</strong> Their answer, in their voice.</p><p><strong>Q:</strong> Second question?</p><p><strong>A:</strong> Their answer.</p>',
      }),
      quote('A pulled-out quote from the interview that captures the subject\'s key idea.', 'Subject name'),
      p('Closing context paragraph wrapping up the profile.'),
    ],
  },

  // ── Quote & explain ─────────────────────────────────────────────────────
  quoteHighlight: {
    name: 'Quote / highlight',
    icon: '💬',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Highlighted theme'),
      quote('Insert an important quote or key takeaway message here.', 'Author or source'),
      p('Add context underneath the quote if needed.'),
    ],
  },
  definitionExplainer: {
    name: 'Definition / explainer',
    icon: '📖',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('What is …?'),
      definition('Key term', 'Short, accessible definition of the key term in one or two sentences.'),
      p('Expand on the definition with an example or context.'),
      callout('info', 'Optional note — use callouts to highlight tips, warnings or important facts.'),
    ],
  },
  comparisonBeforeAfter: {
    name: 'Comparison / before-after',
    icon: '↔️',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Before vs after'),
      cols(2,
        [
          h3('Before'),
          ul(['Point about the original state', 'Another point', 'A third point']),
        ],
        [],
        [
          h3('After'),
          ul(['Point about the new state', 'Another point', 'A third point']),
        ],
        { ratio: 0.5, gap: 24, verticalAlign: 'top' },
      ),
    ],
  },

  // ── Data ────────────────────────────────────────────────────────────────
  dataTableReport: {
    name: 'Data / table report',
    icon: '📊',
    category: 'Data',
    buildBlocks: () => [
      h2('Findings'),
      p('Short introduction that frames the data below.'),
      table(
        [
          ['Metric', 'Group A', 'Group B', 'Difference'],
          ['Sample size', '120', '118', '+2'],
          ['Mean score', '7.2', '6.4', '+0.8'],
          ['Standard deviation', '1.1', '1.3', '−0.2'],
        ],
        { header: true, stripe: true, caption: 'Table 1 — Summary of results' },
      ),
      p('Briefly interpret the table for the reader.'),
    ],
  },
};

// Convenience accessor.
export function getNativeTemplate(key) {
  return NATIVE_TEMPLATES[key] || null;
}

// Group templates by category for the gallery UI.
export function getTemplatesByCategory() {
  const grouped = {};
  for (const cat of TEMPLATE_CATEGORIES) grouped[cat] = [];
  for (const [key, t] of Object.entries(NATIVE_TEMPLATES)) {
    const cat = TEMPLATE_CATEGORIES.includes(t.category) ? t.category : 'Basics';
    grouped[cat].push({ key, ...t });
  }
  return grouped;
}