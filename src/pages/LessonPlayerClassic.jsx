import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ChevronLeft, ChevronRight, Check, ChevronDown, Menu, Search, X,
  Lock, Key, BookOpen, CheckCircle, Settings, Maximize, FileText, Bookmark, MessageSquare, Clock, RefreshCw, Eye
} from 'lucide-react';
import { 
  Box, Button, Card, CardContent, Drawer, IconButton, Typography, 
  AppBar, Toolbar, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  TextField, InputAdornment, Chip, CircularProgress
} from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading lesson...</Typography>
        </Box>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <BookOpen size={64} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>Lesson not found</Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
        </Box>
      </Box>
    );
  }

  // If locked, show lock screen
  if (isLessonLocked && !lessonLoading) {
    return (
      <>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #fff7ed, #fee2e2)' }}>
          <Card sx={{ maxWidth: 448, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <Lock size={32} color="#ea580c" />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Lesson Locked</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                This lesson requires an unlock key. Contact your tutor to get access.
              </Typography>
              <Button
                onClick={() => setShowUnlockDialog(true)}
                variant="contained"
                fullWidth
                startIcon={<Key size={16} />}
                sx={{ background: 'linear-gradient(to right, #ea580c, #dc2626)', mb: 1.5, '&:hover': { background: 'linear-gradient(to right, #c2410c, #b91c1c)' } }}
              >
                Enter Unlock Key
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                fullWidth
              >
                Back to Course
              </Button>
            </CardContent>
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
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50, transition: 'transform 0.3s', transform: `translateY(${Math.min(pullDistance, 80)}px)` }}>
          <Chip
            icon={<RefreshCw size={16} className={pullDistance > 80 ? 'animate-spin' : ''} />}
            label={pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            sx={{ bgcolor: '#2563eb', color: 'white', px: 2, py: 1.5, boxShadow: 4 }}
          />
        </Box>
      )}

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.100', fontSize: deviceType === 'mobile' ? '0.875rem' : '1rem' }}>
        {/* Top Bar */}
        <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary', height: deviceType === 'mobile' ? 56 : 64 }}>
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 1.5, md: 3 }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ display: { xs: 'inline-flex', lg: 'none' } }} onClick={() => setShowSidebar(!showSidebar)}>
                <Menu size={24} />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <ProgressRing progress={progressPercent} size={50} />
              </Box>
              
              {estimatedMinutes > 0 && (
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                  <Clock size={16} />
                  <Typography variant="body2">{estimatedMinutes} min</Typography>
                </Box>
              )}
              
              <AccessibilityControls />
              
              <IconButton
                onClick={() => setFocusModeEnabled(!focusModeEnabled)}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                title="Focus mode (F)"
              >
                <Eye size={20} />
              </IconButton>
              
              <ThemeCustomizer />
              
              <Drawer anchor="right" open={showNotesSheet} onClose={() => setShowNotesSheet(false)}>
                <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Lesson Tools</Typography>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 2 }}>Bookmarks</Typography>
                    <LessonBookmarks lessonId={lessonId} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 2 }}>Keyboard Shortcuts</Typography>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2">← → : Navigate lessons</Typography>
                      <Typography variant="body2">F : Fullscreen</Typography>
                      <Typography variant="body2">Ctrl+B : Bookmark</Typography>
                      <Typography variant="body2">/ : Search</Typography>
                    </Box>
                  </Box>
                </Box>
              </Drawer>

              <IconButton onClick={() => setShowNotesSheet(true)}>
                <Settings size={20} />
              </IconButton>

              <Button
                variant="outlined"
                onClick={() => navigate(`/CourseDetails?id=${courseId}`)}
                sx={{ fontWeight: 600 }}
              >
                EXIT COURSE
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Drawer
          variant="temporary"
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { 
              width: deviceType === 'mobile' ? 288 : 320, 
              bgcolor: '#1e3a8a', 
              color: 'white',
              marginTop: deviceType === 'mobile' ? '56px' : '64px',
              height: `calc(100% - ${deviceType === 'mobile' ? 56 : 64}px)`
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <TextField
                inputRef={searchInputRef}
                placeholder="Search... (Press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="rgba(255,255,255,0.6)" />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' } }
                }}
                sx={{ '& input': { color: 'white', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } } }}
              />
            </Box>

            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {course?.title || 'Course Content'}
              </Typography>
              {enrollment && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, fontSize: '0.875rem' }}>
                    <Typography variant="body2" fontWeight={600}>{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE</Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 50, height: 8 }}>
                    <Box
                      sx={{ bgcolor: 'white', borderRadius: 50, height: 8, transition: 'width 0.3s', width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <List>
                {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
                  <Box key={section}>
                    <ListItemButton onClick={() => toggleSection(section)} sx={{ px: 1.5, py: 1.5, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 1 }}>
                      <ListItemText primary={section} sx={{ '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 700 } }} />
                      {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </ListItemButton>

                    <Collapse in={expandedSections[section]}>
                      <List disablePadding sx={{ mt: 0.5 }}>
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
                                px: 1.5, 
                                py: 1.5, 
                                gap: 1.5, 
                                borderRadius: 1,
                                bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'transparent',
                                '&:hover': { bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 'auto' }}>
                                <Menu size={16} color="rgba(255,255,255,0.6)" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={l.title} 
                                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                              />
                              {completed && (
                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Check size={16} color="#1e3a8a" />
                                </Box>
                              )}
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)', display: { xs: 'block', lg: 'none' } }}>
              <Button 
                onClick={() => setShowSidebar(false)}
                fullWidth
                startIcon={<X size={20} />}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, borderRadius: 2 }}
              >
                Close Menu
              </Button>
            </Box>
          </Box>
        </Drawer>

                {/* Desktop Sidebar */}
                <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            width: 320,
            bgcolor: '#1e3a8a',
            color: 'white',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <TextField
              inputRef={searchInputRef}
              placeholder="Search... (Press /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="rgba(255,255,255,0.6)" />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }
              }}
              sx={{ '& input': { color: 'white', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } } }}
            />
          </Box>

          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {course?.title || 'Course Content'}
            </Typography>
            {enrollment && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, fontSize: '0.875rem' }}>
                  <Typography variant="body2" fontWeight={600}>{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 50, height: 8 }}>
                  <Box
                    sx={{ bgcolor: 'white', borderRadius: 50, height: 8, transition: 'width 0.3s', width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <List>
              {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
                <Box key={section}>
                  <ListItemButton onClick={() => toggleSection(section)} sx={{ px: 1.5, py: 1.5, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 1 }}>
                    <ListItemText primary={section} sx={{ '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 700 } }} />
                    {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </ListItemButton>

                  <Collapse in={expandedSections[section]}>
                    <List disablePadding sx={{ mt: 0.5 }}>
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
                              px: 1.5, 
                              py: 1.5, 
                              gap: 1.5, 
                              borderRadius: 1,
                              bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'transparent',
                              '&:hover': { bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              <Menu size={16} color="rgba(255,255,255,0.6)" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={l.title} 
                              sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                            />
                            {completed && (
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={16} color="#1e3a8a" />
                              </Box>
                            )}
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              ))}
            </List>
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)', display: { xs: 'block', lg: 'none' } }}>
            <Button 
              onClick={() => setShowSidebar(false)}
              fullWidth
              startIcon={<X size={20} />}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, borderRadius: 2 }}
            >
              Close Menu
            </Button>
          </Box>
          </Box>
        </Drawer>

      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: 320,
          bgcolor: '#1e3a8a',
          color: 'white',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)'
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <TextField
            placeholder="Search... (Press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="rgba(255,255,255,0.6)" />
                </InputAdornment>
              ),
              sx: { bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }
            }}
            sx={{ '& input': { color: 'white', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } } }}
          />
        </Box>

        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {course?.title || 'Course Content'}
          </Typography>
          {enrollment && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, fontSize: '0.875rem' }}>
                <Typography variant="body2" fontWeight={600}>{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}% COMPLETE</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 50, height: 8 }}>
                <Box
                  sx={{ bgcolor: 'white', borderRadius: 50, height: 8, transition: 'width 0.3s', width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
              <Box key={section}>
                <ListItemButton onClick={() => toggleSection(section)} sx={{ px: 1.5, py: 1.5, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 1 }}>
                  <ListItemText primary={section} sx={{ '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 700 } }} />
                  {expandedSections[section] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ListItemButton>

                <Collapse in={expandedSections[section]}>
                  <List disablePadding sx={{ mt: 0.5 }}>
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
                            px: 1.5, 
                            py: 1.5, 
                            gap: 1.5, 
                            borderRadius: 1,
                            bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': { bgcolor: isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 'auto' }}>
                            <Menu size={16} color="rgba(255,255,255,0.6)" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={l.title} 
                            sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                          />
                          {completed && (
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={16} color="#1e3a8a" />
                            </Box>
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </Box>
      </Box>

      {/* Main Content */}
        <Box
          component="main" 
          ref={mainContentRef}
          id="lesson-content"
          sx={{ flex: 1, overflowY: 'auto', bgcolor: 'grey.100' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="main"
          aria-label="Lesson content"
        >
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, sm: 6 }, pb: { xs: 12, md: 6 } }}>
            <Box className="no-print" sx={{ mb: 2 }}>
              <BreadcrumbNav 
                course={course}
                section={lesson?.section}
                lesson={lesson}
              />
            </Box>

            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent sx={{ p: { xs: 2, sm: 4, lg: 6 } }}>
                <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
                  <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem', lg: '2.25rem' }, fontWeight: 300, color: 'grey.800', mb: { xs: 2, sm: 4 } }}>
                    {lesson.title}
                  </Typography>
                </Box>

                {lesson.description && (
                  <Typography sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, color: 'grey.700', lineHeight: 1.75, mb: { xs: 2, sm: 3 } }}>
                    {lesson.description}
                  </Typography>
                )}

                {lesson.video_url && (
                  <Box sx={{ my: { xs: 2, sm: 4 }, mx: { xs: -2, sm: 0 } }}>
                    <EnhancedMediaPlayer
                      type="video"
                      src={lesson.video_url}
                    />
                  </Box>
                )}

                {lesson.google_slides_url && (
                  <Box sx={{ my: { xs: 2, sm: 4 }, mx: { xs: -2, sm: 0 } }}>
                    <EnhancedMediaPlayer
                      type="google-slides"
                      src={lesson.google_slides_url.includes('/embed') 
                        ? lesson.google_slides_url 
                        : lesson.google_slides_url.replace('/edit', '/embed')}
                    />
                  </Box>
                )}

                {lesson.file_url && !lesson.video_url && !lesson.google_slides_url && (
                  <Box sx={{ my: { xs: 2, sm: 4 }, mx: { xs: -2, sm: 0 } }}>
                    <EnhancedMediaPlayer
                      type="iframe"
                      src={lesson.file_url}
                    />
                  </Box>
                )}

                {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, mt: { xs: 3, sm: 4 } }}>
                    {lesson.learning_objectives.map((objective, idx) => (
                      <Box component="li" key={idx} sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 } }}>
                        <Typography sx={{ color: '#1e3a8a', fontSize: { xs: '1.25rem', sm: '1.5rem' }, lineHeight: 1 }}>•</Typography>
                        <Typography sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, color: 'grey.700' }}>{objective}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {loadingInteractives && (
                  <Box sx={{ mt: { xs: 4, sm: 6 }, textAlign: 'center', py: 4 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Generating interactive activities...</Typography>
                  </Box>
                )}

                {!loadingInteractives && interactiveContent && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: { xs: 4, sm: 6 } }}>
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
                  </Box>
                )}
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: { xs: 3, sm: 4 }, gap: { xs: 1, sm: 2 } }}>
              <Button 
                variant="outlined"
                size="large"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                ← Previous
              </Button>
              <Button 
                variant="contained"
                size="large"
                onClick={handleNextLesson}
                disabled={!nextLesson}
                sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: 'rgba(30, 58, 138, 0.9)' }, flex: { xs: 1, sm: 'none' } }}
              >
                Next →
              </Button>
            </Box>

            {!isCompleted && (
              <Box className="no-print" sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    markCompleteMutation.mutate();
                    haptic.success();
                  }}
                  disabled={markCompleteMutation.isPending}
                  startIcon={<CheckCircle size={20} />}
                  sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, minHeight: 44, minWidth: 44 }}
                >
                  {markCompleteMutation.isPending ? 'Saving...' : 'Mark as Complete'}
                </Button>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 4 }}>
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

            <Box className="no-print" sx={{ mt: 4 }}>
              <RelatedLessons 
                lessons={sortedLessons}
                courseId={courseId}
                currentLessonId={lessonId}
              />
            </Box>
          </Box>
        </Box>
      </Box>

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

      <QuickActions
        lesson={lesson}
        onOpenNotes={() => setShowNotesSheet(true)}
        onAddBookmark={() => setShowBookmarksSheet(true)}
        onOpenDiscussion={() => navigate(`/CourseDiscussion?id=${courseId}`)}
      />

      <Drawer anchor="right" open={showNotesSheet} onClose={() => setShowNotesSheet(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 500 }, p: 3, overflowY: 'auto' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>My Notes</Typography>
          <LessonNotes lessonId={lessonId} />
        </Box>
      </Drawer>

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