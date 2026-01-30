/**
 * SCORM 2004 API Implementation
 * Handles communication with LMS through standard SCORM API
 */

export class SCORMTracker {
  constructor() {
    this.initialized = false;
    this.API = window.API_1484_11 || window.API || null;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize SCORM connection
   */
  initialize() {
    if (this.initialized) return true;

    try {
      if (this.API && typeof this.API.Initialize === 'function') {
        const result = this.API.Initialize('');
        if (result === 'true') {
          this.initialized = true;
          console.log('SCORM initialized successfully');
          return true;
        }
      } else {
        // Fallback: Create mock API for standalone use
        this.createMockAPI();
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('SCORM initialization error:', error);
      return false;
    }
  }

  /**
   * Create mock SCORM API for standalone/non-LMS environments
   */
  createMockAPI() {
    if (window.API_1484_11) return; // Already exists

    const mockData = {};

    window.API_1484_11 = {
      Initialize: (param) => 'true',
      Terminate: (param) => 'true',
      GetValue: (element) => {
        const value = mockData[element];
        return value !== undefined ? String(value) : '';
      },
      SetValue: (element, value) => {
        mockData[element] = String(value);
        return 'true';
      },
      Commit: (param) => 'true',
      GetLastError: () => '0',
      GetErrorString: (errorCode) => 'No error',
      GetDiagnostic: (errorCode) => 'No diagnostic',
    };

    this.API = window.API_1484_11;
  }

  /**
   * Set a SCORM data value
   */
  setValue(element, value) {
    if (!this.initialized) {
      console.warn('SCORM not initialized');
      return false;
    }

    try {
      if (this.API && typeof this.API.SetValue === 'function') {
        const result = this.API.SetValue(element, String(value));
        return result === 'true';
      }
      return false;
    } catch (error) {
      console.error(`SCORM SetValue error (${element}):`, error);
      return false;
    }
  }

  /**
   * Get a SCORM data value
   */
  getValue(element) {
    if (!this.initialized) {
      console.warn('SCORM not initialized');
      return null;
    }

    try {
      if (this.API && typeof this.API.GetValue === 'function') {
        return this.API.GetValue(element) || null;
      }
      return null;
    } catch (error) {
      console.error(`SCORM GetValue error (${element}):`, error);
      return null;
    }
  }

  /**
   * Commit data to LMS
   */
  commit() {
    if (!this.initialized) return false;

    try {
      if (this.API && typeof this.API.Commit === 'function') {
        const result = this.API.Commit('');
        return result === 'true';
      }
      return false;
    } catch (error) {
      console.error('SCORM commit error:', error);
      return false;
    }
  }

  /**
   * Set lesson location (progress tracking)
   */
  setLocation(location) {
    this.setValue('cmi.location', location);
    return this.commit();
  }

  /**
   * Set completion status
   */
  setCompletionStatus(status = 'completed') {
    // Valid values: 'not attempted', 'attempted', 'completed', 'incomplete'
    this.setValue('cmi.completion_status', status);
    return this.commit();
  }

  /**
   * Set success status
   */
  setSuccessStatus(status = 'passed') {
    // Valid values: 'passed', 'failed', 'unknown'
    this.setValue('cmi.success_status', status);
    return this.commit();
  }

  /**
   * Set score
   */
  setScore(raw, min = 0, max = 100) {
    this.setValue('cmi.score.raw', Math.min(max, Math.max(min, raw)));
    this.setValue('cmi.score.min', min);
    this.setValue('cmi.score.max', max);
    return this.commit();
  }

  /**
   * Set attempt progress
   */
  setProgress(progressPercent) {
    this.setValue('cmi.progress_measure', Math.min(1, Math.max(0, progressPercent / 100)));
    return this.commit();
  }

  /**
   * Mark lesson as started
   */
  start() {
    this.setValue('cmi.completion_status', 'incomplete');
    this.setValue('cmi.entry', 'resume');
    this.setLocation('0');
    return this.commit();
  }

  /**
   * Mark lesson as completed
   */
  complete(score = null) {
    this.setCompletionStatus('completed');
    if (score !== null) {
      this.setScore(score);
      this.setSuccessStatus(score >= 70 ? 'passed' : 'failed');
    }
    this.setValue('cmi.exit', 'logout');
    return this.commit();
  }

  /**
   * Terminate SCORM session
   */
  terminate() {
    if (!this.initialized) return true;

    try {
      if (this.API && typeof this.API.Terminate === 'function') {
        const result = this.API.Terminate('');
        this.initialized = false;
        return result === 'true';
      }
      this.initialized = false;
      return true;
    } catch (error) {
      console.error('SCORM terminate error:', error);
      return false;
    }
  }

  /**
   * Get last error
   */
  getLastError() {
    try {
      if (this.API && typeof this.API.GetLastError === 'function') {
        return this.API.GetLastError();
      }
      return '0';
    } catch (error) {
      return '0';
    }
  }

  /**
   * Get error string
   */
  getErrorString(errorCode = null) {
    try {
      if (this.API && typeof this.API.GetErrorString === 'function') {
        const code = errorCode || this.getLastError();
        return this.API.GetErrorString(code);
      }
      return 'Unknown error';
    } catch (error) {
      return 'Unknown error';
    }
  }
}

// Singleton instance
let scormInstance = null;

/**
 * Get or create SCORM tracker instance
 */
export function getSCORMTracker() {
  if (!scormInstance) {
    scormInstance = new SCORMTracker();
  }
  return scormInstance;
}

/**
 * React hook for SCORM tracking
 */
import React from 'react';

export function useSCORMTracking(lessonId, courseId) {
  const [scormReady, setScormReady] = React.useState(false);

  React.useEffect(() => {
    const scorm = getSCORMTracker();
    const initialized = scorm.initialize();
    
    if (initialized) {
      scorm.start();
      setScormReady(true);
    }

    return () => {
      scorm.setCompletionStatus('incomplete');
      scorm.commit();
    };
  }, [lessonId, courseId]);

  const trackProgress = React.useCallback((currentSlide, totalSlides) => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      const progressPercent = Math.round((currentSlide / totalSlides) * 100);
      scorm.setProgress(progressPercent);
      scorm.setLocation(String(currentSlide));
    }
  }, [scormReady]);

  const markComplete = React.useCallback((score = null) => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      return scorm.complete(score);
    }
    return false;
  }, [scormReady]);

  return {
    scormReady,
    trackProgress,
    markComplete,
  };
}