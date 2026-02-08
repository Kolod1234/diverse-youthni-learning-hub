import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { createPageUrl } from '@/utils';
import { 
        ChevronLeft, ChevronRight, X, CheckCircle, Target, 
        BookOpen, Menu, Maximize2, Layout, Presentation, ClipboardCheck, ZoomIn, ZoomOut, Minimize2, Sparkles, Lock, Key, FileText, Search
      } from 'lucide-react';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import EnhancedMediaPlayer from '@/components/lesson/EnhancedMediaPlayer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LessonPlayerClassic() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const urlCourseId = params.get('course');

  const [showSidebar, setShowSidebar] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Touch state for swipe navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const containerRef = React.useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // First fetch the lesson to get its course_id
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
        return [];
      }
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons;
    },
    enabled: !!lessonId && lessonId !== 'null' && lessonId !== 'undefined'
  });

  const lesson = currentLessonArray[0];
  
  // Use course_id from lesson if URL doesn't have it
  const courseId = urlCourseId || lesson?.course_id;
  
  // Define slide-related variables early (before they're used in effects/handlers)
  const hasSlides = lesson?.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => {
      if (!courseId || courseId === 'null' || courseId === 'undefined') {
        return [];
      }
      return base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100);
    },
    enabled: !!courseId && courseId !== 'null' && courseId !== 'undefined'
  });

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      if (!courseId || courseId === 'null' || courseId === 'undefined') {
        return null;
      }
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      return enrollments[0];
    },
    enabled: !!courseId && courseId !== 'null' && courseId !== 'undefined'
  });

  // Check if lesson is locked
  useEffect(() => {
    if (!lesson || !enrollment || !courseLessons.length) return;
    
    // Admins and tutors can access all lessons
    if (user && (user.role === 'admin' || user.is_tutor)) {
      setIsLessonLocked(false);
      return;
    }
    
    const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
    const isFirstLesson = sortedLessons[0]?.id === lessonId;
    
    if (isFirstLesson) {
      setIsLessonLocked(false);
      return;
    }

    const unlockedLessons = enrollment.unlocked_lessons || [];
    const unlockData = unlockedLessons.find(ul => ul.lesson_id === lessonId);
    
    if (!unlockData) {
      setIsLessonLocked(true);
      return;
    }

    const now = new Date();
    const expiryDate = new Date(unlockData.expires_at);
    
    if (now > expiryDate) {
      setIsLessonLocked(true);
    } else {
      setIsLessonLocked(false);
    }
  }, [lesson, enrollment, courseLessons, lessonId, user]);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['lessonQuizzes', lessonId, courseId],
    queryFn: async () => {
      if (!courseId || courseId === 'null' || courseId === 'undefined') {
        return [];
      }
      // Get all quizzes for this course
      const allQuizzes = await base44.entities.Quiz.filter({ course_id: courseId });
      // Filter for lesson-specific or course-level quizzes
      return allQuizzes.filter(q => 
        q.lesson_id === lessonId || !q.lesson_id || q.lesson_id === 'null'
      );
    },
    enabled: !!courseId && courseId !== 'null' && courseId !== 'undefined'
  });

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

  const updateObjectivesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateLearningObjectives', { lessonId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson', lessonId]);
      toast.success('Learning objectives updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update learning objectives');
      console.error(error);
    }
  });

  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/LessonPlayerClassic?lesson=${nextLesson.id}&course=${courseId}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      navigate(`/LessonPlayerClassic?lesson=${prevLesson.id}&course=${courseId}`);
    }
  };

  const getSlideEmbedUrl = () => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) {
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&rm=minimal`;
      }
    }
    return lesson.file_url || null;
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        toast.error('Fullscreen not supported');
      }
    } else {
      document.exitFullscreen();
    }
  };

  // Touch/Swipe Logic for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Only handle swipe for custom slides, not Google Slides
    if (hasSlides) {
      if (isLeftSwipe && currentSlideIndex < sortedSlides.length - 1) {
        setCurrentSlideIndex(curr => curr + 1);
      }
      if (isRightSwipe && currentSlideIndex > 0) {
        setCurrentSlideIndex(curr => curr - 1);
      }
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // If locked, show lock screen
  if (isLessonLocked && !lessonLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
          <Card className="max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
            <p className="text-gray-600 mb-6">
              This lesson requires an unlock key. Contact your tutor to get access.
            </p>
            <Button
              onClick={() => setShowUnlockDialog(true)}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 gap-2"
            >
              <Key className="w-4 h-4" />
              Enter Unlock Key
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full mt-3"
            >
              Back to Course
            </Button>
          </Card>
        </div>
        <LessonUnlockDialog
          open={showUnlockDialog}
          onOpenChange={setShowUnlockDialog}
          lessonId={lessonId}
          courseId={courseId}
          lessonTitle={lesson?.title}
          onUnlockSuccess={() => {
            refetchEnrollment();
            setIsLessonLocked(false);
          }}
        />
      </>
    );
  }

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);
  const slideUrl = getSlideEmbedUrl();

  const filteredLessons = searchQuery 
    ? sortedLessons.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.section?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedLessons;

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-[#1e3a8a] overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button onClick={() => navigate(`/CourseDetails?id=${courseId}`)} className="p-2 hover:bg-gray-100 rounded-lg shrink-0">
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{lesson.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Lesson {currentLessonIndex + 1} of {sortedLessons.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {lesson?.google_slides_url && !(lesson?.slides && lesson.slides.length > 0) && (user?.role === 'admin' || user?.is_tutor) && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!confirm('Convert this Google Slides presentation to custom slides? This will extract text and images. Some formatting may be lost.')) return;
                toast.loading('Converting Google Slides...');
                try {
                  const response = await base44.functions.invoke('convertGoogleSlideToCustom', { lessonId });
                  if (response.data.success) {
                    toast.success(`Converted ${response.data.slideCount} slides successfully!`);
                    queryClient.invalidateQueries(['lesson', lessonId]);
                    setTimeout(() => window.location.reload(), 1000);
                  }
                } catch (error) {
                  toast.error('Failed to convert Google Slides');
                }
              }}
              className="hidden sm:flex gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Convert to Custom</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="hidden sm:flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Player Style</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}>
                <Presentation className="w-4 h-4 mr-2" />
                PowerPoint (Default)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}>
                <Layout className="w-4 h-4 mr-2" />
                Classic Style (Current)
              </DropdownMenuItem>
              {(user?.role === 'admin' || user?.is_tutor) && lesson && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await base44.entities.Lesson.update(lessonId, { 
                        default_player: 'LessonPlayerClassic' 
                      });
                      toast.success('Classic set as default for this lesson');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Set Classic as Default (Override)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isCompleted && (
            <Button 
              onClick={() => markCompleteMutation.mutate()}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:scale-105 font-semibold"
            >
              <CheckCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Mark Complete</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Enhanced Sidebar */}
        {showSidebar && (
          <aside className="fixed lg:relative z-20 w-full sm:w-80 lg:w-96 h-[calc(100vh-4rem)] lg:h-full bg-[#1e3a8a] text-white flex flex-col shadow-2xl">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="p-6 border-b border-white/20">
              <h3 className="text-lg font-bold mb-4 leading-tight">
                {lesson?.course_id || 'Course Content'}
              </h3>
              {enrollment && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE</span>
                    <span>{enrollment.completed_lessons?.length || 0}/{sortedLessons.length}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredLessons.map((l, idx) => {
                  const completed = enrollment?.completed_lessons?.includes(l.id);
                  const isCurrent = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-white/20 border-2 border-white shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4 text-[#1e3a8a]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white/40 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white/70 mb-1">Lesson {sortedLessons.findIndex(sl => sl.id === l.id) + 1}</div>
                          <div className="font-medium text-sm leading-relaxed">{l.title}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Close button for mobile */}
            <button 
              onClick={() => setShowSidebar(false)} 
              className="lg:hidden p-4 border-t border-white/20 text-center text-sm font-medium hover:bg-white/10"
            >
              Close Sidebar
            </button>
          </aside>
        )}

        {/* Main Content */}
        <main 
          className="flex-1 flex flex-col overflow-hidden lesson-content-container"
          style={{ minHeight: 0 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8" style={{ minHeight: 0 }}>
            {/* Learning Objectives */}
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <div className="max-w-5xl mx-auto mb-3 sm:mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowObjectives(!showObjectives)}
                    className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between text-xs sm:text-base hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.98] sm:hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-bold">Learning Objectives</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                  </button>
                  {(user?.role === 'admin' || user?.is_tutor) && (
                    <Button
                      onClick={() => updateObjectivesMutation.mutate()}
                      disabled={updateObjectivesMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                      size="sm"
                    >
                      {updateObjectivesMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                {showObjectives && (
                  <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-b-xl sm:rounded-b-2xl border border-t-0 border-indigo-200 p-2.5 sm:p-4 space-y-2 sm:space-y-3 shadow-lg">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-white/60 transition-colors">
                        <div className="p-0.5 sm:p-1 bg-green-100 rounded-full shrink-0">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-medium">{objective}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quiz Link */}
            {quizzes.length > 0 && (
              <div className="max-w-5xl mx-auto mb-3 sm:mb-4">
                <button
                  onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between text-xs sm:text-base hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 active:scale-[0.98] sm:hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold">Take Quiz</span>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            {/* Main Lesson Video with Enhanced Player */}
            {lesson.video_url && (
              <div className="max-w-5xl mx-auto mb-6">
                <EnhancedMediaPlayer 
                  type="video" 
                  src={lesson.video_url}
                  className="shadow-2xl"
                />
              </div>
            )}

            {/* Slide Content */}
            <div className="max-w-5xl mx-auto">
              {lesson?.slides && lesson.slides.length > 0 ? (
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={3}
                  centerOnInit={true}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="flex justify-end gap-2 mb-4">
                        <Button variant="outline" size="sm" onClick={() => zoomIn()}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => zoomOut()}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => resetTransform()}>
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <TransformComponent wrapperClass="w-full" contentClass="w-full">
                        <div className="bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden border-2 border-purple-100 ring-2 sm:ring-4 ring-purple-50">
                          <div className="p-3 sm:p-8 min-h-[250px] sm:min-h-[500px] space-y-4 sm:space-y-6">
                            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                              {sortedSlides[currentSlideIndex]?.title || 'Untitled Slide'}
                            </h2>
                            
                            {sortedSlides[currentSlideIndex]?.content && (
                              <div 
                                className="prose prose-xs sm:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900"
                                dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex].content }}
                              />
                            )}
                            
                            {sortedSlides[currentSlideIndex]?.imageUrl && (
                              <div className="mt-6">
                                <img 
                                  src={sortedSlides[currentSlideIndex].imageUrl} 
                                  alt="Slide visual" 
                                  className="w-full rounded-xl shadow-lg"
                                />
                              </div>
                            )}
                            
                            {sortedSlides[currentSlideIndex]?.diagramCode && (
                              <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                                <div dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex].diagramCode }} />
                              </div>
                            )}
                            
                            {sortedSlides[currentSlideIndex]?.labeledIllustration?.generatedUrl && (
                              <div className="mt-6">
                                <img 
                                  src={sortedSlides[currentSlideIndex].labeledIllustration.generatedUrl} 
                                  alt="Educational diagram" 
                                  className="w-full rounded-xl shadow-lg"
                                />
                              </div>
                            )}
                            
                            {sortedSlides[currentSlideIndex]?.videoUrl && (
                              <div className="mt-6">
                                <video 
                                  src={sortedSlides[currentSlideIndex].videoUrl} 
                                  controls 
                                  className="w-full rounded-xl shadow-lg"
                                />
                              </div>
                            )}
                            
                            {sortedSlides[currentSlideIndex]?.audioUrl && (
                              <div className="mt-6">
                                <audio 
                                  src={sortedSlides[currentSlideIndex].audioUrl} 
                                  controls 
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-2 sm:px-8 py-2.5 sm:py-4 flex items-center justify-between border-t border-purple-200 gap-2">
                            <button
                              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                              disabled={currentSlideIndex === 0}
                              className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl transition-all active:scale-90 sm:hover:scale-105"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                            </button>
                            <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-2">
                              {currentSlideIndex + 1} / {sortedSlides.length}
                            </span>
                            <button
                              onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                              disabled={currentSlideIndex === sortedSlides.length - 1}
                              className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl transition-all active:scale-90 sm:hover:scale-105"
                            >
                              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                            </button>
                          </div>
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              ) : slideUrl ? (
                <EnhancedMediaPlayer 
                  type={lesson.google_slides_url ? 'google-slides' : 'iframe'}
                  src={slideUrl}
                  className="shadow-2xl"
                />
              ) : (
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl shadow-xl border-2 border-purple-100 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No content available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <footer className="flex-none bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm z-30">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 relative">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                size="lg"
                className="h-12 px-6 font-semibold"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <span className="text-sm font-medium text-gray-600 text-center absolute left-1/2 -translate-x-1/2 hidden sm:block">
                {enrollment?.completed_lessons?.length || 0} of {sortedLessons.length} completed
              </span>

              <Button
                onClick={handleNextLesson}
                disabled={!nextLesson}
                size="lg"
                className="h-12 px-6 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 font-semibold"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </footer>
        </main>
      </div>

      <LessonUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        lessonId={lessonId}
        courseId={courseId}
        lessonTitle={lesson?.title}
        onUnlockSuccess={() => {
          refetchEnrollment();
          setIsLessonLocked(false);
        }}
      />
    </div>
  );
}