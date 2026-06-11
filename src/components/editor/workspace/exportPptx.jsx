// exportPptx.js
// ----------------------------------------------------------------------------
// Convert the lesson builder's native block tree → a downloadable .pptx file
// using pptxgenjs (browser-side, no backend).
//
// We deliberately keep the mapping CONSERVATIVE:
//  • text-bearing blocks (headings, paragraphs, lists, quotes, callouts,
//    definitions, learning-objective, key-takeaway, knowledge-check, code,
//    math, scientific-equation, divider, spacer, legacy-html) collapse into
//    a single text frame per slide, in document order. This preserves
//    content and reading order without trying to recreate pixel-perfect
//    visual styling (which pptxgenjs can't fully replicate from HTML).
//  • images and image-text get their own image placement.
//  • tables become real pptx tables.
//  • two-columns flattens its children (left then right) into the text
//    frame so nothing is silently dropped.
//
// Each slide title from the lesson is added as a small overline at the top.
// ----------------------------------------------------------------------------

import { htmlToBlocks } from '@/components/editor/lessonBuilder/htmlSerializer';

// ── HTML → plain text helper ──────────────────────────────────────────────
// pptxgenjs takes plain strings or arrays of {text, options} runs. We strip
// tags but keep line breaks so paragraphs stay readable.
function htmlToPlain(html) {
  if (!html) return '';
  if (typeof document === 'undefined') {
    // Server-side fallback — naive strip.
    return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const div = document.createElement('div');
  div.innerHTML = String(html);
  // Replace <br> / block tags with newlines so the text reads naturally.
  div.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  div.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach((el) => {
    el.appendChild(document.createTextNode('\n'));
  });
  return (div.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Block → pptx text lines ───────────────────────────────────────────────
// Each line is a { text, options } run; pptxgenjs concatenates them with
// the bullet / line-break behaviour we configure per run.
function blockToTextLines(block) {
  const d = block?.data || {};
  switch (block.type) {
    case 'heading-1':
      return [{ text: d.text || '', options: { bold: true, fontSize: 32, breakLine: true } }];
    case 'heading-2':
      return [{ text: d.text || '', options: { bold: true, fontSize: 24, breakLine: true } }];
    case 'heading-3':
      return [{ text: d.text || '', options: { bold: true, fontSize: 18, breakLine: true } }];
    case 'paragraph':
      return [{ text: htmlToPlain(d.html), options: { fontSize: 14, breakLine: true } }];
    case 'bullet-list':
      return (d.items || []).map((it) => ({
        text: htmlToPlain(it),
        options: { bullet: true, fontSize: 14, breakLine: true },
      }));
    case 'numbered-list':
      return (d.items || []).map((it) => ({
        text: htmlToPlain(it),
        options: { bullet: { type: 'number' }, fontSize: 14, breakLine: true },
      }));
    case 'quote':
      return [
        { text: `“${htmlToPlain(d.html)}”`, options: { italic: true, fontSize: 16, breakLine: true } },
        ...(d.cite ? [{ text: `— ${d.cite}`, options: { italic: true, fontSize: 12, color: '666666', breakLine: true } }] : []),
      ];
    case 'callout':
      return [{ text: htmlToPlain(d.html), options: { fontSize: 14, color: '1A3C5A', breakLine: true } }];
    case 'definition':
      return [
        { text: d.term || '', options: { bold: true, fontSize: 16, breakLine: true } },
        { text: d.definition || '', options: { fontSize: 14, breakLine: true } },
      ];
    case 'learning-objective':
    case 'key-takeaway':
      return [{ text: htmlToPlain(d.html), options: { fontSize: 14, breakLine: true } }];
    case 'knowledge-check':
      return [
        { text: `Q: ${d.question || ''}`, options: { bold: true, fontSize: 14, breakLine: true } },
        ...(d.answer ? [{ text: `A: ${d.answer}`, options: { fontSize: 14, breakLine: true } }] : []),
      ];
    case 'code':
      return [{ text: d.code || '', options: { fontFace: 'Courier New', fontSize: 12, breakLine: true } }];
    case 'math':
      return [{ text: d.latex || '', options: { fontFace: 'Courier New', fontSize: 14, italic: true, breakLine: true } }];
    case 'scientific-equation':
      return [{ text: d.equation || '', options: { fontFace: 'Courier New', fontSize: 14, breakLine: true } }];
    case 'divider':
      return [{ text: '────────', options: { fontSize: 12, color: '999999', breakLine: true } }];
    case 'spacer':
      return [{ text: ' ', options: { fontSize: 8, breakLine: true } }];
    case 'legacy-html':
      return [{ text: htmlToPlain(d.html), options: { fontSize: 14, breakLine: true } }];
    default:
      return [];
  }
}

// Flatten two-columns / image-text nested children into the same text frame.
function flattenBlocks(blocks) {
  const out = [];
  for (const b of blocks || []) {
    if (b.type === 'two-columns') {
      const d = b.data || {};
      out.push(...flattenBlocks(d.leftBlocks || []));
      out.push(...flattenBlocks(d.middleBlocks || []));
      out.push(...flattenBlocks(d.rightBlocks || []));
    } else {
      out.push(b);
    }
  }
  return out;
}

// ── Build a single pptxgenjs slide from one editor slide ──────────────────
function buildSlide(pptx, slide, index) {
  const pptxSlide = pptx.addSlide();
  const blocks = flattenBlocks(htmlToBlocks(slide.content || ''));

  // Slide title overline (top of slide).
  if (slide.title) {
    pptxSlide.addText(slide.title, {
      x: 0.4, y: 0.25, w: 9.2, h: 0.4,
      fontSize: 11, color: '6B7280', bold: true,
    });
  }

  // Track the next free vertical position for non-text blocks (images / tables)
  // and the text run we accumulate alongside them.
  const textRuns = [];
  let nextY = 0.8;
  const SLIDE_W = 10;
  const SLIDE_H = 5.625; // 16:9 at 10in wide
  const CONTENT_LEFT = 0.4;
  const CONTENT_W = SLIDE_W - 0.8;

  for (const b of blocks) {
    if (b.type === 'image' || b.type === 'image-text') {
      const url = b.data?.url;
      if (url && /^https?:\/\//i.test(url)) {
        try {
          pptxSlide.addImage({
            path: url,
            x: CONTENT_LEFT,
            y: nextY,
            w: CONTENT_W,
            h: 2.6,
            sizing: { type: 'contain', w: CONTENT_W, h: 2.6 },
          });
          nextY += 2.7;
        } catch {
          // pptxgenjs throws if URL is unreadable — skip silently.
        }
      }
      if (b.type === 'image-text') {
        textRuns.push(...blockToTextLines({ type: 'paragraph', data: { html: b.data?.html || '' } }));
      }
      if (b.data?.caption) {
        textRuns.push({ text: b.data.caption, options: { fontSize: 11, italic: true, color: '666666', breakLine: true } });
      }
    } else if (b.type === 'table') {
      const rows = (b.data?.rows || []).map((row) =>
        row.map((cell) => ({
          text: htmlToPlain(typeof cell === 'string' ? cell : cell?.content || ''),
          options: { fontSize: 12, valign: 'middle' },
        }))
      );
      if (rows.length > 0) {
        pptxSlide.addTable(rows, {
          x: CONTENT_LEFT,
          y: nextY,
          w: CONTENT_W,
          border: { type: 'solid', color: 'CCCCCC', pt: 1 },
          fontSize: 12,
        });
        nextY += Math.min(rows.length * 0.4 + 0.2, 3);
      }
    } else {
      textRuns.push(...blockToTextLines(b));
    }
  }

  if (textRuns.length > 0) {
    pptxSlide.addText(textRuns, {
      x: CONTENT_LEFT,
      y: nextY,
      w: CONTENT_W,
      h: Math.max(0.6, SLIDE_H - nextY - 0.3),
      valign: 'top',
      paraSpaceAfter: 6,
    });
  }
}

// ── Public entry point ────────────────────────────────────────────────────
// Dynamic import keeps pptxgenjs (~1 MB) out of the initial bundle.
export async function exportSlidesToPptx(slides, filename = 'lesson.pptx') {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  pptx.defineLayout({ name: 'EDU_16_9', width: 10, height: 5.625 });
  pptx.layout = 'EDU_16_9';

  for (let i = 0; i < (slides || []).length; i++) {
    buildSlide(pptx, slides[i], i);
  }

  const safeName = filename.endsWith('.pptx') ? filename : `${filename}.pptx`;
  await pptx.writeFile({ fileName: safeName });
}