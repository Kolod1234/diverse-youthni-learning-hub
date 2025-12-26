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
  MessageCircle, ArrowRight, ArrowLeft, Home, Bookmark, MessageSquare, Award, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonRatingDialog from '@/components/rating/LessonRatingDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import EmbeddedQuiz from '@/components/quiz/EmbeddedQuiz';
import InlineQuiz from '@/components/lesson/InlineQuiz';
import CodePlayground from '@/components/lesson/CodePlayground';
import LessonQA from '@/components/lesson/LessonQA';
import UniversalSlidePlayer from '@/components/lesson/UniversalSlidePlayer';

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
  const [showObjectives, setShowObjectives] = useState(true);

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

  // Auto-detect view mode based on content
  useEffect(() => {
    if (currentLesson?.content_type === 'googleslides' && currentLesson?.google_slides_url) {
      setViewMode('googleslides');
    } else if (currentLesson?.content_type === 'document' && currentLesson?.file_url) {
      setViewMode('document');
    } else if (currentLesson?.slides && currentLesson.slides.length > 0) {
      setViewMode('slides');
    } else {
      setViewMode('slides');
    }
  }, [currentLesson?.id, currentLesson?.content_type, currentLesson?.google_slides_url, currentLesson?.file_url, currentLesson?.slides]);

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
  
  // Create slides from lesson content or handle document mode
  const slides = currentLesson?.slides || [];
  const isDocumentMode = currentLesson?.content_type === 'document' && currentLesson?.file_url && !slides.length;
  const totalSlides = slides.length > 0 ? slides.length : (isDocumentMode ? 1 : 0);
  const progressPercent = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;

  // Check if current slide is bookmarked
  React.useEffect(() => {
    const isBookmarked = bookmarks.some(b => b.slide_index === currentSlideIndex);
    setBookmarked(isBookmarked);
  }, [bookmarks, currentSlideIndex]);



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

    // Touch swipe handling
    useEffect(() => {
    if (showQuiz) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      // Only capture if not scrolling vertically
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;

      // Allow vertical scrolling by not preventing default
      const deltaX = Math.abs(touchEndX - touchStartX);
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Only prevent default if horizontal swipe is clearly intended
      if (deltaX > deltaY && deltaX > 20) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
    };

    const slideArea = document.querySelector('.slide-swipe-area');
    if (slideArea) {
      slideArea.addEventListener('touchstart', handleTouchStart, { passive: true });
      slideArea.addEventListener('touchmove', handleTouchMove, { passive: false });
      slideArea.addEventListener('touchend', handleTouchEnd);

      return () => {
        slideArea.removeEventListener('touchstart', handleTouchStart);
        slideArea.removeEventListener('touchmove', handleTouchMove);
        slideArea.removeEventListener('touchend', handleTouchEnd);
      };
    }
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

  if (!currentLesson || totalSlides === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h2>
          <p className="text-gray-600 mb-6">This lesson doesn't have content yet.</p>
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

  const currentSlide = isDocumentMode ? { title: currentLesson.title } : slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  // Safety check for currentSlide
  if (!currentSlide && !lessonsLoading) {
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <X className="w-5 h-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {!isDocumentMode && (currentLesson?.google_slides_url || currentLesson?.slides?.length > 0) && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="bg-transparent text-gray-700 text-xs sm:text-sm font-medium border-none outline-none cursor-pointer"
                  >
                    {currentLesson?.slides?.length > 0 && (
                      <option value="slides">📄 Slides</option>
                    )}
                    {currentLesson?.google_slides_url && (
                      <option value="googleslides">📊 Google</option>
                    )}
                  </select>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className={`hover:bg-gray-100 ${bookmarked ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <Bookmark className={`w-4 sm:w-5 h-4 sm:h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQA(!showQA)}
                className="hover:bg-gray-100 text-gray-600"
              >
                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">{enrollment?.progress_percent || 0}%</span>
              </div>
            </div>
          </div>
          
{!isDocumentMode && (
            <div className="flex items-center gap-3">
              <Progress value={progressPercent} className="flex-1 h-2 bg-gray-200" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium min-w-[60px] text-right">
                {currentSlideIndex + 1} / {totalSlides}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'googleslides' ? (
          /* Full-screen Google Slides view */
          <div className="flex-1 w-full h-full">
            <UniversalSlidePlayer 
              googleSlidesUrl={currentLesson?.google_slides_url}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto slide-swipe-area">
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
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    nextSlide();
                  } else if (swipe > 10000) {
                    prevSlide();
                  }
                }}
              >
                <Card className="min-h-full shadow-xl bg-white border-0 flex flex-col p-4 sm:p-6">
                  {/* Learning Objectives - Show on first slide */}
                  {currentSlideIndex === 0 && currentLesson?.learning_objectives && currentLesson.learning_objectives.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 sm:p-6 mb-6 sm:mb-8 rounded-r-xl"
                  >
                    <button
                      onClick={() => setShowObjectives(!showObjectives)}
                      className="w-full flex items-center justify-between mb-3 sm:mb-4 hover:opacity-70 transition-opacity"
                    >
                      <h3 className="font-bold text-blue-900 flex items-center gap-2 text-base sm:text-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        Learning Objectives
                      </h3>
                      <ChevronRight className={`w-5 h-5 text-blue-900 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                    </button>
                    {showObjectives && (
                      <ul className="space-y-2 sm:space-y-3">
                        {currentLesson.learning_objectives.map((objective, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 text-blue-900 text-sm sm:text-base"
                          >
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{objective}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Slide Content */}
                <div className="flex-1 overflow-y-auto mb-6 sm:mb-8">
                  {!isDocumentMode && (
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider block">
                              {currentLesson.section || 'Lesson'}
                            </span>
                            <span className="text-xs text-gray-500">Slide {currentSlideIndex + 1} of {totalSlides}</span>
                          </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 break-words leading-tight">
                          {currentSlide.title}
                        </h1>
                      {lessonQuizzes.length > 0 && (
                        <Button variant="outline" size="sm" className="mt-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => handleTakeQuiz(lessonQuizzes[0])}>
                          <Brain className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Quiz Available</span>
                          <span className="sm:hidden">Quiz</span>
                          <span className="ml-1">({lessonQuizzes[0].questions?.length})</span>
                        </Button>
                      )}
                      </div>
                      {isCompleted && (
                      <div className="ml-4 text-right hidden sm:block">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <CheckCircle className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">Completed</p>
                      </div>
                      )}
                      </div>
                      )}

                      {isDocumentMode ? (
                        <UniversalSlidePlayer 
                          fileUrl={currentLesson.file_url}
                          fileType={currentLesson.file_type}
                        />
                      ) : viewMode === 'document' && currentLesson?.file_url ? (
                    <UniversalSlidePlayer 
                      fileUrl={currentLesson.file_url}
                      fileType={currentLesson.file_type}
                    />
                  ) : (
                    <UniversalSlidePlayer 
                      content={currentSlide?.content}
                      fileUrl={currentSlide?.file_url}
                      fileType={currentSlide?.file_type}
                    />
                  )}

                  {/* Interactive Elements */}
                  {!isDocumentMode && currentSlide.inlineQuiz && (
                    <div className="mt-6">
                      <InlineQuiz 
                        quiz={currentSlide.inlineQuiz}
                        onComplete={(isCorrect) => console.log('Quiz completed:', isCorrect)}
                      />
                    </div>
                  )}

                  {!isDocumentMode && currentSlide.codePlayground && (
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
                  <div className="space-y-3 sm:space-y-4">
                    <Button 
                      onClick={markComplete}
                      disabled={updateEnrollmentMutation.isPending || isCompleted}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isCompleted ? 'Lesson Completed ✓' : 'Complete Lesson'}
                    </Button>

                    {nextLesson && (
                      <Button 
                        onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                      >
                        Next Lesson
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}

                    {lessonQuizzes.length > 0 && (
                      <Button 
                        onClick={() => handleTakeQuiz(lessonQuizzes[0])}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Take Quiz ({lessonQuizzes[0].questions?.length})
                      </Button>
                    )}

                    {!nextLesson && (
                      <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                        <Button variant="outline" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 hover:bg-gray-50 rounded-xl">
                          <Trophy className="w-5 h-5 mr-2" />
                          Back to Course
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={nextSlide}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          {!isDocumentMode && (
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
              {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlideIndex ? 1 : -1);
                  setCurrentSlideIndex(idx);
                }}
                className={`transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 h-2 bg-indigo-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                } rounded-full`}
              />
            ))}
            </div>
            )}

            {/* Arrow Buttons */}
            {!isDocumentMode && (
            <div className="flex items-center justify-between mt-6 sm:mt-8 px-2 sm:px-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              variant="outline"
              size="icon"
              className="hover:bg-gray-50 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              variant="outline"
              size="icon"
              className="hover:bg-gray-50 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              </div>
              )}

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
              )}
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