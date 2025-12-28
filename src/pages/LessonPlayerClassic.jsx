import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, ChevronRight, X, CheckCircle, Target, 
  BookOpen, Menu, Maximize2, Layout, Presentation
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/CourseDetails?id=${courseId}`)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">{lesson.title}</h1>
            <p className="text-sm text-gray-500">Lesson {currentLessonIndex + 1} of {sortedLessons.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="w-4 h-4 mr-2" />
                Player Style
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
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Content
              </h3>
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
          <div className="flex-1 overflow-y-auto p-6">
            {/* Learning Objectives */}
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <div className="max-w-5xl mx-auto mb-6">
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">Learning Objectives</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                </button>
                
                {showObjectives && (
                  <div className="bg-white rounded-b-xl border border-gray-200 p-4 space-y-2">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm">{objective}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Slide Content */}
            <div className="max-w-5xl mx-auto">
              {hasSlides ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-8 min-h-[500px]">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {sortedSlides[currentSlideIndex]?.title}
                    </h2>
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex]?.content || '' }}
                    />
                  </div>
                  <div className="bg-gray-50 px-4 sm:px-8 py-4 flex items-center justify-between border-t">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Slide {currentSlideIndex + 1} of {sortedSlides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === sortedSlides.length - 1}
                      className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
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
          <footer className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-500">
                {enrollment?.completed_lessons?.length || 0} of {sortedLessons.length} completed
              </span>

              <Button
                onClick={handleNextLesson}
                disabled={!nextLesson}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}