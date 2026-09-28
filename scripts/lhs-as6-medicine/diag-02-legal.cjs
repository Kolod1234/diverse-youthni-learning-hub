// AS 6 diagram 2 — the four UK legal supply categories as a rising staircase.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow } = require('./common.cjs');

const STEPS = [
  {
    name: 'GSL', full: 'General Sales List', col: C.ok, fill: C.okSoft,
    where: 'General retail — supermarkets, shops, petrol stations',
    rule: 'No pharmacist needed; small pack sizes only (e.g. a 16-tablet pack of paracetamol); premises must be lockable',
  },
  {
    name: 'P', full: 'Pharmacy medicine', col: C.accent2, fill: C.accent2Soft,
    where: 'Registered pharmacy only',
    rule: 'Sold under the personal supervision of a pharmacist — no prescription needed (e.g. a 32-tablet pack of paracetamol, co-codamol)',
  },
  {
    name: 'POM', full: 'Prescription-only medicine', col: C.amber, fill: C.amberSoft,
    where: 'Dispensed by a pharmacy against a valid prescription',
    rule: 'Serious side effects, narrow therapeutic index or medical monitoring (e.g. antibiotics, antihypertensives)',
  },
  {
    name: 'CD', full: 'Controlled drug', col: C.warn, fill: C.warnSoft,
    where: 'The strictest group within POM — Misuse of Drugs Regulations',
    rule: 'Addiction and abuse risk: locked CD safe, CD register, strict destruction records (e.g. morphine, fentanyl)',
  },
];

function render() {
  const W = 1500, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The four legal supply categories', 'Where a medicine may be sold — and who must supervise it');

  const bw = 330, gap = 18;
  const x0 = (W - (bw * 4 + gap * 3)) / 2;
  const baseY = 800; // bottom edge of every step
  const heights = [420, 470, 520, 570];
  STEPS.forEach((s, i) => {
    const x = x0 + i * (bw + gap);
    const h = heights[i];
    const top = baseY - h;
    panelBox(ctx, x, top, bw, h, s.fill, s.col, 16);
    textCentered(ctx, s.name, x + bw / 2, top + 46, bw - 40, 34, '700', s.col);
    textCentered(ctx, s.full, x + bw / 2, top + 84, bw - 40, 19, '600', C.ink);
    paragraph(ctx, s.where, x + bw / 2, top + 130, bw - 52, 25, 17, '600', C.ink, 'center');
    // separator
    ctx.strokeStyle = C.panelBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 30, top + 176);
    ctx.lineTo(x + bw - 30, top + 176);
    ctx.stroke();
    paragraph(ctx, s.rule, x + bw / 2, top + 210, bw - 52, 25, 17, '400', C.sub, 'center');
  });

  // Increasing-restriction arrow on the left.
  arrow(ctx, x0 - 50, baseY, x0 - 50, 240, 4, C.sub);
  ctx.save();
  ctx.translate(x0 - 92, 520);
  ctx.rotate(-Math.PI / 2);
  textCentered(ctx, 'increasing risk, restriction and supervision', 0, 0, 520, 19, '600', C.sub);
  ctx.restore();

  // Bottom note.
  panelBox(ctx, 70, 830, W - 140, 90, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'All four are legal supply classes — separate from routes of administration (oral, topical, intravenous), which describe how a medicine enters the body.', W / 2, 862, W - 240, 18, '600', C.ink);
  textCentered(ctx, 'Legal categories exist to match the supervision a medicine needs to the place it is sold.', W / 2, 896, W - 240, 16, '400', C.sub);

  save('as6-legal.png', canvas);
}

module.exports = { render };