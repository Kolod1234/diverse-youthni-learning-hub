import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Camera, Maximize, Minimize, ChevronLeft, ChevronRight, Play, Layout,
  X, CheckCircle, BookOpen, Target, FileText
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
  const [showQuiz, setShowQuiz] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const playerRef = useRef(null);
  const videoRef = useRef(null);

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
  const toggleCamera = async () => {
    try {
      if (!isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      } else {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setIsCameraOn(false);
      }
    } catch (err) {
      toast.error("Camera access required for live sessions.");
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

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
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
    <div ref={playerRef} className="fixed inset-0 flex flex-col bg-[#0f172a] text-white font-sans overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#1e293b] border-b border-slate-700 z-50">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/50">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Live Session</span>
          </div>
          <h1 className="text-sm font-semibold hidden sm:block truncate">{lesson.title}</h1>
          {isCompleted && (
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Users size={20} />
          </button>
          {!isCompleted && (
            <button 
              onClick={() => markCompleteMutation.mutate()}
              className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <CheckCircle size={14} /> Complete
            </button>
          )}
          <button 
            onClick={toggleFullscreen} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors hidden md:block"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Course Navigation */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute lg:relative z-10 w-72 bg-[#1e293b]/95 backdrop-blur-sm border-r border-slate-800 flex-col flex-none h-full flex shadow-xl lg:shadow-none"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Course Content</span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-1 hover:bg-slate-700 rounded"
                >
                  <X size={16} />
                </button>
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
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-none mt-0.5">
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 mb-1">Lesson {idx + 1}</div>
                          <div className="font-medium truncate">{l.title}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* WEBCAM PREVIEW */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`} 
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                      <Layout size={40} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={toggleCamera} 
                  className="w-full mt-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors"
                >
                  <Camera size={14} /> {isCameraOn ? 'Close Camera' : 'Open Camera'}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CENTER STAGE: Slide Viewer */}
        <main className="flex-1 flex flex-col relative bg-[#020617] overflow-hidden">
          <AnimatePresence mode="wait">
            {!showQuiz ? (
              <motion.div 
                key="slides"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-4 sm:p-8"
              >
                {/* Learning Objectives */}
                {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowObjectives(!showObjectives)}
                      className="w-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-700/50 rounded-xl p-4 flex items-center justify-between text-left hover:from-blue-900/70 hover:to-indigo-900/70 transition-all"
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
                          className="overflow-hidden bg-slate-900/50 rounded-b-xl border-x border-b border-blue-700/30 p-4"
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

                {/* Responsive Slide Frame */}
                <div className="flex-1 w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative border-4 border-slate-800">
                  {slideUrl ? (
                    <iframe 
                      src={slideUrl} 
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      title="Educational Slides"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                        <p>No content available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM CONTROLS */}
                <div className="h-20 flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevLesson}
                      disabled={!prevLesson}
                      className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20}/>
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      disabled={!nextLesson}
                      className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20}/>
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {currentLessonIndex + 1} / {sortedLessons.length}
                  </span>
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 sm:px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Take Quiz <Play size={18} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex items-center justify-center p-6"
              >
                <div className="bg-[#1e293b] p-12 rounded-[2rem] border border-slate-700 max-w-xl w-full text-center shadow-2xl">
                  <h2 className="text-3xl font-black mb-4">Quiz Time!</h2>
                  <p className="text-slate-400 mb-8 font-medium">Test what you've learned from the session.</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-lg mb-4 transition-colors">
                    Start Quiz
                  </button>
                  <button 
                    onClick={() => setShowQuiz(false)} 
                    className="text-slate-500 text-sm hover:underline"
                  >
                    Return to Lessons
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}