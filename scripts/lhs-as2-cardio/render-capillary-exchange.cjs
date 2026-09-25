/* Canvas render for "The Cardiovascular System" (LHS AS 2): capillary
 * exchange schematic — water forced out at the arteriolar end by hydrostatic
 * pressure, drawn back in at the venular end by the oncotic pull of plasma
 * proteins. Self-contained; writes one PNG to public/lesson-assets/lhs-as2.
 */
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function main() {
  const W = 1600, H = 820;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const INK = '#0f172a', GREY = '#64748b', BLUE = '#2563eb', ORANGE = '#ea580c', GREEN = '#16a34a', RED = '#dc2626';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const text = (t, x, y, font, color, align) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left';
    ctx.fillText(t, x, y); ctx.textAlign = 'left';
  };
  const arrow = (x, y1, y2, color, width) => {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2 - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 11, y2 - 20); ctx.lineTo(x + 11, y2 - 20); ctx.closePath(); ctx.fill();
  };
  const roundedRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  text('How tissue fluid forms at a capillary', 80, 74, 'bold 40px sans-serif', INK);
  text('Water is forced out where blood pressure is highest; it returns where plasma proteins pull hardest', 80, 116, '27px sans-serif', '#475569');

  // Tissue space
  ctx.fillStyle = '#f0fdf4';
  ctx.fillRect(80, 190, 1440, 470);

  // Legend (top right)
  ctx.fillStyle = GREEN;
  ctx.beginPath(); ctx.arc(1210, 150, 11, 0, Math.PI * 2); ctx.fill();
  text('plasma protein', 1230, 158, '25px sans-serif', INK);
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.ellipse(1430, 150, 24, 13, 0, 0, Math.PI * 2); ctx.fill();
  text('red blood cell', 1462, 158, '25px sans-serif', INK);

  // Capillary tube
  const tubeX = 150, tubeY = 440, tubeW = 1300, tubeH = 130;
  ctx.fillStyle = '#fecdd3';
  ctx.fillRect(tubeX, tubeY, tubeW, tubeH);

  // Endothelium: top wall drawn as alternating segments (pores), bottom wall solid
  ctx.strokeStyle = GREY; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(tubeX, tubeY + tubeH); ctx.lineTo(tubeX + tubeW, tubeY + tubeH); ctx.stroke();
  let fx = tubeX;
  while (fx < tubeX + tubeW) {
    const segEnd = Math.min(fx + 26, tubeX + tubeW);
    ctx.beginPath(); ctx.moveTo(fx, tubeY); ctx.lineTo(segEnd, tubeY); ctx.stroke();
    fx += 52;
  }

  // Formed elements inside
  ctx.fillStyle = RED;
  [190, 320, 450, 580, 710, 840, 970, 1100, 1230, 1340].forEach(x => {
    ctx.beginPath(); ctx.ellipse(x, tubeY + 72, 26, 14, 0, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = GREEN;
  [240, 420, 600, 780, 960, 1140, 1320].forEach(x => {
    ctx.beginPath(); ctx.arc(x, tubeY + 38, 11, 0, Math.PI * 2); ctx.fill();
  });

  // Arterial-end arrows (up, out of capillary) + labels
  [250, 350, 450].forEach(x => arrow(x, tubeY - 8, 290, BLUE, 7));
  text('Water and small solutes', 170, 232, 'bold 27px sans-serif', BLUE);
  text('forced out (high blood pressure)', 170, 268, '25px sans-serif', BLUE);

  // Venular-end arrows (down, back into capillary) + labels
  [1150, 1250, 1350].forEach(x => arrow(x, 290, tubeY + 70, ORANGE, 7));
  text('Water drawn back in', 1150, 232, 'bold 27px sans-serif', ORANGE, 'right');
  text('(oncotic pull of plasma proteins)', 1150, 268, '25px sans-serif', ORANGE, 'right');

  // End labels
  text('Arteriolar end', tubeX, tubeY + tubeH + 46, 'bold 27px sans-serif', INK);
  text('(blood pressure high)', tubeX, tubeY + tubeH + 78, '25px sans-serif', '#475569');
  text('Venular end', tubeX + tubeW, tubeY + tubeH + 46, 'bold 27px sans-serif', INK, 'right');
  text('(blood pressure low)', tubeX + tubeW, tubeY + tubeH + 78, '25px sans-serif', '#475569', 'right');

  // Body cells bathed in tissue fluid
  [520, 730, 940].forEach(x => {
    ctx.fillStyle = '#86efac'; ctx.strokeStyle = '#15803d'; ctx.lineWidth = 4;
    roundedRect(x, 588, 150, 84, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.ellipse(x + 75, 630, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
  });
  text('Body cells bathed in tissue fluid', 800, 706, '25px sans-serif', INK, 'center');

  // Lymph note
  text('The small surplus of tissue fluid drains into lymph vessels, which return it to the blood.', 800, 752, 'italic 24px sans-serif', '#334155', 'center');

  const out = path.resolve('public/lesson-assets/lhs-as2/cardio-capillary-exchange.png');
  fs.writeFileSync(out, canvas.toBuffer('image/png', { compressionLevel: 9 }));
  return out;
}

main();
module.exports = { main };