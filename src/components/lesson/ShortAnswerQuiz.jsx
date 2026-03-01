import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, ArrowRight, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathRenderer from './MathRenderer';

export default function ShortAnswerQuiz({ questions, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const q = questions[current];

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setAnswer('');
      setSubmitted(false);
      setCompleted(c => c + 1);
    } else {
      setIsComplete(true);
      confetti({ particleCount: 80, spread: 65 });
      onComplete?.(questions.length);
    }
  };

  if (isComplete) {
    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Short Answers Complete!</h3>
        <p className="text-gray-600 mb-6">You answered all {questions.length} questions. Review the model answers to assess your responses.</p>
        <Button onClick={() => { setCurrent(0); setAnswer(''); setSubmitted(false); setCompleted(0); setIsComplete(false); }}
          className="bg-gradient-to-r from-purple-600 to-pink-600">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-600">Question {current + 1} of {questions.length}</span>
        {q.marks && (
          <Badge variant="outline" className="text-purple-700 border-purple-300">
            {q.marks} mark{q.marks > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
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
        rows={3}
        placeholder="Write your answer here..."
        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white mb-3"
      />

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Submit Answer
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Model Answer */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Model Answer</span>
            </div>
            <div className="text-sm text-gray-700">
              <MathRenderer content={q.modelAnswer} />
            </div>
          </div>

          {/* Key Points */}
          {q.keyPoints && q.keyPoints.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Key Points to Include</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {q.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <MathRenderer content={pt} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
            {current < questions.length - 1 ? <><span>Next Question</span><ArrowRight className="w-4 h-4 ml-2" /></> : 'Finish'}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}