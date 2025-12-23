import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, Pause, ChevronLeft, ChevronRight, CheckCircle, 
  BookOpen, Clock, FileText, Download, X, Menu, Lock,
  StickyNote, Trash2, Save, Brain, MessageCircle, Code, FileSliders, Radio,
  Maximize, Minimize, Keyboard, Volume2, Settings, Zap
} from 'lucide-react';
import JoinSessionDialog from '@/components/session/JoinSessionDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';

// Helper component for keyboard shortcuts
function ShortcutItem({ keys, description }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, idx) => (
          <React.Fragment key={idx}>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-800">
              {key}
            </kbd>
            {idx < keys.length - 1 && <span className="text-gray-400">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// SIDEBAR COMPONENT OUTSIDE - STABLE
const SidebarContent = React.memo(({ course, completedCount, lessons, progressPercent, sections, enrollment, currentLesson, courseId, isLessonAccessible }) => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b border-gray-100">
      <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
        <h2 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
          {course?.title}
        </h2>
      </Link>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{completedCount}/{lessons.length} lessons</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
      
      {/* Module Progress */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Section Progress
        </h4>
        {Object.entries(sections).map(([sectionName, sectionLessons]) => {
          const sectionCompleted = sectionLessons.filter(l => 
            enrollment?.completed_lessons?.includes(l.id)
          ).length;
          const sectionProgress = Math.round((sectionCompleted / sectionLessons.length) * 100);
          
          return (
            <div key={sectionName} className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className="truncate">{sectionName}</span>
                <span className="shrink-0 ml-2">{sectionProgress}%</span>
              </div>
              <Progress value={sectionProgress} className="h-1" />
            </div>
          );
        })}
      </div>
    </div>
    
    <ScrollArea className="flex-1">
      <div className="p-4">
        {Object.entries(sections).map(([sectionName, sectionLessons]) => (
          <div key={sectionName} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {sectionName}
            </h3>
            <div className="space-y-1">
              {sectionLessons.map((lesson) => {
                const isActive = lesson.id === currentLesson?.id;
                const isLessonCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                const canAccess = isLessonAccessible(lesson);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (canAccess) {
                        window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${lesson.id}`;
                      }
                    }}
                    disabled={!canAccess}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : canAccess
                        ? 'hover:bg-gray-50 text-gray-700'
                        : 'opacity-50 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    {isLessonCompleted ? (
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    ) : !canAccess ? (
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <Lock className="w-3 h-3 text-amber-600" />
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Play className="w-3 h-3 text-white ml-0.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Play className="w-3 h-3 text-gray-400 ml-0.5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-600' : ''}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lesson.duration_minutes || 10} min
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
));

export default function LessonPlayer() {
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonId = urlParams.get('lessonId');

  // ALL STATE HOOKS - UNCONDITIONAL
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [liveSession, setLiveSession] = useState(null);
  const [liveLesson, setLiveLesson] = useState(null);
  const [isPresenter, setIsPresenter] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [showLivePanel, setShowLivePanel] = useState(false);

  // ALL EFFECT HOOKS - UNCONDITIONAL
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // ALL QUERY HOOKS - UNCONDITIONAL (with enabled flags)
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email,
  });

  const { data: lessonQuizzes = [] } = useQuery({
    queryKey: ['lesson-quizzes', courseId, lessonId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId, lesson_id: lessonId, is_published: true }),
    enabled: !!courseId && !!lessonId,
  });

  const { data: lessonDiscussions = [] } = useQuery({
    queryKey: ['lesson-discussions', lessonId],
    queryFn: () => base44.entities.Discussion.filter({ lesson_id: lessonId }),
    enabled: !!lessonId,
  });

  // Live session queries
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['active-sessions', lessonId],
    queryFn: () => base44.entities.LiveSession.filter({ lesson_id: lessonId, is_active: true }),
    enabled: !!lessonId && !!liveSession,
    refetchInterval: 3000
  });

  const { data: sessionParticipants = [] } = useQuery({
    queryKey: ['session-participants', liveSession?.id],
    queryFn: () => base44.entities.SessionParticipant.filter({ session_id: liveSession.id, is_active: true }),
    enabled: !!liveSession?.id,
    refetchInterval: 3000
  });

  const { data: sessionQuestions = [] } = useQuery({
    queryKey: ['session-questions', liveSession?.id],
    queryFn: () => base44.entities.SessionQuestion.filter({ session_id: liveSession.id }, '-created_date', 100),
    enabled: !!liveSession?.id,
    refetchInterval: 2000
  });

  // MUTATION HOOK - UNCONDITIONAL
  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, data }) => {
      return base44.entities.Enrollment.update(enrollmentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      return await base44.entities.LiveSession.create(sessionData);
    },
  });

  const updateSlideMutation = useMutation({
    mutationFn: ({ sessionId, slideIndex }) => base44.entities.LiveSession.update(sessionId, {
      current_slide_index: slideIndex
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-sessions']);
    }
  });

  const askQuestionMutation = useMutation({
    mutationFn: (data) => base44.entities.SessionQuestion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['session-questions']);
    }
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({ questionId, answer }) =>
      base44.entities.SessionQuestion.update(questionId, { answer, is_answered: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['session-questions']);
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.LiveSession.update(sessionId, {
      is_active: false,
      ended_at: new Date().toISOString()
    }),
    onSuccess: () => {
      setLiveSession(null);
      setIsPresenter(false);
    }
  });

  // DERIVED STATE - ALWAYS COMPUTED
  const enrollment = enrollments[0];
  const currentLesson = lessons.find(l => l.id === lessonId) || lessons[0];
  
  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = enrollment?.completed_lessons?.includes(currentLesson?.id);

  // Check if lesson is accessible (drip schedule + prerequisites)
  const isLessonAccessible = (lesson) => {
    if (!enrollment) return lesson.is_preview;

    // Check drip schedule
    if (lesson.drip_schedule_days > 0) {
      const enrollmentDate = new Date(enrollment.created_date);
      const unlockDate = new Date(enrollmentDate);
      unlockDate.setDate(unlockDate.getDate() + lesson.drip_schedule_days);
      if (new Date() < unlockDate) return false;
    }

    // Check prerequisites
    if (lesson.prerequisite_lesson_ids?.length > 0) {
      const allPrereqsCompleted = lesson.prerequisite_lesson_ids.every(
        prereqId => enrollment.completed_lessons?.includes(prereqId)
      );
      if (!allPrereqsCompleted) return false;
    }

    return true;
  };

  const canAccessCurrentLesson = currentLesson ? isLessonAccessible(currentLesson) : false;

  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Getting Started';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  const completedCount = enrollment?.completed_lessons?.length || 0;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const currentLessonNotes = enrollment?.notes?.filter(n => n.lesson_id === currentLesson?.id) || [];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Presentation mode shortcuts
      if (presentationMode && currentLesson?.slides) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.min(currentLesson.slides.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Escape') {
          setPresentationMode(false);
        }
        return;
      }

      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'n':
            e.preventDefault();
            setShowNotes(!showNotes);
            break;
          case 'k':
            e.preventDefault();
            setShowKeyboardShortcuts(!showKeyboardShortcuts);
            break;
        }
      }

      // Navigation shortcuts
      if (!e.ctrlKey && !e.metaKey && currentLesson?.slides) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.min(currentLesson.slides.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presentationMode, currentLesson?.slides, showNotes, showKeyboardShortcuts]);

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // RENDER EARLY RETURNS BEFORE EVENT HANDLERS
  if (lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No lessons available</h2>
          <div className="text-left bg-gray-800 p-4 rounded-lg mb-4 text-sm">
            <p className="text-gray-400 mb-2">Debug Info:</p>
            <p className="text-gray-400">Course ID: {courseId || 'missing'}</p>
            <p className="text-gray-400">Lesson ID: {lessonId || 'missing'}</p>
            <p className="text-gray-400">Total Lessons Found: {lessons.length}</p>
            <p className="text-gray-400">Lessons IDs: {lessons.map(l => l.id).join(', ')}</p>
            <p className="text-gray-400 mt-2">Check browser console for more details</p>
          </div>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
        </div>
        );
        }

        // Check lesson access
        if (!canAccessCurrentLesson) {
        const getDaysUntilUnlock = () => {
        if (currentLesson.drip_schedule_days > 0 && enrollment) {
        const enrollmentDate = new Date(enrollment.created_date);
        const unlockDate = new Date(enrollmentDate);
        unlockDate.setDate(unlockDate.getDate() + currentLesson.drip_schedule_days);
        const daysLeft = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 ? daysLeft : 0;
        }
        return 0;
        };

        const getPrerequisiteLessons = () => {
        if (!currentLesson.prerequisite_lesson_ids?.length) return [];
        return lessons.filter(l => currentLesson.prerequisite_lesson_ids.includes(l.id));
        };

        return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson Locked</h2>
          <p className="text-gray-400 mb-4">{currentLesson.title}</p>

          {getDaysUntilUnlock() > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
              <p className="text-amber-300">
                This lesson will unlock in {getDaysUntilUnlock()} days
              </p>
            </div>
          )}

          {getPrerequisiteLessons().length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-300 mb-2">Complete these lessons first:</p>
              <ul className="space-y-1">
                {getPrerequisiteLessons().map(prereq => (
                  <li key={prereq.id} className="text-sm">
                    {enrollment?.completed_lessons?.includes(prereq.id) ? '✓' : '○'} {prereq.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
        </div>
        );
        }

        // STABLE EVENT HANDLERS
  const markComplete = async () => {
    if (!enrollment?.id || !currentLesson?.id || isCompleted) return;
    
    const newCompletedLessons = [...(enrollment.completed_lessons || []), currentLesson.id];
    const newProgress = Math.round((newCompletedLessons.length / lessons.length) * 100);
    const isNowComplete = newCompletedLessons.length === lessons.length;
    
    updateEnrollmentMutation.mutate({
      enrollmentId: enrollment.id,
      data: {
        completed_lessons: newCompletedLessons,
        progress_percent: newProgress,
        current_lesson_id: nextLesson?.id || currentLesson.id,
        is_completed: isNowComplete,
        ...(isNowComplete && { completed_date: new Date().toISOString().split('T')[0] }),
      }
    });

    // Award points
    await awardPoints(10);

    setShowRatingDialog(true);
  };

  const awardPoints = async (points) => {
    try {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        const newPoints = (progress.points || 0) + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        await base44.entities.UserProgress.update(progress.id, {
          points: newPoints,
          level: newLevel,
          total_lessons_completed: (progress.total_lessons_completed || 0) + 1,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      } else {
        await base44.entities.UserProgress.create({
          points: points,
          level: 1,
          total_lessons_completed: 1,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      }
      
      setPointsEarned(points);
      setShowPointsAnimation(true);
    } catch (error) {
      console.error('Failed to award points:', error);
    }
  };

  const handleStartSession = async () => {
    if (!currentLesson?.slides || currentLesson.slides.length === 0) {
      alert('This lesson has no slides for live session');
      return;
    }

    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const newSession = await startSessionMutation.mutateAsync({
        lesson_id: currentLesson.id,
        course_id: courseId,
        presenter_email: user.email,
        presenter_name: user.full_name,
        session_code: sessionCode,
        started_at: new Date().toISOString(),
        current_slide_index: 0,
      });

      setLiveSession(newSession);
      setLiveLesson(currentLesson);
      setIsPresenter(true);
      setShowLivePanel(true);
      setPresentationMode(true);
      alert(`Session started! Share code: ${sessionCode}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session');
    }
  };

  const handleSlideChange = (newIndex) => {
    if (liveSession && isPresenter) {
      updateSlideMutation.mutate({ sessionId: liveSession.id, slideIndex: newIndex });
    }
    setCurrentSlideIndex(newIndex);
  };

  const handleAskQuestion = () => {
    if (!questionText.trim() || !liveSession) return;

    askQuestionMutation.mutate({
      session_id: liveSession.id,
      question: questionText,
      asker_email: user?.email,
      asker_name: user?.full_name,
      slide_index: currentSlideIndex
    });
    setQuestionText('');
  };

  const handleJoinSession = (session, lesson, presenter) => {
    setLiveSession(session);
    setLiveLesson(lesson);
    setIsPresenter(presenter);
    setShowJoinDialog(false);
    setShowLivePanel(true);
    setPresentationMode(true);
  };

  const handleRatingComplete = () => {
    if (nextLesson) {
      window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`;
    }
  };

  const saveNote = () => {
    if (!enrollment?.id || !currentLesson?.id || !noteContent.trim()) return;
    
    const newNotes = [...(enrollment.notes || []), {
      lesson_id: currentLesson.id,
      content: noteContent,
      timestamp: Date.now(),
    }];
    
    updateEnrollmentMutation.mutate({
      enrollmentId: enrollment.id,
      data: { notes: newNotes }
    });
    setNoteContent('');
  };

  // RENDER
  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden" style={{ width: '100vw', height: '100vh', maxHeight: '-webkit-fill-available' }}>
      <div className="flex flex-1 min-w-0 overflow-hidden w-full">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex bg-white border-r border-gray-200 overflow-hidden flex-none"
          >
            <SidebarContent 
              course={course}
              completedCount={completedCount}
              lessons={lessons}
              progressPercent={progressPercent}
              sections={sections}
              enrollment={enrollment}
              currentLesson={currentLesson}
              courseId={courseId}
              isLessonAccessible={isLessonAccessible}
            />
          </motion.aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
            <div className="px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent 
                  course={course}
                  completedCount={completedCount}
                  lessons={lessons}
                  progressPercent={progressPercent}
                  sections={sections}
                  enrollment={enrollment}
                  currentLesson={currentLesson}
                  courseId={courseId}
                  isLessonAccessible={isLessonAccessible}
                />
              </SheetContent>
            </Sheet>

            {/* Desktop Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex shrink-0"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <h1 className="font-semibold text-gray-900 truncate text-sm sm:text-base leading-tight">{currentLesson.title}</h1>
                  <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{currentLesson.section || 'Getting Started'}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Below on Mobile, Inline on Desktop */}
            <div className="flex sm:hidden w-full px-2 py-2 gap-2 border-t border-gray-100 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
            {currentLesson.slides?.length > 0 && !liveSession && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresentationMode(true)}
                  className="flex-1 gap-1 text-xs h-8"
                >
                  <FileSliders className="w-3 h-3" />
                  Present
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartSession}
                  className="flex-1 gap-1 bg-red-600 hover:bg-red-700 text-xs h-8"
                >
                  <Radio className="w-3 h-3" />
                  Go Live
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJoinDialog(true)}
                  className="flex-1 gap-1 text-xs h-8"
                >
                  Join
                </Button>
              </>
            )}
            {liveSession && (
              <>
                <Badge className="bg-red-500 text-white px-3 py-1.5 text-xs animate-pulse flex-none">
                  🔴 LIVE
                </Badge>
                <span className="text-xs text-gray-600 flex items-center">
                  {sessionParticipants.length} watching
                </span>
                {isPresenter && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => endSessionMutation.mutate(liveSession.id)}
                    className="text-xs h-8 ml-auto"
                  >
                    End Session
                  </Button>
                )}
              </>
            )}
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2 px-2 sm:px-4 py-2 flex-shrink-0">
            {currentLesson.slides?.length > 0 && (
              <>
                {!liveSession ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPresentationMode(true)}
                      className="gap-2"
                    >
                      <FileSliders className="w-4 h-4" />
                      <span className="hidden lg:inline">Present</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartSession}
                      className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Radio className="w-4 h-4" />
                      <span className="hidden lg:inline">Go Live</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowJoinDialog(true)}
                      className="gap-2"
                    >
                      <span className="hidden lg:inline">Join Live</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse">
                      🔴 LIVE
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {sessionParticipants.length} watching
                    </span>
                    {isPresenter && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => endSessionMutation.mutate(liveSession.id)}
                      >
                        End Session
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant={showNotes ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
              title="Notes"
              className={showNotes ? 'bg-indigo-600 text-white' : ''}
            >
              <StickyNote className="w-4 h-4" />
            </Button>
              <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </header>

          {/* Video/Content Area */}
          <div className="flex-1 flex min-w-0 overflow-hidden w-full">
          <div className={`flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 lg:p-8 ${showNotes ? 'lg:pr-4' : ''}`} style={{ WebkitOverflowScrolling: 'touch', width: '100%' }}>
            {/* H5P Interactive Content */}
            {currentLesson.h5p_content_url ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 w-full"
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold">Interactive Learning</h2>
                        <p className="text-xs sm:text-sm text-indigo-100">H5P Interactive Content</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white w-full" style={{ minHeight: '400px' }}>
                    <iframe
                      src={currentLesson.h5p_content_url}
                      className="w-full"
                      style={{ height: '400px', minHeight: '400px', border: 'none' }}
                      allowFullScreen
                      allow="geolocation *; microphone *; camera *; midi *; encrypted-media *"
                      title={currentLesson.title}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{currentLesson.duration_minutes || 15} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-indigo-600">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Interactive Content</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : currentLesson.video_url ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 w-full"
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="aspect-video bg-gray-900 relative w-full">
                    <iframe
                      src={currentLesson.video_url}
                      className="w-full h-full absolute inset-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </Card>
              </motion.div>
            ) : currentLesson.description ? (
              <Card className="mb-4 sm:mb-6 p-4 sm:p-8 border-0 shadow-lg w-full">
                <div className="max-w-4xl mx-auto w-full">
                  <div 
                    className="prose prose-sm sm:prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: currentLesson.description }}
                  />
                </div>
              </Card>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 relative w-full">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <p className="text-base sm:text-lg font-medium">{currentLesson.title}</p>
                    <p className="text-gray-400 mt-1 text-sm sm:text-base">{currentLesson.duration_minutes || 10} minutes</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">No content available</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <Card className="p-4 sm:p-6 border-0 shadow-sm mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                  <div 
                    className="text-gray-600 prose prose-sm max-w-none text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: currentLesson.description }}
                  />
                </div>
                
                {!isCompleted ? (
                  <Button 
                    onClick={markComplete}
                    disabled={updateEnrollmentMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="truncate">{updateEnrollmentMutation.isPending ? 'Completing...' : 'Mark Complete'}</span>
                  </Button>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 sm:px-4 py-2 rounded-lg w-full sm:w-auto justify-center"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Completed ✓</span>
                  </motion.div>
                )}
              </div>

              {/* Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="border-t border-gray-100 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Resources</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">{resource.name}</span>
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Interactive Elements */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
              {/* Quizzes */}
              {lessonQuizzes.length > 0 && (
                <Card className="p-4 sm:p-6 border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Practice Quiz</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Test your knowledge</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {lessonQuizzes.map((quiz) => (
                      <Link key={quiz.id} to={createPageUrl('Quiz') + `?id=${quiz.id}`}>
                        <Button variant="outline" className="w-full justify-between hover:bg-white text-xs sm:text-sm h-auto py-2">
                          <span className="truncate">{quiz.title}</span>
                          <span className="text-xs text-gray-500 ml-2">{quiz.questions?.length}q</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Discussion */}
              <Card className="p-4 sm:p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Discussion</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{lessonDiscussions.length} comments</p>
                  </div>
                </div>
                <Link to={createPageUrl('CourseDiscussion') + `?courseId=${courseId}&lessonId=${lessonId}`}>
                  <Button variant="outline" className="w-full hover:bg-white text-xs sm:text-sm h-auto py-2">
                    Join Discussion
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              {prevLesson ? (
                <Button 
                  variant="outline" 
                  className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${prevLesson.id}`}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                >
                  <span className="hidden sm:inline">Next Lesson</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              ) : (
                <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Finish Course</span>
                    <span className="sm:hidden">Finish</span>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Notes Panel */}
          {showNotes && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block bg-white border-l border-gray-200 overflow-hidden flex-none"
            >
              <div className="h-full flex flex-col p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Your Notes</h3>
                
                <div className="mb-4">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write a note about this lesson..."
                    className="min-h-24 resize-none"
                  />
                  <Button 
                    onClick={saveNote}
                    disabled={!noteContent.trim() || updateEnrollmentMutation.isPending}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="space-y-3">
                    {currentLessonNotes.map((note, i) => (
                      <Card key={i} className="p-3 bg-amber-50 border-amber-200">
                        <p className="text-sm text-gray-700">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.timestamp).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                    {currentLessonNotes.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No notes for this lesson yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </motion.aside>
          )}
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      {course && currentLesson && (
        <LessonRatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          lesson={currentLesson}
          course={course}
          onComplete={handleRatingComplete}
        />
      )}

      {showPointsAnimation && (
        <PointsAnimation 
          points={pointsEarned}
          onComplete={() => setShowPointsAnimation(false)}
        />
      )}

      {/* Join Session Dialog */}
      {showJoinDialog && user && (
        <JoinSessionDialog
          user={user}
          onJoinSession={handleJoinSession}
          onClose={() => setShowJoinDialog(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowKeyboardShortcuts(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <ShortcutItem keys={['←', '→']} description="Navigate slides" />
              <ShortcutItem keys={['Ctrl', 'F']} description="Toggle fullscreen" />
              <ShortcutItem keys={['Ctrl', 'N']} description="Toggle notes" />
              <ShortcutItem keys={['Ctrl', 'K']} description="Show shortcuts" />
              <ShortcutItem keys={['Space']} description="Next slide (presentation)" />
              <ShortcutItem keys={['Esc']} description="Exit presentation" />
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm text-indigo-900">
                <strong>Tip:</strong> Use keyboard shortcuts for faster navigation and a better learning experience!
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Presentation Mode */}
      {presentationMode && currentLesson.slides?.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex" style={{ overflow: 'hidden', width: '100vw', height: '100vh', maxHeight: '-webkit-fill-available' }}>
          {/* Main presentation area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Presentation Header */}
            <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between border-b border-gray-700 flex-none">
              <div className="flex items-center gap-4">
                {liveSession && (
                  <>
                    <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse">
                      🔴 LIVE
                    </Badge>
                    <span className="text-xs text-gray-400">Code: {liveSession.session_code}</span>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{sessionParticipants.length} watching</span>
                    </div>
                  </>
                )}
                <span className="text-sm font-medium">Slide {currentSlideIndex + 1} / {currentLesson.slides.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {liveSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLivePanel(!showLivePanel)}
                    className="text-white hover:bg-gray-700 gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Q&A ({sessionQuestions.length})
                  </Button>
                )}
                {lessonQuizzes.length > 0 && (
                  <Link to={createPageUrl('Quiz') + `?id=${lessonQuizzes[0].id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 gap-2">
                      <Brain className="w-4 h-4" />
                      Quiz
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPresentationMode(false);
                    setShowLivePanel(false);
                  }}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Slide Display */}
            <div className="flex-1 flex items-center justify-center relative p-6 overflow-hidden min-h-0 bg-gray-950">
              <style>{`
                #slideContent {
                  scrollbar-width: thin;
                  scrollbar-color: #6366f1 #e5e7eb;
                  max-width: 100%;
                }
                #slideContent::-webkit-scrollbar {
                  width: 12px;
                  height: 12px;
                }
                #slideContent::-webkit-scrollbar-track {
                  background: #e5e7eb;
                  border-radius: 6px;
                }
                #slideContent::-webkit-scrollbar-thumb {
                  background: #6366f1;
                  border-radius: 6px;
                }
                #slideContent::-webkit-scrollbar-thumb:hover {
                  background: #4f46e5;
                }
              `}</style>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  id="slideContent" 
                  className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl aspect-video p-8 overflow-y-auto overflow-x-hidden relative"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {currentLesson.slides[currentSlideIndex]?.title}
                  </h2>
                  <div 
                    className="prose prose-base md:prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.slides[currentSlideIndex]?.content || '' }}
                  />

                  {/* Presenter controls */}
                  {liveSession && isPresenter && (
                    <>
                      <button
                        onClick={() => handleSlideChange(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900/80 hover:bg-gray-900 disabled:opacity-20 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSlideChange(Math.min(currentLesson.slides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === currentLesson.slides.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900/80 hover:bg-gray-900 disabled:opacity-20 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {liveSession && !isPresenter && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-lg">
                  Presenter is in control
                </div>
              )}
            </div>

            {/* Slide Thumbnails - Bottom */}
            {(!liveSession || isPresenter) && (
              <div className="bg-gray-800 border-t border-gray-700 p-3 flex-none">
                <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                  <div className="flex items-center gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                    <span className="text-xs text-gray-400 uppercase tracking-wide shrink-0 font-semibold">Slides</span>
                    {currentLesson.slides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => liveSession && isPresenter ? handleSlideChange(idx) : setCurrentSlideIndex(idx)}
                        className={`shrink-0 rounded-lg border-2 transition-all ${
                          idx === currentSlideIndex
                            ? 'border-indigo-500 ring-2 ring-indigo-400'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="w-32 aspect-video bg-white p-2 rounded-md flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-500 mb-1">Slide {idx + 1}</span>
                          <span className="text-xs font-medium text-gray-900 line-clamp-1 text-center px-2">
                            {slide.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Live Session Panel */}
            {liveSession && showLivePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden flex-none"
            >
              <div className="flex border-b border-gray-700 flex-none">
                <button className="flex-1 px-4 py-3 text-white bg-gray-800 border-b-2 border-indigo-500 text-sm font-medium">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Q&A ({sessionQuestions.length})
                </button>
                <button className="flex-1 px-4 py-3 text-gray-400 hover:text-white text-sm">
                  <Users className="w-4 h-4 inline mr-2" />
                  Online ({sessionParticipants.length})
                </button>
              </div>

              {/* Questions */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {sessionQuestions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No questions yet</p>
                    </div>
                  ) : (
                    sessionQuestions.map((q) => (
                      <Card key={q.id} className="p-3 bg-gray-800 border-gray-700">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">{q.asker_name}</span>
                              {q.is_answered && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                            </div>
                            <p className="text-sm text-gray-300">{q.question}</p>
                            <span className="text-xs text-gray-500 mt-1">Slide {q.slide_index + 1}</span>

                            {q.is_answered && q.answer && (
                              <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Answer:</p>
                                <p className="text-sm text-white">{q.answer}</p>
                              </div>
                            )}

                            {isPresenter && !q.is_answered && (
                              <div className="mt-2">
                                <Input
                                  placeholder="Type your answer..."
                                  className="bg-gray-900 border-gray-700 text-white text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      answerQuestionMutation.mutate({
                                        questionId: q.id,
                                        answer: e.target.value
                                      });
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Ask Question Input */}
              {!isPresenter && (
                <div className="p-4 border-t border-gray-700 flex-none">
                  <div className="flex gap-2">
                    <Input
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ask a question..."
                      className="bg-gray-800 border-gray-700 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    />
                    <Button
                      onClick={handleAskQuestion}
                      disabled={!questionText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
            )}
            </div>
            )}
    </div>
  );
}