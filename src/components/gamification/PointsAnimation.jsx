import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PointsAnimation({ show, points, onComplete }) {
  useEffect(() => {
    if (show && points > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [show, points]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -50 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Zap className="w-8 h-8" />
            <span className="text-3xl font-bold">+{points} XP</span>
            <Star className="w-8 h-8" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}