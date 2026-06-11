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

  // ══════════════════════════════════════════════════════════════════════
  // EXTRA TEMPLATES — added to enrich each category
  // ══════════════════════════════════════════════════════════════════════

  // ── More Basics ─────────────────────────────────────────────────────────
  sectionDivider: {
    name: 'Section divider',
    icon: '➖',
    category: 'Basics',
    buildBlocks: () => [
      h1('Part Two'),
      h3('A short overline introducing the next section'),
      divider(),
    ],
  },
  agenda: {
    name: 'Agenda',
    icon: '🗒️',
    category: 'Basics',
    buildBlocks: () => [
      h1('Today\'s agenda'),
      ol([
        'Welcome and introductions',
        'Key concept of the lesson',
        'Worked example',
        'Discussion',
        'Wrap-up and next steps',
      ]),
    ],
  },
  learningObjectives: {
    name: 'Learning objectives',
    icon: '🎯',
    category: 'Basics',
    buildBlocks: () => [
      h2('By the end of this lesson you will be able to…'),
      ul([
        'State the key concept in your own words',
        'Apply it to a worked example',
        'Identify common pitfalls',
      ]),
    ],
  },
  bigQuote: {
    name: 'Big quote',
    icon: '❝',
    category: 'Basics',
    buildBlocks: () => [
      quote('A single, powerful statement that anchors the lesson.', 'Source'),
    ],
  },
  closingSlide: {
    name: 'Closing / thank you',
    icon: '👋',
    category: 'Basics',
    buildBlocks: () => [
      h1('Thank you'),
      h3('Questions?'),
      p('Contact details, links, or next steps go here.'),
    ],
  },

  // ── More Article ────────────────────────────────────────────────────────
  longReadOpener: {
    name: 'Long-read opener',
    icon: '📜',
    category: 'Article',
    buildBlocks: () => [
      image({
        url: PLACEHOLDER_WIDE,
        align: 'full',
        widthUnit: 'percent',
        width: 100,
        fit: 'cover',
      }),
      h1('A headline that earns the long read'),
      h3('A subtitle that sets the stakes'),
      p('<em>By Author · Date · 12 minute read</em>'),
      p('Opening paragraph — paint the scene with vivid detail and a clear hook.'),
    ],
  },
  newsExplainer: {
    name: 'News explainer',
    icon: '❓',
    category: 'Article',
    buildBlocks: () => [
      h1('Explainer: What\'s going on?'),
      p('<em>A short summary of what this explainer covers.</em>'),
      h2('What happened?'),
      p('A clear, factual account of events.'),
      h2('Why does it matter?'),
      p('The significance for the reader.'),
      h2('What happens next?'),
      ul(['Possible outcome one', 'Possible outcome two', 'What to watch for']),
    ],
  },
  caseStudy: {
    name: 'Case study',
    icon: '🔍',
    category: 'Article',
    buildBlocks: () => [
      h1('Case study: Subject name'),
      h3('Context · Date · Outcome'),
      h2('Background'),
      p('Brief background and context.'),
      h2('Approach'),
      ol(['Step one of the approach', 'Step two', 'Step three']),
      h2('Result'),
      p('What was achieved and why it matters.'),
      callout('info', 'Key lesson: summarise the takeaway in one sentence.'),
    ],
  },
  howToGuide: {
    name: 'How-to guide',
    icon: '🛠️',
    category: 'Article',
    buildBlocks: () => [
      h1('How to do something useful'),
      p('<em>A one-sentence promise of what the reader will achieve.</em>'),
      h2('What you\'ll need'),
      ul(['Item one', 'Item two', 'Item three']),
      h2('Steps'),
      ol([
        'Do the first thing — describe it precisely',
        'Do the second thing — include any tips',
        'Do the third thing — common pitfalls to avoid',
        'Verify the result',
      ]),
      callout('success', 'You\'re done! Quick recap of what was achieved.'),
    ],
  },
  listicle: {
    name: 'Listicle (Top 5)',
    icon: '🏆',
    category: 'Article',
    buildBlocks: () => [
      h1('Top 5 things you should know'),
      p('<em>A one-line standfirst summarising the list.</em>'),
      h2('1. First item'),
      p('Why this matters in two short sentences.'),
      h2('2. Second item'),
      p('A second concise explanation.'),
      h2('3. Third item'),
      p('Continue the pattern.'),
      h2('4. Fourth item'),
      p('Keep paragraphs short.'),
      h2('5. Fifth item'),
      p('Close with the most memorable point.'),
    ],
  },

  // ── More Image layouts ──────────────────────────────────────────────────
  twoImagesSideBySide: {
    name: 'Two images side by side',
    icon: '🖼️',
    category: 'Image layouts',
    buildBlocks: () => [
      h2('Compare these visuals'),
      cols(2,
        [image({ caption: 'Left caption' })],
        [],
        [image({ caption: 'Right caption' })],
        { ratio: 0.5, gap: 24, verticalAlign: 'top' },
      ),
      p('A short paragraph drawing the comparison.'),
    ],
  },
  imageGrid4: {
    name: 'Image grid (4)',
    icon: '🔲',
    category: 'Image layouts',
    buildBlocks: () => [
      h2('Image gallery'),
      cols(2,
        [image({ caption: 'Top left' }), image({ caption: 'Bottom left' })],
        [],
        [image({ caption: 'Top right' }), image({ caption: 'Bottom right' })],
        { ratio: 0.5, gap: 16, verticalAlign: 'top' },
      ),
    ],
  },
  heroOverlayHeading: {
    name: 'Hero image with heading',
    icon: '🌄',
    category: 'Image layouts',
    buildBlocks: () => [
      image({
        url: PLACEHOLDER_WIDE,
        align: 'full',
        widthUnit: 'percent',
        width: 100,
        fit: 'cover',
      }),
      h1('Headline over the hero'),
      h3('Supporting subhead'),
      p('A short paragraph beneath the hero image.'),
    ],
  },
  portraitWithBio: {
    name: 'Portrait with bio',
    icon: '🧑',
    category: 'Image layouts',
    buildBlocks: () => [
      imageText({
        side: 'left',
        url: PLACEHOLDER_PORTRAIT,
        html: '<h2 style="font-size:24px; font-weight:700; color:#1A3C5A; margin:0 0 8px;">Person\'s name</h2><h3 style="font-size:16px; color:#475569; margin:0 0 12px;">Role · Organisation</h3><p>Short biography that introduces this person and why they matter to this lesson.</p>',
      }),
    ],
  },
  threeImageRow: {
    name: 'Three images in a row',
    icon: '🎞️',
    category: 'Image layouts',
    buildBlocks: () => [
      h2('Three perspectives'),
      cols(3,
        [image({ caption: 'First' })],
        [image({ caption: 'Second' })],
        [image({ caption: 'Third' })],
        { gap: 16, verticalAlign: 'top' },
      ),
    ],
  },

  // ── More Editorial ──────────────────────────────────────────────────────
  opinionColumn: {
    name: 'Opinion column',
    icon: '✍️',
    category: 'Editorial',
    buildBlocks: () => [
      h1('Opinion: The headline argument'),
      h3('A subhead that sharpens the position'),
      p('<strong>By Columnist Name</strong> — Opinion · Date'),
      p('Opening paragraph that stakes the claim clearly.'),
      p('Second paragraph develops the reasoning with one or two pieces of evidence.'),
      quote('A pulled-out line that captures the column\'s sharpest point.', 'Columnist'),
      p('Closing paragraph drives the conclusion home.'),
    ],
  },
  magazineSpread: {
    name: 'Magazine spread',
    icon: '📔',
    category: 'Editorial',
    buildBlocks: () => [
      h1('FEATURE HEADLINE'),
      h3('A long, evocative subtitle that promises a rich read'),
      cols(2,
        [
          image({ caption: 'Lead photograph' }),
        ],
        [],
        [
          p('<em>By Writer · Photography by Photographer</em>'),
          p('Opening paragraph in a confident, literary voice.'),
          p('Second paragraph builds the atmosphere.'),
        ],
        { ratio: 0.5, gap: 32, verticalAlign: 'top' },
      ),
    ],
  },
  editorsNote: {
    name: "Editor's note",
    icon: '📬',
    category: 'Editorial',
    buildBlocks: () => [
      h1('From the editor'),
      p('<em>A personal opening line from the editor.</em>'),
      p('First paragraph framing this issue\'s theme.'),
      p('Second paragraph picking out highlights for the reader.'),
      p('<strong>— Editor Name</strong>'),
    ],
  },
  sidebarStory: {
    name: 'Story with sidebar',
    icon: '📑',
    category: 'Editorial',
    buildBlocks: () => [
      h1('Main story headline'),
      cols(2,
        [
          p('Main story opening paragraph.'),
          p('Continuation in the main column.'),
          p('Final paragraph wrapping the story.'),
        ],
        [],
        [
          callout('info', '<strong>Sidebar</strong><br/>Quick facts, a related stat, or a short related item.'),
          ul(['Related point one', 'Related point two', 'Related point three']),
        ],
        { ratio: 0.65, gap: 24, verticalAlign: 'top' },
      ),
    ],
  },

  // ── More Quote & explain ────────────────────────────────────────────────
  prosCons: {
    name: 'Pros and cons',
    icon: '⚖️',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Weighing it up'),
      cols(2,
        [
          h3('Pros'),
          ul(['Advantage one', 'Advantage two', 'Advantage three']),
        ],
        [],
        [
          h3('Cons'),
          ul(['Drawback one', 'Drawback two', 'Drawback three']),
        ],
        { ratio: 0.5, gap: 24, verticalAlign: 'top' },
      ),
      p('A short paragraph summarising the balance.'),
    ],
  },
  faqList: {
    name: 'FAQ',
    icon: '❔',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Frequently asked questions'),
      h3('Q. First question?'),
      p('A clear, one or two sentence answer.'),
      h3('Q. Second question?'),
      p('A clear, one or two sentence answer.'),
      h3('Q. Third question?'),
      p('A clear, one or two sentence answer.'),
    ],
  },
  keyTermsList: {
    name: 'Key terms',
    icon: '🔑',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Key terms'),
      definition('Term one', 'Short, accessible definition of term one.'),
      definition('Term two', 'Short, accessible definition of term two.'),
      definition('Term three', 'Short, accessible definition of term three.'),
    ],
  },
  mythVsFact: {
    name: 'Myth vs fact',
    icon: '🔮',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Myth vs fact'),
      cols(2,
        [
          h3('Myth'),
          callout('warning', 'State the common myth in one short sentence.'),
        ],
        [],
        [
          h3('Fact'),
          callout('success', 'State the correct fact in one short sentence.'),
        ],
        { ratio: 0.5, gap: 24, verticalAlign: 'top' },
      ),
      p('A brief explanation of why the misconception exists.'),
    ],
  },
  threeQuotes: {
    name: 'Three quotes',
    icon: '🗨️',
    category: 'Quote & explain',
    buildBlocks: () => [
      h2('Voices'),
      quote('First quote that opens the conversation.', 'Speaker one'),
      quote('Second quote that adds a complementary view.', 'Speaker two'),
      quote('Third quote that lands the closing thought.', 'Speaker three'),
    ],
  },

  // ── More Data ───────────────────────────────────────────────────────────
  keyStats: {
    name: 'Key stats',
    icon: '🔢',
    category: 'Data',
    buildBlocks: () => [
      h2('Key statistics'),
      cols(3,
        [
          h1('72%'),
          p('Brief description of this statistic.'),
        ],
        [
          h1('3.4×'),
          p('Brief description of this statistic.'),
        ],
        [
          h1('£1.2m'),
          p('Brief description of this statistic.'),
        ],
        { gap: 16, verticalAlign: 'top' },
      ),
      p('Source: Add your data source here.'),
    ],
  },
  comparisonTable: {
    name: 'Comparison table',
    icon: '📋',
    category: 'Data',
    buildBlocks: () => [
      h2('Option comparison'),
      table(
        [
          ['Feature', 'Option A', 'Option B', 'Option C'],
          ['Cost', 'Low', 'Medium', 'High'],
          ['Speed', 'Fast', 'Medium', 'Slow'],
          ['Quality', 'Good', 'Better', 'Best'],
          ['Recommended', 'Beginners', 'Most users', 'Power users'],
        ],
        { header: true, stripe: true, caption: 'Compare features at a glance' },
      ),
    ],
  },
  timelineTable: {
    name: 'Timeline',
    icon: '🕰️',
    category: 'Data',
    buildBlocks: () => [
      h2('Timeline'),
      table(
        [
          ['Date', 'Event', 'Significance'],
          ['Year 1', 'First milestone', 'Why it mattered'],
          ['Year 2', 'Second milestone', 'Why it mattered'],
          ['Year 3', 'Third milestone', 'Why it mattered'],
          ['Today', 'Where we are now', 'What it means'],
        ],
        { header: true, stripe: false, caption: 'Key moments at a glance' },
      ),
    ],
  },
  surveyResults: {
    name: 'Survey results',
    icon: '📈',
    category: 'Data',
    buildBlocks: () => [
      h2('Survey results'),
      p('<em>Sample: N = 0. Method: describe the survey method briefly.</em>'),
      table(
        [
          ['Question', 'Agree', 'Neutral', 'Disagree'],
          ['Statement one', '62%', '24%', '14%'],
          ['Statement two', '48%', '31%', '21%'],
          ['Statement three', '71%', '18%', '11%'],
        ],
        { header: true, stripe: true, caption: 'Table — Survey responses (%)' },
      ),
      callout('info', 'Key insight: summarise the headline finding in one sentence.'),
    ],
  },
  budgetBreakdown: {
    name: 'Budget breakdown',
    icon: '💷',
    category: 'Data',
    buildBlocks: () => [
      h2('Budget breakdown'),
      table(
        [
          ['Category', 'Amount', 'Share'],
          ['Personnel', '£40,000', '50%'],
          ['Materials', '£20,000', '25%'],
          ['Operations', '£12,000', '15%'],
          ['Contingency', '£8,000', '10%'],
          ['Total', '£80,000', '100%'],
        ],
        { header: true, stripe: true, caption: 'Project budget allocation' },
      ),
      p('Brief explanatory note about the allocation.'),
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