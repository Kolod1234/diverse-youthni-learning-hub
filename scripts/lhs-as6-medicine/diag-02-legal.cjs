// AS 6 diagram 2 — the four UK legal supply categories as a rising staircase.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, textLeft } = require('./common.cjs');

const STEPS = [
  {
    name: 'GSL', full: 'General Sales List', col: C.ok, fill: C.okSoft,
    where: 'General retail — supermarkets, shops, petrol stations',
    rule: 'No pharmacist needed; small pack sizes (e.g. 16 paracetamol); lockable premises',
  },
  {
    name: 'P', full: 'Pharmacy medicine', col: C.accent2, fill: C.accent2Soft,
    where: 'Registered pharmacy only',
    rule: 'Sold under the personal supervision of a pharmacist; no prescription (e.g. 32-pack paracetamol, co-codamol)',
  },
  {
    name: 'POM', full: 'Prescription-only medicine', col: C.amber, fill: C.amberSoft,
    where: 'Dispensed by a pharmacy against a valid prescription',
    rule: 'Serious side effects, narrow therapeutic index or monitoring needed (e.g. antibiotics, antihypertensives)',
  },
  {
    name: 'CD', full: 'Controlled drug', col: C.warn, fill: C.warnSoft,
    where: 'Strictest POM group under the Misuse of Drugs Regulations',
    rule: 'Addiction/abuse risk — locked CD safe, CD register, destruction records (e.g. morphine, fentanyl)',
  },
];

function render() {
  const W = 1500, H = 960;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The four legal supply categories', 'Where a medicine may be sold — and who must supervise it');

  const bw = 330, bh = 560, gap = 18;
  const x0 = (W - (bw * 4 + gap * 3)) / 2;
  const y0 = 300;
  STEPS.forEach((s, i) => {
    const x = x0 + i * (bw + gap);
    const lift = 60 * i; // staircase: each step higher
    const y = y0 - lift + 60 * 0; // baseline varies
    const top = y0 + 120 - lift;
    panelBox(ctx, x, top, bw, bh - (y0 - top) + 180, s.fill, s.col, 16);
    textCentered(ctx, s.name, x + bw / 2, top + 46, bw - 40, 34, '700', s.col);
    textCentered(ctx, s.full, x + bw / 2, top + 84, bw - 40, 19, '600', C.ink);
    paragraph(ctx, s.where, x + bw / 2, top + 136, bw - 52, 25, 17, '600', C.ink, 'center');
    dashedRule(ctx, x + bw / 2, top + 210, bw - 52);
    paragraph(ctx, s.rule, x + bw / 2, top + 260, bw - 52, 25, 17, '400', C.sub, 'center');
  });

  // Increasing-restriction arrow along the bottom-left.
  arrow(ctx, x0 - 60, y0 + 400, x0 - 60, y0 + 60, 4, C.sub);
  ctx.save();
  ctx.translate(x0 - 100, (y0 + 230) / 2 + y0 - 115);
  ctx.rotate(-Math.PI / 2);
  textCentered(ctx, 'increasing risk, restriction and supervision', 0, 0, 520, 20, '600', C.sub);
  ctx.restore();

  // Bottom note.
  panelBox(ctx, 70, 850, W - 140, 80, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'All four categories are legal supply classes — separate from routes of administration (oral, topical, intravenous), which describe how a medicine enters the body.', W / 2, 890, W - 240, 18, '400', C.sub);

  save('as6-legal.png', canvas);
}

function dashedRule(ctx, x, y, w) {
  ctx.strokeStyle = C.panelBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();
}

module.exports = { render };