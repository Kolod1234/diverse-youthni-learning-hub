// AS 5 diagram 2 — the four families of engineering materials.
const { C, makeCanvas, title, save, panelBox, textLeft, paragraph } = require('./common.cjs');

const CLASSES = [
  {
    t: 'Metals', col: C.accent, soft: C.accentSoft,
    ex: 'steel · titanium · aluminium · gold',
    p: 'Strong and tough, malleable and ductile; conduct heat and electricity; shiny when polished.',
    j: 'Hip stems, bone plates, pins and surgical instruments.',
  },
  {
    t: 'Ceramics', col: C.ok, soft: C.okSoft,
    ex: 'alumina · zirconia · hydroxyapatite · glass',
    p: 'Very hard, outstanding wear resistance, brittle, electrical insulators, very high melting points.',
    j: 'Joint-replacement bearing surfaces, bone coatings, dental crowns.',
  },
  {
    t: 'Polymers', col: C.pink, soft: C.pinkSoft,
    ex: 'polyethylene · silicone · nylon · polyurethane',
    p: 'Light, flexible and elastic; cheap to shape into tubes, films and threads; low melting points.',
    j: 'Catheters, sutures, contact lenses, tubing, handles.',
  },
  {
    t: 'Composites', col: C.amber, soft: C.amberSoft,
    ex: 'carbon-fibre reinforced resin · glass-reinforced plastic',
    p: 'Two or more constituents combined: strong for their weight, with stiffness tailored to the load.',
    j: 'Prosthetic limbs, aircraft panels, sports equipment.',
  },
];

function render() {
  const W = 1500, H = 940;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The four families of materials', 'Almost every engineered substance belongs to one of these groups');

  const pw = 690, ph = 280, gap = 40;
  const x0 = (W - (pw * 2 + gap)) / 2;
  CLASSES.forEach((cl, i) => {
    const px = x0 + (i % 2) * (pw + gap);
    const py = 140 + Math.floor(i / 2) * (ph + 40);
    panelBox(ctx, px, py, pw, ph, '#ffffff', C.panelBorder, 16);
    textLeft(ctx, cl.t, px + 30, py + 44, pw - 60, 26, '700', cl.col);

    let y = py + 88;
    textLeft(ctx, 'Examples', px + 30, y, 140, 17, '700', cl.col);
    y = paragraph(ctx, cl.ex, px + 160, y, pw - 200, 24, 17, '400', C.ink, 'left');
    y += 10;
    textLeft(ctx, 'Properties', px + 30, y, 140, 17, '700', cl.col);
    y = paragraph(ctx, cl.p, px + 160, y, pw - 200, 24, 17, '400', C.ink, 'left');
    y += 10;
    textLeft(ctx, 'Typical jobs', px + 30, y, 140, 17, '700', cl.col);
    paragraph(ctx, cl.j, px + 160, y, pw - 200, 24, 17, '400', C.ink, 'left');
  });

  panelBox(ctx, 60, 760, W - 120, 130, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Remember M-P-C-C', W / 2, 796, W - 200, 21, '700', C.accent);
  paragraph(
    ctx,
    'Metals carry the load · Polymers flex and seal · Ceramics resist wear · Composites get tailored. Most engineered objects — including the human body after surgery — combine several families, each part matched to the job it must do.',
    W / 2, 836, W - 260, 25, 17, '400', C.sub, 'center',
  );
  save('as5-classes.png', canvas);
}

module.exports = { render };