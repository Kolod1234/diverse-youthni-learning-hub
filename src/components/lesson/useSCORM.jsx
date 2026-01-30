import { useEffect, useState, useCallback } from 'react';
import { useSCORM as useSCORMProvider } from '@code-by-dwayne/react-scorm-provider';

/**
 * Custom hook for SCORM 2004 integration
 * Manages lesson completion, scoring, and session tracking
 */
export function useSCORM(lessonId, courseId) {
  const scorm = useSCORMProvider();
  const [scormReady, setScormReady] = useState(false);
  const [scormError, setScormError] = useState(null);

  // Initialize SCORM on mount
  useEffect(() => {
    if (!scorm || !lessonId || !courseId) return;

    try {
      // Initialize SCORM connection
      scorm.initialize();
      
      // Set learning object identifier
      scorm.setValue('cmi.learner_id', lessonId);
      scorm.setValue('cmi.learner_name', courseId);
      scorm.setValue('cmi.completion_status', 'incomplete');
      
      setScormReady(true);
    } catch (error) {
      console.error('SCORM initialization error:', error);
      setScormError(error.message);
    }

    return () => {
      if (scorm) {
        try {
          scorm.terminate();
        } catch (e) {
          console.error('SCORM terminate error:', e);
        }
      }
    };
  }, [scorm, lessonId, courseId]);

  /**
   * Mark lesson as completed in SCORM
   */
  const markComplete = useCallback(async (score = null) => {
    if (!scorm || !scormReady) {
      console.warn('SCORM not ready');
      return false;
    }

    try {
      scorm.setValue('cmi.completion_status', 'completed');
      
      if (score !== null) {
        scorm.setValue('cmi.score.raw', Math.min(100, Math.max(0, score)));
        scorm.setValue('cmi.score.max', 100);
        scorm.setValue('cmi.score.min', 0);
      }
      
      scorm.save();
      return true;
    } catch (error) {
      console.error('Error marking complete:', error);
      setScormError(error.message);
      return false;
    }
  }, [scorm, scormReady]);

  /**
   * Update lesson progress
   */
  const updateProgress = useCallback((location = '0', status = 'incomplete') => {
    if (!scorm || !scormReady) return;

    try {
      scorm.setValue('cmi.location', String(location));
      scorm.setValue('cmi.completion_status', status);
      scorm.save();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [scorm, scormReady]);

  return {
    scormReady,
    scormError,
    markComplete,
    updateProgress,
  };
}