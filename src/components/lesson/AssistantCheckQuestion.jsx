import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, HelpCircle } from 'lucide-react';
import MathText from '@/components/lesson/MathText';

/**
 * One short question that checks whether the learner understood the
 * explanation they were just given, with the reasoning revealed on request.
 */
export default function AssistantCheckQuestion({ selectedText, lessonTitle }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const generate = async () => {
    setLoading(true);
    setRevealed(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `A learner has just had this idea explained to them, from the lesson "${lessonTitle}":

"""${selectedText}"""

Write ONE very short question that checks whether they truly understood it.
Then give the answer, and a one-sentence reason why that answer is correct.
Use British English and plain, everyday wording.
Any mathematics must be written in LaTeX between single dollar signs, such as $8+3$; never as plain text like "x^2".`,
        response_json_schema: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
            reason: { type: 'string' }
          },
          required: ['question', 'answer', 'reason']
        }
      });
      setQuestion(result);
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 text-xs font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
        Check I understand
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs leading-6 text-violet-900">
      <p className="font-semibold"><MathText text={question.question} /></p>
      {revealed ? (
        <div className="mt-2 space-y-1">
          <p><span className="font-semibold">Answer: </span><MathText text={question.answer} /></p>
          <p><span className="font-semibold">Why: </span><MathText text={question.reason} /></p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-2 rounded-md bg-violet-700 px-3 py-1.5 font-semibold text-white hover:bg-violet-800"
        >
          Show the answer
        </button>
      )}
    </div>
  );
}