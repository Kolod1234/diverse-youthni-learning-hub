import { base44 } from '@/api/base44Client';
import { useEffect, useRef } from 'react';

/**
 * Hook to track detailed lesson progress
 */
export function useLessonProgressTracking(lessonId, courseId) {
  const progressRef = useRef({
    lessonStartTime: Date.now(),
    slideViewTimings: {},
    currentSlide: 0,
    sectionsExpanded: [],
    interactionsCount: 0,
    notesCreated: 0,
    lastUpdateTime: Date.now(),
  });

  const userRef = useRef(null);

  // Get user email on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      userRef.current = user?.email;
    };
    loadUser();
  }, []);

  // Record slide view
  const recordSlideView = async (slideIndex) => {
    if (!userRef.current) return;

    const now = Date.now();
    const timingKey = `slide_${slideIndex}`;

    // Calculate time spent on previous slide
    if (progressRef.current.slideViewTimings[timingKey]) {
      const previousTime = progressRef.current.slideViewTimings[timingKey];
      progressRef.current.slideViewTimings[timingKey] += (now - progressRef.current.lastUpdateTime) / 1000;
    } else {
      progressRef.current.slideViewTimings[timingKey] = 0;
    }

    progressRef.current.currentSlide = slideIndex;
    progressRef.current.lastUpdateTime = now;

    // Debounced save every 10 seconds or on significant interaction
    await debounceProgressSave();
  };

  // Record section expansion
  const recordSectionExpanded = (sectionKey) => {
    if (!progressRef.current.sectionsExpanded.includes(sectionKey)) {
      progressRef.current.sectionsExpanded.push(sectionKey);
    }
  };

  // Record interaction
  const recordInteraction = () => {
    progressRef.current.interactionsCount += 1;
  };

  // Record note creation
  const recordNoteCreated = () => {
    progressRef.current.notesCreated += 1;
  };

  // Debounced save function
  const debounceProgressSave = (() => {
    let timeout;
    return async () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await saveProgress();
      }, 10000);
    };
  })();

  // Save progress to database
  const saveProgress = async () => {
    if (!userRef.current || !lessonId || !courseId) return;

    const totalTimeSpent = (Date.now() - progressRef.current.lessonStartTime) / 1000;
    const slidesViewed = Object.keys(progressRef.current.slideViewTimings).length;

    try {
      // Check if progress record exists
      const existing = await base44.entities.LessonProgress.filter({
        lesson_id: lessonId,
        user_email: userRef.current,
        course_id: courseId,
      });

      const slideViewsArray = Object.entries(progressRef.current.slideViewTimings).map(
        ([key, time]) => ({
          slide_index: parseInt(key.split('_')[1]),
          time_on_slide_seconds: time,
          viewed_at: new Date().toISOString(),
        })
      );

      const progressData = {
        course_id: courseId,
        lesson_id: lessonId,
        user_email: userRef.current,
        time_spent_seconds: Math.round(totalTimeSpent),
        slides_viewed: slideViewsArray,
        total_slides_viewed: slidesViewed,
        sections_expanded: progressRef.current.sectionsExpanded,
        interactions_count: progressRef.current.interactionsCount,
        notes_created: progressRef.current.notesCreated,
        last_viewed_at: new Date().toISOString(),
      };

      if (existing.length > 0) {
        // Update existing record
        const record = existing[0];
        progressData.completion_status = progressData.completion_status || record.completion_status;
        progressData.first_viewed_at = record.first_viewed_at;
        await base44.entities.LessonProgress.update(record.id, progressData);
      } else {
        // Create new record
        progressData.completion_status = 'in_progress';
        progressData.first_viewed_at = new Date().toISOString();
        await base44.entities.LessonProgress.create(progressData);
      }
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  // Mark lesson as completed
  const markLessonComplete = async () => {
    if (!userRef.current || !lessonId || !courseId) return;

    try {
      const existing = await base44.entities.LessonProgress.filter({
        lesson_id: lessonId,
        user_email: userRef.current,
        course_id: courseId,
      });

      if (existing.length > 0) {
        const record = existing[0];
        await base44.entities.LessonProgress.update(record.id, {
          completion_status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [lessonId, courseId]);

  return {
    recordSlideView,
    recordSectionExpanded,
    recordInteraction,
    recordNoteCreated,
    markLessonComplete,
    saveProgress,
  };
}

/**
 * Hook to track quiz performance
 */
export function useQuizPerformanceTracking(quizId, courseId, lessonId = null) {
  const userRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      userRef.current = user?.email;
    };
    loadUser();
  }, []);

  const recordQuizAttempt = async (attemptData) => {
    if (!userRef.current) return;

    try {
      const questionsCorrect = attemptData.answers?.filter(a => a.is_correct).length || 0;
      const totalQuestions = attemptData.answers?.length || 0;
      const scorePercentage = totalQuestions > 0 ? Math.round((questionsCorrect / totalQuestions) * 100) : 0;

      // Get existing attempts to determine attempt number
      const existing = await base44.entities.QuizPerformance.filter({
        quiz_id: quizId,
        user_email: userRef.current,
        course_id: courseId,
      });

      const performanceData = {
        quiz_id: quizId,
        course_id: courseId,
        lesson_id: lessonId,
        user_email: userRef.current,
        attempt_number: existing.length + 1,
        score_raw: attemptData.score || scorePercentage,
        score_percentage: scorePercentage,
        passed: scorePercentage >= 70,
        time_spent_seconds: Math.round(attemptData.timeTakenSeconds || 0),
        questions_answered: totalQuestions,
        questions_correct: questionsCorrect,
        question_performance: attemptData.answers || [],
        attempted_at: new Date().toISOString(),
      };

      await base44.entities.QuizPerformance.create(performanceData);
      return performanceData;
    } catch (error) {
      console.error('Error recording quiz performance:', error);
      return null;
    }
  };

  return { recordQuizAttempt };
}