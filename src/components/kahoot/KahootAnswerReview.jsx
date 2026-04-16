import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

function getPlayerAnswer(answer, question) {
  if (!answer) return 'No answer';
  if (['short_answer', 'long_answer', 'fill_in_gap'].includes(question.question_type)) {
    return answer.text_answer || 'No answer';
  }
  return question.options?.[answer.selected_answer] || 'No answer';
}

function getCorrectAnswer(question) {
  if (['short_answer', 'long_answer', 'fill_in_gap'].includes(question.question_type)) {
    return question.correct_text_answer || '—';
  }
  return question.options?.[question.correct_answer] || '—';
}

export default function KahootAnswerReview({ game, playerInfo }) {
  const me = (game.participants || []).find((p) => p.email === playerInfo?.email);
  const answers = me?.answers || [];

  return (
    <div className="w-full max-w-3xl">
      <h3 className="mb-4 text-center text-xl font-black text-purple-200">Answer Review</h3>
      <div className="space-y-3">
        {(game.questions || []).map((question, index) => {
          const answer = answers.find((item) => item.question_index === index);
          const correct = answer?.is_correct;

          return (
            <div key={index} className="rounded-2xl bg-white/10 p-4 text-left backdrop-blur-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="font-black text-white">{index + 1}. {question.question}</p>
                {correct ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                )}
              </div>
              <p className="text-sm text-purple-100"><span className="font-bold text-white">Your answer:</span> {getPlayerAnswer(answer, question)}</p>
              <p className="mt-1 text-sm text-purple-100"><span className="font-bold text-white">Correct answer:</span> {getCorrectAnswer(question)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}