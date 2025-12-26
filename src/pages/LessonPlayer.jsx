import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import UniversalSlidePlayer from '@/components/lesson/UniversalSlidePlayer';
import {
  ChevronLeft, ChevronRight, BookOpen, FileText, X, Menu,
  CheckCircle, Circle, Star, Download, Maximize, Minimize, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const courseId = params.get('course');

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);
  const [notes, setNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch course lessons for navigation
  const { data: courseLessons = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  // Find current lesson from course lessons
  const lesson = courseLessons.find(l => l.id === lessonId);

  // Fetch enrollment for progress
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      return enrollments[0];
    },
    enabled: !!courseId
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const completedLessons = enrollment.completed_lessons || [];
      if (!completedLessons.includes(lessonId)) {
        await base44.entities.Enrollment.update(enrollment.id, {
          completed_lessons: [...completedLessons, lessonId],
          progress_percent: Math.round(((completedLessons.length + 1) / courseLessons.length) * 100)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
      toast.success('Lesson marked as complete!');
    }
  });

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Navigation
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/LessonPlayer?lesson=${nextLesson.id}&course=${courseId}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      navigate(`/LessonPlayer?lesson=${prevLesson.id}&course=${courseId}`);
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next lesson
        handleNextLesson();
      } else {
        // Swiped right - go to previous lesson
        handlePrevLesson();
      }
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-slate-400 mb-4">Lesson ID: {lessonId || 'None'}</p>
          <p className="text-slate-400 mb-4">Course ID: {courseId || 'None'}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="text-white border-slate-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const slides = lesson.slides || [];
  const currentSlide = slides[currentSlideIndex];
  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  return (
    <div ref={playerRef} className="fixed inset-0 bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-14 md:h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 flex-none z-20">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white p-1 md:p-2"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <h1 className="text-xs md:text-base font-semibold truncate">{lesson.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden text-slate-400 hover:text-white p-2"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="hidden md:flex text-slate-400 hover:text-white p-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => markCompleteMutation.mutate()}
              className="bg-green-600 hover:bg-green-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-9"
            >
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Complete</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Responsive */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute lg:relative z-10 w-72 md:w-80 lg:w-72 xl:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-xl lg:shadow-none"
            >
              <div className="p-3 md:p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Course Content</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
                {sortedLessons.map((l, idx) => {
                  const completed = enrollment?.completed_lessons?.includes(l.id);
                  const isCurrent = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/LessonPlayer?lesson=${l.id}&course=${courseId}`)}
                      className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                        isCurrent
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-none mt-0.5">
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 mb-1">Lesson {idx + 1}</div>
                          <div className="font-medium truncate">{l.title}</div>
                          {l.duration_minutes && (
                            <div className="text-xs text-slate-400 mt-1">
                              {l.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className="flex-1 flex flex-col overflow-hidden bg-slate-950"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Learning Objectives */}
              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <Card className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700">
                  <button
                    onClick={() => setShowObjectives(!showObjectives)}
                    className="w-full p-4 md:p-6 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base md:text-lg">Learning Objectives</h3>
                        <p className="text-xs text-blue-200">What you'll learn in this lesson</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-blue-300 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showObjectives && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3">
                          {lesson.learning_objectives.map((objective, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                              <p className="text-blue-50 text-sm md:text-base">{objective}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Render based on content type */}
              {lesson.google_slides_url ? (
                <UniversalSlidePlayer googleSlidesUrl={lesson.google_slides_url} />
              ) : lesson.file_url ? (
                <UniversalSlidePlayer
                  fileUrl={lesson.file_url}
                  fileType={lesson.file_type}
                />
              ) : lesson.slides && lesson.slides.length > 0 ? (
                <div className="space-y-6">
                  <UniversalSlidePlayer content={currentSlide?.content} />

                  {/* Slide Navigation */}
                  {slides.length > 1 && (
                    <div className="flex items-center justify-between gap-4 bg-slate-900 p-3 rounded-xl">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="text-xs text-white border-slate-700 hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <span className="text-xs text-slate-400">
                        Slide {currentSlideIndex + 1} of {slides.length}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))
                        }
                        disabled={currentSlideIndex === slides.length - 1}
                        className="text-xs text-white border-slate-700 hover:bg-slate-800"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-8 bg-slate-900 border-slate-800 text-center">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No content available</h3>
                  <p className="text-slate-400">This lesson doesn't have any content yet.</p>
                </Card>
              )}

              {/* Resources Section */}
              {lesson.resources && lesson.resources.length > 0 && (
                <Card className="mt-6 bg-slate-900 border-slate-800 p-4 md:p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Download className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {lesson.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="flex-1 truncate">{resource.name}</span>
                        <Download className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Notes Section */}
              <Card className="mt-6 bg-slate-900 border-slate-800 p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  My Notes
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during the lesson..."
                  className="min-h-[120px] bg-slate-800 border-slate-700 text-white text-sm"
                />
              </Card>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-800 bg-slate-900 p-3 md:p-4 flex-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                className="text-xs md:text-sm text-white bg-slate-800 border-slate-700 hover:bg-slate-700 disabled:opacity-50"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="text-center flex-1 min-w-0">
                <div className="text-xs text-slate-400">
                  Lesson {currentLessonIndex + 1} of {sortedLessons.length}
                </div>
                {isCompleted && (
                  <div className="flex items-center justify-center gap-1 text-xs text-green-400 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </div>
                )}
              </div>

              <Button
                onClick={handleNextLesson}
                disabled={!nextLesson}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm disabled:opacity-50"
                size="sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}