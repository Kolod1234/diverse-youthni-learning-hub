import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, ChevronRight, CheckCircle, X, Trophy, Star, Brain, Zap,
  MessageCircle, ArrowRight, ArrowLeft, Home, Bookmark, MessageSquare, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import EmbeddedQuiz from '@/components/quiz/EmbeddedQuiz';
import InlineQuiz from '@/components/lesson/InlineQuiz';
import CodePlayground from '@/components/lesson/CodePlayground';
import LessonQA from '@/components/lesson/LessonQA';
import GoogleSlidePlayer from '@/components/lesson/GoogleSlidePlayer';

export default function LessonPlayer() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonId = urlParams.get('lessonId');

  const [user, setUser] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQA, setShowQA] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [viewMode, setViewMode] = useState('slides'); // 'slides' or 'googleslides'

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
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = enrollment?.completed_lessons?.includes(currentLesson?.id);

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['course-quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId, is_published: true }),
    enabled: !!courseId,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', lessonId, user?.email],
    queryFn: () => base44.entities.LessonBookmark.filter({ lesson_id: lessonId, created_by: user?.email }),
    enabled: !!lessonId && !!user?.email,
  });

  const bookmarkMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonBookmark.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', lessonId]);
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id) => base44.entities.LessonBookmark.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', lessonId]);
    },
  });

  // Filter quizzes that match this lesson by ID, section, or title
  const lessonQuizzes = React.useMemo(() => {
    if (!currentLesson) return [];
    return allQuizzes.filter(quiz => {
      if (quiz.lesson_id === currentLesson.id) return true;
      if (quiz.topic === currentLesson.section) return true;
      if (quiz.topic === currentLesson.title) return true;
      return false;
    });
  }, [allQuizzes, currentLesson]);
  
  // Create slides from lesson content
  const slides = currentLesson?.slides || [];
  const totalSlides = slides.length;
  const progressPercent = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;

  // Check if current slide is bookmarked
  React.useEffect(() => {
    const isBookmarked = bookmarks.some(b => b.slide_index === currentSlideIndex);
    setBookmarked(isBookmarked);
  }, [bookmarks, currentSlideIndex]);

  // Touch handlers for mobile swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setDirection(1);
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleTakeQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setSelectedQuiz(null);
  };

  const handleToggleBookmark = () => {
    const existingBookmark = bookmarks.find(b => b.slide_index === currentSlideIndex);
    if (existingBookmark) {
      deleteBookmarkMutation.mutate(existingBookmark.id);
    } else {
      bookmarkMutation.mutate({
        lesson_id: lessonId,
        slide_index: currentSlideIndex,
      });
    }
  };

  const markComplete = async () => {
    if (!enrollment?.id || !currentLesson?.id || isCompleted) return;
    
    const newCompletedLessons = [...(enrollment.completed_lessons || []), currentLesson.id];
    const newProgress = Math.round((newCompletedLessons.length / lessons.length) * 100);
    const isNowComplete = newCompletedLessons.length === lessons.length;
    const today = new Date().toISOString().split('T')[0];
    
    updateEnrollmentMutation.mutate({
      enrollmentId: enrollment.id,
      data: {
        completed_lessons: newCompletedLessons,
        progress_percent: newProgress,
        current_lesson_id: nextLesson?.id || currentLesson.id,
        is_completed: isNowComplete,
        ...(isNowComplete && { completed_date: today }),
      }
    });

    await awardPoints(10);

    // Check for course completion achievement and generate certificate
    if (isNowComplete) {
      const allEnrollments = await base44.entities.Enrollment.filter({ created_by: user?.email, is_completed: true });
      
      if (allEnrollments.length === 1) {
        await base44.entities.Achievement.create({
          type: 'badge',
          name: 'Course Champion',
          description: 'Complete your first course',
          icon: 'course_complete',
          course_id: courseId,
          earned_date: today,
        });
      } else if (allEnrollments.length === 5) {
        await base44.entities.Achievement.create({
          type: 'badge',
          name: 'Knowledge Seeker',
          description: 'Complete 5 courses',
          icon: 'five_courses',
          earned_date: today,
        });
      }

      // Auto-generate certificate
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await base44.entities.Certificate.create({
        course_id: courseId,
        enrollment_id: enrollment.id,
        certificate_number: certificateNumber,
        issue_date: today,
        student_name: user?.full_name,
        course_title: course?.title,
        instructor_name: course?.instructor,
        final_score: newProgress,
      });

      // Certificate achievement
      await base44.entities.Achievement.create({
        type: 'certificate',
        name: course?.title + ' Certificate',
        description: 'Successfully completed ' + course?.title,
        icon: 'certificate',
        course_id: courseId,
        earned_date: today,
      });
    }
    
    setShowRatingDialog(true);
  };

  const awardPoints = async (points) => {
    try {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      const today = new Date().toISOString().split('T')[0];
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        const newPoints = (progress.points || 0) + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        // Calculate streak
        let newStreak = progress.streak_days || 0;
        const lastActivity = progress.last_activity_date;
        
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        
        await base44.entities.UserProgress.update(progress.id, {
          points: newPoints,
          level: newLevel,
          total_lessons_completed: (progress.total_lessons_completed || 0) + 1,
          last_activity_date: today,
          streak_days: newStreak,
        });

        // Check for streak achievements
        if (newStreak === 7) {
          await base44.entities.Achievement.create({
            type: 'badge',
            name: 'Week Warrior',
            description: '7-day learning streak',
            icon: 'week_streak',
            earned_date: today,
          });
        } else if (newStreak === 30) {
          await base44.entities.Achievement.create({
            type: 'badge',
            name: 'Dedicated Scholar',
            description: '30-day learning streak',
            icon: 'month_streak',
            earned_date: today,
          });
        }
      } else {
        await base44.entities.UserProgress.create({
          points,
          level: 1,
          total_lessons_completed: 1,
          last_activity_date: today,
          streak_days: 1,
        });

        // First lesson achievement
        await base44.entities.Achievement.create({
          type: 'badge',
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon: 'first_lesson',
          earned_date: today,
        });
      }
      
      setPointsEarned(points);
      setShowPointsAnimation(true);
    } catch (error) {
      console.error('Failed to award points:', error);
    }
  };

  const handleRatingComplete = () => {
    if (nextLesson) {
      window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`;
    } else {
      window.location.href = createPageUrl('CourseDetails') + `?id=${courseId}`;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showQuiz) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, totalSlides, showQuiz]);

  // Show quiz if active
  if (showQuiz && selectedQuiz) {
    return <EmbeddedQuiz quiz={selectedQuiz} user={user} onClose={handleCloseQuiz} />;
  }

  // Loading
  if (lessonsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson || !slides.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h2>
          <p className="text-gray-600 mb-6">This lesson doesn't have slides yet.</p>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Home className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              {currentLesson?.google_slides_url && (
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                  <option value="slides" className="text-gray-900">Slide View</option>
                  <option value="googleslides" className="text-gray-900">Google Slides</option>
                </select>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className={`text-white hover:bg-white/20 ${bookmarked ? 'bg-white/20' : ''}`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQA(!showQA)}
                className="text-white hover:bg-white/20"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">{enrollment?.progress_percent || 0}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="flex-1 h-2 bg-white/20" />
            <span className="text-xs text-white font-medium">
              {currentSlideIndex + 1}/{totalSlides}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
        <div className="w-full max-w-5xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlideIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="touch-pan-y select-none"
            >
              <Card className="p-6 md:p-10 lg:p-12 shadow-2xl">
                {/* Learning Objectives - Show on first slide */}
                {currentSlideIndex === 0 && currentLesson?.learning_objectives && currentLesson.learning_objectives.length > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {currentLesson.learning_objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-blue-800 text-sm">
                          <span className="text-blue-500 mt-0.5 font-bold">✓</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Slide Content */}
                <div className="mb-8">
                  {viewMode === 'googleslides' && currentLesson?.google_slides_url ? (
                    <div className="mb-4">
                      <GoogleSlidePlayer 
                        googleSlidesUrl={currentLesson.google_slides_url}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                              {currentLesson.section || 'Lesson'}
                            </span>
                          </div>
                          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {currentSlide.title}
                          </h1>
                          {lessonQuizzes.length > 0 && (
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => handleTakeQuiz(lessonQuizzes[0])}>
                              <Brain className="w-4 h-4 mr-2" />
                              Quiz Available ({lessonQuizzes[0].questions?.length} questions)
                            </Button>
                          )}
                        </div>
                        {isCompleted && (
                          <div className="ml-4 text-right">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-emerald-600">Thank you for completing the lesson</p>
                          </div>
                        )}
                      </div>

                      <GoogleSlidePlayer 
                        content={currentSlide.content}
                        googleSlidesUrl={viewMode === 'slides' ? null : currentLesson?.google_slides_url}
                      />
                    </>
                  )}

                  {/* Interactive Elements */}
                  {currentSlide.inlineQuiz && (
                    <div className="mt-6">
                      <InlineQuiz 
                        quiz={currentSlide.inlineQuiz}
                        onComplete={(isCorrect) => console.log('Quiz completed:', isCorrect)}
                      />
                    </div>
                  )}

                  {currentSlide.codePlayground && (
                    <div className="mt-6">
                      <CodePlayground
                        initialCode={currentSlide.codePlayground.code || ''}
                        language={currentSlide.codePlayground.language || 'javascript'}
                        onRun={(code) => console.log('Code executed:', code)}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isLastSlide ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={markComplete}
                      disabled={updateEnrollmentMutation.isPending || isCompleted}
                      className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isCompleted ? 'Lesson Completed ✓' : 'Complete Lesson'}
                    </Button>

                    {nextLesson && (
                      <Button 
                        onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                      >
                        Next Lesson
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}

                    {lessonQuizzes.length > 0 && (
                      <Button 
                        onClick={() => handleTakeQuiz(lessonQuizzes[0])}
                        className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Take Quiz ({lessonQuizzes[0].questions?.length} questions)
                      </Button>
                    )}

                    {!nextLesson && (
                      <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                        <Button variant="outline" className="w-full h-14 text-lg">
                          <Trophy className="w-5 h-5 mr-2" />
                          Back to Course
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={nextSlide}
                    className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlideIndex ? 1 : -1);
                  setCurrentSlideIndex(idx);
                }}
                className={`transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                } rounded-full`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center justify-between mt-6 px-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 disabled:opacity-30 w-12 h-12"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 disabled:opacity-30 w-12 h-12"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Q&A Section */}
          {showQA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <LessonQA
                lessonId={lessonId}
                courseId={courseId}
                user={user}
                currentSlideIndex={currentSlideIndex}
              />
            </motion.div>
          )}
        </div>
      </div>

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