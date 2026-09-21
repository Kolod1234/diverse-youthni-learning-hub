import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const REWRITE_RULES = `You are an expert WJEC AS Sociology tutor and educational editor. Rewrite the HTML page below so it reads as a lively, one-to-one tutoring session instead of academic prose, while preserving every piece of sociological substance.

STYLE RULES (mandatory):
1. INTERACTIVE TUTOR VOICE. Speak directly to the student ("you"). Before key reveals, ask the student to think, predict or attempt. Use varied prompts such as: "Before you read on, cover the next paragraph and try to name...", "Pause and predict: ...", "Why do you think ...?", "Your turn: ...", "Quick check: ...", "Try it yourself: ...". Include a short thinking question roughly every 150-250 words, and let the following text answer it. Never repeat the same prompt phrasing twice. Do not turn the page into a quiz: the full teaching explanation stays.
2. FULL STOPS, NOT DASHES. It is forbidden to join or bracket clauses with an em dash (—) or en dash (–). Break such constructions into separate sentences, or use commas, colons or brackets. Your output must contain zero em dashes and zero en dashes (use "to" for ranges, e.g. "1945 to 1955").
3. PROPER HEADINGS. Do not leave bold UPPERCASE labels run into a paragraph. Convert every inline label into its own <h4> subheading (sentence case, not all caps) on its own line, followed by the paragraph text. Keep any existing h2/h3 headings as real headings.
4. SENTENCES AND PARAGRAPHS. Prefer short, clear sentences (12 to 25 words). One idea per paragraph. No paragraph longer than about 110 words.
5. BRITISH ENGLISH throughout (socialisation, behaviour, colour, organisation).

PRESERVATION RULES (mandatory):
6. Keep ALL sociological content: every theorist name, study, date, statistic, definition, example, evaluation point, and cross-reference such as "(page 7)" or "(Lesson 11)". Teaching depth must not shrink.
7. IMAGE SLOTS. The input contains placeholder tokens like [IMG-SLOT-1] standing for the page's diagrams. Keep every token EXACTLY as written, in the same position inside its <figure> block. Do not delete, reorder or alter tokens, and do not invent new ones. Keep each <figure> wrapper; you may reword the caption to remove any dash while keeping its meaning.
8. Keep the existing block structures EXACTLY, copying every style attribute VERBATIM, one for one (callout divs, worked-example, practice-block, answer-block, key-rule blocks, tables, lists). Only rewrite the wording inside them. Keep practice questions and their full answers complete.
9. The output must be between 90% and 130% of the input length.
10. Return ONLY JSON of the shape {"content": "..."} containing the complete rewritten HTML. No markdown fences, no commentary.`;

const IMG_RE = /<img[^>]*>/g;
const SRC_RE = /src="([^"]+)"/g;

function extractImgs(html) {
  const srcs = [];
  let m;
  const re = new RegExp(SRC_RE);
  while ((m = re.exec(html)) !== null) srcs.push(m[1]);
  return srcs;
}

function stripTags(html) {
  return String(html)
    .replace(/<img[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
}

function countMatches(html, re) {
  return (String(html).match(re) || []).length;
}

function extractClasses(html) {
  const out = new Set();
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) m[1].split(/\s+/).forEach((c) => c && out.add(c));
  return out;
}

// Re-insert the original <img> tags byte-for-byte wherever the candidate kept the
// same image sources, so image markup can never drift from the authored asset.
function enforceOriginalImgs(original, candidate) {
  const oldTags = original.match(IMG_RE) || [];
  if (!oldTags.length) return candidate;
  let out = candidate;
  oldTags.forEach((tag) => {
    const m = tag.match(SRC_RE);
    const src = m ? m[1] : null;
    if (!src) return;
    const re = new RegExp('<img[^>]*src="' + src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>');
    if (re.test(out)) out = out.replace(re, tag);
  });
  return out;
}

function validate(original, next) {
  const problems = [];
  // 1. images preserved exactly
  const oldImgs = original.match(IMG_RE) || [];
  const newImgs = next.match(IMG_RE) || [];
  if (oldImgs.length !== newImgs.length || !oldImgs.every((tag) => newImgs.includes(tag))) {
    problems.push('img tags were changed or lost. You must reproduce these tags EXACTLY, character for character: [' + oldImgs.join('] [') + ']');
  }
  // 2. no em/en dashes outside img tags
  const noImgs = next.replace(IMG_RE, ' ');
  if (noImgs.includes('\u2014') || noImgs.includes('\u2013')) {
    const offending = [];
    const re = /[^.<>]*[\u2014\u2013][^.<>]*/g;
    let m;
    while ((m = re.exec(noImgs)) !== null && offending.length < 5) {
      offending.push(m[0].replace(/\s+/g, ' ').trim().slice(0, 160));
    }
    problems.push('dash characters remain in these passages, rewrite each into separate sentences: [' + offending.join('] [') + ']');
  }
  // 3. interactive voice: several question prompts
  const qCount = countMatches(stripTags(next), /\?/g);
  if (qCount < 2) problems.push('the page has fewer than two questions to the student, so it does not read as interactive teaching. Add at least two short tutor questions in your own voice, for example "Why do you think ...?" or "Before you read on, try to ..."');
  // 4. inline uppercase bold labels converted to headings
  const hadInlineLabels = /<strong>[A-Z][A-Z0-9 '.:&;/-]{5,}<\/strong>/.test(original);
  if (hadInlineLabels && !/<h[234][\s>]/.test(next)) {
    problems.push('inline uppercase labels were not converted into proper subheadings');
  }
  if (/<strong>[A-Z][A-Z0-9 '.:&;/-]{5,}<\/strong>/.test(next)) {
    problems.push('a bold UPPERCASE inline label still runs into a paragraph');
  }
  // 5. length guard
  const oldLen = stripTags(original).replace(/\s+/g, ' ').trim().length;
  const newLen = stripTags(next).replace(/\s+/g, ' ').trim().length;
  if (newLen < oldLen * 0.7) problems.push('the rewrite is much shorter than the original; teaching content may have been lost');
  if (newLen > oldLen * 1.9) problems.push('the rewrite is much longer than the original');
  // 6. structure guard: classes and inline styles survive
  const oldClasses = extractClasses(original);
  const newClasses = extractClasses(next);
  for (const c of oldClasses) if (!newClasses.has(c)) problems.push('a CSS class was lost: ' + c);
  const oldStyles = countMatches(original, /style="/g);
  const newStyles = countMatches(next, /style="/g);
  if (newStyles < oldStyles * 0.8) problems.push('styled blocks were dropped: the original has ' + oldStyles + ' style attributes but your rewrite has ' + newStyles + '. Copy every style attribute VERBATIM, one for one.');
  // 7. key terms guard: proper nouns survive
  const tokens = new Set(
    (stripTags(original).match(/\b[A-Z][a-z]{3,}\b/g) || []).filter(
      (w) => !['This', 'That', 'Then', 'They', 'When', 'What', 'Which', 'Where', 'While', 'Before', 'After', 'Here', 'There', 'Your', 'Their', 'Some', 'Most', 'Many', 'First', 'Second', 'Third', 'Every', 'Each', 'Both', 'Note', 'Look', 'Think', 'Try', 'Have', 'Does', 'Which', 'Unit', 'Page', 'Turn', 'Cover', 'Pause'].includes(w)
    )
  );
  if (tokens.size > 0) {
    const nextText = stripTags(next);
    let kept = 0;
    tokens.forEach((t) => { if (nextText.includes(t)) kept++; });
    if (kept / tokens.size < 0.7) problems.push('key named concepts or researchers may have been dropped');
  }
  return problems;
}

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

// Split an HTML page into its top-level blocks (paragraphs, divs, figures, tables).
function splitTopLevelBlocks(html) {
  const tokenRe = /<\/?[a-zA-Z][^>]*>/g;
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  let firstStart = -1;
  let lastEnd = 0;
  let m;
  while ((m = tokenRe.exec(html)) !== null) {
    const tag = m[0];
    const nameM = tag.match(/^<\s*\/?\s*([a-zA-Z0-9]+)/);
    const name = nameM ? nameM[1].toLowerCase() : '';
    const closing = /^<\s*\//.test(tag);
    if (!name || VOID_TAGS.has(name)) continue;
    if (!closing) {
      if (depth === 0) {
        blockStart = m.index;
        if (firstStart < 0) firstStart = m.index;
      }
      depth++;
    } else {
      depth--;
      if (depth === 0 && blockStart >= 0) {
        blocks.push({ start: blockStart, end: m.index + tag.length });
        blockStart = -1;
        lastEnd = m.index + tag.length;
      }
    }
  }
  const out = [];
  if (firstStart > 0) {
    const lead = html.slice(0, firstStart).trim();
    if (lead) out.push(lead);
  }
  for (const b of blocks) out.push(html.slice(b.start, b.end));
  if (blocks.length && lastEnd < html.length) {
    const trail = html.slice(lastEnd).trim();
    if (trail) out.push(trail);
  }
  if (!out.length) out.push(html.trim());
  return out;
}

// Group blocks into rewrite chunks of at most maxLen characters.
function chunkBlocks(blocks, maxLen) {
  const chunks = [];
  let cur = [];
  let curLen = 0;
  for (const b of blocks) {
    if (curLen > 0 && curLen + b.length > maxLen) {
      chunks.push(cur.join('\n'));
      cur = [];
      curLen = 0;
    }
    if (b.length > maxLen && cur.length === 0) {
      const parts = b.split(/(?=<p\b)|(?=<div\b)|(?=<h[234]\b)/).filter((p) => p.trim());
      for (const p of parts) {
        if (curLen + p.length > maxLen && cur.length) {
          chunks.push(cur.join('\n'));
          cur = [];
          curLen = 0;
        }
        cur.push(p);
        curLen += p.length;
      }
      continue;
    }
    cur.push(b);
    curLen += b.length;
  }
  if (cur.length) chunks.push(cur.join('\n'));
  return chunks;
}

function buildChunkPrompt(lessonTitle, slideTitle, pageNo, totalPages, sectionNo, sectionTotal, section, problems) {
  let p = `${REWRITE_RULES}

Page context: lesson "${lessonTitle}", page ${pageNo} of ${totalPages}, page title "${slideTitle}". You are rewriting section ${sectionNo} of ${sectionTotal} of that page. If this section opens the page, open with an engaging question to the student; otherwise simply continue the same tutoring voice. Do not add an overall conclusion, and do not drop any block.
`;
  if (problems && problems.length) {
    p += `\nA previous attempt at this page was rejected for these reasons:\n- ${problems.join('\n- ')}\nFix every reason while keeping all other rules.\n`;
  }
  p += `\nHere is the section HTML to rewrite:\n${section}`;
  return p;
}

function buildPrompt(lessonTitle, slideTitle, pageNo, totalPages, original, problems) {
  let p = `${REWRITE_RULES}

Page context: lesson "${lessonTitle}", page ${pageNo} of ${totalPages}, page title "${slideTitle}".
`;
  if (problems && problems.length) {
    p += `\nYour previous attempt at this page was rejected for these reasons:\n- ${problems.join('\n- ')}\nFix every reason while keeping all other rules.\n`;
  }
  p += `\nHere is the page HTML to rewrite:\n${original}`;
  return p;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json().catch(() => ({}));
    const order = Number(payload.order);
    if (!order) return Response.json({ error: 'order (lesson order 1 to 16) is required' }, { status: 400 });
    const fromPage = Math.max(1, Number(payload.from_page) || 1);
    const onlyPages = Array.isArray(payload.pages) && payload.pages.length
      ? payload.pages.map(Number).filter((n) => n > 0)
      : null;
    const budgetMs = (Number(payload.time_budget_s) || 150) * 1000;
    const started = Date.now();

    const courses = await base44.asServiceRole.entities.Course.filter({ title: 'WJEC AS Sociology' });
    if (!courses.length) return Response.json({ error: 'Course not found' }, { status: 404 });
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courses[0].id });
    lessons.sort((a, b) => a.order - b.order);
    const lesson = lessons.find((l) => l.order === order);
    if (!lesson) return Response.json({ error: 'Lesson not found', order }, { status: 404 });
    if (!lesson.slides || !lesson.slides.length) {
      return Response.json({ error: 'Lesson has no slides', order }, { status: 400 });
    }

    const slides = lesson.slides.slice();
    const report = [];
    let page = fromPage;
    while (page <= slides.length) {
      if (onlyPages && !onlyPages.includes(page)) { page++; continue; }
      if (Date.now() - started > budgetMs) break;
      const slide = slides[page - 1];
      const original = slide.content || '';
      // Protect the image tags: swap each for a short slot token, splice back after.
      const imgTags = original.match(IMG_RE) || [];
      const working = imgTags.reduce(
        (acc, tag, i) => acc.replace(tag, '[IMG-SLOT-' + (i + 1) + ']'),
        original
      );
      let attempts = 0;
      let lastProblems = [];
      let ok = false;
      let content = original;
      const schema = {
        type: 'object',
        properties: { content: { type: 'string' } },
        required: ['content'],
      };
      const preferChunks = working.length > 5500;
      for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
        attempts = attempt;
        const feedback = attempt > 1 ? lastProblems : null;
        let chunkMode = preferChunks;
        if (attempt === 2) chunkMode = !preferChunks;
        let raw = '';
        if (chunkMode) {
          const sections = chunkBlocks(splitTopLevelBlocks(working), 3200);
          const parts = [];
          for (let ci = 0; ci < sections.length; ci++) {
            const res = await base44.integrations.Core.InvokeLLM({
              prompt: buildChunkPrompt(lesson.title, slide.title, page, slides.length, ci + 1, sections.length, sections[ci], feedback),
              response_json_schema: schema,
            });
            parts.push(res && res.content ? res.content : '');
          }
          raw = parts.join('\n');
        } else {
          const res = await base44.integrations.Core.InvokeLLM({
            prompt: buildPrompt(lesson.title, slide.title, page, slides.length, working, feedback),
            response_json_schema: schema,
          });
          raw = res && res.content ? res.content : '';
        }
        // splice the protected image tags back, then enforce byte-exact imgs
        let candidate = raw;
        imgTags.forEach((tag, i) => {
          candidate = candidate.replace('[IMG-SLOT-' + (i + 1) + ']', tag);
        });
        candidate = enforceOriginalImgs(original, candidate);
        lastProblems = validate(original, candidate);
        if (!lastProblems.length && candidate) {
          content = candidate;
          ok = true;
        }
      }
      if (ok) {
        slides[page - 1] = { ...slide, content };
      }
      report.push({ page, ok, attempts, problems: ok ? [] : lastProblems });
      page++;
    }

    const processed = page - fromPage;
    if (processed > 0) {
      await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
    }
    return Response.json({
      lesson: lesson.title,
      order,
      pages_processed: processed,
      next_page: page <= slides.length ? page : null,
      elapsed_s: Math.round((Date.now() - started) / 1000),
      report,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}