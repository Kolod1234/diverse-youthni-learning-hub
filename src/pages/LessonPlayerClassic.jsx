import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
        ChevronLeft, ChevronRight, X, CheckCircle, Target, 
        BookOpen, Menu, Maximize2, Layout, Presentation, ClipboardCheck, ZoomIn, ZoomOut, Minimize2
      } from 'lucide-react';
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

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // First fetch the lesson to get its course_id
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons;
    },
    enabled: !!lessonId
  });

  const lesson = currentLessonArray[0];
  
  // Use course_id from lesson if URL doesn't have it
  const courseId = urlCourseId || lesson?.course_id;

  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      return enrollments[0];
    },
    enabled: !!courseId
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['lessonQuizzes', lessonId],
    queryFn: () => base44.entities.Quiz.filter({ lesson_id: lessonId }),
    enabled: !!lessonId
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

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  const getSlideEmbedUrl = () => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) {
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&rm=minimal`;
      }
    }
    return lesson.file_url || null;
  };

  const handleFullscreen = () => {
    const elem = document.querySelector('.lesson-content-container');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  const slideUrl = getSlideEmbedUrl();
  const hasSlides = lesson.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg shadow-purple-100/50 z-30">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="hidden sm:flex"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Layout className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Player Style</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}>
                <Layout className="w-4 h-4 mr-2" />
                Classic Style (Current)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}>
                <Presentation className="w-4 h-4 mr-2" />
                PowerPoint Style
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
                    Set Classic as Default
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="absolute lg:relative z-20 w-full sm:w-80 max-w-sm h-full bg-gradient-to-b from-white to-purple-50/30 border-r border-purple-100 overflow-y-auto shadow-2xl lg:shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Content
                </h3>
                <button onClick={() => setShowSidebar(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {sortedLessons.map((l, idx) => {
                  const completed = enrollment?.completed_lessons?.includes(l.id);
                  const isCurrent = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-600 shadow-lg'
                          : 'bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Lesson {idx + 1}</div>
                          <div className="font-medium text-gray-900 text-sm">{l.title}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden lesson-content-container">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
            {/* Learning Objectives */}
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-2xl p-3 sm:p-4 flex items-center justify-between text-sm sm:text-base hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold">Learning Objectives</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                </button>
                
                {showObjectives && (
                  <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-b-2xl border border-t-0 border-indigo-200 p-3 sm:p-4 space-y-3 shadow-lg">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                        <div className="p-1 bg-green-100 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 shrink-0" />
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
              <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
                <button
                  onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-2xl p-3 sm:p-4 flex items-center justify-between text-sm sm:text-base hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transform hover:scale-[1.02]"
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

            {/* Slide Content */}
            <div className="max-w-5xl mx-auto">
              {hasSlides ? (
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
                        <div className="bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden border-2 border-purple-100 ring-4 ring-purple-50">
                          <div className="p-4 sm:p-8 min-h-[300px] sm:min-h-[500px] space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {sortedSlides[currentSlideIndex]?.title || 'Untitled Slide'}
                    </h2>
                    
                    {sortedSlides[currentSlideIndex]?.content && (
                      <div 
                        className="prose prose-sm sm:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex].content }}
                      />
                    )}
                    
                    {/* Slide Images */}
                    {sortedSlides[currentSlideIndex]?.imageUrl && (
                      <div className="mt-6">
                        <img 
                          src={sortedSlides[currentSlideIndex].imageUrl} 
                          alt="Slide visual" 
                          className="w-full rounded-xl shadow-lg"
                        />
                      </div>
                    )}
                    
                    {/* Mermaid Diagrams */}
                    {sortedSlides[currentSlideIndex]?.diagramCode && (
                      <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                        <div dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex].diagramCode }} />
                      </div>
                    )}
                    
                    {/* Labeled Illustrations */}
                    {sortedSlides[currentSlideIndex]?.labeledIllustration?.generatedUrl && (
                      <div className="mt-6">
                        <img 
                          src={sortedSlides[currentSlideIndex].labeledIllustration.generatedUrl} 
                          alt="Educational diagram" 
                          className="w-full rounded-xl shadow-lg"
                        />
                      </div>
                    )}
                    
                    {/* Slide Videos */}
                    {sortedSlides[currentSlideIndex]?.videoUrl && (
                      <div className="mt-6">
                        <video 
                          src={sortedSlides[currentSlideIndex].videoUrl} 
                          controls 
                          className="w-full rounded-xl shadow-lg"
                        />
                      </div>
                    )}
                    
                    {/* Slide Audio */}
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
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-t border-purple-200 gap-2">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transition-all active:scale-95 transform hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Slide {currentSlideIndex + 1} of {sortedSlides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === sortedSlides.length - 1}
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transition-all active:scale-95 transform hover:scale-105"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  </div>
                  </TransformComponent>
                  </>
                  )}
                  </TransformWrapper>
                  ) : slideUrl ? (
                  <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl shadow-purple-200/50 border-2 border-purple-100 ring-4 ring-purple-50" style={{ paddingTop: '56.25%' }}>
                  <iframe 
                  src={slideUrl} 
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen={true}
                  allow="fullscreen"
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  title="Lesson Content"
                  />
                  </div>
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
          <footer className="bg-white/80 backdrop-blur-xl border-t border-purple-100 px-3 sm:px-6 py-3 sm:py-4 shadow-lg shadow-purple-100/50 z-30">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handlePrevLesson}
                  disabled={!prevLesson}
                  size="sm"
                  className="flex-1 sm:flex-none border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold text-purple-700"
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <Button
                  onClick={handleNextLesson}
                  disabled={!nextLesson}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transform hover:scale-105 font-bold"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 sm:ml-2" />
                </Button>
              </div>

              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                {enrollment?.completed_lessons?.length || 0} of {sortedLessons.length} completed
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}