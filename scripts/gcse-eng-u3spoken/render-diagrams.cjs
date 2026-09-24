// Re-renders u3-spoken-01-speech-vs-writing.png for GCSE English Language
// Unit 3 Section A (Studying Spoken Language, page 2).
// Fixes the label-overlap defect in the previous render: row aspect labels now
// sit inside their own reserved left column instead of floating over cells.
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');

registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', { family: 'DV' });
registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', { family: 'DV', weight: 'bold' });

const OUT = 'public/lesson-assets/gcse-english/u3-spoken-01-speech-vs-writing.png';

const C = {
  ink: '#0f172a', grey: '#64748b', soft: '#94a3b8',
  indigo: '#4f46e5', indigoDark: '#3730a3',
  header: '#6366f1', headerText: '#ffffff',
  labelBg: '#eef2ff', labelText: '#4338ca',
  speechBg: '#f8fafc', writingBg: '#f8fafc',
  rowLine: '#e2e8f0', paper: '#ffffff'
};

const W = 1400;
const M = 70;              // outer margin
const LABEL_W = 300;       // reserved aspect-label column
const GAP = 8;             // gutter between columns
const COL_W = (W - M * 2 - LABEL_W - GAP * 2) / 2;
const TITLE_H = 130;
const HEAD_H = 86;

const ROWS = [
  {
    label: 'Planning',
    speech: 'Composed in real time, while the previous words are still leaving the mouth. There is no delete key.',
    writing: 'Drafted, revised and improved in private before anyone else sees it.'
  },
  {
    label: 'Permanence',
    speech: 'Vanishes the moment it is spoken, so speakers repeat key points and keep checking understanding.',
    writing: 'Stays on the page; the reader can always loop back and re-read.'
  },
  {
    label: 'Audience',
    speech: 'A listener is physically present, reacting live to every utterance.',
    writing: 'Read at a distance. The writer must imagine the reader.'
  },
  {
    label: 'Feedback',
    speech: 'Instant: a frown, a nod, a question. Speakers adjust mid-flow.',
    writing: 'None while writing. Any response arrives long after the words are fixed.'
  },
  {
    label: 'Structure',
    speech: 'Fillers, false starts and self-correction are normal adaptations to live composition.',
    writing: 'Packs more structure into fewer words, because marks on a page do all the work.'
  }
];

function wrap(ctx, str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function cellText(ctx, str, cx, cy, maxW, opts = {}) {
  ctx.font = `${opts.bold ? 'bold ' : ''}${opts.size || 26}px DV`;
  ctx.fillStyle = opts.color || C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrap(ctx, str, maxW);
  const lh = (opts.size || 26) * 1.35;
  const y0 = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, y0 + i * lh));
  return lines.length * lh;
}

const canvas = createCanvas(W, 200); // height corrected below
const ctx = canvas.getContext('2d');

// Measure row heights first, then size the canvas.
ctx.font = '26px DV';
const rowHs = ROWS.map(r => {
  const s = wrap(ctx, r.speech, COL_W - 56).length;
  const w = wrap(ctx, r.writing, COL_W - 56).length;
  const lines = Math.max(s, w);
  return Math.max(96, lines * 35 + 44);
});
const H = TITLE_H + HEAD_H + rowHs.reduce((a, b) => a + b, 0) + M + 6;

const c2 = createCanvas(W, H);
const x = c2.getContext('2d');
x.fillStyle = C.paper;
x.fillRect(0, 0, W, H);
x.lineJoin = 'round';

// Title band
x.fillStyle = C.header;
x.fillRect(0, 0, W, TITLE_H);
x.font = 'bold 40px DV';
x.fillStyle = C.headerText;
x.textAlign = 'center';
x.textBaseline = 'middle';
x.fillText('Two channels: speech and writing', W / 2, 52);
x.font = '25px DV';
x.fillStyle = 'rgba(255,255,255,0.92)';
x.fillText('Why spontaneous speech has its own features', W / 2, 98);

// Header row
const headY = TITLE_H;
x.fillStyle = C.labelBg;
x.fillRect(M, headY, LABEL_W, HEAD_H);
x.fillStyle = C.header;
x.fillRect(M + LABEL_W + GAP, headY, COL_W, HEAD_H);
x.fillRect(M + LABEL_W + GAP + COL_W + GAP, headY, COL_W, HEAD_H);
x.font = 'bold 30px DV';
x.fillStyle = C.headerText;
x.fillText('SPEECH', M + LABEL_W + GAP + COL_W / 2, headY + HEAD_H / 2 + 2);
x.fillText('WRITING', M + LABEL_W + GAP + COL_W + GAP + COL_W / 2, headY + HEAD_H / 2 + 2);
x.font = 'bold 24px DV';
x.fillStyle = C.labelText;
x.fillText('Aspect', M + LABEL_W / 2, headY + HEAD_H / 2 + 2);

// Rows: labels strictly inside the reserved column
let y = headY + HEAD_H;
ROWS.forEach((r, i) {
  const h = rowHs[i];
  const cy = y + h / 2;
  const labelX = M + LABEL_W / 2;
  const speechX = M + LABEL_W + GAP + COL_W / 2;
  const writingX = M + LABEL_W + GAP + COL_W + GAP + COL_W / 2;

  // cell backgrounds
  x.fillStyle = i % 2 === 0 ? C.speechBg : '#f1f5f9';
  x.fillRect(M, y, LABEL_W, h);
  x.fillRect(M + LABEL_W + GAP, y, COL_W, h);
  x.fillRect(M + LABEL_W + GAP + COL_W + GAP, y, COL_W, h);

  // row separators
  x.strokeStyle = C.rowLine;
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(M, y + h);
  x.lineTo(W - M, y + h);
  x.stroke();

  // aspect label — inside its column, cannot overlap cells
  x.font = 'bold 29px DV';
  x.fillStyle = C.labelText;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(r.label, labelX, cy);

  cellText(x, r.speech, speechX, cy, COL_W - 56, { size: 26 });
  cellText(x, r.writing, writingX, cy, COL_W - 56, { size: 26 });
  y += h;
});

// outer frame
x.strokeStyle = C.soft;
x.lineWidth = 3;
x.strokeRect(M, headY, W - M * 2, y - headY);

fs.writeFileSync(OUT, c2.toBuffer('image/png'));

// Edge audit: no ink touching the canvas border
const px = c2.getContext('2d').getImageData(0, 0, W, H).data;
let edgeHit = 0;
for (let i = 0; i < W; i++) {
  for (const row of [0, H - 1]) {
    const o = (row * W + i) * 4;
    if (px[o] < 250 || px[o + 1] < 250 || px[o + 2] < 250) edgeHit++;
  }
}
for (let j = 0; j < H; j++) {
  for (const col of [0, W - 1]) {
    const o = (j * W + col) * 4;
    if (px[o] < 250 || px[o + 1] < 250 || px[o + 2] < 250) edgeHit++;
  }
}

console.log(JSON.stringify({ out: OUT, w: W, h: H, edgeHit }));