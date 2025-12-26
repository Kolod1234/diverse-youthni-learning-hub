import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Presentation, ChevronLeft, ChevronRight, X, 
  CheckCircle, Target, Maximize, Minimize, Home
} from 'lucide-react';
import { toast } from 'sonner';

export default function LessonPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const courseId = params.get('course');

  // State Management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  
  const playerRef = useRef(null);

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

  // Fullscreen and Presentation handling
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

  const togglePresentation = () => {
    setIsPresenting(!isPresenting);
    toast(!isPresenting ? "Presentation Mode: ON (ESC to exit)" : "Presentation Mode: OFF");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPresenting) setIsPresenting(false);
      if (e.key === 'ArrowRight' || e.key === ' ') handleNextLesson();
      if (e.key === 'ArrowLeft') handlePrevLesson();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting]);

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

  if (lessonLoading || lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson && !lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-sm text-slate-400 mb-4">Lesson ID: {lessonId || 'Missing'}</p>
          <p className="text-sm text-slate-400 mb-4">Course ID: {courseId || 'Missing'}</p>
          {courseLessons.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-3">Available lessons in this course:</p>
              <button 
                onClick={() => {
                  const firstLesson = courseLessons.sort((a, b) => a.order - b.order)[0];
                  if (firstLesson) {
                    navigate(`/LessonPlayer?lesson=${firstLesson.id}&course=${courseId}`);
                  }
                }}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                Start First Lesson
              </button>
            </div>
          )}
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  // Get embed URL for Google Slides
  const getSlideEmbedUrl = () => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) {
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      }
    }
    return lesson.file_url || null;
  };

  const slideUrl = getSlideEmbedUrl();

  return (
    <div ref={playerRef} className={`h-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-500 ${isPresenting ? 'bg-black' : 'bg-[#f3f2f1]'}`}>
      
      {/* RIBBON HEADER (Hidden in Presentation) */}
      {!isPresenting && (
        <div className="flex-none z-50">
          {/* Top Bar */}
          <div className="bg-[#FF8C00] text-white h-10 flex items-center justify-between px-4 text-sm">
            <div className="flex items-center gap-3">
              <Presentation size={16} />
              <span className="font-semibold">{lesson?.title || 'Loading...'}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-xs">
                  <CheckCircle size={12} /> Completed
                </span>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="hover:bg-white/10 px-3 py-1 rounded transition-colors text-xs"
            >
              Exit Lesson
            </button>
          </div>
          
          {/* Toolbar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-5 gap-4">
            <div className="flex flex-col items-center p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[64px]" onClick={() => navigate(-1)}>
              <Home size={20} className="text-gray-600" />
              <span className="text-[11px] mt-1">Home</span>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="flex flex-col items-center p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[64px]" onClick={togglePresentation}>
              <Presentation size={20} className="text-gray-600" />
              <span className="text-[11px] mt-1">Present</span>
            </div>
            <div className="flex flex-col items-center p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[64px]" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={20} className="text-gray-600" /> : <Maximize size={20} className="text-gray-600" />}
              <span className="text-[11px] mt-1">Fullscreen</span>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            {!isCompleted && (
              <div className="flex flex-col items-center p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[64px]" onClick={() => markCompleteMutation.mutate()}>
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-[11px] mt-1">Complete</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exit Presentation Button */}
      {isPresenting && (
        <button 
          onClick={togglePresentation}
          className="fixed top-5 right-5 z-[100] bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded flex items-center gap-2 text-sm backdrop-blur-sm"
        >
          <X size={16} /> Exit Presentation
        </button>
      )}

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Filmstrip (Hidden in Presentation) */}
        {!isPresenting && (
          <aside className="w-52 border-r border-gray-200 bg-white overflow-y-auto flex flex-col p-3 gap-3">
            {sortedLessons.map((l, idx) => {
              const completed = enrollment?.completed_lessons?.includes(l.id);
              const isCurrent = l.id === lessonId;
              
              return (
                <div 
                  key={l.id}
                  onClick={() => navigate(`/LessonPlayer?lesson=${l.id}&course=${courseId}`)}
                  className={`relative aspect-video border rounded transition-all cursor-pointer p-1 ${
                    isCurrent 
                      ? 'border-[#FF8C00] border-2 bg-orange-50' 
                      : 'border-gray-300 hover:border-[#FF8C00]'
                  }`}
                >
                  <span className="absolute -left-4 top-0 text-[10px] text-gray-400">{idx + 1}</span>
                  {completed && (
                    <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                  )}
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[8px] text-center p-2 text-gray-600 font-bold uppercase tracking-tighter">
                    {l.title}
                  </div>
                </div>
              );
            })}
          </aside>
        )}

        {/* Stage */}
        <main className={`flex-1 flex flex-col items-center overflow-auto ${
          isPresenting ? 'p-0 bg-black justify-center' : 'bg-[#edebe9] p-10'
        }`}>
          {/* Learning Objectives (Not in Presentation Mode) */}
          {!isPresenting && lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
            <div className="w-full max-w-[960px] mb-4">
              <button
                onClick={() => setShowObjectives(!showObjectives)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-between text-left hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Learning Objectives</h3>
                    <p className="text-xs opacity-90">What you'll learn</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
              </button>
              
              {showObjectives && (
                <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-4 shadow-lg">
                  <div className="space-y-2">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm">{objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide Display */}
          <div className={`bg-white shadow-2xl relative flex flex-col transition-all duration-500 flex-none ${
            isPresenting 
              ? 'w-full h-full aspect-auto m-0 shadow-none' 
              : 'w-full max-w-[960px] aspect-video mb-10 rounded-lg'
          }`}>
            <div className="flex-1 w-full bg-black overflow-hidden relative professional-slide-stage">
              {slideUrl ? (
                <iframe 
                  src={slideUrl} 
                  className="w-full h-full border-0"
                  style={{ width: '100%', height: '100%' }}
                  allowFullScreen
                  title="Educational Slides"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>No content available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* STATUS BAR (Hidden in Presentation) */}
      {!isPresenting && (
        <footer className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600 flex-none">
          <div className="flex items-center gap-5">
            <span>Lesson {currentLessonIndex + 1} of {sortedLessons.length}</span>
            <span className="flex items-center gap-1 text-[#FF8C00] font-semibold">
              <CheckCircle size={12} /> 
              {enrollment?.completed_lessons?.length || 0} completed
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex gap-3">
              <button onClick={handlePrevLesson} disabled={!prevLesson} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextLesson} disabled={!nextLesson} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={togglePresentation} className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">
              <Presentation size={14} />
              <span>Present</span>
            </button>
            <button onClick={toggleFullscreen} className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </footer>
      )}

      {/* Mobile Navigation (Only in Presentation Mode) */}
      {isPresenting && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50 md:hidden">
          <button onClick={handlePrevLesson} disabled={!prevLesson} className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center disabled:opacity-30">
            <ChevronLeft />
          </button>
          <button onClick={handleNextLesson} disabled={!nextLesson} className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center disabled:opacity-30">
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}