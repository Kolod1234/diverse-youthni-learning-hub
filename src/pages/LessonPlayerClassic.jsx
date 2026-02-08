import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ChevronLeft, ChevronRight, Check, ChevronDown, Menu, Search, X
} from 'lucide-react';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import EnhancedMediaPlayer from '@/components/lesson/EnhancedMediaPlayer';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function LessonPlayerClassic() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const urlCourseId = params.get('course');

  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [user, setUser] = useState(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Group lessons by section
  const groupedLessons = sortedLessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Lessons';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  // Auto-expand current lesson's section
  useEffect(() => {
    if (lesson?.section && !expandedSections[lesson.section]) {
      setExpandedSections(prev => ({ ...prev, [lesson.section]: true }));
    }
  }, [lesson?.section]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/CourseDetails?id=${courseId}`)}
            className="font-semibold"
          >
            EXIT COURSE
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-[#1e3a8a] text-white transition-transform duration-300 flex flex-col`}
          style={{ marginTop: '64px' }}
        >
          {/* Search */}
          <div className="p-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>

          {/* Course Title and Progress */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-lg font-bold mb-4 leading-tight">
              {course?.title || 'Course Content'}
            </h2>
            {enrollment && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lessons */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
                <div key={section}>
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold tracking-wide hover:bg-white/10 rounded transition-colors text-left"
                  >
                    <span className="flex-1">{section}</span>
                    {expandedSections[section] ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {expandedSections[section] && (
                    <div className="space-y-1 mt-1">
                      {sectionLessons.filter(l => 
                        !searchQuery || 
                        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.section?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((l) => {
                        const completed = enrollment?.completed_lessons?.includes(l.id);
                        const isCurrent = l.id === lessonId;

                        return (
                          <div
                            key={l.id}
                            onClick={() => navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`)}
                            className={`flex items-start gap-3 px-3 py-3 rounded cursor-pointer transition-colors ${
                              isCurrent ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}
                          >
                            <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                              <Menu className="w-4 h-4 text-white/60" />
                            </div>
                            <p className="flex-1 text-sm leading-relaxed">
                              {l.title}
                            </p>
                            {completed && (
                              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-[#1e3a8a]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat with us */}
          <div className="p-4 border-t border-white/20">
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <span className="text-2xl">👋</span>
              <span className="text-sm font-medium">Chat with us</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
            style={{ marginTop: '64px' }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-5xl mx-auto px-8 py-12">
            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm p-12">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light leading-tight text-gray-800 mb-8">
                  {lesson.title}
                </h1>
              </div>

              {/* Description */}
              {lesson.description && (
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {lesson.description}
                </p>
              )}

              {/* Media Player */}
              {lesson.video_url && (
                <div className="my-8">
                  <EnhancedMediaPlayer
                    type="video"
                    src={lesson.video_url}
                  />
                </div>
              )}

              {lesson.google_slides_url && (
                <div className="my-8">
                  <EnhancedMediaPlayer
                    type="google-slides"
                    src={lesson.google_slides_url.includes('/embed') 
                      ? lesson.google_slides_url 
                      : lesson.google_slides_url.replace('/edit', '/embed')}
                  />
                </div>
              )}

              {lesson.file_url && !lesson.video_url && !lesson.google_slides_url && (
                <div className="my-8">
                  <EnhancedMediaPlayer
                    type="iframe"
                    src={lesson.file_url}
                  />
                </div>
              )}

              {/* Learning Objectives */}
              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <ul className="space-y-6 mt-8">
                  {lesson.learning_objectives.map((objective, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="text-[#1e3a8a] text-2xl flex-shrink-0 mt-1">•</span>
                      <div>
                        <span className="text-lg text-gray-700">{objective}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
              >
                ← Previous
              </Button>
              <Button 
                size="lg" 
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
                onClick={handleNextLesson}
                disabled={!nextLesson}
              >
                Next →
              </Button>
            </div>
          </div>
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