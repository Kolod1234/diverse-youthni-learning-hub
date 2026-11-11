import { base44 } from '@/api/base44Client';

export const LEVELS = [
  { label: 'Very simple English', instruction: 'Explain it so a 10-year-old could understand: short everyday words, very short sentences, one idea at a time. Explain the real thing directly in plain words. If you must use a subject word, explain it straight away in simple brackets. Never assume any school knowledge.' },
  { label: 'Simpler still', instruction: 'The learner found the last explanation too hard. Explain it again for a 10-year-old using even smaller steps and the simplest words possible. Use a subject word only if it is needed, and explain it in brackets straight away.' },
  { label: 'Assume nothing', instruction: 'Assume the learner has no prior knowledge at all. Start from the very first idea and build up slowly in words a 10-year-old knows, defining every single word that is not everyday English.' }
];

// Shared by the explanation and the follow-up chat: simple words first, analogies only when they truly fit.
const PLAIN_LANGUAGE_RULES = `- Simple must still be correct: keep the real meaning of the subject, just say it in easy words.
- Explain the actual thing directly. Do NOT use analogies or "think of it like…" / "imagine…" comparisons by default — most explanations need none.
- Only use a comparison if it matches how the real thing works step for step and genuinely makes it clearer. Never use one that is only loosely related, made-up or could give the wrong idea.
- When an example helps, prefer a real one from the topic itself (for example real numbers, a real object or a real situation from the lesson) instead of an analogy.`;

const EXPLANATION_SCHEMA = {
  type: 'object',
  properties: {
    steps: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    key_terms: {
      type: 'array',
      items: {
        type: 'object',
        properties: { term: { type: 'string' }, meaning: { type: 'string' } },
        required: ['term', 'meaning']
      }
    },
    visual: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['none', 'graph', 'diagram'] },
        title: { type: 'string' },
        caption: { type: 'string' },
        drawing_brief: { type: 'string' },
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
                  required: ['x', 'y']
                }
              }
            },
            required: ['name', 'points']
          }
        }
      }
    },
    maths_breakdown: {
      type: 'object',
      properties: {
        equation: { type: 'string' },
        symbol_meanings: { type: 'array', items: { type: 'object', properties: { symbol: { type: 'string' }, meaning: { type: 'string' } }, required: ['symbol', 'meaning'] } },
        worked_steps: { type: 'array', items: { type: 'string' } },
        check_line: { type: 'string' }
      }
    }
  },
  required: ['steps', 'summary']
};

export function requestExplanation({ text, lessonTitle, level }) {
  return base44.integrations.Core.InvokeLLM({
    prompt: `You are a patient tutor helping a learner with the lesson "${lessonTitle}".

They highlighted this text and want it explained:
"""${text}"""

${LEVELS[level].instruction}

Rules:
- British English spelling throughout.
${PLAIN_LANGUAGE_RULES}
- Explain the ENTIRE highlighted text, even if it is long — do not stop after the first sentence or idea. Use up to eight steps if the highlight needs them.
- The highlighted text may contain LaTeX maths written between single dollar signs, such as $8-(-3)$. Keep all maths in that same $...$ LaTeX form in your steps, summary and key terms. Never write maths as plain text like "x^2" or "1/2" when a proper LaTeX form exists.
- Your reply is JSON: inside every JSON string, write each LaTeX backslash as a double backslash (for example \\\\frac, \\\\times, \\\\theta) so the commands survive.
- Break the explanation into short micro-steps: one single action or idea per step.
- State the reason BEFORE any algebra, calculation or technical move.
- Never chain two calculations into one step.
- Keep each step to one or two short sentences.
- Finish with a one-line plain-English summary.
- If the highlighted text contains an equation, formula, calculation or any mathematical notation, also fill in maths_breakdown:
  - equation: the main equation or formula only, written in LaTeX and wrapped in single dollar signs, for example $T = \\frac{1}{f}$. No words outside the dollar signs.
  - symbol_meanings: EVERY symbol or term in that equation, each with its meaning in plain everyday words. The "symbol" field is the bare LaTeX symbol with no dollar signs around it (for example "\\theta" or "v"); the "meaning" field explains it in plain words.
  - worked_steps: work the maths through in tiny steps. Each step states ONE single move in plain words first (why you do it), then shows the result in LaTeX between single dollar signs. Show EVERY intermediate line — never skip, merge or jump ahead. If the highlight only states a formula, apply it to one simple worked example using values consistent with the highlight, saying each substitution separately.
  - check_line: one plain-English sentence checking the final result makes sense (right size, right units, sensible).
  - If there is no equation or formula, leave maths_breakdown out entirely.
- Then decide whether a picture would make this much easier to understand:
  - If a graph or chart of numbers would help (for example a trend, a relationship between two things, or a comparison), set visual.kind to "graph" and provide a small chart: chart_type ("line", "bar" or "scatter"), x_label, y_label, and series with 3-6 numbered points each. Use realistic values consistent with the highlighted text.
  - Otherwise, if a labelled diagram or sketch would help the learner see what is happening (an object, a process, a structure or a cycle), set visual.kind to "diagram" and write a detailed drawing_brief describing exactly what to draw, what to label and any arrows.
  - If no picture would genuinely help, set visual.kind to "none". Do not force a picture onto a purely word-based idea.`,
    response_json_schema: EXPLANATION_SCHEMA
  });
}

// Splits a highlight into its sentences so the learner can pick one to discuss.
export function splitIntoParts(text) {
  const parts = String(text || '')
    .replace(/([.!?])\s+(?=[A-Z0-9$("'“‘])/g, '$1\u2063')
    .split('\u2063')
    .map(part => part.trim())
    .filter(part => part.length > 2);
  return parts.length > 1 ? parts.slice(0, 8) : [];
}

function describeExplanation(explanation) {
  if (!explanation) return '(not shown yet)';
  const maths = explanation.maths_breakdown;
  return [
    ...(explanation.steps || []).map((step, index) => `Step ${index + 1}: ${step}`),
    maths?.equation && `Equation: ${maths.equation}`,
    ...(maths?.symbol_meanings || []).map(item => `${item.symbol} means ${item.meaning}`),
    ...(maths?.worked_steps || []).map((step, index) => `Maths step ${index + 1}: ${step}`),
    explanation.summary && `Summary: ${explanation.summary}`
  ].filter(Boolean).join('\n');
}

// One tutor reply in the follow-up discussion. Plain text (not JSON), so LaTeX backslashes stay intact.
export async function requestFollowUp({ selectionText, lessonTitle, explanation, level, focus, history, question }) {
  const conversation = history
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'Learner' : 'Tutor'}${m.about ? ` (about ${m.about})` : ''}: ${m.text}`)
    .join('\n\n');

  const reply = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a patient, friendly tutor continuing a conversation with a learner about the lesson "${lessonTitle}".

The learner highlighted this part of the lesson:
"""${selectionText}"""

You already explained it like this:
${describeExplanation(explanation)}
${focus ? `\nThe learner is asking specifically about this part (${focus.label}):\n"""${focus.text}"""\n` : ''}
Conversation so far:
${conversation || '(this is their first follow-up question)'}

The learner's new message:
"""${question}"""

How to reply:
- ${LEVELS[level]?.instruction || LEVELS[0].instruction}
- British English spelling throughout.
${PLAIN_LANGUAGE_RULES}
- Answer exactly what they asked and link it back to the highlighted lesson text. If they are still confused, explain it a different way from before (smaller steps, simpler words, or a worked example with real values from the lesson) rather than repeating the same words.
- Put each step of reasoning on its own line, numbered when there is more than one step. State the reason before each calculation and show every intermediate line.
- Write all maths in LaTeX between single dollar signs, for example $T = \\frac{1}{f}$. Never write maths as plain text such as 1/f or x^2.
- If they give their own answer or reasoning, tell them clearly whether it is right and why.
- If the question has nothing to do with this lesson, say so kindly in one sentence and steer back to the highlighted topic.
- Keep it under 180 words unless a calculation genuinely needs more.
- Finish with one short question that checks they followed, unless they have said they understand.
- Plain text only: no Markdown headings, no bold markers, no code blocks.`
  });

  return String(reply ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .trim();
}