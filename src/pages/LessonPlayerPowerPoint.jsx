import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  FileText, Presentation, ChevronLeft, ChevronRight, X, 
  CheckCircle, Target, Maximize, Minimize, Home, BookOpen, Layout, ClipboardCheck, ZoomIn, ZoomOut, Minimize2,
  Bookmark, BookmarkCheck, Search, Sparkles, Pencil, Eraser, Settings, Volume2, Eye, Brain, List, Plus, Trash2, Lock, Key, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { 
  Box, Button, Card, CardContent, IconButton, Typography, Chip, TextField,
  Dialog, DialogTitle, DialogContent, Menu, MenuItem, Divider, Collapse,
  CircularProgress, InputAdornment, Select, FormControl, InputLabel
} from '@mui/material';
import { toast } from 'sonner';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import DocumentViewer from '@/components/lesson/DocumentViewer';
import LessonContentRenderer from '@/components/lesson/LessonContentRenderer';
import FeedbackButton from '@/components/lesson/FeedbackButton';


export default function LessonPlayerPowerPoint() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const urlCourseId = params.get('course');

  // State Management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [bookmarkedSlides, setBookmarkedSlides] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#FF0000');
  const [drawings, setDrawings] = useState([]);
  const [showOutline, setShowOutline] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiHelpLoading, setAIHelpLoading] = useState(false);
  const [aiHelpResponse, setAIHelpResponse] = useState('');
  const [aiHelpQuery, setAIHelpQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [showPresentationControls, setShowPresentationControls] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState({
    fontSize: 100,
    contrast: 'normal',
    dyslexiaFont: false,
    textToSpeech: false
  });
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  
  // Touch state for Swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData?.lesson_bookmarks) {
        setBookmarkedSlides(userData.lesson_bookmarks[lessonId] || []);
      }
    };
    loadUser();
  }, [lessonId]);

  // Data Fetching logic
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => base44.entities.Lesson.filter({ id: lessonId }),
    enabled: !!lessonId
  });

  const lesson = currentLessonArray[0];
  const courseId = urlCourseId || lesson?.course_id;
  
  // Define these early so they can be used in event handlers
  const hasSlides = lesson?.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      return enrollments[0];
    },
    enabled: !!courseId
  });

  // Lock Logic
  useEffect(() => {
    if (!lesson || !enrollment || !courseLessons.length) return;
    if (user && (user.role === 'admin' || user.is_tutor)) { setIsLessonLocked(false); return; }
    
    const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
    if (sortedLessons[0]?.id === lessonId) { setIsLessonLocked(false); return; }

    const unlockedLessons = enrollment.unlocked_lessons || [];
    const unlockData = unlockedLessons.find(ul => ul.lesson_id === lessonId);
    
    if (!unlockData) { setIsLessonLocked(true); return; }

    const now = new Date();
    const expiryDate = new Date(unlockData.expires_at);
    if (now > expiryDate) setIsLessonLocked(true); 
    else setIsLessonLocked(false);
  }, [lesson, enrollment, courseLessons, lessonId, user]);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['lessonQuizzes', lessonId, courseId],
    queryFn: async () => {
      if (!courseId || courseId === 'null') return [];
      const allQuizzes = await base44.entities.Quiz.filter({ course_id: courseId });
      return allQuizzes.filter(q => q.lesson_id === lessonId || !q.lesson_id || q.lesson_id === 'null');
    },
    enabled: !!courseId && courseId !== 'null'
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

  // Fullscreen/Pres handling
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const togglePresentation = () => {
    setIsPresenting(!isPresenting);
    toast(!isPresenting ? "Presentation Mode: ON" : "Presentation Mode: OFF");
    
    // Focus the main element to ensure keyboard events work
    setTimeout(() => {
      const mainElement = document.querySelector('main[tabindex="0"]');
      if (mainElement) {
        mainElement.focus();
      }
    }, 100);
  };

  // Show controls on mouse/touch movement in presentation mode
  const handleShowControls = () => {
    if (!isPresenting) return;
    setShowPresentationControls(true);
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowPresentationControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (isPresenting) {
      handleShowControls();
    }
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isPresenting]);

  // Touch/Swipe Logic
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !lesson) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    const slides = lessonHasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

    // For custom slides navigation
    if (lessonHasSlides) {
      if (isLeftSwipe && currentSlideIndex < slides.length - 1) {
        setCurrentSlideIndex(curr => curr + 1);
      }
      if (isRightSwipe && currentSlideIndex > 0) {
        setCurrentSlideIndex(curr => curr - 1);
      }
    }
  };

  // Keyboard navigation - FIXED with proper dependencies
  useEffect(() => {
    if (!lesson) return;
    
    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    const slides = lessonHasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
    
    const handleKeyDown = (e) => {
      // Escape key to exit presentation mode
      if (e.key === 'Escape' && isPresenting) {
        setIsPresenting(false);
        return;
      }

      // For custom slides (internal content), handle navigation
      if (lessonHasSlides) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentSlideIndex(prev => Math.max(0, prev - 1));
        }
      }
      // For Google Slides/external content: Let the iframe handle its own keyboard events
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, lesson, currentSlideIndex]);

  // Nav Logic
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];

  const handleNextLesson = () => nextLesson && navigate(`/LessonPlayerPowerPoint?lesson=${nextLesson.id}&course=${courseId}`);
  const handlePrevLesson = () => prevLesson && navigate(`/LessonPlayerPowerPoint?lesson=${prevLesson.id}&course=${courseId}`);

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  const slideUrl = lesson ? (() => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
    }
    return lesson.file_url || null;
    })() : null;
  
  // Bookmark functionality
  const toggleBookmark = async (slideIndex) => {
    const updatedBookmarks = bookmarkedSlides.includes(slideIndex)
      ? bookmarkedSlides.filter(i => i !== slideIndex)
      : [...bookmarkedSlides, slideIndex];
    
    setBookmarkedSlides(updatedBookmarks);
    
    const allBookmarks = { ...(user?.lesson_bookmarks || {}), [lessonId]: updatedBookmarks };
    await base44.auth.updateMe({ lesson_bookmarks: allBookmarks });
    toast.success(updatedBookmarks.includes(slideIndex) ? 'Bookmark added' : 'Bookmark removed');
  };

  // AI Summary generation - FIXED
  const generateAISummary = async () => {
    if (!lesson) return;
    
    setLoadingSummary(true);
    setShowAISummary(true);
    
    try {
      const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
      const slides = lessonHasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
      const slideContent = lessonHasSlides 
        ? slides.map(s => `${s.title}: ${s.content}`).join('\n\n')
        : 'Google Slides presentation';
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this lesson content and provide a concise, structured summary with key takeaways:\n\nLesson: ${lesson.title}\n\nContent:\n${slideContent}`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_points: { type: 'array', items: { type: 'string' } },
            suggested_focus: { type: 'string' }
          }
        }
      });
      
      setAiSummary(response);
    } catch (error) {
      toast.error('Failed to generate summary');
      setShowAISummary(false);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Search functionality - FIXED
  const searchResults = lesson && searchQuery ? (() => {
    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    if (!lessonHasSlides) return [];
    const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    return slides.map((slide, idx) => ({
      index: idx,
      title: slide.title,
      matches: slide.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               slide.title?.toLowerCase().includes(searchQuery.toLowerCase())
    })).filter(s => s.matches);
  })() : [];

  // Drawing functionality
  const startDrawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawings([...drawings, { x, y, color: drawColor, type: 'start' }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawings([...drawings, { x, y, color: drawColor, type: 'draw' }]);
  };

  const clearDrawings = () => {
    setDrawings([]);
    toast.success('Drawings cleared');
  };

  // Render drawings on canvas
  useEffect(() => {
    if (!canvasRef.current || drawings.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let isDrawingPath = false;
    drawings.forEach((point) => {
      if (point.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        isDrawingPath = true;
      } else if (isDrawingPath) {
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });
  }, [drawings]);

  // AI Contextual Help - FIXED
  const askAIAboutSlide = async (query = '') => {
    if (!lesson) return;
    
    setAIHelpLoading(true);
    setShowAIHelp(true);
    
    try {
      const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
      const slides = lessonHasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
      const currentSlide = slides[currentSlideIndex];
      const slideContext = currentSlide ? `${currentSlide.title}: ${currentSlide.content}` : 'Current slide content';
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful tutor assistant. The student is viewing a lesson slide with the following content:\n\n${slideContext}\n\nStudent's question: ${query || 'Can you explain this slide in simple terms?'}\n\nProvide a clear, concise, and educational response.`,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            key_points: { type: 'array', items: { type: 'string' } },
            related_topics: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      setAIHelpResponse(response);
    } catch (error) {
      toast.error('Failed to get AI help');
    } finally {
      setAIHelpLoading(false);
    }
  };

  // Note-taking - FIXED
  const addNote = () => {
    if (!currentNote.trim() || !lesson) return;
    
    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    const slides = lessonHasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
    
    const newNote = {
      id: Date.now(),
      content: currentNote,
      slideIndex: currentSlideIndex,
      slideTitle: slides[currentSlideIndex]?.title || 'Slide',
      timestamp: new Date().toISOString(),
      slideNumber: currentSlideIndex + 1
    };
    
    setNotes([...notes, newNote]);
    setCurrentNote('');
    toast.success('Note saved');
  };

  // Generate flashcards - FIXED
  const generateFlashcards = async () => {
    if (!lesson) return;
    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    if (!lessonHasSlides) return;
    
    try {
      const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentSlide = slides[currentSlideIndex];
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3-5 flashcard questions and answers from this slide content:\n\nTitle: ${currentSlide.title}\nContent: ${currentSlide.content}\n\nCreate educational flashcards that test understanding of key concepts.`,
        response_json_schema: {
          type: 'object',
          properties: {
            flashcards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' }
                }
              }
            }
          }
        }
      });
      
      setFlashcards([...flashcards, ...response.flashcards]);
      setShowFlashcards(true);
      toast.success(`Generated ${response.flashcards.length} flashcards`);
    } catch (error) {
      toast.error('Failed to generate flashcards');
    }
  };

  // Text-to-speech - FIXED
  const speakSlideContent = () => {
    if (!lesson || !window.speechSynthesis) return;
    const lessonHasSlides = lesson?.slides && lesson.slides.length > 0;
    if (!lessonHasSlides) return;
    
    const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentSlide = slides[currentSlideIndex];
    const text = `${currentSlide.title}. ${currentSlide.content?.replace(/<[^>]*>/g, '')}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    toast.success('Reading slide content');
  };

  if (lessonLoading || lessonsLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#f97316', mb: 2 }} />
          <Typography sx={{ color: 'white' }}>Loading lesson...</Typography>
        </Box>
      </Box>
    );
  }

  if (!lesson && !lessonLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <BookOpen size={64} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>Lesson not found</Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2, bgcolor: '#1e293b', '&:hover': { bgcolor: '#334155' } }}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLessonLocked && !lessonLoading) {
    return (
      <>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #fff7ed, #fee2e2)' }}>
          <Card sx={{ maxWidth: 448 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
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
              <Button variant="outlined" onClick={() => navigate(-1)} fullWidth>
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

  const LessonInfoContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {quizzes.length > 0 && (
        <Button
          onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)}
          variant="contained"
          fullWidth
          endIcon={<ChevronRight size={20} />}
          sx={{ background: 'linear-gradient(to right, #9333ea, #ec4899)', p: { xs: 1.5, sm: 2 }, borderRadius: 3, boxShadow: 1, '&:hover': { background: 'linear-gradient(to right, #7e22ce, #db2777)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ClipboardCheck size={20} />
            <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Take Quiz</Typography>
          </Box>
        </Button>
      )}
      {lesson.learning_objectives?.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: 1, border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              <Target size={16} color="#2563eb" /> Learning Objectives
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {lesson.learning_objectives.map((obj, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <CheckCircle size={14} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{obj}</span>
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  return (
    <Box ref={playerRef} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none', bgcolor: isPresenting ? 'black' : 'background.default' }}>

      {!isPresenting && (
        <Box sx={{ flexShrink: 0, zIndex: 50, boxShadow: 2 }}>
          <Box sx={{ bgcolor: '#FF8C00', color: 'white', height: { xs: 48, sm: 40 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
              <IconButton size="small" onClick={() => navigate(-1)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <ChevronLeft size={20} />
              </IconButton>
              <Presentation size={16} style={{ display: 'none' }} className="sm:block" />
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson?.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Layout size={18} />
              </IconButton>
              <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={() => setMobileMenuAnchor(null)}>
                <MenuItem onClick={() => { navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`); setMobileMenuAnchor(null); }}>
                  <Presentation size={16} style={{ marginRight: 8 }} /> PowerPoint
                </MenuItem>
                <MenuItem onClick={() => { navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`); setMobileMenuAnchor(null); }}>
                  <Layout size={16} style={{ marginRight: 8 }} /> Classic
                </MenuItem>
              </Menu>
              <IconButton size="small" onClick={togglePresentation} sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Presentation size={18} />
              </IconButton>
              <IconButton size="small" onClick={toggleFullscreen} sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </IconButton>
              <IconButton size="small" onClick={generateAISummary} sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'white', '&:active': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Sparkles size={18} />
              </IconButton>
              <Button onClick={() => navigate(-1)} size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, fontSize: '0.75rem', px: 1.5 }}>
                Exit
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, height: 64, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', alignItems: 'center', px: 2.5, gap: 2, overflowX: 'auto' }}>
            <Box onClick={() => navigate(`/CourseDetails?id=${courseId}`)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <Home size={20} />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Exit</Typography>
            </Box>
            <Box sx={{ width: 1, height: 40, bgcolor: 'divider' }} />
            <Box>
              <Box onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
                <Layout size={20} />
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Style</Typography>
              </Box>
              <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={() => setMobileMenuAnchor(null)}>
                <MenuItem onClick={() => { navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`); setMobileMenuAnchor(null); }}>
                  <Presentation size={16} style={{ marginRight: 8 }} /> PowerPoint (Default)
                </MenuItem>
                <MenuItem onClick={() => { navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`); setMobileMenuAnchor(null); }}>
                  <Layout size={16} style={{ marginRight: 8 }} /> Classic Style
                </MenuItem>
                {(user?.role === 'admin' || user?.is_tutor) && lesson && (
                  <>
                    <Divider />
                    <MenuItem 
                      onClick={async () => {
                        await base44.entities.Lesson.update(lessonId, { default_player: 'LessonPlayerPowerPoint' });
                        toast.success('PowerPoint set as default for this lesson');
                        setMobileMenuAnchor(null);
                      }}
                    >
                      <CheckCircle size={16} style={{ marginRight: 8 }} /> Set PowerPoint as Default
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
            {lesson?.google_slides_url && !hasSlides && (user?.role === 'admin' || user?.is_tutor) && (
              <Box onClick={async () => {
                if (!confirm('Convert this Google Slides presentation to custom slides? This will extract text and images. Some formatting may be lost.')) return;
                toast.loading('Converting Google Slides...');
                try {
                  const response = await base44.functions.invoke('convertGoogleSlideToCustom', { lessonId });
                  if (response.data.success) {
                    toast.success(`Converted ${response.data.slideCount} slides successfully!`);
                    queryClient.invalidateQueries(['lesson', lessonId]);
                    setTimeout(() => window.location.reload(), 1000);
                  }
                } catch (error) {
                  toast.error('Failed to convert Google Slides');
                }
              }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
                <FileText size={20} color="#6366f1" />
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Convert</Typography>
              </Box>
            )}
            <Box onClick={togglePresentation} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <Presentation size={20} />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Present</Typography>
            </Box>
            <Box onClick={toggleFullscreen} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Full</Typography>
            </Box>
            <Box onClick={() => setShowSearch(!showSearch)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <Search size={20} />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Search</Typography>
            </Box>
            <Box onClick={generateAISummary} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <Sparkles size={20} color="#9333ea" />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>AI</Typography>
            </Box>
            <Box onClick={() => setShowNotes(!showNotes)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <BookOpen size={20} color="#2563eb" />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Notes</Typography>
            </Box>
            <Box onClick={() => setShowOutline(!showOutline)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
              <Layout size={20} />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Outline</Typography>
            </Box>
            {!isCompleted && (
              <Box onClick={() => markCompleteMutation.mutate()} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer', minWidth: 64 }}>
                <CheckCircle size={20} color="#16a34a" />
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', mt: 0.5, color: 'text.secondary' }}>Done</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {isPresenting && (
        <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 100, display: 'flex', gap: 1.5 }}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ChevronLeft size={18} />}
            sx={{ bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', px: 2.5, py: 1.25, borderRadius: 2, boxShadow: 8, '&:hover': { bgcolor: 'rgba(0,0,0,0.9)', transform: 'scale(1.05)' }, transition: 'all 0.3s' }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back</Box>
          </Button>
          <Button
            onClick={togglePresentation}
            startIcon={<X size={18} />}
            sx={{ bgcolor: 'rgba(220, 38, 38, 0.8)', backdropFilter: 'blur(12px)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', px: 2.5, py: 1.25, borderRadius: 2, boxShadow: 8, '&:hover': { bgcolor: '#dc2626', transform: 'scale(1.05)' }, transition: 'all 0.3s' }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Exit</Box>
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', flexDirection: { xs: 'column', sm: 'row' }, minHeight: 0 }}>
        
        {!isPresenting && showOutline && (
          <Box component="aside" sx={{ display: { xs: 'none', md: 'flex' }, width: 208, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', overflowY: 'auto', flexDirection: 'column', p: 1.5, gap: 1.5, zIndex: 40 }}>
            {sortedLessons.map((l, idx) => (
              <Box 
                key={l.id} 
                onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${l.id}&course=${courseId}`)} 
                sx={{ 
                  aspectRatio: '16/9', 
                  border: l.id === lessonId ? '2px solid #f97316' : 1, 
                  borderColor: l.id === lessonId ? '#f97316' : 'divider',
                  bgcolor: l.id === lessonId ? '#fff7ed' : 'transparent',
                  borderRadius: 1, 
                  p: 0.5, 
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#f97316' }
                }}
              >
                <Box sx={{ width: '100%', height: '100%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', textAlign: 'center', p: 0.5, fontWeight: 500 }}>
                  <Typography sx={{ fontSize: '0.625rem' }}>{l.title}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 0.3s',
            position: 'relative',
            bgcolor: isPresenting ? 'black' : { xs: 'black', sm: 'action.hover' },
            justifyContent: isPresenting ? 'center' : 'flex-start',
            p: isPresenting ? 0 : { xs: 0, sm: 3, md: 5 },
            overflowY: isPresenting ? 'hidden' : 'auto',
            minHeight: 0
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseMove={handleShowControls}
          tabIndex={0}
        >
          {!isPresenting && (
            <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', boxShadow: 1, zIndex: 20, flexShrink: 0 }}>
              <Button
                onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                fullWidth
                sx={{ justifyContent: 'space-between', px: 2, py: 1.25, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }, borderRadius: 0 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info size={14} color="#3b82f6" />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Lesson Info & Quiz</Typography>
                </Box>
                {isMobileInfoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>

              <Collapse in={isMobileInfoOpen}>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', maxHeight: '35vh', overflowY: 'auto' }}>
                  <LessonInfoContent />
                </Box>
              </Collapse>
            </Box>
          )}

          {!isPresenting && (
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', maxWidth: 960, mb: 2 }}>
              <LessonInfoContent />
            </Box>
          )}

          {!isPresenting && lesson?.video_url && (
            <Box sx={{ width: '100%', maxWidth: 960, mb: { xs: 2, sm: 3 }, flexShrink: 0 }}>
              <Box sx={{ background: 'linear-gradient(to bottom right, white, rgba(239, 246, 255, 0.2), rgba(238, 242, 255, 0.2))', borderRadius: { xs: 3, sm: 4 }, boxShadow: 8, overflow: 'hidden', border: 2, borderColor: '#e0e7ff', outline: { xs: '2px solid #eef2ff', sm: '4px solid #eef2ff' }, outlineOffset: { xs: 2, sm: 4 } }}>
                <Box sx={{ aspectRatio: '16/9', bgcolor: 'black' }}>
                  <Box
                    component="video"
                    src={lesson.video_url}
                    controls
                    controlsList="nodownload"
                    sx={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'all 0.5s', 
            bgcolor: 'black', 
            mb: 3,
            width: isPresenting ? '100%' : { xs: '100%', sm: 960 },
            height: isPresenting ? '100%' : 'auto',
            minHeight: isPresenting ? '100vh' : 0,
            aspectRatio: isPresenting ? 'auto' : '16/9',
            boxShadow: isPresenting ? 0 : { xs: 0, sm: 8 },
            borderRadius: isPresenting ? 0 : { xs: 0, sm: 2 }
          }}>
            
            {isPresenting && (
              <Box
                component="canvas"
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                sx={{ 
                  position: 'absolute', 
                  inset: 0, 
                  zIndex: 50,
                  cursor: isDrawing ? 'crosshair' : 'default',
                  pointerEvents: isDrawing ? 'auto' : 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
              />
            )}

            <Box sx={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', bgcolor: 'black', position: 'relative', minHeight: 0 }}>
              {lesson?.file_url && lesson?.file_type === 'pptx' ? (
                <DocumentViewer fileUrl={lesson.file_url} fileType={lesson.file_type} />
              ) : slideUrl ? (
                <>
                  <iframe 
                    src={slideUrl} 
                    className="w-full h-full border-0 block"
                    allowFullScreen
                    title="Lesson Slides"
                  />
                  {/* Transparent touch overlay for Google Slides - captures edge swipes only */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-16 pointer-events-auto"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    />
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-16 pointer-events-auto"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    />
                  </div>
                </>
              ) : hasSlides ? (
                <TransformWrapper disabled={isPresenting || window.innerWidth < 640}>
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {!isPresenting && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                          <IconButton onClick={() => zoomIn()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, border: 1, borderColor: 'divider', boxShadow: 1 }}>
                            <ZoomIn size={16} />
                          </IconButton>
                          <IconButton onClick={() => zoomOut()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, border: 1, borderColor: 'divider', boxShadow: 1 }}>
                            <ZoomOut size={16} />
                          </IconButton>
                          <IconButton onClick={() => resetTransform()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, border: 1, borderColor: 'divider', boxShadow: 1 }}>
                            <Minimize2 size={16} />
                          </IconButton>
                        </Box>
                      )}
                      <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%', 
                          bgcolor: 'background.paper', 
                          color: 'text.primary', 
                          p: { xs: 2, sm: 6 }, 
                          overflowY: 'auto', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          fontSize: `${accessibilityMode.fontSize}%`,
                          filter: accessibilityMode.contrast === 'high' ? 'contrast(1.5)' : accessibilityMode.contrast === 'inverted' ? 'invert(1)' : 'none',
                          fontFamily: accessibilityMode.dyslexiaFont ? 'Comic Sans MS, cursive' : 'inherit'
                        }}>
                          <Box sx={{ maxWidth: 1024, width: '100%' }}>
                            <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.875rem' }, fontWeight: 700, mb: 2 }}>{sortedSlides[currentSlideIndex]?.title}</Typography>
                            <Box className="prose prose-sm sm:prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex]?.content }} />
                          </Box>
                        </Box>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              ) : (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', bgcolor: '#374151' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <FileText size={64} color="#6b7280" style={{ margin: '0 auto 16px' }} />
                    <Typography color="#9ca3af">No Content</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {!isPresenting && (
              <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, px: 2, display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', alignItems: 'center', zIndex: 50, pointerEvents: 'none' }}>
                <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto' }}>
                  {hasSlides && (
                    <IconButton
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      sx={{ width: 40, height: 40, bgcolor: 'rgba(17, 24, 39, 0.8)', color: 'white', borderRadius: '50%', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', '&:active': { bgcolor: '#f97316' }, '&:disabled': { opacity: 0.3 } }}
                    >
                      <ChevronLeft size={20} />
                    </IconButton>
                  )}
                </Box>
                
                <Chip
                  label={`${currentSlideIndex + 1} / ${sortedSlides.length || 1}`}
                  sx={{ bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', color: 'white', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.1)' }}
                />

                <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto' }}>
                  {hasSlides && (
                    <IconButton
                      onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === sortedSlides.length - 1}
                      sx={{ width: 40, height: 40, bgcolor: 'rgba(17, 24, 39, 0.8)', color: 'white', borderRadius: '50%', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', '&:active': { bgcolor: '#f97316' }, '&:disabled': { opacity: 0.3 } }}
                    >
                      <ChevronRight size={20} />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={toggleFullscreen}
                    sx={{ width: 40, height: 40, bgcolor: 'rgba(17, 24, 39, 0.8)', color: 'white', borderRadius: '50%', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', '&:active': { bgcolor: '#2563eb' } }}
                  >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize size={18} />}
                  </IconButton>
                </Box>
              </Box>
            )}

          </Box>
        </Box>

        {!isPresenting && lesson && (
          <Box sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', px: { xs: 2, sm: 3 }, py: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <FeedbackButton lesson={lesson} courseId={courseId} />
          </Box>
        )}
      </Box>

      {!isPresenting && (
        <Box component="footer" sx={{ display: { xs: 'none', sm: 'flex' }, height: 48, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', px: 2, fontSize: '0.75rem', color: 'text.secondary', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Typography variant="caption">Lesson {currentLessonIndex + 1} of {sortedLessons.length}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handlePrevLesson} disabled={!prevLesson} startIcon={<ChevronLeft size={14} />} sx={{ fontSize: '0.75rem', '&:hover': { color: '#f97316' }, '&:disabled': { opacity: 0.5 } }}>
                Prev Lesson
              </Button>
              <Button size="small" onClick={handleNextLesson} disabled={!nextLesson} endIcon={<ChevronRight size={14} />} sx={{ fontSize: '0.75rem', '&:hover': { color: '#f97316' }, '&:disabled': { opacity: 0.5 } }}>
                Next Lesson
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {hasSlides && (
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}>
                <IconButton size="small" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} sx={{ '&:hover': { bgcolor: 'action.selected' }, '&:disabled': { opacity: 0.3 } }}>
                  <ChevronLeft size={16} />
                </IconButton>
                <Typography sx={{ px: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>{currentSlideIndex + 1} / {sortedSlides.length}</Typography>
                <IconButton size="small" onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === sortedSlides.length - 1} sx={{ '&:hover': { bgcolor: 'action.selected' }, '&:disabled': { opacity: 0.3 } }}>
                  <ChevronRight size={16} />
                </IconButton>
              </Box>
            )}
            <Button size="small" onClick={togglePresentation} startIcon={<Presentation size={14} />} sx={{ fontSize: '0.75rem', '&:hover': { bgcolor: 'action.hover' } }}>
              Present
            </Button>
            <IconButton size="small" onClick={toggleFullscreen} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </IconButton>
          </Box>
        </Box>
      )}

      {isPresenting && showPresentationControls && (
        <Box sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1.5, zIndex: 90, bgcolor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 2, p: 1.5, boxShadow: 8, transition: 'opacity 0.3s' }}>
          {hasSlides && (
            <>
              <IconButton onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, color: 'white', borderRadius: 2, '&:disabled': { opacity: 0.3 }, '&:active': { transform: 'scale(0.95)' }, transition: 'all 0.3s' }}>
                <ChevronLeft size={24} />
              </IconButton>
              <Chip label={`${currentSlideIndex + 1} / ${sortedSlides.length}`} sx={{ px: 3, py: 1, color: 'white', bgcolor: 'rgba(255,255,255,0.05)', fontSize: '1rem', fontWeight: 500, borderRadius: 2 }} />
              <IconButton onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === sortedSlides.length - 1} sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, color: 'white', borderRadius: 2, '&:disabled': { opacity: 0.3 }, '&:active': { transform: 'scale(0.95)' }, transition: 'all 0.3s' }}>
                <ChevronRight size={24} />
              </IconButton>
            </>
          )}
          {!hasSlides && slideUrl && (
            <Chip icon={<Presentation size={16} />} label="Presentation Mode" sx={{ px: 3, py: 1.5, color: 'white', fontSize: '0.875rem', fontWeight: 500 }} />
          )}
        </Box>
      )}

      {isPresenting && showPresentationControls && (
        <Box sx={{ position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', gap: 1, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 2, p: 1, transition: 'opacity 0.3s' }}>
          <Button
            onClick={() => setIsDrawing(!isDrawing)}
            variant={isDrawing ? 'contained' : 'outlined'}
            startIcon={<Pencil size={16} />}
            size="small"
            sx={{ 
              bgcolor: isDrawing ? '#2563eb' : 'rgba(255,255,255,0.1)', 
              color: 'white', 
              borderColor: isDrawing ? 'transparent' : 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: isDrawing ? '#1d4ed8' : 'rgba(255,255,255,0.2)' },
              fontSize: '0.875rem'
            }}
          >
            {isDrawing ? 'Drawing' : 'Draw'}
          </Button>
          {isDrawing && (
            <>
              <Box component="input" type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} sx={{ width: 40, height: 40, borderRadius: 1, cursor: 'pointer', border: 'none' }} />
              <Button onClick={clearDrawings} variant="outlined" size="small" startIcon={<Eraser size={16} />} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, fontSize: '0.875rem' }}>
                Clear
              </Button>
            </>
          )}
        </Box>
      )}

      <Dialog open={showSearch} onClose={() => setShowSearch(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search size={20} /> Search
        </DialogTitle>
        <DialogContent>
          <TextField placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} fullWidth autoFocus sx={{ mb: 2 }} />
          {searchQuery && searchResults.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {searchResults.map(r => (
                <Button key={r.index} onClick={() => { setCurrentSlideIndex(r.index); setShowSearch(false); }} sx={{ p: 1.5, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }, borderRadius: 1, justifyContent: 'flex-start' }}>
                  <Typography fontWeight={500}>Slide {r.index + 1}: {r.title}</Typography>
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAISummary} onClose={() => setShowAISummary(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={20} color="#9333ea" /> AI Summary
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {loadingSummary ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#9333ea' }} />
            </Box>
          ) : aiSummary ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Summary</Typography>
                <Typography>{aiSummary.summary}</Typography>
              </Box>
              {aiSummary.key_points?.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Key Points</Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {aiSummary.key_points.map((p, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', gap: 1 }}>
                        <CheckCircle size={16} color="#16a34a" style={{ marginTop: 2 }} />
                        <Typography>{p}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showNotes} onClose={() => setShowNotes(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookOpen size={20} color="#2563eb" /> Notes ({notes.length})
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField value={currentNote} onChange={(e)=>setCurrentNote(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&addNote()} placeholder="Add a note..." fullWidth />
            <Button onClick={addNote} variant="contained" startIcon={<Plus size={16} />}>Add</Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {notes.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>No notes yet</Typography>
            ) : notes.map(n => (
              <Card key={n.id} sx={{ p: 1.5, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Chip label={`Slide ${n.slideNumber}`} size="small" sx={{ bgcolor: '#6366f1', color: 'white', fontSize: '0.75rem', fontWeight: 600 }} />
                  <IconButton size="small" onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))} sx={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </IconButton>
                </Box>
                <Typography variant="body2">{n.content}</Typography>
              </Card>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showOutline} onClose={() => setShowOutline(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <List size={20} /> Outline
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {lesson?.slides && lesson.slides.length > 0 && (() => {
              const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
              return slides.map((s, i) => (
                <Button 
                  key={i} 
                  onClick={() => { setCurrentSlideIndex(i); setShowOutline(false); }} 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    justifyContent: 'flex-start',
                    bgcolor: i === currentSlideIndex ? 'rgba(99, 102, 241, 0.1)' : 'action.hover',
                    border: i === currentSlideIndex ? '2px solid #6366f1' : 'none',
                    '&:hover': { bgcolor: i === currentSlideIndex ? 'rgba(99, 102, 241, 0.1)' : 'action.selected' }
                  }}
                >
                  <Typography fontWeight={500}>{i + 1}. {s.title}</Typography>
                </Button>
              ));
            })()}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIHelp} onClose={() => setShowAIHelp(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Brain size={20} color="#9333ea" /> AI Tutor
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField placeholder="Ask a question..." value={aiHelpQuery} onChange={(e)=>setAIHelpQuery(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&askAIAboutSlide(aiHelpQuery)} fullWidth />
            <Button onClick={() => askAIAboutSlide(aiHelpQuery)} disabled={aiHelpLoading} variant="contained">Ask</Button>
          </Box>
          {aiHelpLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#9333ea' }} />
            </Box>
          ) : aiHelpResponse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Answer</Typography>
                <Typography>{aiHelpResponse.answer}</Typography>
              </Box>
              {aiHelpResponse.key_points?.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Key Points</Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                    {aiHelpResponse.key_points.map((p, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <CheckCircle size={16} color="#16a34a" style={{ marginTop: 2 }} />
                        <Typography variant="body2">{p}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAccessibility} onClose={() => setShowAccessibility(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Eye size={20} /> Accessibility
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Font Size: {accessibilityMode.fontSize}%</Typography>
              <Box component="input" type="range" min="80" max="150" value={accessibilityMode.fontSize} onChange={(e) => setAccessibilityMode({...accessibilityMode, fontSize: parseInt(e.target.value)})} sx={{ width: '100%' }} />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Contrast</InputLabel>
              <Select value={accessibilityMode.contrast} onChange={(e) => setAccessibilityMode({...accessibilityMode, contrast: e.target.value})} label="Contrast">
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="inverted">Inverted</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={speakSlideContent} variant="contained" fullWidth startIcon={<Volume2 size={16} />}>
              Read Aloud
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlashcards} onClose={() => setShowFlashcards(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Target size={20} color="#16a34a" /> Flashcards ({flashcards.length})
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {flashcards.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>No flashcards yet</Typography>
            ) : flashcards.map((c, i) => (
              <Card key={i} sx={{ p: 2, background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <Typography fontWeight={600} sx={{ mb: 1.5 }}>{c.question}</Typography>
                <Card sx={{ p: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2">{c.answer}</Typography>
                </Card>
              </Card>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

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
    </Box>
  );
}