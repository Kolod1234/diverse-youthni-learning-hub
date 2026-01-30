import { useEffect, useState, useCallback } from 'react';
import { useSCORMProvider } from '@code-by-dwayne/react-scorm-provider';

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
      scorm.init();
      
      // Set learning object identifier
      scorm.set('cmi.core.lesson_location', '0');
      scorm.set('cmi.core.lesson_status', 'incomplete');
      scorm.set('cmi.core.entry', 'ab-initio');
      
      setScormReady(true);
    } catch (error) {
      console.error('SCORM initialization error:', error);
      setScormError(error.message);
    }

    return () => {
      if (scorm) {
        try {
          scorm.quit();
        } catch (e) {
          console.error('SCORM quit error:', e);
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
      return;
    }

    try {
      scorm.set('cmi.core.lesson_status', 'completed');
      
      if (score !== null) {
        scorm.set('cmi.core.score.raw', Math.min(100, Math.max(0, score)));
        scorm.set('cmi.core.score.max', '100');
        scorm.set('cmi.core.score.min', '0');
      }
      
      scorm.set('cmi.core.exit', 'logout');
      scorm.save();
      
      return true;
    } catch (error) {
      console.error('Error marking complete:', error);
      setScormError(error.message);
      return false;
    }
  }, [scorm, scormReady]);

  /**
   * Update lesson progress/location
   */
  const updateProgress = useCallback((location = '0', statusType = 'incomplete') => {
    if (!scorm || !scormReady) return;

    try {
      scorm.set('cmi.core.lesson_location', String(location));
      scorm.set('cmi.core.lesson_status', statusType);
      scorm.save();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [scorm, scormReady]);

  /**
   * Set suspend data (for state persistence)
   */
  const setSuspendData = useCallback((data) => {
    if (!scorm || !scormReady) return;

    try {
      scorm.set('cmi.suspend_data', JSON.stringify(data));
      scorm.save();
    } catch (error) {
      console.error('Error setting suspend data:', error);
    }
  }, [scorm, scormReady]);

  /**
   * Get suspend data
   */
  const getSuspendData = useCallback(() => {
    if (!scorm || !scormReady) return null;

    try {
      const data = scorm.get('cmi.suspend_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting suspend data:', error);
      return null;
    }
  }, [scorm, scormReady]);

  return {
    scormReady,
    scormError,
    markComplete,
    updateProgress,
    setSuspendData,
    getSuspendData,
  };
}