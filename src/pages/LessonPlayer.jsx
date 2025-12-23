import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, ChevronLeft, ChevronRight, CheckCircle, 
  BookOpen, Clock, FileText, Download, X, Menu, Lock,
  StickyNote, Save, Brain, MessageCircle, Zap
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import { motion } from 'framer-motion';

// Sidebar component
const CourseSidebar = ({ course, lessons, enrollment, currentLesson, courseId, sections }) => {
  const completedCount = enrollment?.completed_lessons?.length || 0;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Course Header */}
      <div className="p-4 border-b">
        <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
          <h2 className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 mb-3">
            {course?.title}
          </h2>
        </Link>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedCount}/{lessons.length} lessons</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(sections).map(([sectionName, sectionLessons]) => (
          <div key={sectionName} className="p-4 border-b">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              {sectionName}
            </h3>
            <div className="space-y-2">
              {sectionLessons.map((lesson) => {
                const isActive = lesson.id === currentLesson?.id;
                const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${lesson.id}`;
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                      isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-100' : isActive ? 'bg-indigo-600' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Play className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration_minutes || 10} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function LessonPlayer() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonId = urlParams.get('lessonId');

  const [user, setUser] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Load user
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

  // Fetch data
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

  // Mutations
  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, data }) => base44.entities.Enrollment.update(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    },
  });

  // Derived state
  const enrollment = enrollments[0];
  const currentLesson = lessons.find(l => l.id === lessonId) || lessons[0];
  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = enrollment?.completed_lessons?.includes(currentLesson?.id);
  const currentLessonNotes = enrollment?.notes?.filter(n => n.lesson_id === currentLesson?.id) || [];

  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Getting Started';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  // Handlers
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
          points,
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

  const handleRatingComplete = () => {
    if (nextLesson) {
      window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`;
    }
  };

  // Loading state
  if (lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No lessons available</h2>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button>Back to Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="flex items-center justify-between p-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <CourseSidebar 
                course={course}
                lessons={lessons}
                enrollment={enrollment}
                currentLesson={currentLesson}
                courseId={courseId}
                sections={sections}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1 text-center px-2">
            <h1 className="font-semibold text-sm truncate">{currentLesson.title}</h1>
          </div>

          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 border-r bg-white sticky top-0 h-screen overflow-hidden">
        <CourseSidebar 
          course={course}
          lessons={lessons}
          enrollment={enrollment}
          currentLesson={currentLesson}
          courseId={courseId}
          sections={sections}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-white border-b">
          <div>
            <h1 className="font-semibold text-gray-900">{currentLesson.title}</h1>
            <p className="text-sm text-gray-500">{currentLesson.section || 'Getting Started'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showNotes ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
            >
              <StickyNote className="w-4 h-4 mr-2" />
              Notes
            </Button>
            <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Video/Content */}
            {currentLesson.h5p_content_url ? (
              <Card className="mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">Interactive Content</h3>
                      <p className="text-sm text-indigo-100">H5P Interactive Learning</p>
                    </div>
                  </div>
                </div>
                <iframe
                  src={currentLesson.h5p_content_url}
                  className="w-full h-96 md:h-[500px]"
                  allowFullScreen
                  title={currentLesson.title}
                />
              </Card>
            ) : currentLesson.video_url ? (
              <Card className="mb-6 overflow-hidden">
                <div className="aspect-video bg-black">
                  <iframe
                    src={currentLesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </Card>
            ) : (
              <Card className="mb-6 p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.description || '' }}
                />
              </Card>
            )}

            {/* Lesson Details */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentLesson.duration_minutes || 10} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {currentLesson.section || 'Getting Started'}
                    </span>
                  </div>
                </div>
                
                {!isCompleted ? (
                  <Button 
                    onClick={markComplete}
                    disabled={updateEnrollmentMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>

              {/* Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Resources</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium">{resource.name}</span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Quiz and Discussion */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {lessonQuizzes.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Practice Quiz</h3>
                      <p className="text-sm text-gray-500">{lessonQuizzes[0].questions?.length} questions</p>
                    </div>
                  </div>
                  {lessonQuizzes.map((quiz) => (
                    <Link key={quiz.id} to={createPageUrl('Quiz') + `?id=${quiz.id}`}>
                      <Button variant="outline" className="w-full">
                        {quiz.title}
                      </Button>
                    </Link>
                  ))}
                </Card>
              )}

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Discussion</h3>
                    <p className="text-sm text-gray-500">{lessonDiscussions.length} comments</p>
                  </div>
                </div>
                <Link to={createPageUrl('CourseDiscussion') + `?courseId=${courseId}&lessonId=${lessonId}`}>
                  <Button variant="outline" className="w-full">
                    Join Discussion
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Notes Section - Mobile */}
            {showNotes && (
              <Card className="mb-6 p-6 md:hidden">
                <h3 className="font-semibold mb-4">Your Notes</h3>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write a note..."
                  className="mb-2"
                  rows={4}
                />
                <Button 
                  onClick={saveNote}
                  disabled={!noteContent.trim()}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
                
                {currentLessonNotes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {currentLessonNotes.map((note, i) => (
                      <div key={i} className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              {prevLesson ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${prevLesson.id}`}
                  className="flex-1 md:flex-none"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button 
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Finish Course
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Notes Sidebar */}
          {showNotes && (
            <div className="hidden md:block fixed right-0 top-0 w-80 h-screen bg-white border-l p-6 overflow-y-auto">
              <h3 className="font-semibold mb-4">Your Notes</h3>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note..."
                className="mb-2"
                rows={4}
              />
              <Button 
                onClick={saveNote}
                disabled={!noteContent.trim()}
                className="w-full mb-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              
              <div className="space-y-2">
                {currentLessonNotes.map((note, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {currentLessonNotes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No notes yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
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
    </div>
  );
}