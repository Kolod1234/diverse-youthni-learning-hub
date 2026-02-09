import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ChevronLeft, ChevronRight, Check, ChevronDown, Menu, Search, X,
  Lock, Key, BookOpen, CheckCircle, Settings, Maximize, FileText, Bookmark, MessageSquare, Clock, RefreshCw, Eye
} from 'lucide-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import EnhancedMediaPlayer from '@/components/lesson/EnhancedMediaPlayer';
import MatchingGame from '@/components/lesson/MatchingGame';
import InteractiveQuiz from '@/components/lesson/InteractiveQuiz';
import FlashCards from '@/components/lesson/FlashCards';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import LessonBookmarks from '@/components/lesson/LessonBookmarks';
import LessonNotes from '@/components/lesson/LessonNotes';
import ResumePrompt from '@/components/lesson/ResumePrompt';
import CertificateGenerator from '@/components/lesson/CertificateGenerator';
import AccessibilityControls from '@/components/lesson/AccessibilityControls';
import QuickActions from '@/components/lesson/QuickActions';
import useKeyboardShortcuts from '@/components/lesson/useKeyboardShortcuts';
import useProgressAutoSave from '@/components/lesson/useProgressAutoSave';
import usePictureInPicture from '@/components/lesson/usePictureInPicture';
import useHapticFeedback from '@/components/lesson/useHapticFeedback';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import CommandPalette from '@/components/lesson/CommandPalette';
import BreadcrumbNav from '@/components/lesson/BreadcrumbNav';
import ProgressRing from '@/components/lesson/ProgressRing';
import NetworkStatusIndicator from '@/components/lesson/NetworkStatusIndicator';
import RelatedLessons from '@/components/lesson/RelatedLessons';
import ScrollPositionIndicator from '@/components/lesson/ScrollPositionIndicator';
import SplitViewLayout from '@/components/lesson/SplitViewLayout';
import ErrorBoundary from '@/components/lesson/ErrorBoundary';
import FocusMode from '@/components/lesson/FocusMode';
import ImprovedFocusMode from '@/components/lesson/ImprovedFocusMode';
import { useDeviceType } from '@/components/lesson/ResponsiveControls';
import StudyTimer from '@/components/lesson/StudyTimer';
import StreakTracker from '@/components/lesson/StreakTracker';
import XPProgressBar from '@/components/lesson/XPProgressBar';
import ThemeCustomizer from '@/components/lesson/ThemeCustomizer';
import DifficultyRating from '@/components/lesson/DifficultyRating';
import { 
  Box, Card, TextField, Button, Paper, Stack, Typography, Container, 
  Drawer, AppBar, Toolbar, IconButton, Divider, CircularProgress
} from '@mui/material';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [interactiveContent, setInteractiveContent] = useState(null);
  const [loadingInteractives, setLoadingInteractives] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showNotesSheet, setShowNotesSheet] = useState(false);
  const [showBookmarksSheet, setShowBookmarksSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const searchInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const { deviceType, orientation, isTouchDevice } = useDeviceType();
  
  // Advanced hooks
  const { videoRef, isPiP, enterPiP, exitPiP } = usePictureInPicture();
  const haptic = useHapticFeedback();
  const { isPulling, pullDistance } = usePullToRefresh(async () => {
    await Promise.all([
      refetchLesson(),
      refetchCourse(),
      refetchEnrollment()
    ]);
    haptic.success();
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Load user XP and update streak
  useEffect(() => {
    const updateStreak = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const streaks = await base44.entities.StudyStreak.list();
      const streak = streaks[0];
      
      if (streak) {
        const lastDate = streak.last_activity_date;
        if (lastDate !== today) {
          // Update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const newStreak = lastDate === yesterdayStr ? streak.current_streak + 1 : 1;
          
          await base44.entities.StudyStreak.update(streak.id, {
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_activity_date: today,
            streak_dates: [...(streak.streak_dates || []), today],
            total_xp: streak.total_xp || 0,
          });
        }
        setCurrentXP(streak.total_xp || 0);
        setUserLevel(Math.floor((streak.total_xp || 0) / 100) + 1);
      } else {
        // Create first streak record
        await base44.entities.StudyStreak.create({
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_dates: [today],
          total_xp: 0,
        });
      }
    };
    
    updateStreak();
  }, [user]);

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

  // Load interactive content based on lesson
  useEffect(() => {
    const loadInteractives = async () => {
      if (!lessonId || lessonId === 'null' || lessonId === 'undefined' || !lesson) return;
      
      setLoadingInteractives(true);
      try {
        const response = await base44.functions.invoke('generateLessonInteractives', { lessonId });
        if (response.data.success) {
          setInteractiveContent(response.data);
        }
      } catch (error) {
        console.error('Failed to load interactive content:', error);
      } finally {
        setLoadingInteractives(false);
      }
    };
    
    loadInteractives();
  }, [lessonId, lesson]);

  const handleRegenerateInteractives = async () => {
    setLoadingInteractives(true);
    try {
      const response = await base44.functions.invoke('generateLessonInteractives', { lessonId });
      if (response.data.success) {
        setInteractiveContent(response.data);
        toast.success('New activities generated!');
      }
    } catch (error) {
      console.error('Failed to regenerate interactive content:', error);
      toast.error('Failed to generate new activities');
    } finally {
      setLoadingInteractives(false);
    }
  };

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

  // Progress auto-save hook (after enrollment is defined)
  const { getLastProgress, clearProgress } = useProgressAutoSave(lessonId);

  // Sort lessons once
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];

  // Check for resume prompt
  useEffect(() => {
    if (lessonId && enrollment) {
      const lastProgress = getLastProgress();
      if (lastProgress && lastProgress.progress > 10 && lastProgress.progress < 90) {
        setShowResumePrompt(true);
      }
    }
  }, [lessonId, enrollment]);

  // Track engagement metrics
  const trackEngagement = (eventType, data = {}) => {
    base44.analytics.track({
      eventName: `lesson_${eventType}`,
      properties: {
        lessonId,
        courseId,
        ...data
      }
    });
  };

  // Calculate reading time
  const estimatedMinutes = lesson?.duration_minutes || Math.ceil((lesson?.slides?.length || 0) * 2);
  const progressPercent = sortedLessons.length > 0 ? ((currentLessonIndex + 1) / sortedLessons.length * 100) : 0;

  useEffect(() => {
    if (lessonId) {
      trackEngagement('started');
      const startTime = Date.now();
      
      return () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEngagement('time_spent', { seconds: timeSpent });
      };
    }
  }, [lessonId]);

  // Keyboard shortcuts
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

  useKeyboardShortcuts({
    onNext: handleNextLesson,
    onPrev: handlePrevLesson,
    onToggleFullscreen: () => {
      if (!document.fullscreenElement) {
        mainContentRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    },
    onBookmark: () => setShowBookmarksSheet(true),
    onSearch: () => searchInputRef.current?.focus()
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
        
        // Clear progress tracking
        clearProgress();
        
        // Award points for completing lesson
        const response = await base44.functions.invoke('awardPoints', {
          action: 'complete_lesson'
        });
        
        if (response.data.success) {
          setEarnedPoints(response.data.pointsEarned);
          setShowPointsAnimation(true);
          
          // Update XP
          const newXP = currentXP + response.data.pointsEarned;
          setCurrentXP(newXP);
          setXpGain(response.data.pointsEarned);
          setShowXPGain(true);
          setTimeout(() => setShowXPGain(false), 3000);
          
          // Update streak XP
          const streaks = await base44.entities.StudyStreak.list();
          if (streaks[0]) {
            await base44.entities.StudyStreak.update(streaks[0].id, {
              total_xp: newXP,
            });
          }
          
          if (response.data.newBadges?.length > 0) {
            setNewBadges(response.data.newBadges);
            setShowBadges(true);
          }
        }

        // Track completion
        trackEngagement('completed');

        // Check if course is complete
        const newCompletedCount = completedLessons.length + 1;
        if (newCompletedCount === courseLessons.length) {
          setTimeout(() => setShowCertificate(true), 2000);
        }
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

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && nextLesson) {
      handleNextLesson();
    }
    if (isRightSwipe && prevLesson) {
      handlePrevLesson();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getSlideEmbedUrl = () => {
    if (!lesson) return null;
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
    <ErrorBoundary>
      {/* Network Status */}
      <NetworkStatusIndicator />
      
      {/* Scroll Progress */}
      <ScrollPositionIndicator />
      
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-transform"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
        >
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
            <span className="text-sm">{pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}

      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          fontSize: { xs: '0.875rem', md: '1rem' },
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {/* Top Bar */}
                <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: 1, height: { xs: 56, md: 64 }, px: { xs: 1.5, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            sx={{ display: { lg: 'none' } }}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-6 h-6" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Progress Ring */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ProgressRing progress={progressPercent} size={50} />
          </Box>

          {/* Estimated Time */}
          {estimatedMinutes > 0 && (
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
              <Clock className="w-4 h-4" />
              <Typography variant="caption">{estimatedMinutes} min</Typography>
            </Box>
          )}
          
          <AccessibilityControls />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFocusModeEnabled(!focusModeEnabled)}
            className="hidden md:inline-flex"
            title="Focus mode (F)"
          >
            <Eye className="w-5 h-5" />
          </Button>
          
          <ThemeCustomizer />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Lesson Tools</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-medium mb-3">Bookmarks</h4>
                  <LessonBookmarks lessonId={lessonId} />
                </div>
                <div>
                  <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>← → : Navigate lessons</p>
                    <p>F : Fullscreen</p>
                    <p>Ctrl+B : Bookmark</p>
                    <p>/ : Search</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            onClick={() => navigate(`/CourseDetails?id=${courseId}`)}
            className="font-semibold"
          >
            EXIT COURSE
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <motion.div
            initial={false}
            animate={{ x: showSidebar ? 0 : '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              insetInlineStart: 0,
              insetBlockStart: deviceType === 'mobile' ? '56px' : '64px',
              insetBlockEnd: 0,
              width: deviceType === 'mobile' ? '288px' : '320px',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#1e3a8a',
              color: 'white'
            }}
          >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <Box sx={{ position: 'relative' }}>
              <Search sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }} />
              <TextField
                inputRef={searchInputRef}
                type="text"
                placeholder="Search... (Press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-input': { color: 'white', pl: '28px' },
                  '& .MuiOutlinedInput-root': { 
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                  }
                }}
                aria-label="Search lessons"
              />
            </Box>
          </Box>

          {/* Course Title and Progress */}
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
              {course?.title || 'Course Content'}
            </Typography>
            {enrollment && (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                    {Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      bgcolor: 'white',
                      width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%`,
                      transition: 'width 300ms ease-in-out'
                    }}
                  />
                </Box>
              </Stack>
            )}
          </Box>

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

          {/* Close button for mobile */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)', display: { lg: 'none' } }}>
            <Button 
              onClick={() => setShowSidebar(false)}
              fullWidth
              sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, textTransform: 'none', fontSize: '0.875rem', fontWeight: 500 }}
            >
              <X className="w-5 h-5" />
              Close Menu
            </Button>
          </Box>
          </motion.div>

          {/* Overlay for mobile */}
          {showSidebar && (
          <Box
            onClick={() => setShowSidebar(false)}
            sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 30, display: { lg: 'none' }, mt: { xs: '56px', md: '64px' } }}
          />
          )}

        {/* Main Content */}
        <main 
          ref={mainContentRef}
          id="lesson-content"
          className="flex-1 overflow-y-auto bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="main"
          aria-label="Lesson content"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 md:pb-12">
            {/* Breadcrumb Navigation */}
            <div className="no-print mb-4">
              <BreadcrumbNav 
                course={course}
                section={lesson?.section}
                lesson={lesson}
              />
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 lg:p-12">
              {/* Title */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight text-gray-800 mb-4 sm:mb-8">
                  {lesson.title}
                </h1>
              </div>

              {/* Description */}
              {lesson.description && (
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  {lesson.description}
                </p>
              )}

              {/* Media Player - with explicit sizing */}
                {lesson.video_url && (
                  <div className="my-8 w-full" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
                    <EnhancedMediaPlayer
                      type="video"
                      src={lesson.video_url}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {lesson.google_slides_url && !lesson.video_url && (
                  <div className="my-8 w-full" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
                    <EnhancedMediaPlayer
                      type="google-slides"
                      src={lesson.google_slides_url.includes('/embed') 
                        ? lesson.google_slides_url 
                        : `https://docs.google.com/presentation/d/${lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]}/embed?start=false&loop=false&delayms=3000`}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {lesson.file_url && !lesson.video_url && !lesson.google_slides_url && (
                  <div className="my-8 w-full" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
                    <EnhancedMediaPlayer
                      type="iframe"
                      src={lesson.file_url}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {!lesson.video_url && !lesson.google_slides_url && !lesson.file_url && (
                  <div className="my-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <p className="text-gray-600">No video, slides, or file attached to this lesson yet.</p>
                  </div>
                )}

              {/* Learning Objectives */}
              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <ul className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
                  {lesson.learning_objectives.map((objective, idx) => (
                    <li key={idx} className="flex gap-3 sm:gap-4">
                      <span className="text-[#1e3a8a] text-xl sm:text-2xl flex-shrink-0 mt-0.5 sm:mt-1">•</span>
                      <div>
                        <span className="text-base sm:text-lg text-gray-700">{objective}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Interactive Elements - Generated from Learning Objectives */}
              {loadingInteractives && (
                <div className="mt-8 sm:mt-12 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating interactive activities...</p>
                </div>
              )}

              {!loadingInteractives && interactiveContent && (
                <div className="space-y-6 mt-8 sm:mt-12">
                  {interactiveContent.matchingPairs?.length > 0 && (
                    <MatchingGame
                      pairs={interactiveContent.matchingPairs}
                      onRegenerate={handleRegenerateInteractives}
                      onComplete={async (score) => {
                        toast.success(`Great job! You scored ${score} points!`);
                        
                        // Award points for completing interactive
                        const response = await base44.functions.invoke('awardPoints', {
                          action: 'interactive_complete',
                          value: score
                        });
                        
                        if (response.data.success) {
                          setEarnedPoints(response.data.pointsEarned);
                          setShowPointsAnimation(true);
                        }
                      }}
                    />
                  )}

                  {interactiveContent.quizQuestions?.length > 0 && (
                    <InteractiveQuiz
                      questions={interactiveContent.quizQuestions}
                      onRegenerate={handleRegenerateInteractives}
                      onComplete={async (score) => {
                        const percentage = Math.round((score / interactiveContent.quizQuestions.length) * 100);
                        toast.success(`Quiz complete! You scored ${percentage}%`);
                        
                        // Award points based on quiz score
                        const response = await base44.functions.invoke('awardPoints', {
                          action: 'complete_quiz',
                          value: percentage
                        });
                        
                        if (response.data.success) {
                          setEarnedPoints(response.data.pointsEarned);
                          setShowPointsAnimation(true);
                          
                          if (response.data.newBadges?.length > 0) {
                            setNewBadges(response.data.newBadges);
                            setShowBadges(true);
                          }
                        }
                      }}
                    />
                  )}

                  {interactiveContent.flashCards?.length > 0 && (
                    <FlashCards 
                      cards={interactiveContent.flashCards}
                      onRegenerate={handleRegenerateInteractives}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 sm:mt-8 gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                className="flex-1 sm:flex-none"
              >
                ← Previous
              </Button>
              <Button 
                size="lg" 
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 flex-1 sm:flex-none"
                onClick={handleNextLesson}
                disabled={!nextLesson}
              >
                Next →
              </Button>
            </div>

            {/* Mark Complete Button */}
            {!isCompleted && (
              <div className="mt-6 text-center no-print">
                <Button
                  size="lg"
                  onClick={() => {
                    markCompleteMutation.mutate();
                    haptic.success();
                  }}
                  disabled={markCompleteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 gap-2 min-h-[44px] min-w-[44px]"
                >
                  <CheckCircle className="w-5 h-5" />
                  {markCompleteMutation.isPending ? 'Saving...' : 'Mark as Complete'}
                </Button>
              </div>
            )}

            {/* Learning Enhancement Tools */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <StreakTracker />
              <StudyTimer />
            </div>

            <div className="mt-6">
              <XPProgressBar 
                currentXP={currentXP}
                level={userLevel}
                showGain={showXPGain}
                gainAmount={xpGain}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <DifficultyRating 
                lessonId={lessonId}
                onComplete={() => toast.success('Thank you for your feedback!')}
              />
            </div>

            {/* Related Lessons */}
            <div className="no-print mt-8">
              <RelatedLessons 
                lessons={sortedLessons}
                courseId={courseId}
                currentLessonId={lessonId}
              />
            </div>
          </div>
        </main>
        </Box>
        </Box>
        </Box>

        {/* Command Palette */}
        <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        actions={{
          onSearch: () => searchInputRef.current?.focus(),
          onBookmark: () => setShowBookmarksSheet(true),
          onNotes: () => setShowNotesSheet(true),
          onDiscussion: () => navigate(`/CourseDiscussion?id=${courseId}`),
          onShare: () => {
            if (navigator.share) {
              navigator.share({
                title: lesson?.title,
                text: `Check out this lesson: ${lesson?.title}`,
                url: window.location.href
              });
            }
          },
          onAnalytics: () => navigate(`/Analytics`)
        }}
      />

      {/* Quick Actions FAB */}
      <QuickActions
        lesson={lesson}
        onOpenNotes={() => setShowNotesSheet(true)}
        onAddBookmark={() => setShowBookmarksSheet(true)}
        onOpenDiscussion={() => navigate(`/CourseDiscussion?id=${courseId}`)}
      />

      {/* Notes Sheet */}
      <Sheet open={showNotesSheet} onOpenChange={setShowNotesSheet}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>My Notes</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <LessonNotes lessonId={lessonId} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Resume Prompt */}
      <ResumePrompt
        open={showResumePrompt}
        onOpenChange={setShowResumePrompt}
        lastPosition={getLastProgress()}
        onResume={() => {
          const progress = getLastProgress();
          if (progress) {
            window.scrollTo({ top: progress.scrollPosition, behavior: 'smooth' });
          }
          setShowResumePrompt(false);
        }}
        onStartOver={() => {
          clearProgress();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setShowResumePrompt(false);
        }}
      />

      {/* Certificate */}
      <CertificateGenerator
        open={showCertificate}
        onOpenChange={setShowCertificate}
        courseTitle={course?.title || 'Course'}
        userName={user?.full_name || 'Student'}
        completionDate={new Date().toISOString()}
      />

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

      <PointsAnimation 
        show={showPointsAnimation}
        points={earnedPoints}
        onComplete={() => setShowPointsAnimation(false)}
      />

      <BadgeUnlock 
        badges={newBadges}
        onClose={() => setShowBadges(false)}
      />

      {/* Improved Focus Mode */}
      <ImprovedFocusMode
        enabled={focusModeEnabled}
        onToggle={setFocusModeEnabled}
        type={lesson?.video_url ? 'video' : 'slides'}
      >
        {lesson?.video_url ? (
          <EnhancedMediaPlayer
            type="video"
            src={lesson.video_url}
            className="w-full h-full"
          />
        ) : lesson?.google_slides_url ? (
          <EnhancedMediaPlayer
            type="google-slides"
            src={lesson.google_slides_url.includes('/embed') 
              ? lesson.google_slides_url 
              : lesson.google_slides_url.replace('/edit', '/embed')}
            className="w-full h-full"
          />
        ) : lesson?.file_url ? (
          <EnhancedMediaPlayer
            type="iframe"
            src={lesson.file_url}
            className="w-full h-full"
          />
        ) : (
          <div className="prose prose-lg max-w-none text-white bg-black/50 p-8 rounded-lg backdrop-blur-sm">
            <h1>{lesson?.title}</h1>
            {lesson?.description && <p>{lesson.description}</p>}
            {lesson?.learning_objectives && (
              <ul>
                {lesson.learning_objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </ImprovedFocusMode>
    </ErrorBoundary>
  );
}