/* Shared visual factory for the variable-length A2 Biology coordination lessons. */

function sheet(K, title) {
  const d = new K.Diagram();
  d.fitlabel(380, 425, 700, title, K.TEAL, 14.5, true);
  return d;
}

function drawSlide(K, spec) {
  const d = sheet(K, spec.title);
  if (spec.kind === 'compare') {
    d.twocol(spec.left, spec.right, {
      y0: 278,
      rowh: spec.rowh || 44,
      gap: 9,
      lc: K.BLUE,
      rc: K.TEAL,
      heads: spec.heads,
      size: spec.size || 9.3,
    });
  } else if (spec.kind === 'cards') {
    d.cards(spec.cards, {
      y0: spec.y0 || 342,
      x: 44,
      w: 672,
      rowh: spec.rowh || 48,
      gap: spec.gap || 8,
      colour: K.INDIGO,
      size: spec.size || 9.3,
    });
  } else if (spec.kind === 'steps') {
    if (spec.key) d.box(48, 326, 664, 56, spec.key, K.BLUE, 10.2);
    d.steps(spec.chain, {
      x: 52,
      y0: spec.key ? 252 : 338,
      w: 656,
      rowh: spec.rowh || (spec.chain.length > 6 ? 35 : 42),
      gap: spec.gap || 7,
      colour: spec.colour === 'blue' ? K.BLUE : K.TEAL,
      size: spec.size || 9.6,
    });
  } else {
    d.box(50, 320, 660, 58, spec.key, K.TEAL, 10.5);
    d.chain(spec.chain, {
      y: 190,
      x0: 42,
      x1: 718,
      h: 82,
      colour: [K.BLUE, K.INDIGO, K.AMBER, K.TEAL],
      size: spec.size || 9.4,
    });
  }
  if (spec.caption) d.caption(spec.caption, { y: 39, size: 9.2, wrap: 108 });
  return d;
}

function makeCoordinationLesson(cfg) {
  const pages = cfg.slides.map((spec) => (K) => drawSlide(K, spec));
  (cfg.openStaxCopies || []).forEach(({ source, pageNumbers }) => {
    pageNumbers.forEach((pageNumber) => {
      pages[pageNumber - 1] = {
        path: `a2-biology/${cfg.prefix}${String(pageNumber).padStart(2, '0')}.png`,
        copyFrom: source,
      };
    });
  });
  if (pages.length !== cfg.pageCount) throw new Error(`${cfg.title}: expected ${cfg.pageCount} pages, got ${pages.length}`);
  return { dir: 'a2-biology', prefix: cfg.prefix, pages };
}

module.exports = { makeCoordinationLesson };


