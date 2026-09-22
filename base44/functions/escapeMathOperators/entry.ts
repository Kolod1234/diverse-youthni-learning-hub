import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Lesson HTML stores LaTeX inside $...$ / $$...$$ spans. When a relational
// operator is stored as a raw < or > (for example "$a<b$"), the browser's
// HTML parser swallows "<b$, ..." as a bogus tag when the slide is injected
// via innerHTML. That deletes text and leaves unbalanced $ delimiters, after
// which MathJax typesets prose as mathematics and strips its spaces.
//
// This function walks every lesson slide, escapes raw < and > inside math
// spans to &lt; / &gt;, and reports spans it must leave alone (mispaired
// delimiters that swallowed real HTML markup) for targeted manual repair.

const MARKUP_RE = /<\/|<!--/;
const TAG_START_RE = /<[a-zA-Z\/!]/;

function fixContent(html: string): { out: string; escaped: number; flags: string[] } {
  const flags: string[] = [];
  let out = '';
  let i = 0;
  let escaped = 0;
  let inTag = false;

  while (i < html.length) {
    const c = html[i];

    if (inTag) {
      out += c;
      if (c === '>') inTag = false;
      i++;
      continue;
    }

    if (c === '<') {
      out += c;
      inTag = true;
      i++;
      continue;
    }

    if (c === '$') {
      // Display math $$...$$
      if (html[i + 1] === '$') {
        const close = html.indexOf('$$', i + 2);
        if (close === -1) {
          flags.push(`unterminated display math at ${i}`);
          out += '$$';
          i += 2;
          continue;
        }
        const inner = html.slice(i + 2, close);
        if (MARKUP_RE.test(inner) || TAG_START_RE.test(inner)) {
          flags.push(`display span contains markup at ${i}`);
        } else {
          const ops = (inner.match(/[<>]/g) || []).length;
          if (ops > 0) {
            out += '$$' + inner.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '$$';
            escaped += ops;
            i = close + 2;
            continue;
          }
        }
        out += html.slice(i, close + 2);
        i = close + 2;
        continue;
      }

      // Inline math $...$
      const close = html.indexOf('$', i + 1);
      if (close === -1) {
        flags.push(`unterminated inline math at ${i}`);
        out += html.slice(i);
        break;
      }
      const inner = html.slice(i + 1, close);
      if (MARKUP_RE.test(inner)) {
        // A stray $ earlier on the slide has mispaired this span over real
        // HTML markup. Escaping here would corrupt the tags, so keep it raw.
        flags.push(`skipped mispaired span at ${i}: ${inner.slice(0, 60).replace(/\s+/g, ' ')}`);
        out += html.slice(i, close + 1);
        i = close + 1;
        continue;
      }
      const ops = (inner.match(/[<>]/g) || []).length;
      if (ops > 0) {
        out += '$' + inner.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '$';
        escaped += ops;
        i = close + 1;
        continue;
      }
      out += html.slice(i, close + 1);
      i = close + 1;
      continue;
    }

    out += c;
    i++;
  }

  return { out, escaped, flags };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    const courses = await base44.asServiceRole.entities.Course.list(null, 1000);
    const seen = new Set();
    const report = [];
    let slidesFixed = 0;
    let opsEscaped = 0;

    for (const course of courses) {
      let lessons;
      try {
        lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 500);
      } catch (err) {
        continue;
      }
      for (const lesson of lessons) {
        if (seen.has(lesson.id)) continue;
        seen.add(lesson.id);
        const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
        if (slides.length === 0) continue;

        let changed = false;
        let lessonEscaped = 0;
        const flags = [];
        const fixedSlides = [];

        for (let idx = 0; idx < slides.length; idx++) {
          const content = slides[idx].content || '';
          const res = fixContent(content);
          if (res.escaped > 0) {
            lessonEscaped += res.escaped;
            fixedSlides.push(idx + 1);
            slides[idx] = { ...slides[idx], content: res.out };
            changed = true;
          }
          if (res.flags.length > 0) {
            flags.push({ slide: idx + 1, flags: res.flags });
          }
        }

        if (lessonEscaped > 0) {
          slidesFixed += fixedSlides.length;
          opsEscaped += lessonEscaped;
        }
        if (changed && !dryRun) {
          await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
        }
        if (changed || flags.length > 0) {
          report.push({
            course: course.title,
            order: lesson.order,
            title: lesson.title,
            slides_fixed: fixedSlides,
            operators_escaped: lessonEscaped,
            flagged: flags.slice(0, 5)
          });
        }
      }
    }

    return Response.json({
      dry_run: dryRun,
      lessons_scanned: seen.size,
      slides_fixed: slidesFixed,
      operators_escaped: opsEscaped,
      report: report.slice(0, 200),
      report_total: report.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}