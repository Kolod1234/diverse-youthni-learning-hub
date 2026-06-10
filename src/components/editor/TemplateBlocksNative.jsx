// Native-block factories for TemplateBlocks-menu items.
// ----------------------------------------------------------------------------
// Historically the "Blocks" menu in the lesson editor inserted ready-made HTML
// snippets directly into slide.content. When the Visual Lesson Builder later
// re-parsed that content it had no `data-lesson-block="…"` markers to read, so
// the whole snippet was wrapped in a single `legacy-html` block — meaning the
// "Pro Tip", "Warning" etc. boxes could only be edited via a raw-HTML textarea.
//
// This module gives each well-known Blocks-menu item a NATIVE replacement made
// of real builder blocks (callout / definition / quote / heading / list).
// Those blocks serialise with `data-lesson-block` markers, so when the slide
// is reopened the builder reconstructs the SAME editable blocks — every text
// field stays inline-editable.
//
// Lookup key is the `name` field on the legacy snippet (case-insensitive).
// Unknown names return null → TemplateBlocks falls back to the old HTML path.

import { createBlock } from './lessonBuilder/blockTypes';

const callout = (variant, html) => createBlock('callout', { variant, html });
const definition = (term, def) => createBlock('definition', { term, definition: def });
const quote = (html, cite = '') => createBlock('quote', { html, cite });
const h2 = (text) => createBlock('heading-2', { text });
const h3 = (text) => createBlock('heading-3', { text });
const p  = (html) => createBlock('paragraph', { html });
const ul = (items) => createBlock('bullet-list', { items });
const ol = (items) => createBlock('numbered-list', { items });

// Mapping from legacy snippet name → factory that returns Block[].
// Variants chosen to match the original colour intent in TemplateBlocks.jsx:
//   info / warning / success / danger map onto the four CalloutBlock palettes.
const NATIVE_MAP = {
  // ── Callouts ────────────────────────────────────────────────────────────
  'tip box':          () => [callout('info',    '<p><strong>Pro Tip</strong> — Add your helpful tip or advice here. This helps students remember key points.</p>')],
  'quick tip':        () => [callout('success', '<p><strong>💡 Quick Tip:</strong> Short, actionable advice in one sentence.</p>')],
  'study tip':        () => [callout('info',    '<p><strong>📚 Study Tip</strong> — Provide effective study strategies and learning techniques.</p>')],
  'important notice': () => [callout('danger',  '<p><strong>Important</strong> — Highlight critical information students need to remember.</p>')],
  'key concept':      () => [callout('success', '<p><strong>Key Concept</strong> — Emphasize essential concepts and learning objectives.</p>')],
  'info box':         () => [callout('info',    '<p><strong>Did You Know?</strong> Share interesting facts or additional context.</p>')],
  'warning box':      () => [callout('warning', '<p><strong>Warning</strong> — Caution students about common pitfalls or dangerous misconceptions.</p>')],
  'caution box':      () => [callout('warning', '<p><strong>Caution</strong> — Advise students to proceed carefully or note potential issues.</p>')],
  'success box':      () => [callout('success', '<p><strong>Well Done!</strong> Celebrate achievements and reinforce positive learning outcomes.</p>')],
  'question box':     () => [callout('info',    '<p><strong>Think About It</strong> — Pose thought-provoking questions to encourage critical thinking.</p>')],
  'remember box':     () => [callout('warning', '<p><strong>📌 Remember</strong> — Highlight key facts that students must memorize.</p>')],
  'common mistake':   () => [callout('danger',  '<p><strong>Common Mistake</strong> — Point out typical errors students make and how to avoid them.</p>')],
  'fun fact':         () => [callout('info',    '<p><strong>🎨 Fun Fact</strong> — Share interesting trivia to engage students and make learning fun.</p>')],
  'note box':         () => [callout('warning', '<p><strong>📝 Note</strong> — Additional notes or supplementary information.</p>')],
  'attention box':    () => [callout('danger',  '<p><strong>ATTENTION!</strong> Critical alert requiring immediate attention from students.</p>')],

  // ── Definitions ─────────────────────────────────────────────────────────
  'term definition':  () => [definition('Term or Concept', 'Clear definition goes here. Explain the term in simple, understandable language.')],
  'glossary item':    () => [definition('Term', 'Brief explanation of the glossary term.')],
  'vocabulary card':  () => [
    h3('Word'),
    p('<em>/pronunciation/</em>'),
    p('Definition and meaning of the word.'),
  ],
  'key terms list':   () => [
    h3('Key Terms'),
    definition('Term 1', 'Definition'),
    definition('Term 2', 'Definition'),
    definition('Term 3', 'Definition'),
  ],

  // ── Content / quotes / summary ──────────────────────────────────────────
  'quote box':        () => [quote('Insert meaningful quote or key statement here.', 'Source or Author')],
  'highlighted quote':() => [quote('Insert important quote or statement here.', '')],
  'summary box':      () => [
    h3('Summary'),
    ul(['Key point 1', 'Key point 2', 'Key point 3']),
  ],
  'objectives list':  () => [
    h3('🎯 Learning Objectives'),
    ul(['Objective 1', 'Objective 2', 'Objective 3']),
  ],
  'numbered steps':   () => [
    h3('Step-by-Step Process'),
    ol(['First Step: Description', 'Second Step: Description', 'Third Step: Description']),
  ],
  'highlighted text': () => [callout('warning', '<p><strong>✨</strong> Highlighted key information that deserves special attention.</p>')],
  'conclusion text':  () => [callout('success', '<p><strong>✓ Conclusion</strong> — Summarize the main takeaways and reinforce learning.</p>')],
  'intro paragraph':  () => [callout('info',    '<p>Introductory paragraph with emphasis to set the context and grab attention.</p>')],

  // ── Text ────────────────────────────────────────────────────────────────
  'large heading':    () => [createBlock('heading-1', { text: 'Main Heading' })],
  'section heading':  () => [h2('Section Title')],
  'subheading':       () => [h3('Subheading')],
  'paragraph':        () => [p('Add your paragraph text here. Write clear, concise explanations that help students understand the topic.')],
  'bullet list':      () => [ul(['First bullet point', 'Second bullet point', 'Third bullet point'])],
  'numbered list':    () => [ol(['First item', 'Second item', 'Third item'])],

  // ── Examples ────────────────────────────────────────────────────────────
  'example block':    () => [callout('warning', '<p><strong>EXAMPLE</strong> — Walk through a specific example step-by-step to illustrate the concept.</p>')],
  'real-world example': () => [callout('info', '<p><strong>🌍 Real-World Application</strong> — Show how this concept applies in everyday life or professional settings.</p>')],
  'counter-example':  () => [callout('danger', '<p><strong>🚫 Counter-Example</strong> — Show an example that contradicts a common assumption to deepen understanding.</p>')],
  'historical example': () => [callout('warning', '<p><strong>📜 Historical Context</strong> — Provide historical background or examples from the past.</p>')],
  'application example': () => [callout('info', '<p><strong>APPLICATION</strong> — Practical steps to apply this concept in real situations.</p>')],
};

/**
 * Look up native blocks for a legacy snippet name.
 * @param {string} name e.g. "Pro Tip", "Warning Box"
 * @returns {Array|null} array of native blocks, or null if not migrated.
 */
export function nativeBlocksForName(name) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  const factory = NATIVE_MAP[key];
  return factory ? factory() : null;
}