// AS 6 diagram 5 — the four clinical trial phases as a widening pyramid.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, textLeft } = require('./common.cjs');

const PHASES = [
  {
    t: 'Phase I — Safety', who: '20–100 HEALTHY VOLUNTEERS', col: C.accent,
    d: 'Is it safe, and at what dose? Establishes safe dosage ranges, identifies common side effects and measures pharmacokinetics — how the body absorbs, distributes, metabolises and excretes the drug.',
  },
  {
    t: 'Phase II — Efficacy', who: '100–300 PATIENTS WITH THE CONDITION', col: C.accent2,
    d: 'Does it actually work? Tests efficacy — real therapeutic effect in the patients the medicine is intended for — while monitoring short-term side effects continues.',
  },
  {
    t: 'Phase III — Comparison', who: '1,000–3,000+ PATIENTS', col: C.ok,
    d: 'Does it work at scale, and better than what we already have? Confirms effectiveness across a diverse population, monitors less common adverse reactions and compares the new medicine against the standard treatment or a placebo.',
  },
  {
    t: 'Phase IV — Surveillance', who: 'THE GENERAL PUBLIC, AFTER LICENSING', col: C.amber,
    d: 'What do we learn from millions of users? Post-marketing surveillance detects rare or long-term side effects that shorter, smaller trials could never reveal. Reports feed systems such as the Yellow Card Scheme.',
  },
];

function render() {
  const W = 1500, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Testing in humans: the four clinical phases', 'Each phase answers a different question before the medicine can progress');

  const y0 = 150;
  const bh = 178;
  PHASES.forEach((p, i) => {
    const inset = 70 + i * 120;
    const w = W - 140 - inset * 2;
    const x = (W - w) / 2;
    const y = y0 + i * (bh + 18);
    panelBox(ctx, x, y, w, bh, '#ffffff', p.col, 14);
    textCentered(ctx, p.t, x + w / 2, y + 34, w - 60, 24, '700', p.col);
    textCentered(ctx, p.who, x + w / 2, y + 64, w - 60, 16, '700', C.ink);
    paragraph(ctx, p.d, x + w / 2, y + 106, w - 100, 23, 16, '400', C.sub, 'center');
  });

  // Memory aid band.
  panelBox(ctx, 70, 910, W - 140, 50, C.accentSoft, C.accent, 14);
  textCentered(ctx, 'Safe → Effective → Compare → Protect: Phase I checks SAFETY, II EFFICACY, III COMPARISON, IV PROTECTS the public after licensing.', W / 2, 935, W - 220, 18, '600', C.ink);

  save('as6-phases.png', canvas);
}

module.exports = { render };