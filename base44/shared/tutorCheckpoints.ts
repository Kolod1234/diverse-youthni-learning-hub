// Shared tutor-checkpoint splice helpers used by checkpoint-insertion backend
// functions. The checkpoint markup must stay byte-compatible with
// src/components/lesson/tutorCheckpoint.js and the .tutor-checkpoint CSS:
// interactivity lives in the reader, this module only builds and validates HTML.

// The lesson players decode entities in some paths, so the checkpoint markup
// must avoid quote and ampersand characters entirely instead of entity-encoding them.
export function escText(s) {
  return String(s)
    .replace(/[\u2014\u2013]/g, ' to ')
    .replace(/"/g, "'")
    .replace(/&(?!\w+;)/g, 'and')
    .replace(/</g, '(')
    .replace(/>/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripTags(html) {
  return String(html)
    .replace(/<img[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCheckpointHTML(cp) {
  const keys = ['A', 'B', 'C', 'D', 'E'];
  const options = cp.options
    .map(
      (o, i) =>
        `<button type="button" class="tutor-checkpoint-option" data-correct="${o.correct ? 1 : 0}" data-feedback="${escText(o.feedback)}"><span class="tutor-checkpoint-key">${keys[i] || String(i + 1)}</span><span>${escText(o.text)}</span></button>`
    )
    .join('');
  return (
    '<div class="tutor-checkpoint">' +
    '<div class="tutor-checkpoint-label">Tutor check-in</div>' +
    '<div class="tutor-checkpoint-bubble">' +
    `<p class="tutor-checkpoint-question">${escText(cp.question)}</p>` +
    `<div class="tutor-checkpoint-options">${options}</div>` +
    '</div>' +
    '<div class="tutor-checkpoint-feedback" hidden></div>' +
    '</div>'
  );
}

export function validateCheckpoint(cp, blockCount) {
  if (!cp || typeof cp.after !== 'number' || !Number.isInteger(cp.after) || cp.after < 1 || cp.after > blockCount) {
    return 'the after block number must be between 1 and ' + blockCount;
  }
  if (typeof cp.question !== 'string' || !cp.question.includes('?') || cp.question.length > 180) {
    return 'the question must contain a question mark and stay under 180 characters';
  }
  const opts = Array.isArray(cp.options) ? cp.options : [];
  if (opts.length < 3 || opts.length > 5) return 'there must be between 3 and 5 options';
  if (opts.filter((o) => o && o.correct === true).length !== 1) return 'exactly one option must be correct';
  for (const o of opts) {
    if (typeof o.text !== 'string' || !o.text.trim() || o.text.length > 160) return 'every option needs text under 160 characters';
    if (typeof o.feedback !== 'string' || o.feedback.trim().length < 20 || o.feedback.length > 360) return 'every option needs feedback between 20 and 360 characters';
    if (/[\u2014\u2013"]/.test(o.text) || /[\u2014\u2013"]/.test(o.feedback) || /[\u2014\u2013"]/.test(cp.question)) return 'no dashes or double quotes are allowed';
  }
  return null;
}

// Insert validated checkpoints into a page at exact top-level block boundaries.
// offsets are spliced from the end backwards so earlier offsets stay valid.
export function spliceCheckpoints(content, ranges, accepted) {
  let next = content;
  const sorted = accepted.slice().sort((a, b) => b.after - a.after);
  for (const cp of sorted) {
    const pos = ranges[cp.after - 1].end;
    const html = buildCheckpointHTML(cp);
    next = next.slice(0, pos) + '\n' + html + '\n' + next.slice(pos);
  }
  return next;
}

export const checkpointsJsonSchema = {
  type: 'object',
  properties: {
    checkpoints: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          after: { type: 'integer' },
          question: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                correct: { type: 'boolean' },
                feedback: { type: 'string' },
              },
              required: ['text', 'correct', 'feedback'],
            },
          },
        },
        required: ['after', 'question', 'options'],
      },
    },
  },
  required: ['checkpoints'],
};