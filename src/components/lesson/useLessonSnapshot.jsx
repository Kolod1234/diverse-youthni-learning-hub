import { useEffect, useMemo, useRef } from 'react';

const stripHtml = (html = '') => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

/**
 * Captures exactly what the learner is looking at right now — the lesson, the
 * open page, its text, their own notes and how far through the session they
 * are — as a single object the Learning Assistant can be given as context.
 */
export default function useLessonSnapshot({
  lesson,
  course,
  pageIndex = 0,
  pageCount = 0,
  pageTitle = '',
  pageHtml = '',
  note = '',
  isBookmarked = false,
  courseProgressPercent = 0
}) {
  const visitedPagesRef = useRef([]);
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    visitedPagesRef.current = [];
    sessionStartRef.current = Date.now();
  }, [lesson?.id]);

  useEffect(() => {
    if (!lesson?.id) return;
    if (!visitedPagesRef.current.includes(pageIndex)) {
      visitedPagesRef.current.push(pageIndex);
    }
  }, [lesson?.id, pageIndex]);

  return useMemo(() => {
    const pageText = stripHtml(pageHtml);
    const minutesInLesson = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));

    const snapshot = {
      capturedAt: new Date().toISOString(),
      courseTitle: course?.title || '',
      lessonTitle: lesson?.title || '',
      lessonSection: lesson?.section || '',
      learningObjectives: lesson?.learning_objectives || [],
      pageNumber: pageIndex + 1,
      pageCount,
      pageTitle,
      pageText,
      learnerNote: note || '',
      isBookmarked,
      pagesViewedThisSession: visitedPagesRef.current.length,
      minutesInLesson,
      courseProgressPercent
    };

    snapshot.asPromptContext = [
      `Course: ${snapshot.courseTitle || 'Unknown course'}`,
      `Lesson: ${snapshot.lessonTitle}${snapshot.lessonSection ? ` (${snapshot.lessonSection})` : ''}`,
      `Open page: ${snapshot.pageNumber} of ${snapshot.pageCount || 1} — "${snapshot.pageTitle || 'Untitled'}"`,
      snapshot.learningObjectives.length ? `Objectives for this lesson: ${snapshot.learningObjectives.join('; ')}` : '',
      `Session so far: ${snapshot.pagesViewedThisSession} page(s) read over about ${snapshot.minutesInLesson} minute(s); course ${snapshot.courseProgressPercent}% complete.`,
      snapshot.learnerNote ? `The learner's own notes on this page: "${snapshot.learnerNote}"` : '',
      `Text currently on the learner's screen:\n"""${pageText.slice(0, 6000)}"""`
    ].filter(Boolean).join('\n');

    return snapshot;
  }, [
    course?.title,
    lesson?.title,
    lesson?.section,
    lesson?.learning_objectives,
    pageIndex,
    pageCount,
    pageTitle,
    pageHtml,
    note,
    isBookmarked,
    courseProgressPercent
  ]);
}