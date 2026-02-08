import React, { useState, useEffect } from 'react';
import { X, Eye, Sun, Moon, Coffee, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImprovedFocusMode({ 
  children, 
  enabled, 
  onToggle,
  type = 'video' // 'video' or 'slides'
}) {
  const [dimLevel, setDimLevel] = useState(80);
  const [ambientMode, setAmbientMode] = useState(false);
  const [eyeComfort, setEyeComfort] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [showExitHint, setShowExitHint] = useState(true);

  useEffect(() => {
    if (enabled) {
      setShowExitHint(true);
      const timer = setTimeout(() => setShowExitHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      const interval = setInterval(() => {
        setFocusTime(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setFocusTime(0);
    }
  }, [enabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleExit = () => {
    onToggle(false);
  };

  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${dimLevel / 100})`,
      }}
      onClick={handleExit}
    >
      {/* Exit Hints */}
      <AnimatePresence>
        {showExitHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm"
          >
            Press ESC or click outside to exit focus mode
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 z-[110] bg-red-500/90 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
        title="Exit focus mode (ESC)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Focus Timer */}
      {showTimer && (
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <TimerIcon className="w-4 h-4" />
          <span className="font-mono">{formatTime(focusTime)}</span>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-3 z-[110]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-white text-sm">
          <Sun className="w-4 h-4" />
          <Slider
            value={[dimLevel]}
            onValueChange={(v) => setDimLevel(v[0])}
            min={0}
            max={95}
            step={5}
            className="w-32"
          />
          <Moon className="w-4 h-4" />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={ambientMode ? 'default' : 'outline'}
            onClick={() => setAmbientMode(!ambientMode)}
            className="text-xs"
            title="Ambient lighting"
          >
            <Eye className="w-3 h-3 mr-1" />
            Ambient
          </Button>
          <Button
            size="sm"
            variant={eyeComfort ? 'default' : 'outline'}
            onClick={() => setEyeComfort(!eyeComfort)}
            className="text-xs"
            title="Reduce blue light"
          >
            <Moon className="w-3 h-3 mr-1" />
            Comfort
          </Button>
          <Button
            size="sm"
            variant={showTimer ? 'default' : 'outline'}
            onClick={() => setShowTimer(!showTimer)}
            className="text-xs"
          >
            <TimerIcon className="w-3 h-3 mr-1" />
            Timer
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div 
        className={`absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 ${
          type === 'slides' ? 'max-w-7xl mx-auto' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`w-full h-full relative ${
            ambientMode ? 'shadow-[0_0_100px_50px_rgba(59,130,246,0.3)]' : ''
          } ${
            eyeComfort ? 'filter sepia-[0.1] brightness-[0.95]' : ''
          }`}
          style={{
            borderRadius: type === 'slides' ? '12px' : '0',
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}