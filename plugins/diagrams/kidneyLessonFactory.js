/* Shared 30-page diagram factory for A2 Biology kidney lessons. */

function sheet(K, title) {
  const d = new K.Diagram();
  d.fitlabel(380, 425, 700, title, K.TEAL, 14.5, true);
  return d;
}

function conceptPage(K, spec) {
  const { TEAL, BLUE, INDIGO, AMBER } = K;
  const d = sheet(K, spec.title);
  d.box(50, 320, 660, 58, spec.key, spec.colour || TEAL, 10.5);
  d.chain(spec.chain, {
    y: 190,
    x0: 38,
    x1: 722,
    h: 82,
    colour: [BLUE, INDIGO, AMBER],
    size: 9.5,
  });
  d.caption(spec.caption, { y: 49, size: 9.5, wrap: 105 });
  return d;
}

function makeLesson(cfg) {
  const pages = [];

  pages.push((K) => {
    const d = sheet(K, cfg.title);
    d.box(50, 326, 660, 58, cfg.centralIdea, K.TEAL, 10.5);
    d.chain(cfg.overview, { y: 190, x0: 34, x1: 726, h: 82, colour: [K.BLUE, K.INDIGO, K.AMBER, K.TEAL, K.BLUE], size: 9 });
    d.caption(cfg.overviewCaption, { y: 48, size: 9.5, wrap: 105 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Learning outcomes and starting points');
    d.steps(cfg.outcomes, { x: 48, y0: 322, w: 664, rowh: 44, gap: 10, colour: K.TEAL, size: 10.5 });
    d.caption(cfg.prior, { y: 47, size: 9.5, wrap: 105 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Essential terminology');
    d.cards(cfg.terms, { y0: 342, x: 44, w: 672, rowh: 47, gap: 8, colour: K.INDIGO, size: 9.5 });
    d.caption(cfg.termsCaption, { y: 31, size: 9, wrap: 112 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'The whole biological sequence');
    d.steps(cfg.sequence, { x: 46, y0: 340, w: 668, rowh: 38, gap: 7, colour: K.TEAL, size: 9.8 });
    d.caption('Follow the arrows in order: structure, mechanism and consequence must remain connected.', { y: 29, size: 9.2 });
    return d;
  });

  pages.push({ path: cfg.openStaxPath, skip: true });

  cfg.concepts.forEach((spec) => pages.push((K) => conceptPage(K, spec)));

  pages.push((K) => {
    const d = sheet(K, 'Worked example 1 - decode the question');
    d.box(45, 316, 670, 68, cfg.worked.question, K.BLUE, 10.5);
    d.steps(cfg.worked.mustConnect, { x: 82, y0: 226, w: 596, rowh: 42, gap: 11, colour: K.TEAL, size: 10.3 });
    d.caption(cfg.worked.trap, { y: 48, size: 9.5, wrap: 108 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Worked example 1 - every microstep');
    d.steps(cfg.worked.steps, { x: 42, y0: 350, w: 676, rowh: 31, gap: 5, colour: K.INDIGO, size: 9.2 });
    d.caption('Each line earns its place by linking the structure to the next biological consequence.', { y: 28, size: 9 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Worked example 1 - conclusion and check');
    d.box(50, 286, 660, 80, cfg.worked.conclusion, K.TEAL, 11.5);
    d.box(50, 162, 660, 86, 'CHECK: ' + cfg.worked.check, K.AMBER, 10.5);
    d.caption(cfg.worked.finalCaption, { y: 54, size: 9.5, wrap: 105 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, cfg.compare.title);
    d.twocol(cfg.compare.left, cfg.compare.right, {
      y0: 274,
      rowh: 45,
      gap: 10,
      lc: K.BLUE,
      rc: K.TEAL,
      heads: cfg.compare.heads,
      size: 9.5,
    });
    d.caption(cfg.compare.caption, { y: 42, size: 9.5, wrap: 105 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, cfg.application.title);
    d.box(46, 332, 668, 54, cfg.application.situation, K.AMBER, 10.5);
    d.steps(cfg.application.steps, { x: 52, y0: 263, w: 656, rowh: 37, gap: 7, colour: K.TEAL, size: 9.7 });
    d.caption(cfg.application.caption, { y: 27, size: 9.2, wrap: 108 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Misconceptions corrected with reasons');
    let y = 316;
    cfg.misconceptions.forEach(([wrong, right]) => {
      d.box(38, y, 326, 68, 'WRONG: ' + wrong, K.RED, 9.4);
      d.box(396, y, 326, 68, 'RIGHT: ' + right, K.TEAL, 9.4);
      d.arrow([368, y + 34], [392, y + 34], K.SLATE, 1.6);
      y -= 90;
    });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, cfg.specification.title);
    d.steps(cfg.outcomes, { x: 52, y0: 310, w: 656, rowh: 43, gap: 10, colour: K.TEAL, size: 10.2 });
    d.box(52, 48, 656, 62, cfg.specification.note, K.AMBER, 10);
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Check your understanding');
    d.steps(cfg.questions, { x: 62, y0: 316, w: 636, rowh: 47, gap: 12, colour: K.BLUE, size: 10.5 });
    d.caption('Answer in full sentences and link each named structure to its function.', { y: 45, size: 9.5 });
    return d;
  });

  cfg.answers.forEach((answerPage, index) => pages.push((K) => {
    const d = sheet(K, `Questions ${index * 2 + 1} and ${index * 2 + 2} - fully worked answers`);
    d.cards(answerPage, { y0: 322, x: 48, w: 664, rowh: 59, gap: 12, colour: K.INDIGO, size: 9.4 });
    d.caption('The answer names the structure first, then states its position, property or consequence.', { y: 35, size: 9.2 });
    return d;
  }));

  pages.push((K) => {
    const d = sheet(K, cfg.data.title);
    d.box(50, 310, 660, 78, cfg.data.question, K.BLUE, 10.5);
    d.chain(cfg.data.values, { y: 182, x0: 80, x1: 680, h: 76, colour: [K.INDIGO, K.AMBER, K.TEAL], size: 10 });
    d.box(130, 62, 500, 54, cfg.data.formula, K.TEAL, 10.5);
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, cfg.calculation.title);
    d.steps(cfg.calculation.steps, { x: 66, y0: 323, w: 628, rowh: 43, gap: 10, colour: K.INDIGO, size: 10.5 });
    d.box(130, 35, 500, 52, cfg.calculation.answer, K.TEAL, 11);
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'CCEA exam-style question - 12 marks');
    d.box(45, 298, 670, 92, cfg.examQuestion, K.BLUE, 11);
    d.chain(['linked biological stages', 'correct terminology', 'relevant evidence or calculation'], {
      y: 156,
      x0: 56,
      x1: 704,
      h: 84,
      colour: [K.TEAL, K.INDIGO, K.AMBER],
      size: 9.7,
    });
    d.caption('Plan the causal chain before writing; isolated facts cannot reach the top band.', { y: 43, size: 9.5 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'CCEA exam-style answer - complete reasoning chain');
    d.steps(cfg.examAnswer, { x: 43, y0: 350, w: 674, rowh: 31, gap: 5, colour: K.TEAL, size: 9.1 });
    d.caption(cfg.examCaption, { y: 27, size: 9.1, wrap: 110 });
    return d;
  });

  pages.push((K) => {
    const d = sheet(K, 'Lesson recap and next connection');
    d.steps(cfg.recap, { x: 48, y0: 306, w: 664, rowh: 52, gap: 13, colour: K.TEAL, size: 10.8 });
    d.box(48, 58, 664, 72, 'NEXT LESSON: ' + cfg.nextLesson, K.INDIGO, 10.8);
    return d;
  });

  if (pages.length !== 30) throw new Error(`${cfg.title}: expected 30 pages, got ${pages.length}`);
  return { dir: 'a2-biology', prefix: cfg.prefix, pages };
}

module.exports = { makeLesson };

