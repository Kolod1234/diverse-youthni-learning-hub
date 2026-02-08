import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ComprehensionCheck({ lessonId, onAnswer }) {
  const [showCheck, setShowCheck] = useState(false);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    // Show comprehension check every 5 minutes
    const timer = setInterval(() => {
      setShowCheck(true);
      generateQuestion();
    }, 5 * 60 * 1000);

    return () => clearInterval(timer);
  }, [lessonId]);

  const generateQuestion = () => {
    // Simple comprehension questions
    const questions = [
      {
        text: 'Are you following along with the content?',
        options: ['Yes, clearly', 'Somewhat', 'Need clarification']
      },
      {
        text: 'How would you rate your understanding so far?',
        options: ['Great', 'Good', 'Struggling']
      },
      {
        text: 'Do you need to review any section?',
        options: ['No', 'Maybe', 'Yes']
      }
    ];
    
    setQuestion(questions[Math.floor(Math.random() * questions.length)]);
  };

  const handleAnswer = (selectedAnswer) => {
    setAnswer(selectedAnswer);
    onAnswer?.({ question: question.text, answer: selectedAnswer });
    
    setTimeout(() => {
      setShowCheck(false);
      setAnswer(null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {showCheck && question && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 right-6 z-50 max-w-sm"
        >
          <Card className="p-4 bg-white shadow-2xl border-2 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-2">Quick Check</h4>
                <p className="text-sm text-gray-700">{question.text}</p>
              </div>
            </div>

            {!answer ? (
              <div className="space-y-2">
                {question.options.map((option, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>Thank you for your feedback!</span>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}