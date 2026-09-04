/* Longitudinal section through the mammalian kidney.
 * PLACEHOLDER: a clean drawn schematic, in use until licensed or public-domain
 * anatomical artwork is dropped in at this asset path. */

module.exports = function drawKidney(K) {
  const { Diagram, TEAL, BLUE, INDIGO, AMBER, RED, SLATE } = K;
  const d = new Diagram(760, 456);
  d.title('Longitudinal section through the kidney', { size: 15 });

  const cx = 268, cy = 226;            // centre of the organ
  const px = cx + 74, py = cy;         // renal pelvis sits at the hilum

  // ---- outline: rounded laterally, notched at the hilum -------------------
  const bean = [
    [cx +  10, cy + 146], [cx +  78, cy + 124], [cx + 112, cy +  66],
    [cx +  74, cy +  30], [cx +  66, cy +   0], [cx +  74, cy -  30],
    [cx + 112, cy -  66], [cx +  78, cy - 124], [cx +  10, cy - 146],
    [cx -  66, cy - 132], [cx - 118, cy -  72], [cx - 132, cy +   0],
    [cx - 118, cy +  72], [cx -  66, cy + 132],
  ];
  d.blob(bean.map(p => [cx + (p[0]-cx)*1.05, cy + (p[1]-cy)*1.05]),
         { fill: '#cbd5e1', stroke: null });                    // capsule
  d.blob(bean, { fill: '#a7f3d0', stroke: '#0f766e', lw: 2.0 }); // cortex
  d.blob(bean.map(p => [cx + (p[0]-cx)*0.80, cy + (p[1]-cy)*0.80]),
         { fill: '#fef3c7', stroke: '#b45309', lw: 1.2 });       // medulla

  // ---- pyramids fanned around the pelvis, bases out to the cortex ---------
  const angles = [118, 149, 180, 211, 242].map(a => a * Math.PI / 180);
  const apexR = 46, baseR = 168, halfBase = 30;
  const papilla = [];
  for (const t of angles) {
    const ux = Math.cos(t), uy = Math.sin(t), nx = -uy, ny = ux;
    const ax = px + apexR*ux, ay = py + apexR*uy;
    const bx = px + baseR*ux, by = py + baseR*uy;
    d.poly([[bx + nx*halfBase, by + ny*halfBase],
            [bx - nx*halfBase, by - ny*halfBase], [ax, ay]],
           { fill: '#fcd34d', stroke: '#b45309', lw: 1.3 });
    papilla.push([ax, ay, ux, uy, nx, ny]);
  }
  // minor calyces cupping each papilla
  for (const [ax, ay, ux, uy, nx, ny] of papilla) {
    d.poly([[ax - ux*3 + nx*14, ay - uy*3 + ny*14],
            [ax + ux*18 + nx*10, ay + uy*18 + ny*10],
            [ax + ux*18 - nx*10, ay + uy*18 - ny*10],
            [ax - ux*3 - nx*14, ay - uy*3 - ny*14]],
           { fill: '#c7d2fe', stroke: '#4338ca', lw: 1.0 });
  }

  // ---- pelvis and ureter --------------------------------------------------
  d.poly([[px - 34, py + 44], [px - 34, py - 44], [px + 30, py - 14],
          [px + 30, py + 14]], { fill: '#a5b4fc', stroke: '#4338ca', lw: 1.6 });
  d.poly([[px + 30, py + 14], [px + 30, py - 14], [px + 96, py - 30],
          [px + 96, py - 8]], { fill: '#a5b4fc', stroke: '#4338ca', lw: 1.6 });

  // ---- vessels, kept short so they never reach the label column -----------
  d.poly([[px - 18, py + 26], [px - 14, py + 46], [px + 96, py + 74],
          [px + 96, py + 52]], { fill: '#fecaca', stroke: '#b91c1c', lw: 1.5 });
  d.poly([[px - 18, py - 26], [px - 14, py - 46], [px + 96, py - 74],
          [px + 96, py - 52]], { fill: '#dbeafe', stroke: '#1d4ed8', lw: 1.5 });

  // ---- labels -------------------------------------------------------------
  const L = 128, R = 512;                       // label columns
  const lead = (x1,y1,x2,y2,c) => d.plot([[x1,y1],[x2,y2]], { colour:c, lw:1.1 });

  d.label(L, cy + 138, 'fibrous capsule', SLATE, 9.5, { ha:'right' });
  lead(L + 4, cy + 138, cx - 74, cy + 116, SLATE);
  d.label(L, cy + 82, 'CORTEX', TEAL, 10.5, { ha:'right', bold:true });
  lead(L + 4, cy + 82, cx - 96, cy + 56, TEAL);
  d.label(L, cy + 22, 'MEDULLA', AMBER, 10.5, { ha:'right', bold:true });
  lead(L + 4, cy + 22, cx - 72, cy + 16, AMBER);
  d.label(L, cy - 40, 'renal pyramid', AMBER, 9.5, { ha:'right' });
  lead(L + 4, cy - 40, cx - 54, cy - 40, AMBER);
  d.label(L, cy - 100, 'renal column', TEAL, 9.5, { ha:'right' });
  lead(L + 4, cy - 100, cx - 22, cy - 84, TEAL);

  d.label(R, cy + 116, 'renal artery', RED, 9.5, { ha:'left' });
  lead(R - 6, cy + 116, px + 78, py + 66, RED);
  d.label(R, cy + 60, 'papilla', AMBER, 9.5, { ha:'left' });
  lead(R - 6, cy + 60, papilla[0][0] + 8, papilla[0][1] + 2, AMBER);
  d.label(R, cy + 10, 'minor calyx', INDIGO, 9.5, { ha:'left' });
  lead(R - 6, cy + 10, px - 22, py + 20, INDIGO);
  d.label(R, cy - 40, 'renal pelvis', INDIGO, 9.5, { ha:'left' });
  lead(R - 6, cy - 40, px + 4, py - 6, INDIGO);
  d.label(R, cy - 88, 'ureter', INDIGO, 9.5, { ha:'left' });
  lead(R - 6, cy - 88, px + 86, py - 24, INDIGO);
  d.label(R, cy - 134, 'renal vein', BLUE, 9.5, { ha:'left' });
  lead(R - 6, cy - 134, px + 78, py - 66, BLUE);

  d.caption('Blood is filtered in the cortex; the medulla builds the salt gradient that concentrates urine. Fluid drains papilla to calyx to pelvis, then leaves by the ureter.',
            { y: 30, size: 9.5, wrap: 104 });
  return d;
};
