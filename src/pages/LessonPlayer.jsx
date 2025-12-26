import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft, ChevronRight, X, Users, Play, Maximize, Minimize, Camera,
  CheckCircle, Circle, BookOpen, Download, Target, FileText
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);
  const [notes, setNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch all course lessons for navigation
  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  // Fetch current lesson directly by ID
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.filter({ id: lessonId }),
    enabled: !!lessonId
  });

  const lesson = currentLessonArray[0];

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

  // Camera handling
  const handleCamera = async () => {
    try {
      if (!isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      } else {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraOn(false);
      }
    } catch (err) {
      toast.error("Camera access failed. Please check permissions.");
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
        handleNextLesson();
      } else {
        handlePrevLesson();
      }
    }
  };

  if (lessonLoading || lessonsLoading) {
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

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);
  const slides = lesson.slides || [];

  // Get embed URL for Google Slides
  const getSlideEmbedUrl = () => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) {
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      }
    }
    return null;
  };

  const slideEmbedUrl = getSlideEmbedUrl();

  return (
    <div ref={playerRef} className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 flex-none z-10">
        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-medium truncate">{lesson.title}</h1>
          {isCompleted && (
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white hidden md:flex"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => markCompleteMutation.mutate()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Course Navigation */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute lg:relative z-10 w-72 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col h-full shadow-xl lg:shadow-none"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
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

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sortedLessons.map((l, idx) => {
                  const completed = enrollment?.completed_lessons?.includes(l.id);
                  const isCurrent = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        navigate(`/LessonPlayer?lesson=${l.id}&course=${courseId}`);
                        setShowSidebar(false);
                      }}
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

              {/* Webcam Preview */}
              <div className="p-2 bg-black border-t border-slate-800 relative aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover rounded ${!isCameraOn && 'hidden'}`} 
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-900 rounded">
                    <Camera size={32} />
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main 
          className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!showQuiz ? (
            <div className="flex-1 flex flex-col p-4">
              {/* Learning Objectives */}
              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowObjectives(!showObjectives)}
                    className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 rounded-xl p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Learning Objectives</h3>
                        <p className="text-xs text-blue-200">What you'll learn</p>
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
                        className="overflow-hidden bg-slate-900 rounded-b-xl border-x border-b border-blue-700/50 p-4"
                      >
                        <div className="space-y-2">
                          {lesson.learning_objectives.map((objective, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                              <p className="text-blue-50 text-sm">{objective}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Slide Display */}
              <div className="flex-1 w-full relative bg-white rounded-xl overflow-hidden shadow-2xl">
                {slideEmbedUrl ? (
                  <iframe 
                    src={slideEmbedUrl} 
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    title="Lesson Slides"
                  />
                ) : lesson.file_url ? (
                  <iframe 
                    src={lesson.file_url} 
                    className="absolute top-0 left-0 w-full h-full border-0"
                    title="Lesson Content"
                  />
                ) : slides.length > 0 ? (
                  <div className="absolute inset-0 p-8 overflow-auto bg-slate-900">
                    <div 
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex]?.content }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4" />
                      <p>No content available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="h-16 flex items-center justify-between px-2 flex-none mt-4">
                <button 
                  onClick={handleCamera} 
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <Camera size={16} /> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                </button>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    className="text-white bg-slate-800 border-slate-700 hover:bg-slate-700"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-xs text-slate-400">
                    {currentLessonIndex + 1} / {sortedLessons.length}
                  </span>

                  <Button
                    onClick={handleNextLesson}
                    disabled={!nextLesson}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-lg w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Ready for the Quiz?</h2>
                <p className="text-slate-400 mb-8">Test your understanding of this lesson.</p>
                <div className="flex flex-col gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                    Start Quiz
                  </Button>
                  <button 
                    onClick={() => setShowQuiz(false)} 
                    className="text-slate-500 hover:text-white text-sm"
                  >
                    Review Content Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}