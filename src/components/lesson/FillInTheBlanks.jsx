import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function FillInTheBlanks({ exercises, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  const currentExercise = exercises[currentIndex];
  const blankCount = currentExercise.blanks.length;

  // Initialize answers if needed
  React.useEffect(() => {
    setUserAnswers(new Array(blankCount).fill(''));
    setIsChecked(false);
    setShowHint(false);
  }, [currentIndex, blankCount]);

  const updateAnswer = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const checkAnswers = () => {
    const correctCount = userAnswers.filter((answer, idx) => 
      answer.trim().toLowerCase() === currentExercise.blanks[idx].toLowerCase()
    ).length;
    
    setIsChecked(true);
    
    if (correctCount === blankCount) {
      setScore(prev => prev + 1);
      toast.success('Perfect! All answers correct! 🎉');
      
      if (currentIndex === exercises.length - 1 && onComplete) {
        setTimeout(() => onComplete(score + 1), 1500);
      }
    } else {
      toast.error(`${correctCount}/${blankCount} correct. Try again!`);
    }
  };

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const retry = () => {
    setUserAnswers(new Array(blankCount).fill(''));
    setIsChecked(false);
    setShowHint(false);
  };

  // Split text by __blank__ and render with input fields
  const renderExercise = () => {
    const parts = currentExercise.text.split('__blank__');
    const elements = [];
    
    parts.forEach((part, idx) => {
      elements.push(
        <span key={`text-${idx}`} className="text-gray-900">
          {part}
        </span>
      );
      
      if (idx < parts.length - 1) {
        const isCorrect = isChecked && userAnswers[idx].trim().toLowerCase() === currentExercise.blanks[idx].toLowerCase();
        const isIncorrect = isChecked && userAnswers[idx].trim().toLowerCase() !== currentExercise.blanks[idx].toLowerCase();
        
        elements.push(
          <span key={`input-${idx}`} className="inline-flex items-center mx-1">
            <Input
              value={userAnswers[idx] || ''}
              onChange={(e) => updateAnswer(idx, e.target.value)}
              disabled={isChecked}
              className={`inline-block w-32 h-8 text-center ${
                isCorrect ? 'border-green-500 bg-green-50' : 
                isIncorrect ? 'border-red-500 bg-red-50' : ''
              }`}
              placeholder={`blank ${idx + 1}`}
            />
            {isChecked && (
              <span className="ml-1">
                {isCorrect ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-600" />
                )}
              </span>
            )}
          </span>
        );
      }
    });
    
    return elements;
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fill in the Blanks {currentIndex + 1} of {exercises.length}</CardTitle>
          <Badge variant="secondary">{score}/{exercises.length} Correct</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
              <p className="text-lg leading-relaxed">
                {renderExercise()}
              </p>
            </div>

            {currentExercise.hint && (
              <div className="flex items-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint ? 'Hide' : 'Show'} Hint
                </Button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm"
                    >
                      💡 {currentExercise.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {isChecked && userAnswers.some((answer, idx) => 
              answer.trim().toLowerCase() !== currentExercise.blanks[idx].toLowerCase()
            ) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm font-medium mb-2">Correct answers:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {currentExercise.blanks.map((blank, idx) => (
                    <li key={idx}>
                      Blank {idx + 1}: <strong>{blank}</strong>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="flex gap-2">
              {!isChecked ? (
                <Button
                  onClick={checkAnswers}
                  disabled={userAnswers.some(a => !a.trim())}
                  className="flex-1"
                >
                  Check Answers
                </Button>
              ) : (
                <>
                  <Button
                    onClick={retry}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  {currentIndex < exercises.length - 1 && (
                    <Button onClick={nextExercise} className="flex-1">
                      Next Exercise →
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}