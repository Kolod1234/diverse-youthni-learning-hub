import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpeedReadingMode({ content, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (content) {
      const text = typeof content === 'string' ? content : content.textContent;
      const wordArray = text.split(/\s+/).filter(w => w.length > 0);
      setWords(wordArray);
    }
  }, [content]);

  useEffect(() => {
    if (isActive && currentIndex < words.length) {
      const interval = 60000 / wpm;
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsActive(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, wpm, words.length, currentIndex]);

  const reset = () => {
    setCurrentIndex(0);
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      <div className="max-w-2xl w-full px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            className="text-center mb-12"
          >
            <p className="text-6xl font-bold text-white">
              {words[currentIndex]}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={() => setIsActive(!isActive)}
                className="gap-2"
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button size="lg" variant="outline" onClick={reset}>
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="outline" onClick={onClose}>
              Exit
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Speed: {wpm} WPM
              </span>
              <span className="text-sm">
                {currentIndex + 1} / {words.length}
              </span>
            </div>
            <Slider
              value={[wpm]}
              onValueChange={([val]) => setWpm(val)}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}