import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function PointsAnimation({ points, onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1.5, y: -50 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-6 py-3 shadow-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-white" />
            <span className="text-2xl font-bold text-white">+{points} pts</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}