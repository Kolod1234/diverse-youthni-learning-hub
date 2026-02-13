import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import MathRenderer from './MathRenderer';

export default function InlineQuiz({ quiz, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    setShowResult(true);
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    onComplete?.(isCorrect);
  };

  const isCorrect = selectedAnswer === quiz.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Check</h3>
        </div>
        
        <div className="text-gray-700 font-medium mb-4">
          <MathRenderer content={quiz.question} />
        </div>
        
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(val) => setSelectedAnswer(parseInt(val))}
          disabled={showResult}
        >
          <div className="space-y-3">
            {quiz.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                  showResult && idx === quiz.correctAnswer
                    ? 'border-emerald-500 bg-emerald-50'
                    : showResult && selectedAnswer === idx && idx !== quiz.correctAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <RadioGroupItem value={idx.toString()} id={`inline-${idx}`} />
                <Label htmlFor={`inline-${idx}`} className="ml-3 flex-1 cursor-pointer">
                  <MathRenderer content={option} />
                </Label>
                {showResult && idx === quiz.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
                {showResult && selectedAnswer === idx && idx !== quiz.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>

        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            Check Answer
          </Button>
        ) : (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <p className={`font-medium ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
            </p>
            {quiz.explanation && (
              <div className="text-sm text-gray-700 mt-2">
                <MathRenderer content={quiz.explanation} />
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}