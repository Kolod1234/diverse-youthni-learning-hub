// AS 3 diagram 5: the Haber process flow diagram.
const H = require('./common.cjs');
const {
  C, makeCanvas, title, save, textCentered, textLeft, setFont,
  arrow, roundRect, panelBox, chip, lead, dashedLine, atom,
} = H;

function flowBox(ctx, x, y, w, h, heading, sub, fill, stroke) {
  panelBox(ctx, x, y, w, h, fill || C.panel, stroke || C.panelBorder);
  textCentered(ctx, heading, x + w / 2, y + h / 2 - (sub ? 15 : 0), w - 24, sub ? 23 : 24, '700');
  if (sub) textCentered(ctx, sub, x + w / 2, y + h / 2 + 18, w - 24, 19, '400', C.sub);
}

function renderHaber() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'The Haber process: nitrogen and hydrogen into ammonia',
    'A compromise between rate, yield and cost, running continuously and recycling everything it can');

  // feedstock boxes
  flowBox(ctx, 80, 190, 330, 120, 'Nitrogen from the air', 'separated by fractional distillation', C.accent2Soft, '#bae6fd');
  flowBox(ctx, 80, 400, 330, 120, 'Hydrogen from natural gas', 'methane reacted with steam', C.accent2Soft, '#bae6fd');

  // merge arrows to compressor
  arrow(ctx, 410, 250, 500, 320, 5, C.ink);
  arrow(ctx, 410, 460, 500, 326, 5, C.ink);
  flowBox(ctx, 500, 270, 240, 110, 'Compressor', 'about 200 atmospheres', C.warnSoft, '#fecaca');
  textCentered(ctx, 'high pressure favours ammonia (2 molecules made from 4)', 620, 410, 340, 18, '600', C.sub);

  // converter
  arrow(ctx, 740, 325, 800, 325, 5, C.ink);
  flowBox(ctx, 800, 240, 300, 170, 'Converter', 'iron catalyst beds, about 450 °C', C.okSoft, '#bbf7d0');
  textCentered(ctx, 'unreacted gases pass over several catalyst beds', 950, 440, 320, 18, '600', C.sub);

  // condenser
  arrow(ctx, 1100, 325, 1160, 325, 5, C.ink);
  flowBox(ctx, 1160, 270, 240, 110, 'Condenser', 'cooled until ammonia liquefies', '#dbeafe', '#93c5fd');

  // product
  arrow(ctx, 1400, 325, 1460, 325, 5, C.ink);
  ctx.fillStyle = '#c084fc';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, 1430, 300, 100, 90, 12);
  ctx.fill();
  ctx.stroke();
  textCentered(ctx, 'NH3', 1480, 345, 80, 24, '700', '#3b0764');
  textCentered(ctx, 'liquid ammonia', 1480, 420, 180, 20, '700', C.ink);

  // recycle loop
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(1280, 380);
  ctx.lineTo(1280, 560);
  ctx.lineTo(620, 560);
  ctx.lineTo(620, 380);
  ctx.stroke();
  ctx.setLineDash([]);
  arrow(ctx, 620, 400, 620, 376, 5, C.accent);
  textCentered(ctx, 'unreacted nitrogen and hydrogen are recycled — nothing is wasted', 950, 596, 700, 20, '700', C.accent);

  // compromise conditions band
  panelBox(ctx, 100, 660, 1400, 170, C.amberSoft, '#fde68a');
  textCentered(ctx, 'The engineer’s compromise', 800, 694, 800, 24, '700', '#92400e');
  const cols = [
    ['Pressure: about 200 atm',
      'Higher pressure would raise the yield further, but stronger',
      'vessels and pumps cost more and are more dangerous.'],
    ['Temperature: about 450 °C',
      'Cooler would give a better yield (forward is exothermic) but',
      'far too slowly; hotter converts less of the gas stream.'],
    ['Iron catalyst',
      'Speeds both directions equally, letting the plant run at a',
      'temperature that balances yield against rate.'],
  ];
  cols.forEach(function (c, i) {
    const x = 130 + i * 465;
    textLeft(ctx, c[0], x, 726, 430, 21, '700', '#92400e');
    textLeft(ctx, c[1], x, 758, 430, 17, '400', '#78350f');
    textLeft(ctx, c[2], x, 786, 430, 17, '400', '#78350f');
  });

  chip(ctx, 'Only about 15 % of each pass converts — recycling is what makes the process profitable',
    w / 2, 880, 1200, C.panel, C.ink, 21);
  save('as3-haber.png', canvas);
}

module.exports = { renderHaber };