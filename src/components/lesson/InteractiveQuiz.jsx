import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InteractiveQuiz({ questions, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswerClick = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correctAnswer) {
      setScore(prev => prev + 1);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      confetti({ particleCount: 100, spread: 70 });
      onComplete?.(score);
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
          <p className="text-lg text-gray-600 mb-6">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>
          <Button onClick={reset} className="bg-gradient-to-r from-green-600 to-blue-600">
            Try Again
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-semibold text-green-600">
            Score: {score}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">
        {question.question}
      </h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <motion.button
              key={index}
              onClick={() => handleAnswerClick(index)}
              whileHover={{ scale: showResult ? 1 : 1.02 }}
              whileTap={{ scale: showResult ? 1 : 0.98 }}
              disabled={showResult}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                showCorrect
                  ? 'bg-green-100 border-2 border-green-500'
                  : showWrong
                  ? 'bg-red-100 border-2 border-red-500'
                  : isSelected
                  ? 'bg-orange-200 border-2 border-orange-500'
                  : 'bg-white border-2 border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium text-gray-800">{option}</span>
                {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {question.explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>
          )}
          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-orange-600 to-pink-600">
            {currentQuestion < questions.length - 1 ? (
              <>
                Next Question <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'See Results'
            )}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}