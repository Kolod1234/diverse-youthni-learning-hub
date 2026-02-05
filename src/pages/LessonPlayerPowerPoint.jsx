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
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson && !lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full mt-3">
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

  // Reusable Content Component for Quiz/Objectives
  const LessonInfoContent = () => (
    <div className="space-y-4">
      {quizzes.length > 0 && (
        <button onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3"><ClipboardCheck className="w-5 h-5" /><span className="font-semibold text-sm sm:text-base">Take Quiz</span></div><ChevronRight className="w-5 h-5" />
        </button>
      )}
      {lesson.learning_objectives?.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base text-foreground"><Target className="w-4 h-4 text-blue-600"/> Learning Objectives</h3>
          <div className="space-y-2">
            {lesson.learning_objectives.map((obj, i) => (
              <p key={i} className="text-xs sm:text-sm text-muted-foreground flex gap-2 items-start">
                <CheckCircle size={14} className="mt-0.5 text-green-500 shrink-0"/> 
                <span>{obj}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div ref={playerRef} className={`h-screen flex flex-col overflow-hidden font-sans select-none bg-background ${isPresenting ? 'bg-black' : ''}`}>

      {/* HEADER: Slim on Mobile */}
      {!isPresenting && (
        <div className="flex-none z-50 shadow-md">
          <div className="bg-[#FF8C00] text-white h-12 sm:h-10 flex items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
               <button onClick={() => navigate(-1)} className="sm:hidden p-1 active:bg-white/20 rounded"><ChevronLeft size={20}/></button>
              <Presentation size={16} className="hidden sm:block" />
              <span className="font-semibold text-sm truncate">{lesson?.title}</span>
            </div>
            <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="sm:hidden p-2 active:bg-white/20 rounded"><Layout size={18}/></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}>
                      <Presentation className="w-4 h-4 mr-2" />
                      PowerPoint
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}>
                      <Layout className="w-4 h-4 mr-2" />
                      Classic
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={togglePresentation}><Presentation size={18}/></button>
                <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={toggleFullscreen}>{isFullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
                <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={generateAISummary}><Sparkles size={18}/></button>
                <button className="hidden sm:block hover:bg-white/10 px-3 py-1 rounded transition-colors text-xs" onClick={() => navigate(-1)}>Exit</button>
            </div>
          </div>
          
          {/* DESKTOP TOOLBAR (Hidden on Mobile) */}
          <div className="hidden sm:flex h-16 bg-card border-b border-border items-center px-5 gap-4 overflow-x-auto">
             <div onClick={() => navigate(`/CourseDetails?id=${courseId}`)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Home size={20} className="text-foreground"/><span className="text-[11px] mt-1 text-muted-foreground">Exit</span></div>
             <div className="w-[1px] h-10 bg-border" />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]">
                  <Layout size={20} className="text-foreground" />
                  <span className="text-[11px] mt-1 text-muted-foreground">Style</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}>
                  <Presentation className="w-4 h-4 mr-2" />
                  PowerPoint (Default)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}>
                  <Layout className="w-4 h-4 mr-2" />
                  Classic Style
                </DropdownMenuItem>
                {(user?.role === 'admin' || user?.is_tutor) && lesson && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await base44.entities.Lesson.update(lessonId, { default_player: 'LessonPlayerPowerPoint' });
                        toast.success('PowerPoint set as default for this lesson');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Set PowerPoint as Default
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {lesson?.google_slides_url && !hasSlides && (user?.role === 'admin' || user?.is_tutor) && (
              <div onClick={async () => {
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
              }} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><FileText size={20} className="text-indigo-600"/><span className="text-[11px] mt-1 text-muted-foreground">Convert</span></div>
            )}
            <div onClick={togglePresentation} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Presentation size={20} className="text-foreground"/><span className="text-[11px] mt-1 text-muted-foreground">Present</span></div>
             <div onClick={toggleFullscreen} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]">{isFullscreen ? <Minimize size={20} className="text-foreground"/> : <Maximize size={20} className="text-foreground"/>}<span className="text-[11px] mt-1 text-muted-foreground">Full</span></div>
             <div onClick={() => setShowSearch(!showSearch)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Search size={20} className="text-foreground"/><span className="text-[11px] mt-1 text-muted-foreground">Search</span></div>
             <div onClick={generateAISummary} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Sparkles size={20} className="text-purple-600"/><span className="text-[11px] mt-1 text-muted-foreground">AI</span></div>
             <div onClick={() => setShowNotes(!showNotes)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><BookOpen size={20} className="text-blue-600"/><span className="text-[11px] mt-1 text-muted-foreground">Notes</span></div>
             <div onClick={() => setShowOutline(!showOutline)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Layout size={20} className="text-foreground"/><span className="text-[11px] mt-1 text-muted-foreground">Outline</span></div>
             {!isCompleted && <div onClick={() => markCompleteMutation.mutate()} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><CheckCircle size={20} className="text-green-600"/><span className="text-[11px] mt-1 text-muted-foreground">Done</span></div>}
          </div>
        </div>
      )}

      {/* Exit Buttons in Presentation Mode */}
      {isPresenting && (
        <div className="fixed top-6 right-6 z-[100] flex gap-3">
          <button onClick={() => navigate(-1)} className="bg-black/70 hover:bg-black/90 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105">
            <ChevronLeft size={18} /> <span className="hidden sm:inline">Back</span>
          </button>
          <button onClick={togglePresentation} className="bg-red-600/80 hover:bg-red-600 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105">
            <X size={18} /> <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="flex flex-1 overflow-hidden relative flex-col sm:flex-row" style={{ minHeight: 0 }}>
        
        {/* SIDEBAR (Desktop Only) */}
        {!isPresenting && showOutline && (
          <aside className="hidden md:flex w-52 border-r border-border bg-card overflow-y-auto flex-col p-3 gap-3 z-40">
            {sortedLessons.map((l, idx) => (
              <div key={l.id} onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${l.id}&course=${courseId}`)} className={`aspect-video border rounded p-1 cursor-pointer ${l.id === lessonId ? 'border-orange-500 bg-orange-50 border-2' : 'border-border'}`}>
                 <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-center p-1 font-medium text-foreground">{l.title}</div>
              </div>
            ))}
          </aside>
        )}

        {/* MAIN STAGE */}
        <main 
          className={`flex-1 flex flex-col items-center overflow-hidden transition-all relative
            ${isPresenting ? 'bg-black justify-center p-0' : 'bg-black sm:bg-muted p-0 sm:p-6 md:p-10'}
          `}
          style={{ minHeight: 0 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseMove={handleShowControls}
          tabIndex={0}
        >
          {/* MOBILE INFO ACCORDION */}
          {!isPresenting && (
             <div className="md:hidden w-full bg-card border-b border-border shadow-sm z-20 flex-none flex-shrink-0">
                <button 
                  onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-foreground bg-muted hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Info size={14} className="text-blue-500"/>
                    Lesson Info & Quiz
                  </span>
                  {isMobileInfoOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {isMobileInfoOpen && (
                  <div className="p-3 bg-muted border-t border-border max-h-[35vh] overflow-y-auto">
                    <LessonInfoContent />
                  </div>
                )}
             </div>
          )}

          {/* DESKTOP INFO BLOCKS */}
          {!isPresenting && (
             <div className="hidden md:block w-full max-w-[960px] mb-4">
                <LessonInfoContent />
             </div>
          )}

          {/* MAIN LESSON VIDEO */}
          {!isPresenting && lesson?.video_url && (
            <div className="w-full max-w-[960px] mb-4 sm:mb-6 flex-none">
              <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 dark:from-slate-800 dark:via-slate-800/20 dark:to-slate-900/20 rounded-xl sm:rounded-2xl shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30 overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50 ring-2 sm:ring-4 ring-indigo-50 dark:ring-indigo-950/50">
                <div className="aspect-video bg-black">
                  <video 
                    src={lesson.video_url} 
                    controls 
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLIDE CONTAINER */}
          <div className={`relative flex flex-col transition-all duration-500 bg-black
            ${isPresenting 
              ? 'w-full h-full min-h-screen' 
              : 'w-full sm:max-w-[960px] aspect-video sm:shadow-2xl sm:rounded-lg sm:bg-card flex-none' 
            }`}
          >
            
            {/* Drawing Canvas */}
            {isPresenting && (
              <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="absolute inset-0 z-50"
                style={{ 
                  cursor: isDrawing ? 'crosshair' : 'default',
                  pointerEvents: isDrawing ? 'auto' : 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
              />
            )}

            {/* Slide Content */}
            <div className="flex-1 w-full h-full overflow-hidden bg-black relative" style={{ minHeight: 0 }}>
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
                        <div className="absolute top-2 right-2 z-10 hidden sm:flex gap-2">
                          <button onClick={() => zoomIn()} className="p-2 bg-card/90 hover:bg-card border border-border rounded shadow"><ZoomIn className="w-4 h-4 text-foreground" /></button>
                          <button onClick={() => zoomOut()} className="p-2 bg-card/90 hover:bg-card border border-border rounded shadow"><ZoomOut className="w-4 h-4 text-foreground" /></button>
                          <button onClick={() => resetTransform()} className="p-2 bg-card/90 hover:bg-card border border-border rounded shadow"><Minimize2 className="w-4 h-4 text-foreground" /></button>
                        </div>
                      )}
                      <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                        <div className="w-full h-full bg-card text-foreground p-4 sm:p-12 overflow-y-auto flex flex-col justify-center items-center" style={{
                          fontSize: `${accessibilityMode.fontSize}%`,
                          filter: accessibilityMode.contrast === 'high' ? 'contrast(1.5)' : accessibilityMode.contrast === 'inverted' ? 'invert(1)' : 'none',
                          fontFamily: accessibilityMode.dyslexiaFont ? 'Comic Sans MS, cursive' : 'inherit'
                        }}>
                          <div className="max-w-4xl w-full">
                            <h2 className="text-xl sm:text-3xl font-bold mb-4 text-foreground">{sortedSlides[currentSlideIndex]?.title}</h2>
                            <div className="prose prose-sm sm:prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex]?.content }} />
                          </div>
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800">
                  <div className="text-center"><FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" /><p className="text-gray-400">No Content</p></div>
                </div>
              )}
            </div>

            {/* FLOATING MOBILE CONTROLS */}
            {!isPresenting && (
              <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-center sm:hidden z-50 pointer-events-none">
                 <div className="flex gap-2 pointer-events-auto">
                   {hasSlides && (
                     <button 
                       onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                       disabled={currentSlideIndex === 0}
                       className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-orange-500 disabled:opacity-30 border border-white/20"
                     >
                       <ChevronLeft size={20} />
                     </button>
                   )}
                 </div>
                 
                 <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-white/10">
                    {currentSlideIndex + 1} / {sortedSlides.length || 1}
                 </div>

                 <div className="flex gap-2 pointer-events-auto">
                   {hasSlides && (
                     <button 
                       onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))}
                       disabled={currentSlideIndex === sortedSlides.length - 1}
                       className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-orange-500 disabled:opacity-30 border border-white/20"
                     >
                       <ChevronRight size={20} />
                     </button>
                   )}
                   <button 
                     onClick={toggleFullscreen}
                     className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-blue-600 border border-white/20"
                   >
                     {isFullscreen ? <Minimize2 size={18}/> : <Maximize size={18}/>}
                   </button>
                 </div>
              </div>
            )}

          </div>
          </main>

          {/* Feedback Section - Below Main Player */}
          {!isPresenting && lesson && (
          <div className="bg-card border-t border-border px-4 sm:px-6 py-3 flex justify-end">
            <FeedbackButton lesson={lesson} courseId={courseId} />
          </div>
          )}
          </div>

      {/* DESKTOP FOOTER */}
      {!isPresenting && (
        <footer className="hidden sm:flex h-12 bg-card border-t border-border items-center justify-between px-4 text-xs text-muted-foreground flex-none">
          <div className="flex items-center gap-5">
            <span>Lesson {currentLessonIndex + 1} of {sortedLessons.length}</span>
            <div className="flex gap-2">
                <button onClick={handlePrevLesson} disabled={!prevLesson} className="flex items-center gap-1 hover:text-orange-500 disabled:opacity-50"><ChevronLeft size={14}/> Prev Lesson</button>
                <button onClick={handleNextLesson} disabled={!nextLesson} className="flex items-center gap-1 hover:text-orange-500 disabled:opacity-50">Next Lesson <ChevronRight size={14}/></button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {hasSlides && (
               <div className="flex items-center bg-muted rounded-lg p-1">
                 <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} className="p-1 hover:bg-accent rounded disabled:opacity-30" disabled={currentSlideIndex === 0}><ChevronLeft size={16}/></button>
                 <span className="px-2 font-mono text-foreground">{currentSlideIndex + 1} / {sortedSlides.length}</span>
                 <button onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))} className="p-1 hover:bg-accent rounded disabled:opacity-30" disabled={currentSlideIndex === sortedSlides.length - 1}><ChevronRight size={16}/></button>
               </div>
             )}
             <button onClick={togglePresentation} className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded"><Presentation size={14}/><span>Present</span></button>
             <button onClick={toggleFullscreen} className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded">{isFullscreen ? <Minimize size={14}/> : <Maximize size={14}/>}</button>
          </div>
        </footer>
      )}

      {/* Slide Nav in Presentation Mode - Show on hover/interaction */}
      {isPresenting && showPresentationControls && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[90] bg-black/80 backdrop-blur-md border-2 border-white/50 rounded-lg p-3 shadow-2xl transition-opacity duration-300">
          {hasSlides && (
            <>
              <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95">
                <ChevronLeft size={24} />
              </button>
              <span className="px-6 py-2 text-white text-base font-medium flex items-center bg-white/5 rounded-lg">{currentSlideIndex + 1} / {sortedSlides.length}</span>
              <button onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === sortedSlides.length - 1} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {!hasSlides && slideUrl && (
            <span className="px-6 py-3 text-white text-sm font-medium flex items-center gap-2">
              <Presentation size={16} />
              Presentation Mode
            </span>
          )}
        </div>
      )}

      {/* Drawing Tools in Presentation - Show on hover/interaction */}
      {isPresenting && showPresentationControls && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-black/70 backdrop-blur-md border-2 border-white/50 rounded-lg p-2 transition-opacity duration-300">
          <button onClick={() => setIsDrawing(!isDrawing)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${isDrawing ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Pencil size={16} />{isDrawing ? 'Drawing' : 'Draw'}
          </button>
          {isDrawing && (
            <>
              <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <button onClick={clearDrawings} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 text-sm"><Eraser size={16} />Clear</button>
            </>
          )}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Search</DialogTitle></DialogHeader>
          <Input placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-2 mt-4">
              {searchResults.map(r => (
                <button key={r.index} onClick={() => { setCurrentSlideIndex(r.index); setShowSearch(false); }} className="w-full p-3 bg-muted hover:bg-accent rounded text-left">
                  <span className="font-medium text-foreground">Slide {r.index + 1}: {r.title}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAISummary} onOpenChange={setShowAISummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600"/>AI Summary</DialogTitle></DialogHeader>
          {loadingSummary ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : aiSummary ? (
            <div className="space-y-4">
              <div><h3 className="font-semibold mb-2 text-foreground">Summary</h3><p className="text-foreground">{aiSummary.summary}</p></div>
              {aiSummary.key_points?.length > 0 && (
                <div><h3 className="font-semibold mb-2 text-foreground">Key Points</h3>
                  <ul className="space-y-2">{aiSummary.key_points.map((p, i) => <li key={i} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5"/><span className="text-foreground">{p}</span></li>)}</ul>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600"/>Notes ({notes.length})</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            <Input value={currentNote} onChange={(e)=>setCurrentNote(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&addNote()} placeholder="Add a note..."/>
            <Button onClick={addNote} className="gap-2"><Plus className="w-4 h-4"/>Add</Button>
          </div>
          <div className="mt-4 space-y-2">
            {notes.length === 0 ? <p className="text-center text-muted-foreground py-8">No notes yet</p> : notes.map(n=><div key={n.id} className="p-3 bg-muted rounded border border-border"><div className="flex justify-between mb-1"><span className="text-xs font-semibold text-indigo-600">Slide {n.slideNumber}</span><button onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))} className="text-red-500"><Trash2 size={14}/></button></div><p className="text-sm text-foreground">{n.content}</p></div>)}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOutline} onOpenChange={setShowOutline}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><List className="w-5 h-5"/>Outline</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {lesson?.slides && lesson.slides.length > 0 && (() => {
              const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
              return slides.map((s, i) => (
                <button key={i} onClick={() => { setCurrentSlideIndex(i); setShowOutline(false); }} className={`w-full p-3 rounded text-left ${i === currentSlideIndex ? 'bg-indigo-500/10 border-2 border-indigo-600' : 'bg-muted hover:bg-accent'}`}>
                  <span className="font-medium text-foreground">{i + 1}. {s.title}</span>
                </button>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600"/>AI Tutor</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            <Input placeholder="Ask a question..." value={aiHelpQuery} onChange={(e)=>setAIHelpQuery(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&askAIAboutSlide(aiHelpQuery)}/>
            <Button onClick={() => askAIAboutSlide(aiHelpQuery)} disabled={aiHelpLoading}>Ask</Button>
          </div>
          {aiHelpLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div> : aiHelpResponse && (
            <div className="space-y-3 mt-4">
              <div><h3 className="font-semibold mb-2 text-foreground">Answer</h3><p className="text-foreground">{aiHelpResponse.answer}</p></div>
              {aiHelpResponse.key_points?.length > 0 && <div><h3 className="font-semibold mb-2 text-foreground">Key Points</h3><ul>{aiHelpResponse.key_points.map((p, i) => <li key={i} className="flex gap-2 mb-1"><CheckCircle size={16} className="text-green-600 mt-0.5"/><span className="text-foreground">{p}</span></li>)}</ul></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAccessibility} onOpenChange={setShowAccessibility}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5"/>Accessibility</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Font Size: {accessibilityMode.fontSize}%</label>
              <input type="range" min="80" max="150" value={accessibilityMode.fontSize} onChange={(e) => setAccessibilityMode({...accessibilityMode, fontSize: parseInt(e.target.value)})} className="w-full"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contrast</label>
              <select value={accessibilityMode.contrast} onChange={(e) => setAccessibilityMode({...accessibilityMode, contrast: e.target.value})} className="w-full p-2 border rounded">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="inverted">Inverted</option>
              </select>
            </div>
            <Button onClick={speakSlideContent} className="w-full gap-2"><Volume2 className="w-4 h-4"/>Read Aloud</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlashcards} onOpenChange={setShowFlashcards}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-green-600"/>Flashcards ({flashcards.length})</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {flashcards.length === 0 ? <p className="text-center text-muted-foreground py-8">No flashcards yet</p> : flashcards.map((c, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded border border-green-500/20">
                <p className="font-semibold mb-3 text-foreground">{c.question}</p>
                <div className="p-3 bg-card border border-border rounded"><p className="text-sm text-foreground">{c.answer}</p></div>
              </div>
            ))}
          </div>
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
    </div>
  );
}