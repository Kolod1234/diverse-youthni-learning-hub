import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';
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
    <Box sx={{ bgcolor: 'white', border: 1, borderColor: 'divider', borderRadius: 2, boxShadow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isBreak ? (
            <Coffee size={20} color="#16a34a" />
          ) : (
            <Timer size={20} color="#2563eb" />
          )}
          <Typography variant="h6" fontWeight={600}>
            {isBreak ? 'Break Time' : 'Study Session'}
          </Typography>
        </Box>
      </Box>

      {!isBreak && !isActive && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Session Duration</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[25, 30, 35, 40, 45, 50, 55, 60].map(mins => (
              <Button
                key={mins}
                onClick={() => changeDuration(mins)}
                size="small"
                variant={duration === mins ? 'contained' : 'outlined'}
                sx={{ 
                  minWidth: 44,
                  bgcolor: duration === mins ? '#2563eb' : 'transparent',
                  color: duration === mins ? 'white' : 'grey.700',
                  '&:hover': { bgcolor: duration === mins ? '#1d4ed8' : 'grey.100' }
                }}
              >
                {mins}m
              </Button>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ position: 'relative', width: 192, height: 192, mx: 'auto', mb: 3 }}>
        <svg style={{ transform: 'rotate(-90deg)', width: 192, height: 192 }}>
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke={isBreak ? '#22c55e' : '#2563eb'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h3" fontWeight={700}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={() => setIsActive(!isActive)}
          variant="contained"
          startIcon={isActive ? <Pause size={16} /> : <Play size={16} />}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outlined" onClick={reset}>
          <RotateCcw size={16} />
        </Button>
      </Box>
    </Box>
  );
}