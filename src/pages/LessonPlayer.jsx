import React, { useEffect, useState } from 'react';
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
  StickyNote, Trash2, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';

export default function LessonPlayer() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonId = urlParams.get('lessonId');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email,
  });

  const enrollment = enrollments[0];
  const currentLesson = lessons.find(l => l.id === lessonId) || lessons[0];
  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = enrollment?.completed_lessons?.includes(currentLesson?.id);

  // Group lessons by section
  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Getting Started';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  const completedCount = enrollment?.completed_lessons?.length || 0;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const updateEnrollmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Enrollment.update(enrollment.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    },
  });

  const markComplete = async () => {
    if (!enrollment || isCompleted) return;
    
    const newCompletedLessons = [...(enrollment.completed_lessons || []), currentLesson.id];
    const newProgress = Math.round((newCompletedLessons.length / lessons.length) * 100);
    const isNowComplete = newCompletedLessons.length === lessons.length;
    
    updateEnrollmentMutation.mutate({
      completed_lessons: newCompletedLessons,
      progress_percent: newProgress,
      current_lesson_id: nextLesson?.id || currentLesson.id,
      is_completed: isNowComplete,
      ...(isNowComplete && { completed_date: new Date().toISOString().split('T')[0] }),
    });

    // Show rating dialog after marking complete
    setShowRatingDialog(true);
  };

  const handleRatingComplete = () => {
    // Auto-navigate to next lesson after rating
    if (nextLesson) {
      setTimeout(() => {
        window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`;
      }, 500);
    }
  };

  const saveNote = () => {
    if (!enrollment || !noteContent.trim()) return;
    
    const newNotes = [...(enrollment.notes || []), {
      lesson_id: currentLesson.id,
      content: noteContent,
      timestamp: Date.now(),
    }];
    
    updateEnrollmentMutation.mutate({ notes: newNotes });
    setNoteContent('');
  };

  const currentLessonNotes = enrollment?.notes?.filter(n => n.lesson_id === currentLesson?.id) || [];

  const SidebarContent = () => (
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
                    <Link
                      key={lesson.id}
                      to={createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${lesson.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
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
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No lessons available</h2>
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block bg-white border-r border-gray-200 overflow-hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

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
                <SidebarContent />
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
            {/* Video Player Placeholder */}
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

            {/* Lesson Info */}
            <Card className="p-6 border-0 shadow-sm mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                  <p className="text-gray-600">{currentLesson.description}</p>
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

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Link to={createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${prevLesson.id}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Link to={createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
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
          <AnimatePresence>
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
          </AnimatePresence>
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