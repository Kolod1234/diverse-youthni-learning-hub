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
import LiveSessionView from '@/components/session/LiveSessionView';
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
      alert(`Session started! Code: ${sessionCode}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session');
    }
  };

  const handleJoinSession = (session, lesson, presenter) => {
    setLiveSession(session);
    setLiveLesson(lesson);
    setIsPresenter(presenter);
    setShowJoinDialog(false);
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
    <div className="fixed inset-0 flex flex-col h-screen w-screen bg-gray-50" style={{ overflow: 'hidden', maxWidth: '100vw' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block bg-white border-r border-gray-200 overflow-hidden flex-none"
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
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
              className="hidden lg:flex"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <div>
              <h1 className="font-semibold text-gray-900 line-clamp-1">{currentLesson.title}</h1>
              <p className="text-sm text-gray-500">{currentLesson.section || 'Getting Started'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentLesson.slides?.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresentationMode(true)}
                  className="gap-2 hidden sm:flex"
                >
                  <FileSliders className="w-4 h-4" />
                  Present
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartSession}
                  className="gap-2 bg-red-600 hover:bg-red-700 hidden sm:flex"
                >
                  <Radio className="w-4 h-4" />
                  Live
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJoinDialog(true)}
                  className="gap-2 hidden sm:flex"
                >
                  Join
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title="Fullscreen (Ctrl+F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="Keyboard Shortcuts (Ctrl+K)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <Button
              variant={showNotes ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
              title="Notes (Ctrl+N)"
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
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className={`flex-1 overflow-y-auto p-4 lg:p-8 ${showNotes ? 'lg:pr-4' : ''}`} style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* H5P Interactive Content */}
            {currentLesson.h5p_content_url ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">Interactive Learning</h2>
                        <p className="text-sm text-indigo-100">H5P Interactive Content</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white" style={{ minHeight: '600px' }}>
                    <iframe
                      src={currentLesson.h5p_content_url}
                      className="w-full h-full"
                      style={{ minHeight: '600px', border: 'none' }}
                      allowFullScreen
                      allow="geolocation *; microphone *; camera *; midi *; encrypted-media *"
                      title={currentLesson.title}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{currentLesson.duration_minutes || 15} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                        <Zap className="w-4 h-4" />
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
                className="mb-6"
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="aspect-video bg-gray-900 relative">
                    <iframe
                      src={currentLesson.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </Card>
              </motion.div>
            ) : currentLesson.description ? (
              <Card className="mb-6 p-8 border-0 shadow-lg">
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: currentLesson.description }}
                  />
                </div>
              </Card>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">{currentLesson.title}</p>
                    <p className="text-gray-400 mt-1">{currentLesson.duration_minutes || 10} minutes</p>
                    <p className="text-sm text-gray-500 mt-3">No content available</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <Card className="p-6 border-0 shadow-sm mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                  <div 
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.description }}
                  />
                </div>
                
                {!isCompleted ? (
                  <Button 
                    onClick={markComplete}
                    disabled={updateEnrollmentMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {updateEnrollmentMutation.isPending ? 'Completing...' : 'Mark Complete'}
                  </Button>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed ✓</span>
                  </motion.div>
                )}
              </div>

              {/* Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">{resource.name}</span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Interactive Elements */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Quizzes */}
              {lessonQuizzes.length > 0 && (
                <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Practice Quiz</h3>
                      <p className="text-sm text-gray-500">Test your knowledge</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {lessonQuizzes.map((quiz) => (
                      <Link key={quiz.id} to={createPageUrl('Quiz') + `?id=${quiz.id}`}>
                        <Button variant="outline" className="w-full justify-between hover:bg-white">
                          <span>{quiz.title}</span>
                          <span className="text-xs text-gray-500">{quiz.questions?.length} questions</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Discussion */}
              <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Discussion</h3>
                    <p className="text-sm text-gray-500">{lessonDiscussions.length} comments</p>
                  </div>
                </div>
                <Link to={createPageUrl('CourseDiscussion') + `?courseId=${courseId}&lessonId=${lessonId}`}>
                  <Button variant="outline" className="w-full hover:bg-white">
                    Join Discussion
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${prevLesson.id}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    Finish Course
                    <CheckCircle className="w-4 h-4" />
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

      {/* Live Session */}
      {liveSession && liveLesson && (
        <LiveSessionView
          session={liveSession}
          lesson={liveLesson}
          isPresenter={isPresenter}
          onClose={() => {
            setLiveSession(null);
            setLiveLesson(null);
            setIsPresenter(false);
          }}
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
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Presentation Header */}
            <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between border-b border-gray-700 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Slide {currentSlideIndex + 1} / {currentLesson.slides.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {lessonQuizzes.length > 0 && (
                  <Link to={createPageUrl('Quiz') + `?id=${lessonQuizzes[0].id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 gap-2">
                      <Brain className="w-4 h-4" />
                      Take Quiz
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPresentationMode(false)}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Slide Display */}
            <div className="flex-1 flex items-center justify-center relative p-6 overflow-hidden">
              <style>{`
                #slideContent {
                  scrollbar-width: thin;
                  scrollbar-color: #6366f1 #e5e7eb;
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
              <div 
                id="slideContent" 
                className="bg-white rounded-xl shadow-xl w-full h-full p-8 overflow-y-auto overflow-x-hidden"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {currentLesson.slides[currentSlideIndex]?.title}
                </h2>
                <div 
                  className="prose prose-base md:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.slides[currentSlideIndex]?.content || '' }}
                />
              </div>

              {/* Scroll Control Buttons - Up/Down */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('slideContent');
                    if (element) {
                      element.scrollTop -= 200;
                    }
                  }}
                  className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8 rotate-90" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('slideContent');
                    if (element) {
                      element.scrollTop += 200;
                    }
                  }}
                  className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer"
                >
                  <ChevronRight className="w-8 h-8 rotate-90" />
                </button>
              </div>

              {/* Navigation Arrows - Left/Right - Hidden, use keyboard instead */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <span>Use ← → arrow keys to navigate</span>
              </div>
            </div>

            {/* Slide Thumbnails - Bottom */}
            <div className="bg-gray-800 border-t border-gray-700 p-3 rounded-b-2xl">
              <div className="overflow-x-auto">
                <div className="flex items-center gap-3 pb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide shrink-0 font-semibold">Slides</span>
                  {currentLesson.slides.map((slide, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`shrink-0 rounded-lg border-2 transition-all ${
                        idx === currentSlideIndex
                          ? 'border-indigo-500 ring-2 ring-indigo-400'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="w-32 aspect-video bg-white p-2 rounded-md flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500 mb-1">Slide {idx + 1}</span>
                        <span className="text-xs font-medium text-gray-900 line-clamp-1 text-center">
                          {slide.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}