import { useEffect, useRef } from 'react';

export default function useProgressAutoSave(lessonId, saveProgress) {
  const intervalRef = useRef(null);
  const lastSaveRef = useRef(Date.now());

  useEffect(() => {
    // Auto-save every 30 seconds
    intervalRef.current = setInterval(() => {
      const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      const progressData = {
        lessonId,
        scrollPosition: window.scrollY,
        progress: Math.min(scrollProgress, 100),
        timestamp: Date.now()
      };

      localStorage.setItem(`lesson-progress-${lessonId}`, JSON.stringify(progressData));
      lastSaveRef.current = Date.now();
      
      // Also update via callback if provided
      if (saveProgress) {
        saveProgress(progressData);
      }
    }, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lessonId, saveProgress]);

  const getLastProgress = () => {
    const saved = localStorage.getItem(`lesson-progress-${lessonId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  };

  const clearProgress = () => {
    localStorage.removeItem(`lesson-progress-${lessonId}`);
  };

  return { getLastProgress, clearProgress };
}