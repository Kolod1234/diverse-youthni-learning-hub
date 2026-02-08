import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchingGame({ pairs, onComplete }) {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const left = pairs.map((p, i) => ({ id: i, text: p.left, matched: false }));
    const right = pairs.map((p, i) => ({ id: i, text: p.right, matched: false }))
      .sort(() => Math.random() - 0.5);
    setLeftItems(left);
    setRightItems(right);
  }, [pairs]);

  const handleLeftClick = (item) => {
    if (item.matched) return;
    setSelectedLeft(item);
    if (selectedRight) checkMatch(item, selectedRight);
  };

  const handleRightClick = (item) => {
    if (item.matched) return;
    setSelectedRight(item);
    if (selectedLeft) checkMatch(selectedLeft, item);
  };

  const checkMatch = (left, right) => {
    setAttempts(prev => prev + 1);
    
    if (left.id === right.id) {
      const newMatches = [...matches, left.id];
      setMatches(newMatches);
      setScore(prev => prev + 10);
      
      setLeftItems(prev => prev.map(item => 
        item.id === left.id ? { ...item, matched: true } : item
      ));
      setRightItems(prev => prev.map(item => 
        item.id === right.id ? { ...item, matched: true } : item
      ));

      if (newMatches.length === pairs.length) {
        setIsComplete(true);
        confetti({ particleCount: 100, spread: 70 });
        onComplete?.(score + 10);
      }
    }
    
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 600);
  };

  const reset = () => {
    const left = pairs.map((p, i) => ({ id: i, text: p.left, matched: false }));
    const right = pairs.map((p, i) => ({ id: i, text: p.right, matched: false }))
      .sort(() => Math.random() - 0.5);
    setLeftItems(left);
    setRightItems(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches([]);
    setScore(0);
    setAttempts(0);
    setIsComplete(false);
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Match the Pairs</h3>
        <div className="flex gap-3 items-center">
          <div className="text-sm font-semibold text-purple-600">
            Score: {score}
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold text-gray-800 mb-2">Excellent!</h4>
          <p className="text-gray-600 mb-4">
            You completed the matching game with {score} points in {attempts} attempts!
          </p>
          <Button onClick={reset} className="bg-gradient-to-r from-purple-600 to-blue-600">
            Play Again
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {leftItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleLeftClick(item)}
                whileHover={{ scale: item.matched ? 1 : 1.02 }}
                whileTap={{ scale: item.matched ? 1 : 0.98 }}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  item.matched
                    ? 'bg-green-100 border-2 border-green-500'
                    : selectedLeft?.id === item.id
                    ? 'bg-blue-200 border-2 border-blue-500'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.matched && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  <span className="text-sm sm:text-base font-medium text-gray-800">{item.text}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="space-y-3">
            {rightItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleRightClick(item)}
                whileHover={{ scale: item.matched ? 1 : 1.02 }}
                whileTap={{ scale: item.matched ? 1 : 0.98 }}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  item.matched
                    ? 'bg-green-100 border-2 border-green-500'
                    : selectedRight?.id === item.id
                    ? 'bg-purple-200 border-2 border-purple-500'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.matched && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  <span className="text-sm sm:text-base font-medium text-gray-800">{item.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}