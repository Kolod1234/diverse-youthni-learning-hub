import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

export default function XPProgressBar({ currentXP, level, showGain = false, gainAmount = 0 }) {
  const [displayXP, setDisplayXP] = useState(currentXP - gainAmount);
  const xpForNextLevel = level * 100;
  const progress = (displayXP % xpForNextLevel) / xpForNextLevel * 100;

  useEffect(() => {
    if (showGain && gainAmount > 0) {
      let start = currentXP - gainAmount;
      const duration = 1000;
      const increment = gainAmount / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= currentXP) {
          setDisplayXP(currentXP);
          clearInterval(timer);
        } else {
          setDisplayXP(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [showGain, gainAmount, currentXP]);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-sm">Level {level}</span>
        </div>
        <span className="text-sm text-gray-600">
          {Math.floor(displayXP % xpForNextLevel)} / {xpForNextLevel} XP
        </span>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence>
        {showGain && gainAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center justify-center gap-1 text-green-600 font-semibold"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+{gainAmount} XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}