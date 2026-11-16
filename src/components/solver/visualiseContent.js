import { base44 } from '@/api/base44Client';
import { SOLVER_MODEL } from '@/components/solver/verifiedAnswer';

const VISUALISE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    visual_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage_label: { type: 'string' },
          detail: { type: 'string' },
          key_expression: { type: 'string' },
        },
        required: ['stage_label', 'detail'],
      },
    },
    chart: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['none', 'graph'] },
        title: { type: 'string' },
        caption: { type: 'string' },
        chart_type: { type: 'string', enum: ['line', 'bar', 'scatter'] },
        x_label: { type: 'string' },
        y_label: { type: 'string' },
        series: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              points: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { x: { type: 'number' }, y: { type: 'number' } },
                  required: ['x', 'y'],
                },
              },
            },
            required: ['name', 'points'],
          },
        },
      },
    },
    diagram_brief: { type: 'string' },
    what_to_notice: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'summary', 'visual_steps', 'diagram_brief', 'what_to_notice'],
};

export function requestVisualisation({ text, question, subject, qualification }) {
  const topicLabel = [qualification, subject].filter(Boolean).join(' ') || 'Past paper';
  return base44.integrations.Core.InvokeLLM({
    model: SOLVER_MODEL,
    prompt: `You are creating a clear visual breakdown for a ${topicLabel} student so they can SEE how this part of a past paper solution works.

${question ? `Question context:\n"""${question.slice(0, 1500)}"""\n\n` : ''}Solution text to visualise:
"""${String(text || '').slice(0, 3500)}"""

Rules:
- Use British English spelling throughout and plain, accurate language.
- Keep every mathematical symbol, number with units, formula or equation wrapped in single dollar signs ($...$) in valid LaTeX. Inside JSON strings, escape every LaTeX backslash as a double backslash (e.g. \\\\frac, \\\\times, \\\\text).
- Copy exact values, relationships and units from the question and solution — never invent contradictory numbers.
- visual_steps: 3 to 5 connected visual stages showing how the problem or mechanism unfolds from start to finish. Each has a short stage_label (2–5 words), a 1–2 sentence detail, and an optional key_expression (e.g. "$v = \\\\frac{120\\,000}{5400} = 22.2 \\\\text{ m/s}$").
- chart: If a quantitative relationship, function, rate, proportionality, comparison of categories, or step values can be plotted meaningfully on axes, set chart.kind to "graph" with chart_type ("line", "bar", or "scatter"), clear x_label and y_label (including units), caption, and 1–2 series of 3–7 accurate numerical (x, y) points. Otherwise set chart.kind to "none".
- diagram_brief: A precise 2–4 sentence visual specification for a clean 2D textbook schematic diagram illustrating this exact concept or calculation (listing objects, shapes, exact labels, values, arrows, and layout; white background, no clutter).
- what_to_notice: 2 to 3 short bullet points telling the student what key feature or relationship to look at in the visual.`,
    response_json_schema: VISUALISE_SCHEMA,
  });
}

export async function requestVisualDiagram({ brief, text, question, subject, qualification, imageUrl }) {
  const refs = imageUrl ? [imageUrl] : undefined;
  const context = [
    qualification && subject ? `${qualification} ${subject}` : subject || '',
    question ? `Question: ${question.slice(0, 400)}` : '',
    `Focus: ${String(text || '').slice(0, 400)}`,
  ].filter(Boolean).join('. ');

  const result = await base44.integrations.Core.GenerateImage({
    prompt: `Professional flat 2D educational textbook schematic diagram on a plain white background. Crisp dark lines, clear visual hierarchy, accessible indigo, blue and emerald accents, generous spacing, concise correctly spelled British English labels with neat leader lines, no clutter, no watermark, no photorealism. Copy all numbers, units and symbols accurately; invent nothing. ${context}. Visual specification: ${brief}`,
    existing_image_urls: refs,
  });
  return result?.url || '';
}