import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathRenderer from './MathRenderer';

export default function TrueFalseQuiz({ questions = [], onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!questions || questions.length === 0) {
    return <Card className="p-6 text-center text-gray-500">No true/false questions available</Card>;
  }

  const q = questions[current];

  const handleAnswer = (answer) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);
    if (answer === q.isTrue) {
      setScore(s => s + 1);
      confetti({ particleCount: 40, spread: 55 });
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      confetti({ particleCount: 100, spread: 70 });
      onComplete?.(score + (selected === q.isTrue ? 1 : 0));
    }
  };

  if (isComplete) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-teal-50 to-blue-50 text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">True / False Complete!</h3>
        <p className="text-lg text-gray-600 mb-6">{finalScore} / {questions.length} correct ({percentage}%)</p>
        <Button onClick={() => { setCurrent(0); setSelected(null); setShowResult(false); setScore(0); setIsComplete(false); }}
          className="bg-gradient-to-r from-teal-600 to-blue-600">
          Try Again
        </Button>
      </Card>
    );
  }

  const isCorrect = selected === q.isTrue;

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-600">Question {current + 1} of {questions.length}</span>
        <span className="text-sm font-semibold text-green-600">Score: {score}/{questions.length}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div
          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="text-lg font-bold text-gray-800 mb-6">
        <MathRenderer content={q.statement} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {[true, false].map((val) => {
          const isSelected = selected === val;
          const isRight = showResult && val === q.isTrue;
          const isWrong = showResult && isSelected && val !== q.isTrue;
          return (
            <motion.button
              key={String(val)}
              onClick={() => handleAnswer(val)}
              whileHover={{ scale: showResult ? 1 : 1.03 }}
              whileTap={{ scale: showResult ? 1 : 0.97 }}
              disabled={showResult}
              className={`py-4 rounded-xl text-lg font-bold border-2 transition-all ${
                isRight ? 'bg-green-100 border-green-500 text-green-700' :
                isWrong ? 'bg-red-100 border-red-500 text-red-700' :
                'bg-white border-gray-200 text-gray-700 hover:border-teal-400'
              }`}
            >
              {val ? '✓ True' : '✗ False'}
            </motion.button>
          );
        })}
      </div>

      {showResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={`flex items-center gap-2 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {isCorrect ? 'Correct!' : `Incorrect — the statement is ${q.isTrue ? 'True' : 'False'}`}
          </div>
          {q.explanation && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
              <MathRenderer content={q.explanation} />
            </div>
          )}
          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600">
            {current < questions.length - 1 ? <><span>Next</span><ArrowRight className="w-4 h-4 ml-2" /></> : 'See Results'}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}