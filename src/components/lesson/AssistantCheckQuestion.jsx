import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, HelpCircle, RotateCcw } from 'lucide-react';
import MathText from '@/components/lesson/MathText';

/**
 * Two short multiple-choice questions that check whether the learner truly
 * understood the explanation they were just given. They answer themselves,
 * and get immediate feedback explaining their choice either way.
 */
export default function AssistantCheckQuestion({ selectedText, lessonTitle, taughtExplanation }) {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuestions(null);
    setAnswers({});
    try {
      const taught = taughtExplanation
        ? `\n\nThe tutor explained it to them like this:\n"""${taughtExplanation}"""\n\nBase both questions on what that explanation actually said, not on outside knowledge.`
        : '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `A learner has just had this part of the lesson "${lessonTitle}" explained to them:

"""${selectedText}"""${taught}

Write TWO very short multiple-choice questions that check whether they truly understood it:
- Each question tests a DIFFERENT idea from the explanation.
- Include one option that is a common misconception or a near-miss, so guessing will not work.
- Question text and every option stay short (one or two sentences each).
- The explanation field tells the learner, in one or two plain sentences, why the right answer is right — and, if it helps, why the tempting wrong answer is wrong.
Use British English and plain, everyday wording.
Any mathematics must be written in LaTeX between single dollar signs, such as $8+3$; never as plain text like "x^2".`,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', minItems: 3, maxItems: 4, items: { type: 'string' } },
                  correct_index: { type: 'integer' },
                  explanation: { type: 'string' }
                },
                required: ['question', 'options', 'correct_index', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      });
      setQuestions(Array.isArray(result?.questions) ? result.questions : []);
    } finally {
      setLoading(false);
    }
  };

  const answer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  if (!questions) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 text-xs font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
        {loading ? 'Thinking of questions…' : 'Check I understand'}
      </button>
    );
  }

  const allAnswered = questions.length > 0 && questions.every((_, qi) => answers[qi] !== undefined);

  return (
    <div className="w-full rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs leading-6 text-violet-900">
      <p className="mb-2 flex items-center gap-1.5 font-semibold">
        <HelpCircle className="h-3.5 w-3.5" /> Do you really understand? Try these:
      </p>
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="mb-3 last:mb-0">
            <p className="font-semibold"><MathText text={q.question} /></p>
            <div className="mt-1 space-y-1">
              {(q.options || []).map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correct_index;
                let cls = 'border-violet-200 bg-white text-violet-900 hover:border-violet-400';
                if (chosen !== undefined) {
                  if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                  else if (isChosen) cls = 'border-rose-400 bg-rose-50 text-rose-900';
                  else cls = 'border-violet-100 bg-white text-violet-900 opacity-60';
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={chosen !== undefined}
                    onClick={() => answer(qi, oi)}
                    className={`flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left ${cls}`}
                  >
                    <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                    <span className="min-w-0 flex-1"><MathText text={opt} /></span>
                  </button>
                );
              })}
            </div>
            {chosen !== undefined && (
              <div className={`mt-1 rounded-md p-2 ${chosen === q.correct_index ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                <span className="font-semibold">{chosen === q.correct_index ? 'Correct — ' : 'Not quite — '}</span>
                <MathText text={q.explanation} />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-md bg-violet-700 px-3 py-1.5 font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        {loading ? 'Thinking of new questions…' : allAnswered ? 'Ask me different questions' : 'Ask me different questions'}
      </button>
    </div>
  );
}