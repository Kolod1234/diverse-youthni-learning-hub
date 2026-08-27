import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findBoxes, isAnswerBox, replaceBoxes, boxText, type SlideBox } from '../../shared/answerBlocks.ts';

const COURSE_ID = '698a3d721a8a90bcc13737e2';
const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:8px 0;';
const MODEL = 'claude_sonnet_4_6';

type AuditUnit = {
  id: string;
  slideIndex: number;
  slideTitle: string;
  question: string;
  box: SlideBox;
  maskedHtml: string;
  svgs: string[];
};

type ModelItem = {
  id?: string;
  html?: string;
  changed?: boolean;
  valid?: boolean;
  issues?: string[];
};

const responseSchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'html', 'issues'],
        properties: {
          id: { type: 'string' },
          html: { type: 'string' },
          changed: { type: 'boolean' },
          valid: { type: 'boolean' },
          issues: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

const REWRITE_RULES = `You are a senior CCEA AS Mathematics examiner and an exceptionally careful teacher. Audit and rewrite every supplied SOLUTION box for a learner who has never met the topic. Independently solve each question before editing. Correct any mathematical, arithmetic, sign, notation, method or final-answer error that you find.

NON-NEGOTIABLE PRESENTATION STANDARD
- Keep the exact outer solution-box opening <div>, its style, and its uppercase label <div>.
- Inside each solution box use exactly ONE <ol style="${OL_STYLE}">. Its numbering must run continuously from the first action to the final check. Never type numbers such as "1." inside an <li>.
- Every item must use <li style="${LI_STYLE}">.
- ONE small action per list item. A step may recall one formula, substitute once, expand once, collect one kind of term, divide once, evaluate once, state one conclusion, or perform one check.
- State the reason or instruction BEFORE the mathematics in every item. No list item may begin with a formula, "=", an implication arrow, or an unexplained result.
- Never place two algebraic transformations in one list item. In particular, split $a=b=c$, $a=b\\Rightarrow c=d$, and a line containing several "=" signs into separate numbered items.
- MACHINE-CHECK RULE: count every equals sign, \\Rightarrow, \\implies and \\therefore across the ENTIRE <li>, including separate maths spans. The total must be at most ONE. If the total is two or more, split that item again. A formula and its substitution must be separate numbered steps.
- Do not combine two questions or two parts on one line. If a box answers several expressions, keep one continuous list and introduce each part in words, such as "Now consider the second expression".
- Show all substitutions, sign changes, bracket expansions, collection of like terms, divisions, simplifications, arithmetic, units and rounding. Do not assume mental arithmetic or an unstated algebra law.
- For factorising by splitting the middle term, separately show: calculate $ac$; identify the required product and sum; find the two numbers; split the middle term; group the first pair; group the second pair; identify the common bracket; write the product; expand to check.
- End with a clearly worded final answer and a separate substitution/expansion/check step whenever a check is mathematically natural.
- Use correct British English and valid LaTeX. Use $...$ or $$...$$; do not introduce SVG, images or Markdown.
- Keep any mark-scheme line after the </ol>, unchanged.
- Keep every [SVG_...] placeholder exactly once and in the same relative location.
- Remove obsolete compressed working rather than leaving it before or after the list.

ACCURACY STANDARD
- Recompute from the QUESTION context. Do not preserve an incorrect original answer.
- Do not invent a different question, value or condition.
- Check domains, excluded values, signs, exact values, units, degree/radian mode, significant figures, probability bounds and vector directions where relevant.
- For proof, state each logical justification. For graphs/statistics/mechanics, explain every reading, formula choice and substitution.
- Return a complete solution-box HTML string for every requested id. Return no prose outside the JSON structure.`;

const VERIFY_RULES = `You are the independent second examiner for a CCEA AS Mathematics course. Re-solve every QUESTION from scratch, then inspect the candidate SOLUTION box line by line.

A box is valid only when:
1. every mathematical statement and final answer is correct;
2. exactly one continuously numbered <ol> is used;
3. every <li> performs one small action only;
4. every step explains the action before showing the mathematics;
5. no algebraic chain contains two or more relation/transformation signs;
6. no arithmetic, substitution, sign change, rearrangement, unit, rounding or conclusion is skipped;
7. separate questions/parts are never compressed onto one line;
8. a natural final check is present;
9. the exact outer wrapper, label and all placeholders remain intact;
10. the total count of equals signs, \\Rightarrow, \\implies and \\therefore across each entire <li> is at most ONE, even when they occur in separate maths spans.

For each id, return the complete corrected HTML. If the candidate already meets every rule, return it unchanged with valid=true and changed=false. If anything fails, correct it, set changed=true, set valid=true only after correction, and list the defects you corrected. Do not defer to the first examiner or to the original final answer: independently verify it.`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function invokeBatch(base44, prompt: string) {
  let lastError: any = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: MODEL,
        prompt,
        response_json_schema: responseSchema
      });
    } catch (error) {
      lastError = error;
      await sleep(1800 * (attempt + 1));
    }
  }
  throw lastError;
}

function maskSvgs(html: string, id: string) {
  const svgs: string[] = [];
  const maskedHtml = (html || '').replace(/<svg[\s\S]*?<\/svg>/gi, (svg) => {
    const token = `[SVG_${id}_${svgs.length}]`;
    svgs.push(svg);
    return token;
  });
  return { maskedHtml, svgs };
}

function restoreSvgs(html: string, unit: AuditUnit) {
  let out = html;
  for (let i = 0; i < unit.svgs.length; i++) {
    const token = `[SVG_${unit.id}_${i}]`;
    if ((out.split(token).length - 1) !== 1) {
      return { ok: false, reason: `placeholder ${token} was lost or duplicated`, html: '' };
    }
    out = out.replace(token, unit.svgs[i]);
  }
  if (/\[SVG_[^\]]+\]/.test(out)) {
    return { ok: false, reason: 'a stray SVG placeholder remains', html: '' };
  }
  return { ok: true, reason: '', html: out };
}

function openingTag(html: string) {
  const end = html.indexOf('>');
  return end >= 0 ? html.slice(0, end + 1) : '';
}

function mathChunks(html: string) {
  return (html.match(/\$\$?[\s\S]*?\$\$?/g) || []);
}

function relationCount(math: string) {
  return (math.match(/(?<!\\)=|\\Rightarrow|\\implies|\\therefore/g) || []).length;
}

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&minus;/gi, '-')
    .replace(/&times;/gi, '×')
    .replace(/\s+/g, ' ')
    .trim();
}

function listItems(html: string) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
}

function validateCandidate(unit: AuditUnit, html: string) {
  const out = (html || '').trim();
  if (!out.startsWith('<div') || !out.endsWith('</div>')) {
    return { ok: false, reason: 'complete solution-box wrapper is missing' };
  }
  if (openingTag(out) !== openingTag(unit.maskedHtml)) {
    return { ok: false, reason: 'outer solution-box opening tag changed' };
  }
  const found = findBoxes(out);
  if (found.length !== 1 || !isAnswerBox(found[0])) {
    return { ok: false, reason: 'solution label or box structure changed' };
  }
  if (found[0].label !== unit.box.label) {
    return { ok: false, reason: 'solution label text changed' };
  }

  const olCount = (out.match(/<ol\b/gi) || []).length;
  if (olCount !== 1) return { ok: false, reason: `expected one ordered list, found ${olCount}` };
  if (/<ol\b[^>]*\bstart\s*=/i.test(out)) {
    return { ok: false, reason: 'ordered-list numbering was manually restarted' };
  }

  const items = listItems(out);
  if (items.length < 2) return { ok: false, reason: 'solution is not a multistep breakdown' };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const text = plainText(item);
    if (/^\s*\d+\s*[.)]/.test(text)) {
      return { ok: false, reason: `step ${i + 1} contains a typed number as well as automatic numbering` };
    }
    if (/^(?:=|⇒|→|\\Rightarrow|\\implies)/.test(text)) {
      return { ok: false, reason: `step ${i + 1} begins with an unexplained continuation` };
    }
    const firstMath = item.search(/\$\$?/);
    const beforeMath = plainText(firstMath >= 0 ? item.slice(0, firstMath) : item);
    if (firstMath >= 0 && !/[A-Za-z]{3}/.test(beforeMath)) {
      return { ok: false, reason: `step ${i + 1} shows mathematics before explaining the action` };
    }
    const totalRelations = mathChunks(item).reduce((sum, chunk) => sum + relationCount(chunk), 0);
    if (totalRelations >= 2) {
      return { ok: false, reason: `step ${i + 1} still contains more than one relation or transformation` };
    }
  }

  for (let i = 0; i < unit.svgs.length; i++) {
    const token = `[SVG_${unit.id}_${i}]`;
    if ((out.split(token).length - 1) !== 1) {
      return { ok: false, reason: `placeholder ${token} was lost or duplicated` };
    }
  }
  return { ok: true, reason: '' };
}

function createUnits(lesson: any): AuditUnit[] {
  const units: AuditUnit[] = [];
  (lesson.slides || []).forEach((slide, slideIndex) => {
    const boxes = findBoxes(slide.content || '');
    const question = boxes
      .filter((box) => /question|practice|exam/i.test(box.label))
      .map(boxText)
      .join('\\n');
    let solutionIndex = 0;
    boxes.forEach((box) => {
      if (!isAnswerBox(box)) return;
      solutionIndex++;
      const id = `L${lesson.order}-S${slideIndex + 1}-B${solutionIndex}`;
      const masked = maskSvgs(box.html, id);
      units.push({
        id,
        slideIndex,
        slideTitle: slide.title || `Slide ${slideIndex + 1}`,
        question,
        box,
        maskedHtml: masked.maskedHtml,
        svgs: masked.svgs
      });
    });
  });
  return units;
}

function manifest(units: AuditUnit[], htmlById?: Map<string, string>) {
  return units.map((unit) => ({
    id: unit.id,
    slide_title: unit.slideTitle,
    question: unit.question || '(The question is implicit in the original worked solution; infer only from that solution.)',
    solution_html: htmlById?.get(unit.id) || unit.maskedHtml
  }));
}

function responseMap(response: any) {
  const map = new Map<string, ModelItem>();
  for (const item of (response?.items || [])) {
    if (item?.id && !map.has(item.id)) map.set(item.id, item);
  }
  return map;
}

async function rewriteAndVerifyBatch(base44, lesson: any, units: AuditUnit[]) {
  let rewriteResponse: any = null;
  let rewriteProblems: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const retry = attempt === 0 ? '' : `\\n\\nYour previous output was rejected for these exact structural reasons:\\n- ${rewriteProblems.join('\\n- ')}\\nReturn all ids again and repair them.`;
    rewriteResponse = await invokeBatch(
      base44,
      `${REWRITE_RULES}\\n\\nLESSON: ${lesson.order}. ${lesson.title}\\n\\nINPUT UNITS (JSON):\\n${JSON.stringify(manifest(units))}${retry}`
    );
    const byId = responseMap(rewriteResponse);
    rewriteProblems = [];
    for (const unit of units) {
      const item = byId.get(unit.id);
      if (!item?.html) {
        rewriteProblems.push(`${unit.id}: missing output`);
        continue;
      }
      const check = validateCandidate(unit, item.html);
      if (!check.ok) rewriteProblems.push(`${unit.id}: ${check.reason}`);
    }
    if (rewriteProblems.length === 0) break;
  }

  const rewrittenById = new Map<string, string>();
  const rewriteIssues = new Map<string, string[]>();
  const failures: { id: string; stage: string; reason: string }[] = [];
  const rewriteMap = responseMap(rewriteResponse);
  for (const unit of units) {
    const item = rewriteMap.get(unit.id);
    if (!item?.html) {
      failures.push({ id: unit.id, stage: 'rewrite', reason: 'missing model output' });
      continue;
    }
    const check = validateCandidate(unit, item.html);
    if (!check.ok) {
      failures.push({ id: unit.id, stage: 'rewrite', reason: check.reason });
      continue;
    }
    rewrittenById.set(unit.id, item.html.trim());
    rewriteIssues.set(unit.id, Array.isArray(item.issues) ? item.issues : []);
  }

  const verifyUnits = units.filter((unit) => rewrittenById.has(unit.id));
  if (verifyUnits.length === 0) {
    return { accepted: new Map<string, string>(), rewriteIssues, verifyIssues: new Map(), verifierCorrections: 0, failures };
  }

  let verifyResponse: any = null;
  let verifyProblems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const retry = attempt === 0 ? '' : `\\n\\nYour previous output was structurally rejected for:\\n- ${verifyProblems.join('\\n- ')}\\nReturn every id again with those defects corrected.`;
    verifyResponse = await invokeBatch(
      base44,
      `${VERIFY_RULES}\\n\\nLESSON: ${lesson.order}. ${lesson.title}\\n\\nCANDIDATE UNITS (JSON):\\n${JSON.stringify(manifest(verifyUnits, rewrittenById))}${retry}`
    );
    const byId = responseMap(verifyResponse);
    verifyProblems = [];
    for (const unit of verifyUnits) {
      const item = byId.get(unit.id);
      if (!item?.html) {
        verifyProblems.push(`${unit.id}: missing verifier output`);
        continue;
      }
      const check = validateCandidate(unit, item.html);
      if (!check.ok) verifyProblems.push(`${unit.id}: ${check.reason}`);
      if (item.valid !== true) verifyProblems.push(`${unit.id}: verifier did not certify mathematical validity`);
    }
    if (verifyProblems.length === 0) break;
  }

  const accepted = new Map<string, string>();
  const verifyIssues = new Map<string, string[]>();
  let verifierCorrections = 0;
  const verifyMap = responseMap(verifyResponse);
  for (const unit of verifyUnits) {
    const item = verifyMap.get(unit.id);
    if (!item?.html) {
      failures.push({ id: unit.id, stage: 'verify', reason: 'missing verifier output' });
      continue;
    }
    const check = validateCandidate(unit, item.html);
    if (!check.ok) {
      failures.push({ id: unit.id, stage: 'verify', reason: check.reason });
      continue;
    }
    if (item.valid !== true) {
      failures.push({ id: unit.id, stage: 'verify', reason: 'mathematical validity was not certified' });
      continue;
    }
    accepted.set(unit.id, item.html.trim());
    verifyIssues.set(unit.id, Array.isArray(item.issues) ? item.issues : []);
    if (item.changed === true || item.html.trim() !== rewrittenById.get(unit.id)) verifierCorrections++;
  }

  return { accepted, rewriteIssues, verifyIssues, verifierCorrections, failures };
}

function structuralScan(lesson: any) {
  const rows: any[] = [];
  let issues = 0;
  const units = createUnits(lesson);
  for (const unit of units) {
    const check = validateCandidate(unit, unit.maskedHtml);
    if (!check.ok) {
      issues++;
      rows.push({
        id: unit.id,
        slide: unit.slideIndex + 1,
        slide_title: unit.slideTitle,
        reason: check.reason
      });
    }
  }
  return { units: units.length, issues, rows };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const courseId = body.course_id || COURSE_ID;
    const order = Number(body.order);
    if (courseId !== COURSE_ID) {
      return Response.json({ error: 'This audit is restricted to the AS Mathematics course' }, { status: 400 });
    }
    if (!Number.isInteger(order) || order < 1 || order > 84) {
      return Response.json({ error: 'order must be an integer from 1 to 84' }, { status: 400 });
    }

    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId, order });
    const lesson = lessons[0];
    if (!lesson) return Response.json({ error: `Lesson order ${order} was not found` }, { status: 404 });

    const before = structuralScan(lesson);
    if (body.scan_only) {
      return Response.json({
        success: true,
        mode: 'scan',
        order: lesson.order,
        title: lesson.title,
        section: lesson.section,
        ...before
      });
    }

    const units = createUnits(lesson);
    const batchSize = Math.max(2, Math.min(8, Number(body.batch_size) || 6));
    const accepted = new Map<string, string>();
    const failures: any[] = [];
    const issueLog: any[] = [];
    let verifierCorrections = 0;

    for (let i = 0; i < units.length; i += batchSize) {
      const batch = units.slice(i, i + batchSize);
      const result = await rewriteAndVerifyBatch(base44, lesson, batch);
      for (const [id, html] of result.accepted) accepted.set(id, html);
      verifierCorrections += result.verifierCorrections;
      failures.push(...result.failures);
      for (const unit of batch) {
        issueLog.push({
          id: unit.id,
          slide: unit.slideIndex + 1,
          rewrite_issues: result.rewriteIssues.get(unit.id) || [],
          verification_issues: result.verifyIssues.get(unit.id) || []
        });
      }
    }

    const replacementsBySlide = new Map<number, { box: SlideBox; html: string }[]>();
    for (const unit of units) {
      const maskedAccepted = accepted.get(unit.id);
      if (!maskedAccepted) continue;
      const restored = restoreSvgs(maskedAccepted, unit);
      if (!restored.ok) {
        failures.push({ id: unit.id, stage: 'restore', reason: restored.reason });
        accepted.delete(unit.id);
        continue;
      }
      if (!replacementsBySlide.has(unit.slideIndex)) replacementsBySlide.set(unit.slideIndex, []);
      replacementsBySlide.get(unit.slideIndex)!.push({ box: unit.box, html: restored.html });
    }

    const slides = (lesson.slides || []).map((slide) => ({ ...slide }));
    for (const [slideIndex, replacements] of replacementsBySlide) {
      slides[slideIndex].content = replaceBoxes(slides[slideIndex].content || '', replacements);
    }

    if (accepted.size > 0) {
      await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
    }

    const savedLesson = { ...lesson, slides };
    const after = structuralScan(savedLesson);
    return Response.json({
      success: failures.length === 0 && after.issues === 0,
      order: lesson.order,
      title: lesson.title,
      section: lesson.section,
      solution_units: units.length,
      saved_units: accepted.size,
      verifier_corrections: verifierCorrections,
      failures,
      issues: issueLog,
      before_structural_failures: before.issues,
      after_structural_failures: after.issues,
      remaining: after.rows
    });
  } catch (error) {
    console.error('AS Mathematics solution audit failed', error);
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
