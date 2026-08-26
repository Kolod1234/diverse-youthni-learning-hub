import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { mapWithLimit } from '../../shared/lessonHtml.ts';
import { replaceBoxes } from '../../shared/answerBlocks.ts';
import { findPackedAnswerBoxes, slideQuestion, deepenBox } from '../../shared/solutionSteps.ts';

async function processSlide(base44, content: string) {
  const targets = findPackedAnswerBoxes(content || '');
  if (targets.length === 0) return { content, changed: false };

  const question = slideQuestion(content);
  const results = await mapWithLimit(targets, 2, (box) => deepenBox(base44, question, box));

  const replacements = [];
  const reasons = [];
  results.forEach((r, i) => {
    if (r.changed) replacements.push({ box: targets[i], html: r.html });
    else if (r.reason) reasons.push(r.reason);
  });

  if (replacements.length === 0) {
    return { content, changed: false, reason: reasons[0] || 'no change' };
  }
  return { content: replaceBoxes(content, replacements), changed: true, reason: reasons[0] };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const courseId = body.course_id;
    const orders = Array.isArray(body.orders) ? body.orders : [];
    if (!courseId) return Response.json({ error: 'course_id is required' }, { status: 400 });

    const lessons = await base44.asServiceRole.entities.Lesson.filter(
      orders.length > 0
        ? { course_id: courseId, order: { $in: orders } }
        : { course_id: courseId }
    );
    lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Dry run: report which lessons still contain packed working.
    if (body.scan_only) {
      let boxes = 0;
      const scan = [];
      for (const lesson of lessons) {
        const count = (lesson.slides || []).reduce(
          (sum, s) => sum + findPackedAnswerBoxes(s.content || '').length,
          0
        );
        boxes += count;
        if (count > 0) scan.push({ order: lesson.order, title: lesson.title, boxes: count });
      }
      return Response.json({ lessons: lessons.length, boxes, scan });
    }

    const report = [];
    for (const lesson of lessons) {
      const slides = Array.isArray(lesson.slides) ? [...lesson.slides] : [];
      const results = await mapWithLimit(slides, 3, (s) => processSlide(base44, s.content || ''));
      let updated = 0;
      const skipped = [];
      results.forEach((r, i) => {
        if (r.changed) {
          slides[i] = { ...slides[i], content: r.content };
          updated++;
        } else if (r.reason) {
          skipped.push({ slide: i + 1, reason: r.reason });
        }
      });
      if (updated > 0) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
      }
      report.push({ order: lesson.order, title: lesson.title, updated, skipped });
    }

    return Response.json({ processed: report.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}