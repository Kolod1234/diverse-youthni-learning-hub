import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ChevronLeft, ChevronRight, Check, ChevronDown, Menu, Search, X,
  Lock, Key, BookOpen, CheckCircle, Settings, Maximize, FileText, Bookmark, MessageSquare, Clock, RefreshCw, Eye, Sparkles
} from 'lucide-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import useLessonPlayer from '@/components/lesson/useLessonPlayer';
import { AIAssistantDialog } from '@/components/lesson/LessonPlayerSharedUI';
import EnhancedMediaPlayer from '@/components/lesson/EnhancedMediaPlayer';
import UniversalLessonPlayer from '@/components/lesson/UniversalLessonPlayer';
import MatchingGame from '@/components/lesson/MatchingGame';
import InteractiveQuiz from '@/components/lesson/InteractiveQuiz';
import FlashCards from '@/components/lesson/FlashCards';
import EssayQuestion from '@/components/lesson/EssayQuestion';
import FillInTheBlanks from '@/components/lesson/FillInTheBlanks';
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
import { Card, TextField, Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, LinearProgress, Typography, Backdrop, Chip, Stack, Container, AppBar, Toolbar, IconButton } from '@mui/material';
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
    base44.auth.me().then(setUser);
  }, []);

  // Load user XP and update streak (with retry logic and debouncing)
  useEffect(() => {
    if (!user) return;

    let timeoutId;
    const updateStreak = async (retries = 3) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const streaks = await base44.entities.StudyStreak.list();
        const streak = streaks[0];
        
        if (streak) {
          const lastDate = streak.last_activity_date;
          if (lastDate !== today) {
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
          await base44.entities.StudyStreak.create({
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_dates: [today],
            total_xp: 0,
          });
        }
      } catch (error) {
        if (error.message?.includes('Rate limit') && retries > 0) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, 3 - retries) * 1000;
          timeoutId = setTimeout(() => updateStreak(retries - 1), delay);
        } else {
          console.error('Failed to update streak:', error);
        }
      }
    };

    // Debounce: only call updateStreak after user is loaded
    timeoutId = setTimeout(() => updateStreak(), 500);
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  // First fetch the lesson to get its course_id
  const { data: lesson, isLoading: lessonLoading, error: lessonError, isFetching, refetch: refetchLesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
        console.error('Invalid lessonId:', lessonId);
        return null;
      }
      try {
        console.log('Fetching lesson with ID:', lessonId);
        const response = await base44.entities.Lesson.get(lessonId);
        console.log('Lesson fetched successfully:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch lesson via get, trying filter fallback:', error);
        // Fallback: try to fetch via filter
        try {
          const lessons = await base44.entities.Lesson.filter({ id: lessonId });
          if (lessons && lessons.length > 0) {
            console.log('Lesson found via filter fallback:', lessons[0]);
            return lessons[0];
          }
        } catch (filterError) {
          console.error('Filter fallback also failed:', filterError);
        }
        // For 404 or not found errors, return null gracefully instead of throwing
        if (error.message?.includes('not found') || error.status === 404 || error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(lessonId) && lessonId !== 'null' && lessonId !== 'undefined',
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1
  });
  
  // Use course_id from lesson if URL doesn't have it
  const courseId = urlCourseId || lesson?.course_id;

  // Load interactive content based on lesson (with caching)
  useEffect(() => {
    const loadInteractives = async () => {
      if (!lessonId || lessonId === 'null' || lessonId === 'undefined') return;
      
      // Check cache first
      const cacheKey = `interactives_${lessonId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setInteractiveContent(JSON.parse(cached));
          return;
        } catch (e) {
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      setLoadingInteractives(true);
      try {
        const response = await base44.functions.invoke('generateLessonInteractives', { lessonId });
        if (response.data.success) {
          setInteractiveContent(response.data);
          sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to load interactive content:', error);
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment and try again.');
        }
      } finally {
        setLoadingInteractives(false);
      }
    };
    
    loadInteractives();
  }, [lessonId]);

  const handleRegenerateInteractives = async () => {
    setLoadingInteractives(true);
    try {
      const response = await base44.functions.invoke('generateLessonInteractives', { lessonId });
      if (response.data.success) {
        setInteractiveContent(response.data);
        // Update cache
        const cacheKey = `interactives_${lessonId}`;
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        toast.success('New activities generated!');
      }
    } catch (error) {
      console.error('Failed to regenerate interactive content:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit reached. Please wait a moment before regenerating.');
      } else {
        toast.error('Failed to generate new activities');
      }
    } finally {
      setLoadingInteractives(false);
    }
  };

  const { data: course, refetch: refetchCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        return await base44.entities.Course.get(courseId);
      } catch (error) {
        if (error.message?.includes('not found') || error.status === 404 || error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false
  });

  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => {
      if (!courseId || courseId === 'null' || courseId === 'undefined') {
        return [];
      }
      return base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100);
    },
    enabled: !!courseId && courseId !== 'null' && courseId !== 'undefined',
    retry: 3,
    staleTime: 5 * 60 * 1000
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
    enabled: !!courseId && courseId !== 'null' && courseId !== 'undefined',
    retry: 3,
    staleTime: 2 * 60 * 1000
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
    onToggleFullscreen: toggleFullscreen,
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

  if (lessonLoading || isFetching) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 48, height: 48, border: '3px solid', borderColor: 'primary.main', borderRadius: '50%', borderTop: '3px solid', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', mx: 'auto', mb: 2 }} />
          <Typography color="text.secondary">Loading lesson...</Typography>
        </Box>
      </Box>
    );
  }

  if (lessonError || !lesson) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <BookOpen style={{ width: 64, height: 64, color: 'rgba(0,0,0,0.2)', margin: '0 auto 16px' }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            {lessonError ? 'Failed to load lesson' : 'Lesson not found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {lessonError ? 'Please try again or contact support if the issue persists.' : 'This lesson may have been removed or is unavailable.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button onClick={() => window.location.reload()} variant="contained">Retry</Button>
            <Button onClick={() => navigate(-1)} variant="outlined">Go Back</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // If locked, show lock screen
  if (isLessonLocked && !lessonLoading) {
    return (
      <>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
          <Card sx={{ maxWidth: 400, p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Lock style={{ width: 32, height: 32, color: '#d97706' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Lesson Locked</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This lesson requires an unlock key. Contact your tutor to get access.
            </Typography>
            <Stack spacing={2}>
              <Button
                onClick={() => setShowUnlockDialog(true)}
                variant="contained"
                fullWidth
                sx={{ background: 'linear-gradient(90deg, #ea580c 0%, #dc2626 100%)', gap: 1, minHeight: 44 }}
              >
                <Key className="w-4 h-4" />
                Enter Unlock Key
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                fullWidth
                sx={{ minHeight: 44 }}
              >
                Back to Course
              </Button>
            </Stack>
          </Card>
        </Box>
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

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Top Bar */}
        <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1, zIndex: 40 }}>
          <Toolbar disableGutters sx={{ px: { xs: 1.5, md: 3 }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                sx={{ display: { xs: 'flex', lg: 'none' } }}
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
        
            <Stack direction="row" spacing={1.5} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Progress Ring */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <ProgressRing progress={progressPercent} size={50} />
              </Box>
              
              {/* Estimated Time */}
              {estimatedMinutes > 0 && (
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                  <Clock className="w-4 h-4" />
                  <Typography variant="body2">{estimatedMinutes} min</Typography>
                </Box>
              )}
              
              <IconButton onClick={() => setShowAI(true)} title="AI Assistant (A)" sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </IconButton>

              <AccessibilityControls />
              
              <IconButton
                onClick={() => setFocusModeEnabled(!focusModeEnabled)}
                sx={{ display: { xs: 'none', md: 'flex' } }}
                title="Focus mode (F)"
              >
                <Eye className="w-5 h-5" />
              </IconButton>
              
              <ThemeCustomizer />
              
              <Sheet>
                <SheetTrigger asChild>
                  <IconButton>
                    <Settings className="w-5 h-5" />
                  </IconButton>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Lesson Tools</SheetTitle>
                  </SheetHeader>
                  <Stack spacing={3} sx={{ mt: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Bookmarks</Typography>
                      <LessonBookmarks lessonId={lessonId} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Keyboard Shortcuts</Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">← → : Navigate lessons</Typography>
                        <Typography variant="caption" color="text.secondary">F : Fullscreen</Typography>
                        <Typography variant="caption" color="text.secondary">Ctrl+B : Bookmark</Typography>
                        <Typography variant="caption" color="text.secondary">/ : Search</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </SheetContent>
              </Sheet>

              <Button
                variant="outlined"
                onClick={() => navigate(`/CourseDetails?id=${courseId}`)}
                sx={{ fontWeight: 600 }}
              >
                EXIT COURSE
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Navigation Drawer */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: deviceType === 'mobile' ? 288 : 320,
              bgcolor: '#1e3a8a',
              color: 'white',
              mt: { xs: '56px', md: '64px' }
            }
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
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
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }
                }
              }}
              InputProps={{ startAdornment: <Search className="w-4 h-4 mr-2 opacity-60" /> }}
              aria-label="Search lessons"
            />
          </Box>

          {/* Course Title and Progress */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              {course?.title || 'Course Content'}
            </Typography>
            {enrollment && (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)' }}
                />
              </Stack>
            )}
          </Box>

          {/* Lessons List */}
          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
              <Box key={section}>
                <ListItemButton
                  onClick={() => toggleSection(section)}
                  sx={{
                    py: 1.5,
                    px: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <ListItemText primary={section} />
                  {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ListItemButton>

                {expandedSections[section] && (
                  <List sx={{ py: 0.5, pl: 0 }}>
                    {sectionLessons.filter(l => 
                      !searchQuery || 
                      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.section?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((l) => {
                      const completed = enrollment?.completed_lessons?.includes(l.id);
                      const isCurrent = l.id === lessonId;

                      return (
                        <ListItemButton
                          key={l.id}
                          onClick={() => navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 24, color: 'inherit', opacity: 0.6 }}>
                            <Menu className="w-4 h-4" />
                          </ListItemIcon>
                          <ListItemText primary={l.title} />
                          {completed && (
                            <CheckCircle size={20} style={{ color: 'white' }} />
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            ))}
          </List>

          {/* Close button for mobile */}
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowSidebar(false)}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <X className="w-5 h-5 mr-2" />
              Close Menu
            </Button>
          </Box>
        </Drawer>

        {/* Desktop Sidebar */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            width: 320,
            bgcolor: '#1e3a8a',
            color: 'white',
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider'
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
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
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }
                }
              }}
              InputProps={{ startAdornment: <Search className="w-4 h-4 mr-2 opacity-60" /> }}
              aria-label="Search lessons"
            />
          </Box>

          {/* Course Title and Progress */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              {course?.title || 'Course Content'}
            </Typography>
            {enrollment && (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)' }}
                />
              </Stack>
            )}
          </Box>

          {/* Lessons List */}
          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
              <Box key={section}>
                <ListItemButton
                  onClick={() => toggleSection(section)}
                  sx={{
                    py: 1.5,
                    px: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <ListItemText primary={section} />
                  {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ListItemButton>

                {expandedSections[section] && (
                  <List sx={{ py: 0.5, pl: 0 }}>
                    {sectionLessons.filter(l => 
                      !searchQuery || 
                      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.section?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((l) => {
                      const completed = enrollment?.completed_lessons?.includes(l.id);
                      const isCurrent = l.id === lessonId;

                      return (
                        <ListItemButton
                          key={l.id}
                          onClick={() => navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 24, color: 'inherit', opacity: 0.6 }}>
                            <Menu className="w-4 h-4" />
                          </ListItemIcon>
                          <ListItemText primary={l.title} />
                          {completed && (
                            <CheckCircle size={20} style={{ color: 'white' }} />
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>
            ))}
          </List>
        </Box>

        {/* Mobile Overlay */}
        <Backdrop
          open={showSidebar}
          onClick={() => setShowSidebar(false)}
          sx={{ display: { xs: 'block', lg: 'none' }, zIndex: 30 }}
        />

        {/* Main Content */}
        <Box
          component="main"
          ref={mainContentRef}
          id="lesson-content"
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="main"
          aria-label="Lesson content"
        >
          <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 6, md: 12 }, pb: { xs: 12, md: 6 } }}>
            {/* Breadcrumb Navigation */}
            <Box sx={{ mb: 2, printIcon: 'none' }}>
              <BreadcrumbNav 
                course={course}
                section={lesson?.section}
                lesson={lesson}
              />
            </Box>

            {/* Content Card */}
            <Card sx={{ rounded: 2, boxShadow: 1, p: { xs: 2, sm: 4, md: 6 } }}>
              {/* Title */}
              <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.25rem' },
                    fontWeight: 300,
                    lineHeight: 1.3,
                    color: 'text.primary',
                    mb: { xs: 2, sm: 3, md: 4 }
                  }}
                >
                  {lesson.title}
                </Typography>
              </Box>

              {/* Description */}
              {lesson.description && (
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    mb: { xs: 2, sm: 3 }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: typeof lesson.description === 'string'
                      ? lesson.description
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .replace(/&amp;/g, '&')
                      : lesson.description
                  }}
                />
              )}

              {/* Lesson Slides */}
              {lesson.slides && lesson.slides.length > 0 && (
                <Box sx={{ mt: { xs: 4, sm: 6 } }}>
                  {lesson.slides.map((slide, idx) => (
                    <Box key={idx} sx={{ mb: 4 }}>
                      {slide.title && (
                        <Typography 
                          variant="h4" 
                          sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontWeight: 600, mb: 2, color: 'text.primary' }}
                        >
                          {slide.title}
                        </Typography>
                      )}
                      {slide.content && (
                        <Box
                          sx={{ 
                            prose: true, 
                            color: 'text.primary', 
                            lineHeight: 1.7,
                            '& .math-error': {
                              display: 'none'
                            }
                          }}
                          dangerouslySetInnerHTML={{
                            __html: typeof slide.content === 'string'
                              ? slide.content
                                  .replace(/&lt;/g, '<')
                                  .replace(/&gt;/g, '>')
                                  .replace(/&quot;/g, '"')
                                  .replace(/&#39;/g, "'")
                                  .replace(/&amp;/g, '&')
                                  .replace(/<span[^>]*class="[^"]*math-error[^"]*"[^>]*>.*?<\/span>/gi, '')
                              : slide.content
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Media Player */}
              {lesson.video_url && (
                <Box sx={{ my: { xs: 2, sm: 4 } }}>
                  <EnhancedMediaPlayer
                    type="video"
                    src={lesson.video_url}
                  />
                </Box>
              )}

              {lesson.google_slides_url && (
                <Box sx={{ my: { xs: 2, sm: 4 } }}>
                  <UniversalLessonPlayer
                    lesson={lesson}
                    totalSlides={lesson.slides?.length || 20}
                  />
                </Box>
              )}

              {lesson.file_url && !lesson.video_url && !lesson.google_slides_url && (
                <Box sx={{ my: { xs: 2, sm: 4 } }}>
                  <EnhancedMediaPlayer
                    type="iframe"
                    src={lesson.file_url}
                  />
                </Box>
              )}

              {/* Learning Objectives */}
              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <List sx={{ mt: { xs: 2, sm: 4 }, py: 0 }}>
                  {lesson.learning_objectives.map((objective, idx) => (
                    <ListItem key={idx} sx={{ py: 1.5 }}>
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 24 }}>
                        •
                      </ListItemIcon>
                      <ListItemText
                        primary={objective}
                        primaryTypographyProps={{
                          variant: 'body1',
                          sx: { fontSize: { xs: '1rem', sm: '1.125rem' }, color: 'text.primary' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Interactive Elements - Generated from Learning Objectives */}
              {loadingInteractives && (
                <Box sx={{ mt: { xs: 4, sm: 6 }, textAlign: 'center', py: 4 }}>
                  <Box sx={{ width: 32, height: 32, border: '3px solid', borderColor: 'primary.main', borderRadius: '50%', borderTop: '3px solid', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', mx: 'auto', mb: 2 }} />
                  <Typography color="text.secondary">Generating interactive activities...</Typography>
                </Box>
              )}

              {!loadingInteractives && interactiveContent && (
                <Stack spacing={3} sx={{ mt: { xs: 4, sm: 6 } }}>
                  {interactiveContent.essayQuestions?.length > 0 && (
                    <EssayQuestion
                      questions={interactiveContent.essayQuestions}
                      onComplete={async (count) => {
                        toast.success(`Completed ${count} essay questions!`);
                        const response = await base44.functions.invoke('awardPoints', {
                          action: 'complete_quiz',
                          value: count * 20
                        });
                        if (response.data.success) {
                          setEarnedPoints(response.data.pointsEarned);
                          setShowPointsAnimation(true);
                        }
                      }}
                    />
                  )}

                  {interactiveContent.fillInTheBlanks?.length > 0 && (
                    <FillInTheBlanks
                      exercises={interactiveContent.fillInTheBlanks}
                      onComplete={async (score) => {
                        toast.success(`Completed ${score} exercises!`);
                        const response = await base44.functions.invoke('awardPoints', {
                          action: 'interactive_complete',
                          value: score * 10
                        });
                        if (response.data.success) {
                          setEarnedPoints(response.data.pointsEarned);
                          setShowPointsAnimation(true);
                        }
                      }}
                    />
                  )}

                  {interactiveContent.matchingPairs?.length > 0 && (
                    <MatchingGame
                      pairs={interactiveContent.matchingPairs}
                      onRegenerate={handleRegenerateInteractives}
                      onComplete={async (score) => {
                        toast.success(`Great job! You scored ${score} points!`);
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
                </Stack>
              )}
            </Card>

            {/* Navigation Buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 4 }, justifyContent: 'space-between' }}>
              <Button 
                variant="outlined"
                size="large"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                sx={{ flex: { xs: 1, sm: 'none' }, minHeight: 44 }}
              >
                ← Previous
              </Button>
              <Button 
                variant="contained"
                size="large"
                sx={{ flex: { xs: 1, sm: 'none' }, bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e2855' }, minHeight: 44 }}
                onClick={handleNextLesson}
                disabled={!nextLesson}
              >
                Next →
              </Button>
            </Stack>

            {/* Mark Complete Button */}
            {!isCompleted && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={() => {
                    markCompleteMutation.mutate();
                    haptic.success();
                  }}
                  disabled={markCompleteMutation.isPending}
                  sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }, gap: 1, minHeight: 48, fontSize: '1rem' }}
                >
                  <CheckCircle size={20} />
                  {markCompleteMutation.isPending ? 'Saving...' : 'Mark as Complete'}
                </Button>
              </Box>
            )}

            {/* Learning Enhancement Tools */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 4 }}>
              <StreakTracker />
              <StudyTimer />
            </Box>

            <Box sx={{ mt: 3 }}>
              <XPProgressBar 
                currentXP={currentXP}
                level={userLevel}
                showGain={showXPGain}
                gainAmount={xpGain}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <DifficultyRating 
                lessonId={lessonId}
                onComplete={() => toast.success('Thank you for your feedback!')}
              />
            </Box>

            {/* Related Lessons */}
            <Box sx={{ mt: 4 }}>
              <RelatedLessons 
                lessons={sortedLessons}
                courseId={courseId}
                currentLessonId={lessonId}
              />
            </Box>
          </Container>
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
          <Box sx={{ mt: 3 }}>
            <LessonNotes lessonId={lessonId} />
          </Box>
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

      {/* Shared AI Assistant */}
      <AIAssistantDialog
        open={showAI}
        onOpenChange={setShowAI}
        aiTab={aiTab} setAiTab={setAiTab}
        aiLoading={aiLoading}
        aiResponse={aiResponse} setAiResponse={setAiResponse}
        aiSummary={aiSummary}
        aiTranslation={aiTranslation}
        targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
        onAsk={q => askAI(q, lesson?.title || '')}
        onSummarise={() => summariseSlide(lesson?.slides?.map(s => `${s.title}: ${s.content?.replace(/<[^>]*>/g, '')}`).join('\n\n') || lesson?.title || '')}
        onDefine={defineWord}
        onTranslate={() => translateSlide(lesson?.title || '')}
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
          <Box sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', p: 4, borderRadius: 2, backdropFilter: 'blur(4px)', maxWidth: '100%' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>{lesson?.title}</Typography>
            {lesson?.description && <Typography sx={{ mb: 2 }}>{lesson.description}</Typography>}
            {lesson?.learning_objectives && (
              <ul style={{ color: 'white' }}>
                {lesson.learning_objectives.map((obj, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{obj}</li>
                ))}
              </ul>
            )}
          </Box>
        )}
      </ImprovedFocusMode>
    </ErrorBoundary>
  );
}