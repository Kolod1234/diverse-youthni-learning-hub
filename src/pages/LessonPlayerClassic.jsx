import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, ChevronRight, X, CheckCircle, Target, 
  BookOpen, Menu, Maximize2, Layout, Presentation, ClipboardCheck
} from 'lucide-react';
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
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      }
    }
    return lesson.file_url || null;
  };

  const slideUrl = getSlideEmbedUrl();
  const hasSlides = lesson.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{lesson.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500">Lesson {currentLessonIndex + 1} of {sortedLessons.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Layout className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Player Style</span>
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
            </DropdownMenuContent>
          </DropdownMenu>

          {!isCompleted && (
            <Button 
              onClick={() => markCompleteMutation.mutate()}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
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
          <aside className="absolute lg:relative z-10 w-80 h-full bg-white border-r border-gray-200 overflow-y-auto shadow-xl lg:shadow-none">
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
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 border-2 border-indigo-600'
                          : 'bg-gray-50 hover:bg-gray-100'
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
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {/* Learning Objectives */}
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 sm:p-4 flex items-center justify-between text-sm sm:text-base"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold">Learning Objectives</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                </button>
                
                {showObjectives && (
                  <div className="bg-white rounded-b-xl border border-gray-200 p-3 sm:p-4 space-y-2">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-xs sm:text-sm">{objective}</p>
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
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 sm:p-8 min-h-[400px] sm:min-h-[500px]">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {sortedSlides[currentSlideIndex]?.title}
                    </h2>
                    <div 
                      className="prose prose-sm sm:prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex]?.content || '' }}
                    />
                  </div>
                  <div className="bg-gray-50 px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-t gap-2">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      Slide {currentSlideIndex + 1} of {sortedSlides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === sortedSlides.length - 1}
                      className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : slideUrl ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden aspect-video">
                  <iframe 
                    src={slideUrl} 
                    className="w-full h-full"
                    allowFullScreen
                    title="Lesson Content"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" />
                    <p>No content available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <footer className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                size="sm"
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <span className="text-xs sm:text-sm text-gray-500 text-center">
                {enrollment?.completed_lessons?.length || 0} of {sortedLessons.length} completed
              </span>

              <Button
                onClick={handleNextLesson}
                disabled={!nextLesson}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-2" />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}