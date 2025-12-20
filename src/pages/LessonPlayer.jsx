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
  StickyNote, Trash2, Save, Brain, MessageCircle, Code, FileSliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';

// SIDEBAR COMPONENT OUTSIDE - STABLE
const SidebarContent = React.memo(({ course, completedCount, lessons, progressPercent, sections, enrollment, currentLesson, courseId }) => (
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
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${lesson.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isLessonCompleted ? (
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
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
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId, lesson_id: lessonId }),
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

  // DERIVED STATE - ALWAYS COMPUTED
  const enrollment = enrollments[0];
  const currentLesson = useMemo(() => 
    lessons.find(l => l.id === lessonId) || lessons[0],
    [lessons, lessonId]
  );
  
  const currentIndex = useMemo(() => 
    lessons.findIndex(l => l.id === currentLesson?.id),
    [lessons, currentLesson]
  );
  
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  
  const isCompleted = useMemo(() => 
    enrollment?.completed_lessons?.includes(currentLesson?.id),
    [enrollment, currentLesson]
  );

  const sections = useMemo(() => 
    lessons.reduce((acc, lesson) => {
      const section = lesson.section || 'Getting Started';
      if (!acc[section]) acc[section] = [];
      acc[section].push(lesson);
      return acc;
    }, {}),
    [lessons]
  );

  const completedCount = enrollment?.completed_lessons?.length || 0;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const currentLessonNotes = useMemo(() => 
    enrollment?.notes?.filter(n => n.lesson_id === currentLesson?.id) || [],
    [enrollment, currentLesson]
  );

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

    setShowRatingDialog(true);
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No lessons available</h2>
          <p className="text-gray-400 mb-4">Course ID: {courseId}, Lesson ID: {lessonId}</p>
          <p className="text-gray-400 mb-4">Total Lessons Found: {lessons.length}</p>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block bg-white border-r border-gray-200 overflow-hidden"
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
          />
        </motion.aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
            <Button
              variant={showNotes ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className={showNotes ? 'bg-indigo-600' : ''}
            >
              <StickyNote className="w-4 h-4 mr-2" />
              Notes
            </Button>
            
            <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Video/Content Area */}
        <div className="flex-1 flex">
          <div className={`flex-1 p-4 lg:p-8 ${showNotes ? 'lg:pr-4' : ''}`}>
            {/* Content Display - Slides or Video */}
            {currentLesson.slides?.length > 0 ? (
              <Card className="mb-6 border-0 shadow-lg overflow-hidden">
                {/* Slide Content */}
                <div className="bg-white p-8 min-h-[500px]">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      {currentLesson.slides[currentSlideIndex]?.title}
                    </h2>
                    <div 
                      className="prose prose-lg max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: currentLesson.slides[currentSlideIndex]?.content || '' }}
                    />
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Slide
                  </Button>

                  <div className="flex items-center gap-2">
                    <FileSliders className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Slide {currentSlideIndex + 1} of {currentLesson.slides.length}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlideIndex(Math.min(currentLesson.slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === currentLesson.slides.length - 1}
                  >
                    Next Slide
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-6 relative">
                {currentLesson.video_url ? (
                  <iframe
                    src={currentLesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                      <p className="text-lg font-medium">{currentLesson.title}</p>
                      <p className="text-gray-400 mt-1">{currentLesson.duration_minutes || 10} minutes</p>
                    </div>
                  </div>
                )}
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
              className="hidden lg:block bg-white border-l border-gray-200 overflow-hidden"
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

      {/* Rating Dialog */}
      <LessonRatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        lesson={currentLesson}
        course={course}
        onComplete={handleRatingComplete}
      />
    </div>
  );
}