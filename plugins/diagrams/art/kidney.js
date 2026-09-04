/* Longitudinal section through the mammalian kidney.
 * Drawn as a proper labelled teaching diagram: capsule, cortex, medulla with
 * renal pyramids and papillae, renal columns, minor and major calyces, pelvis,
 * ureter and the vessels at the hilum — each with a leader line to its label. */

module.exports = function drawKidney(K) {
  const { Diagram, TEAL, BLUE, INDIGO, AMBER, RED, SLATE, TEXT } = K;
  const d = new Diagram(760, 456);

  d.title('Longitudinal section through the kidney', { size: 15 });

  const cx = 262, cy = 224;              // centre of the organ
  const hx = cx + 96, hy = cy;           // hilum, on the medial (right) side

  // ---- outer bean outline -------------------------------------------------
  // Wide and rounded laterally; indented at the hilum where vessels enter.
  const bean = [
    [cx +  4, cy + 152], [cx +  76, cy + 132], [cx + 118, cy +  74],
    [cx +  92, cy +  34], [cx +  84, cy +   0], [cx +  92, cy -  34],
    [cx + 118, cy -  74], [cx +  76, cy - 132], [cx +   4, cy - 152],
    [cx -  74, cy - 138], [cx - 126, cy -  76], [cx - 140, cy +   0],
    [cx - 126, cy +  76], [cx -  74, cy + 138],
  ];
  // fibrous capsule: a slightly larger outline behind the organ
  d.blob(bean.map(p => [cx + (p[0]-cx)*1.045, cy + (p[1]-cy)*1.045]),
         { fill: '#cbd5e1', stroke: null });
  d.blob(bean, { fill: '#a7f3d0', stroke: '#0f766e', lw: 2.0 });   // cortex

  // ---- medulla: the inner zone -------------------------------------------
  const inner = bean.map(p => [cx + (p[0]-cx)*0.70, cy + (p[1]-cy)*0.70]);
  d.blob(inner, { fill: '#fef3c7', stroke: '#b45309', lw: 1.2 });

  // ---- renal pyramids, apices pointing in toward the pelvis ---------------
  // Bases sit against the cortex; each apex (papilla) is cupped by a calyx.
  const PY = [128, 155, 180, 205, 232].map(a => a * Math.PI / 180);
  const apexR = 52, baseR = 122, halfBase = 30;
  const papillae = [];
  for (const t of PY) {
    const ux = Math.cos(t), uy = Math.sin(t);
    const px = hx + apexR * ux, py = hy + apexR * uy;          // papilla
    const bxc = hx + baseR * ux, byc = hy + baseR * uy;        // base centre
    const nx = -uy, ny = ux;                                   // perpendicular
    d.poly([[bxc + nx*halfBase, byc + ny*halfBase],
            [bxc - nx*halfBase, byc - ny*halfBase],
            [px, py]],
           { fill: '#fcd34d', stroke: '#b45309', lw: 1.3 });
    papillae.push([px, py, ux, uy]);
    // minor calyx: a small cup around the papilla, opening toward the pelvis
    d.poly([[px - ux*4 + nx*15, py - uy*4 + ny*15],
            [px + ux*20 + nx*11, py + uy*20 + ny*11],
            [px + ux*20 - nx*11, py + uy*20 - ny*11],
            [px - ux*4 - nx*15, py - uy*4 - ny*15]],
           { fill: '#c7d2fe', stroke: '#4338ca', lw: 1.1 });
  }

  // ---- renal pelvis, gathering the calyces and narrowing to the ureter ----
  d.poly([[hx - 46, hy + 46], [hx - 46, hy - 46], [hx + 26, hy - 15],
          [hx + 26, hy + 15]],
         { fill: '#a5b4fc', stroke: '#4338ca', lw: 1.6 });
  // ureter
  d.poly([[hx + 26, hy + 15], [hx + 26, hy - 15], [hx + 150, hy - 44],
          [hx + 150, hy - 22]],
         { fill: '#a5b4fc', stroke: '#4338ca', lw: 1.6 });

  // ---- vessels at the hilum ----------------------------------------------
  d.poly([[hx - 30, hy + 30], [hx - 26, hy + 52], [hx + 150, hy + 92],
          [hx + 150, hy + 68]], { fill: '#fecaca', stroke: '#b91c1c', lw: 1.5 });
  d.poly([[hx - 30, hy - 30], [hx - 26, hy - 52], [hx + 150, hy - 92],
          [hx + 150, hy - 68]], { fill: '#dbeafe', stroke: '#1d4ed8', lw: 1.5 });

  // ---- labels, each on a leader line -------------------------------------
  const lead = (x1,y1,x2,y2,c) => d.plot([[x1,y1],[x2,y2]], { colour:c, lw:1.1 });

  // left-hand labels
  d.label(96, cy + 150, 'fibrous capsule', SLATE, 9.5, { ha:'right' });
  lead(100, cy + 150, cx - 96, cy + 112, SLATE);
  d.label(96, cy + 96, 'CORTEX', TEAL, 10.5, { ha:'right', bold:true });
  lead(100, cy + 96, cx - 104, cy + 66, TEAL);
  d.label(96, cy + 18, 'MEDULLA', AMBER, 10.5, { ha:'right', bold:true });
  lead(100, cy + 18, cx - 66, cy + 8, AMBER);
  d.label(96, cy - 60, 'renal pyramid', AMBER, 9.5, { ha:'right' });
  lead(100, cy - 60, cx - 46, cy - 56, AMBER);
  d.label(96, cy - 126, 'renal column', TEAL, 9.5, { ha:'right' });
  lead(100, cy - 126, cx - 18, cy - 96, TEAL);

  // right-hand labels
  d.label(head(0), cy + 132, 'renal artery', RED, 9.5, { ha:'left' });
  lead(head(0) - 6, cy + 132, hx + 96, hy + 74, RED);
  d.label(head(0), cy + 74, 'papilla', AMBER, 9.5, { ha:'left' });
  lead(head(0) - 6, cy + 74, papillae[4][0] + 6, papillae[4][1] + 4, AMBER);
  d.label(head(0), cy + 22, 'minor calyx', INDIGO, 9.5, { ha:'left' });
  lead(head(0) - 6, cy + 22, hx - 34, hy + 26, INDIGO);
  d.label(head(0), cy - 24, 'renal pelvis', INDIGO, 9.5, { ha:'left' });
  lead(head(0) - 6, cy - 24, hx - 6, hy - 4, INDIGO);
  d.label(head(0), cy - 72, 'ureter', INDIGO, 9.5, { ha:'left' });
  lead(head(0) - 6, cy - 72, hx + 104, hy - 30, INDIGO);
  d.label(head(0), cy - 124, 'renal vein', BLUE, 9.5, { ha:'left' });
  lead(head(0) - 6, cy - 124, hx + 96, hy - 74, BLUE);

  function head(){ return 470; }

  d.caption('Blood is filtered in the cortex; the medulla builds the salt gradient that concentrates urine. Fluid drains papilla to calyx to pelvis, then leaves by the ureter.',
            { y: 34, size: 9.5, wrap: 104 });
  return d;
};
