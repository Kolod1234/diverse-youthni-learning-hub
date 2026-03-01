import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Trophy, ArrowRight, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathRenderer from './MathRenderer';
import { base44 } from '@/api/base44Client';

export default function ShortAnswerQuiz({ questions = [], onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!questions || questions.length === 0) {
    return <Card className="p-6 text-center text-gray-500">No short answer questions available</Card>;
  }

  const q = questions[current];

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    setSubmitted(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a marking assistant. A student answered the following short-answer question.

Question: ${q.question}
Model Answer: ${q.modelAnswer}
Key Points: ${(q.keyPoints || []).join(', ')}
Marks Available: ${q.marks || 2}

Student Answer: "${answer}"

Grade this answer. Respond ONLY with valid JSON:
{
  "marksAwarded": <number 0 to ${q.marks || 2}>,
  "feedback": "<1-2 sentence constructive feedback>",
  "correct": <true if full marks, false otherwise>
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            marksAwarded: { type: 'number' },
            feedback: { type: 'string' },
            correct: { type: 'boolean' }
          }
        }
      });

      setFeedback(result);
      if (result.correct) {
        setScore(s => s + 1);
        confetti({ particleCount: 40, spread: 55 });
      }
    } catch {
      setFeedback({ marksAwarded: 0, feedback: 'Unable to grade automatically. Compare your answer to the model answer below.', correct: false });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setAnswer('');
      setSubmitted(false);
      setFeedback(null);
    } else {
      setIsComplete(true);
      confetti({ particleCount: 100, spread: 70 });
      onComplete?.(score + (feedback?.correct ? 1 : 0));
    }
  };

  if (isComplete) {
    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-violet-50 to-pink-50 text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Short Answer Complete!</h3>
        <p className="text-lg text-gray-600 mb-6">{score} / {questions.length} correct</p>
        <Button onClick={() => { setCurrent(0); setAnswer(''); setSubmitted(false); setFeedback(null); setScore(0); setIsComplete(false); }}
          className="bg-gradient-to-r from-violet-600 to-pink-600">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-600">Question {current + 1} of {questions.length}</span>
        <span className="text-sm font-semibold text-violet-600">{q.marks || 2} marks</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div
          className="bg-gradient-to-r from-violet-500 to-purple-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="text-lg font-bold text-gray-800 mb-4">
        <MathRenderer content={q.question} />
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={submitted}
        placeholder="Write your answer here..."
        rows={4}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none mb-4 disabled:bg-gray-50"
      />

      {!submitted && (
        <Button onClick={handleSubmit} disabled={!answer.trim()} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 mb-3">
          Submit Answer
        </Button>
      )}

      {loadingFeedback && (
        <div className="text-center text-sm text-gray-500 py-2">Grading your answer...</div>
      )}

      {feedback && !loadingFeedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={`flex items-start gap-2 p-3 rounded-lg border ${feedback.correct ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feedback.correct ? 'text-green-600' : 'text-orange-500'}`} />
            <div>
              <p className={`font-semibold text-sm ${feedback.correct ? 'text-green-700' : 'text-orange-700'}`}>
                {feedback.marksAwarded} / {q.marks || 2} marks
              </p>
              <p className="text-sm text-gray-700 mt-0.5">{feedback.feedback}</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Model Answer
            </div>
            <div className="text-sm text-gray-700">
              <MathRenderer content={q.modelAnswer} />
            </div>
          </div>

          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
            {current < questions.length - 1 ? <><span>Next Question</span><ArrowRight className="w-4 h-4 ml-2" /></> : 'See Results'}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}