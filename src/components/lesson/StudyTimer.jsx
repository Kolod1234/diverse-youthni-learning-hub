import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StudyTimer() {
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [duration, setDuration] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);

  useEffect(() => {
    let interval = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      if (isBreak) {
        toast.success('Break time is over! Ready to study?');
        setIsBreak(false);
        setSeconds(duration * 60);
        setInitialSeconds(duration * 60);
      } else {
        toast.success('Great work! Time for a break!');
        setIsBreak(true);
        setSeconds(5 * 60);
        setInitialSeconds(5 * 60);
      }
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, isBreak]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setSeconds(duration * 60);
    setInitialSeconds(duration * 60);
  };

  const changeDuration = (mins) => {
    if (!isActive) {
      setDuration(mins);
      setSeconds(mins * 60);
      setInitialSeconds(mins * 60);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isBreak ? (
            <Coffee className="w-5 h-5 text-green-600" />
          ) : (
            <Timer className="w-5 h-5 text-blue-600" />
          )}
          <h3 className="font-semibold">
            {isBreak ? 'Break Time' : 'Study Session'}
          </h3>
        </div>
      </div>

      {/* Duration Selector */}
      {!isBreak && !isActive && (
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Session Duration</label>
          <div className="flex flex-wrap gap-2">
            {[25, 30, 35, 40, 45, 50, 55, 60].map(mins => (
              <button
                key={mins}
                onClick={() => changeDuration(mins)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  duration === mins 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            className={isBreak ? 'text-green-500' : 'text-blue-600'}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold">
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => setIsActive(!isActive)}
          className="gap-2"
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}