/**
 * SCORM 1.2 and 2004 API Implementation
 * Handles communication with LMS through standard SCORM API
 * Supports both SCORM 1.2 and SCORM 2004 standards
 */

export class SCORMTracker {
  constructor() {
    this.initialized = false;
    this.version = null;
    this.API = null;
    this.sessionId = this.generateSessionId();
    this.errorLog = [];
    this.lastCommitTime = null;
    this.autoCommitInterval = null;
    
    // Detect SCORM version and API
    this.detectAPI();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect which SCORM API is available
   */
  detectAPI() {
    // Check for SCORM 2004 (API_1484_11)
    if (window.API_1484_11) {
      this.API = window.API_1484_11;
      this.version = '2004';
      console.log('SCORM 2004 API detected');
      return;
    }

    // Check for SCORM 1.2 (API)
    if (window.API) {
      this.API = window.API;
      this.version = '1.2';
      console.log('SCORM 1.2 API detected');
      return;
    }

    // Search in parent frames for SCORM API
    const api = this.findAPI(window);
    if (api) {
      this.API = api.apiObject;
      this.version = api.version;
      console.log(`SCORM ${api.version} API found in parent window`);
    }
  }

  /**
   * Recursively search for SCORM API in parent windows
   */
  findAPI(win) {
    let tries = 0;
    const maxTries = 500;

    while (win.parent && win.parent !== win && tries < maxTries) {
      tries++;
      
      // Check for SCORM 2004
      if (win.parent.API_1484_11) {
        return { apiObject: win.parent.API_1484_11, version: '2004' };
      }
      
      // Check for SCORM 1.2
      if (win.parent.API) {
        return { apiObject: win.parent.API, version: '1.2' };
      }
      
      win = win.parent;
    }
    
    return null;
  }

  /**
   * Log errors for debugging
   */
  logError(context, errorCode, errorMsg) {
    const error = {
      timestamp: new Date().toISOString(),
      context,
      errorCode,
      errorMsg,
    };
    this.errorLog.push(error);
    console.error(`SCORM Error [${context}]:`, errorMsg, `(Code: ${errorCode})`);
  }

  /**
   * Get all logged errors
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Initialize SCORM connection
   */
  initialize() {
    if (this.initialized) return true;

    try {
      if (!this.API) {
        this.logError('initialize', 'NO_API', 'No SCORM API found, creating mock');
        this.createMockAPI();
        this.initialized = true;
        return true;
      }

      const initFn = this.version === '1.2' ? 'LMSInitialize' : 'Initialize';
      
      if (typeof this.API[initFn] === 'function') {
        const result = this.API[initFn]('');
        
        if (result === 'true' || result === true) {
          this.initialized = true;
          console.log(`SCORM ${this.version} initialized successfully`);
          
          // Start auto-commit every 30 seconds
          this.startAutoCommit();
          
          return true;
        } else {
          const errorCode = this.getLastError();
          const errorMsg = this.getErrorString(errorCode);
          this.logError('initialize', errorCode, errorMsg);
          return false;
        }
      }
      
      // Fallback to mock
      this.createMockAPI();
      this.initialized = true;
      return true;
    } catch (error) {
      this.logError('initialize', 'EXCEPTION', error.message);
      this.createMockAPI();
      this.initialized = true;
      return true;
    }
  }

  /**
   * Start auto-commit to prevent data loss
   */
  startAutoCommit() {
    if (this.autoCommitInterval) {
      clearInterval(this.autoCommitInterval);
    }
    
    this.autoCommitInterval = setInterval(() => {
      if (this.initialized) {
        this.commit();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop auto-commit
   */
  stopAutoCommit() {
    if (this.autoCommitInterval) {
      clearInterval(this.autoCommitInterval);
      this.autoCommitInterval = null;
    }
  }

  /**
   * Create mock SCORM API for standalone/non-LMS environments
   */
  createMockAPI() {
    const mockData = {};
    this.version = '2004'; // Default to 2004

    // Create SCORM 2004 mock API
    if (!window.API_1484_11) {
      window.API_1484_11 = {
        Initialize: () => 'true',
        Terminate: () => 'true',
        GetValue: (element) => mockData[element] !== undefined ? String(mockData[element]) : '',
        SetValue: (element, value) => {
          mockData[element] = String(value);
          console.log(`Mock SCORM Set: ${element} = ${value}`);
          return 'true';
        },
        Commit: () => 'true',
        GetLastError: () => '0',
        GetErrorString: () => 'No error',
        GetDiagnostic: () => 'No diagnostic',
      };
    }

    // Create SCORM 1.2 mock API
    if (!window.API) {
      window.API = {
        LMSInitialize: () => 'true',
        LMSFinish: () => 'true',
        LMSGetValue: (element) => mockData[element] !== undefined ? String(mockData[element]) : '',
        LMSSetValue: (element, value) => {
          mockData[element] = String(value);
          console.log(`Mock SCORM 1.2 Set: ${element} = ${value}`);
          return 'true';
        },
        LMSCommit: () => 'true',
        LMSGetLastError: () => '0',
        LMSGetErrorString: () => 'No error',
        LMSGetDiagnostic: () => 'No diagnostic',
      };
    }

    this.API = window.API_1484_11 || window.API;
    console.log(`Mock SCORM ${this.version} API created`);
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
      const setFn = this.version === '1.2' ? 'LMSSetValue' : 'SetValue';
      
      if (this.API && typeof this.API[setFn] === 'function') {
        const result = this.API[setFn](element, String(value));
        
        if (result === 'true' || result === true) {
          return true;
        } else {
          const errorCode = this.getLastError();
          const errorMsg = this.getErrorString(errorCode);
          this.logError('setValue', errorCode, `Failed to set ${element}: ${errorMsg}`);
          return false;
        }
      }
      return false;
    } catch (error) {
      this.logError('setValue', 'EXCEPTION', `Exception setting ${element}: ${error.message}`);
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
      const getFn = this.version === '1.2' ? 'LMSGetValue' : 'GetValue';
      
      if (this.API && typeof this.API[getFn] === 'function') {
        const value = this.API[getFn](element);
        
        // Check for errors
        const errorCode = this.getLastError();
        if (errorCode !== '0') {
          const errorMsg = this.getErrorString(errorCode);
          this.logError('getValue', errorCode, `Failed to get ${element}: ${errorMsg}`);
          return null;
        }
        
        return value || null;
      }
      return null;
    } catch (error) {
      this.logError('getValue', 'EXCEPTION', `Exception getting ${element}: ${error.message}`);
      return null;
    }
  }

  /**
   * Commit data to LMS
   */
  commit() {
    if (!this.initialized) return false;

    try {
      const commitFn = this.version === '1.2' ? 'LMSCommit' : 'Commit';
      
      if (this.API && typeof this.API[commitFn] === 'function') {
        const result = this.API[commitFn]('');
        
        if (result === 'true' || result === true) {
          this.lastCommitTime = Date.now();
          return true;
        } else {
          const errorCode = this.getLastError();
          const errorMsg = this.getErrorString(errorCode);
          this.logError('commit', errorCode, `Commit failed: ${errorMsg}`);
          return false;
        }
      }
      return false;
    } catch (error) {
      this.logError('commit', 'EXCEPTION', `Commit exception: ${error.message}`);
      return false;
    }
  }

  /**
   * Set lesson location (progress tracking)
   */
  setLocation(location) {
    const element = this.version === '1.2' ? 'cmi.core.lesson_location' : 'cmi.location';
    this.setValue(element, location);
    return this.commit();
  }

  /**
   * Get lesson location
   */
  getLocation() {
    const element = this.version === '1.2' ? 'cmi.core.lesson_location' : 'cmi.location';
    return this.getValue(element);
  }

  /**
   * Set bookmark (same as location but with different semantics)
   */
  setBookmark(bookmark) {
    return this.setLocation(bookmark);
  }

  /**
   * Get bookmark
   */
  getBookmark() {
    return this.getLocation();
  }

  /**
   * Set suspend data (persistent data across sessions)
   */
  setSuspendData(data) {
    const element = this.version === '1.2' ? 'cmi.suspend_data' : 'cmi.suspend_data';
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // SCORM 1.2 has a 4096 character limit on suspend_data
    if (this.version === '1.2' && dataString.length > 4096) {
      this.logError('setSuspendData', 'DATA_TOO_LARGE', `Suspend data exceeds 4096 chars (${dataString.length})`);
      return false;
    }
    
    this.setValue(element, dataString);
    return this.commit();
  }

  /**
   * Get suspend data
   */
  getSuspendData() {
    const element = this.version === '1.2' ? 'cmi.suspend_data' : 'cmi.suspend_data';
    const data = this.getValue(element);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  /**
   * Set completion status
   */
  setCompletionStatus(status = 'completed') {
    if (this.version === '1.2') {
      // SCORM 1.2 uses lesson_status instead
      // Valid: 'passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'
      const statusMap = {
        'completed': 'completed',
        'incomplete': 'incomplete',
        'not attempted': 'not attempted',
        'attempted': 'incomplete',
      };
      const scorm12Status = statusMap[status] || 'incomplete';
      this.setValue('cmi.core.lesson_status', scorm12Status);
    } else {
      // SCORM 2004: 'not attempted', 'attempted', 'completed', 'incomplete'
      this.setValue('cmi.completion_status', status);
    }
    return this.commit();
  }

  /**
   * Get completion status
   */
  getCompletionStatus() {
    if (this.version === '1.2') {
      return this.getValue('cmi.core.lesson_status');
    } else {
      return this.getValue('cmi.completion_status');
    }
  }

  /**
   * Set success status
   */
  setSuccessStatus(status = 'passed') {
    if (this.version === '1.2') {
      // SCORM 1.2 combines completion and success in lesson_status
      this.setValue('cmi.core.lesson_status', status);
    } else {
      // SCORM 2004: 'passed', 'failed', 'unknown'
      this.setValue('cmi.success_status', status);
    }
    return this.commit();
  }

  /**
   * Get success status
   */
  getSuccessStatus() {
    if (this.version === '1.2') {
      const status = this.getValue('cmi.core.lesson_status');
      if (status === 'passed' || status === 'failed') return status;
      return 'unknown';
    } else {
      return this.getValue('cmi.success_status');
    }
  }

  /**
   * Set score
   */
  setScore(raw, min = 0, max = 100) {
    const scoreRaw = Math.min(max, Math.max(min, raw));
    
    if (this.version === '1.2') {
      this.setValue('cmi.core.score.raw', scoreRaw);
      this.setValue('cmi.core.score.min', min);
      this.setValue('cmi.core.score.max', max);
    } else {
      this.setValue('cmi.score.raw', scoreRaw);
      this.setValue('cmi.score.min', min);
      this.setValue('cmi.score.max', max);
    }
    return this.commit();
  }

  /**
   * Get score
   */
  getScore() {
    if (this.version === '1.2') {
      return {
        raw: parseFloat(this.getValue('cmi.core.score.raw')) || 0,
        min: parseFloat(this.getValue('cmi.core.score.min')) || 0,
        max: parseFloat(this.getValue('cmi.core.score.max')) || 100,
      };
    } else {
      return {
        raw: parseFloat(this.getValue('cmi.score.raw')) || 0,
        min: parseFloat(this.getValue('cmi.score.min')) || 0,
        max: parseFloat(this.getValue('cmi.score.max')) || 100,
      };
    }
  }

  /**
   * Set attempt progress
   */
  setProgress(progressPercent) {
    if (this.version === '2004') {
      this.setValue('cmi.progress_measure', Math.min(1, Math.max(0, progressPercent / 100)));
    }
    // SCORM 1.2 doesn't have progress_measure, use location instead
    return this.commit();
  }

  /**
   * Get progress
   */
  getProgress() {
    if (this.version === '2004') {
      const progress = parseFloat(this.getValue('cmi.progress_measure')) || 0;
      return Math.round(progress * 100);
    }
    return 0;
  }

  /**
   * Set session time
   */
  setSessionTime(seconds) {
    // Convert seconds to SCORM time format (HH:MM:SS or PTxHxMxS)
    const time = this.formatTime(seconds);
    
    if (this.version === '1.2') {
      this.setValue('cmi.core.session_time', time);
    } else {
      this.setValue('cmi.session_time', time);
    }
    return this.commit();
  }

  /**
   * Format time for SCORM
   */
  formatTime(seconds) {
    if (this.version === '1.2') {
      // SCORM 1.2: HH:MM:SS
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      // SCORM 2004: ISO 8601 duration (PTxHxMxS)
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `PT${hours}H${minutes}M${secs}S`;
    }
  }

  /**
   * Mark lesson as started
   */
  start() {
    const entryStatus = this.getEntryStatus();
    
    if (this.version === '1.2') {
      // Check if first time or resuming
      if (entryStatus === '' || entryStatus === 'ab-initio') {
        this.setValue('cmi.core.lesson_status', 'incomplete');
        this.setValue('cmi.core.entry', 'ab-initio');
      } else {
        this.setValue('cmi.core.entry', 'resume');
      }
      this.setLocation('0');
    } else {
      // SCORM 2004
      if (entryStatus === '' || entryStatus === 'ab-initio') {
        this.setValue('cmi.completion_status', 'incomplete');
      }
      this.setValue('cmi.entry', 'resume');
      this.setLocation('0');
    }
    
    return this.commit();
  }

  /**
   * Get entry status (first time vs resume)
   */
  getEntryStatus() {
    if (this.version === '1.2') {
      return this.getValue('cmi.core.entry');
    } else {
      return this.getValue('cmi.entry');
    }
  }

  /**
   * Mark lesson as completed
   */
  complete(score = null) {
    if (this.version === '1.2') {
      if (score !== null) {
        this.setScore(score);
        this.setValue('cmi.core.lesson_status', score >= 70 ? 'passed' : 'failed');
      } else {
        this.setValue('cmi.core.lesson_status', 'completed');
      }
      this.setValue('cmi.core.exit', 'logout');
    } else {
      this.setCompletionStatus('completed');
      if (score !== null) {
        this.setScore(score);
        this.setSuccessStatus(score >= 70 ? 'passed' : 'failed');
      }
      this.setValue('cmi.exit', 'normal');
    }
    return this.commit();
  }

  /**
   * Set exit status (for proper session closure)
   */
  setExit(exitType = 'normal') {
    if (this.version === '1.2') {
      // SCORM 1.2: 'time-out', 'suspend', 'logout', ''
      const validExits = ['time-out', 'suspend', 'logout', ''];
      const exit = validExits.includes(exitType) ? exitType : 'suspend';
      this.setValue('cmi.core.exit', exit);
    } else {
      // SCORM 2004: 'time-out', 'suspend', 'logout', 'normal', ''
      this.setValue('cmi.exit', exitType);
    }
    return this.commit();
  }

  /**
   * Terminate SCORM session
   */
  terminate() {
    if (!this.initialized) return true;

    try {
      // Stop auto-commit
      this.stopAutoCommit();
      
      // Final commit before terminating
      this.commit();
      
      const terminateFn = this.version === '1.2' ? 'LMSFinish' : 'Terminate';
      
      if (this.API && typeof this.API[terminateFn] === 'function') {
        const result = this.API[terminateFn]('');
        this.initialized = false;
        
        if (result === 'true' || result === true) {
          console.log(`SCORM ${this.version} session terminated successfully`);
          return true;
        } else {
          const errorCode = this.getLastError();
          const errorMsg = this.getErrorString(errorCode);
          this.logError('terminate', errorCode, `Terminate failed: ${errorMsg}`);
          return false;
        }
      }
      
      this.initialized = false;
      return true;
    } catch (error) {
      this.logError('terminate', 'EXCEPTION', `Terminate exception: ${error.message}`);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Get last error
   */
  getLastError() {
    try {
      const errorFn = this.version === '1.2' ? 'LMSGetLastError' : 'GetLastError';
      
      if (this.API && typeof this.API[errorFn] === 'function') {
        return this.API[errorFn]();
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
      const errorFn = this.version === '1.2' ? 'LMSGetErrorString' : 'GetErrorString';
      
      if (this.API && typeof this.API[errorFn] === 'function') {
        const code = errorCode || this.getLastError();
        return this.API[errorFn](code);
      }
      return 'Unknown error';
    } catch (error) {
      return 'Unknown error';
    }
  }

  /**
   * Get diagnostic info
   */
  getDiagnostic(errorCode = null) {
    try {
      const diagFn = this.version === '1.2' ? 'LMSGetDiagnostic' : 'GetDiagnostic';
      
      if (this.API && typeof this.API[diagFn] === 'function') {
        const code = errorCode || this.getLastError();
        return this.API[diagFn](code);
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Get SCORM version
   */
  getVersion() {
    return this.version;
  }

  /**
   * Check if SCORM is available
   */
  isAvailable() {
    return this.API !== null;
  }

  /**
   * Get full diagnostic report
   */
  getDiagnosticReport() {
    return {
      version: this.version,
      initialized: this.initialized,
      apiAvailable: this.isAvailable(),
      lastCommit: this.lastCommitTime,
      errorLog: this.errorLog,
      currentLocation: this.getLocation(),
      completionStatus: this.getCompletionStatus(),
      successStatus: this.getSuccessStatus(),
      score: this.getScore(),
      suspendData: this.getSuspendData(),
    };
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
      // Load previous bookmark/location
      const bookmark = scorm.getBookmark();
      if (bookmark) {
        console.log(`Resuming from bookmark: ${bookmark}`);
      }
      
      scorm.start();
      setScormReady(true);
      
      // Log SCORM version
      console.log(`SCORM Tracking Active - Version: ${scorm.getVersion()}`);
    } else {
      console.warn('SCORM initialization failed, tracking disabled');
    }

    return () => {
      const scorm = getSCORMTracker();
      scorm.setExit('suspend');
      scorm.commit();
    };
  }, [lessonId, courseId]);

  const trackProgress = React.useCallback((currentSlide, totalSlides) => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      const progressPercent = Math.round((currentSlide / totalSlides) * 100);
      scorm.setProgress(progressPercent);
      scorm.setLocation(String(currentSlide));
      scorm.setBookmark(String(currentSlide));
    }
  }, [scormReady]);

  const markComplete = React.useCallback((score = null) => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      return scorm.complete(score);
    }
    return false;
  }, [scormReady]);

  const saveSuspendData = React.useCallback((data) => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      return scorm.setSuspendData(data);
    }
    return false;
  }, [scormReady]);

  const loadSuspendData = React.useCallback(() => {
    const scorm = getSCORMTracker();
    if (scormReady) {
      return scorm.getSuspendData();
    }
    return null;
  }, [scormReady]);

  const getDiagnostics = React.useCallback(() => {
    const scorm = getSCORMTracker();
    return scorm.getDiagnosticReport();
  }, []);

  return {
    scormReady,
    trackProgress,
    markComplete,
    saveSuspendData,
    loadSuspendData,
    getDiagnostics,
  };
}