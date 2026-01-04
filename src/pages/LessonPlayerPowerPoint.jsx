import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  FileText, Presentation, ChevronLeft, ChevronRight, X, 
  CheckCircle, Target, Maximize, Minimize, Home, BookOpen, Layout, ClipboardCheck, ZoomIn, ZoomOut, Minimize2,
  Bookmark, BookmarkCheck, Search, Sparkles, Pencil, Eraser, Save, Settings, Volume2, Type, Eye, Brain, List, Plus, Trash2
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
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';

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
  const [accessibilityMode, setAccessibilityMode] = useState({
    fontSize: 100,
    contrast: 'normal',
    dyslexiaFont: false,
    textToSpeech: false
  });
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [progressiveDisclosure, setProgressiveDisclosure] = useState({});
  const [microLearningMode, setMicroLearningMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  const playerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      // Load bookmarks from user preferences
      if (userData?.lesson_bookmarks) {
        setBookmarkedSlides(userData.lesson_bookmarks[lessonId] || []);
      }
    };
    loadUser();
  }, [lessonId]);

  // First fetch the lesson to get its course_id
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons;
    },
    enabled: !!lessonId
  });

  const lesson = currentLessonArray[0];
  
  // Use course_id from lesson if URL doesn't have it
  const courseId = urlCourseId || lesson?.course_id;

  // Fetch all course lessons for navigation
  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  // Fetch enrollment for progress
  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      return enrollments[0];
    },
    enabled: !!courseId
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

  // Mark lesson complete mutation
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

  // Fullscreen and Presentation handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePresentation = () => {
    setIsPresenting(!isPresenting);
    toast(!isPresenting ? "Presentation Mode: ON (ESC to exit)" : "Presentation Mode: OFF");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPresenting) setIsPresenting(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting]);

  // Navigate slides with arrow keys
  useEffect(() => {
    if (!lesson || !lesson.slides || lesson.slides.length === 0) return;
    const slides = [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const handleSlideNav = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleSlideNav);
    return () => window.removeEventListener('keydown', handleSlideNav);
  }, [lesson]);

  // Navigation
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/LessonPlayerPowerPoint?lesson=${nextLesson.id}&course=${courseId}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      navigate(`/LessonPlayerPowerPoint?lesson=${prevLesson.id}&course=${courseId}`);
    }
  };

  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  // Define slide-related variables early
  // Show unlock dialog if locked
  useEffect(() => {
    if (isLessonLocked && !lessonLoading) {
      setShowUnlockDialog(true);
    }
  }, [isLessonLocked, lessonLoading]);

  const slideUrl = lesson ? (() => {
    if (lesson.google_slides_url) {
      const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (presentationId) {
        return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&rm=minimal`;
      }
    }
    return lesson.file_url || null;
  })() : null;
  
  const hasSlides = lesson?.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

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

  // AI Summary generation
  const generateAISummary = async () => {
    if (!lesson) return;
    
    setLoadingSummary(true);
    setShowAISummary(true);
    
    try {
      const slideContent = hasSlides 
        ? sortedSlides.map(s => `${s.title}: ${s.content}`).join('\n\n')
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

  // Search functionality
  const searchResults = hasSlides && searchQuery 
    ? sortedSlides.map((slide, idx) => ({
        index: idx,
        title: slide.title,
        matches: slide.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 slide.title?.toLowerCase().includes(searchQuery.toLowerCase())
      })).filter(s => s.matches)
    : [];

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
    drawings.forEach((point, idx) => {
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

  // AI Contextual Help
  const askAIAboutSlide = async (query = '') => {
    setAIHelpLoading(true);
    setShowAIHelp(true);
    
    try {
      const currentSlide = sortedSlides[currentSlideIndex];
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

  // Note-taking with timestamps
  const addNote = () => {
    if (!currentNote.trim()) return;
    
    const newNote = {
      id: Date.now(),
      content: currentNote,
      slideIndex: currentSlideIndex,
      slideTitle: sortedSlides[currentSlideIndex]?.title || 'Slide',
      timestamp: new Date().toISOString(),
      slideNumber: currentSlideIndex + 1
    };
    
    setNotes([...notes, newNote]);
    setCurrentNote('');
    toast.success('Note saved');
  };

  // Generate flashcards from current slide
  const generateFlashcards = async () => {
    if (!hasSlides) return;
    
    try {
      const currentSlide = sortedSlides[currentSlideIndex];
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

  // Text-to-speech for accessibility
  const speakSlideContent = () => {
    if (!hasSlides || !window.speechSynthesis) return;
    
    const currentSlide = sortedSlides[currentSlideIndex];
    const text = `${currentSlide.title}. ${currentSlide.content?.replace(/<[^>]*>/g, '')}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    toast.success('Reading slide content');
  };

  // Progressive disclosure toggle
  const toggleContentBlock = (blockIndex) => {
    setProgressiveDisclosure(prev => ({
      ...prev,
      [currentSlideIndex]: {
        ...prev[currentSlideIndex],
        [blockIndex]: !prev[currentSlideIndex]?.[blockIndex]
      }
    }));
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
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Go Back
          </button>
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

  return (
    <div ref={playerRef} className={`h-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-500 ${isPresenting ? 'bg-black' : 'bg-[#f3f2f1]'}`}>

      {/* RIBBON HEADER (Hidden in Presentation) */}
      {!isPresenting && (
        <div className="flex-none z-50">
          {/* Top Bar */}
          <div className="bg-[#FF8C00] text-white h-10 flex items-center justify-between px-2 sm:px-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Presentation size={14} className="shrink-0 hidden sm:block" />
              <span className="font-semibold truncate">{lesson?.title || 'Loading...'}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-[10px] sm:text-xs shrink-0">
                  <CheckCircle size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Completed</span>
                </span>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="hover:bg-white/10 px-3 py-1 rounded transition-colors text-xs"
            >
              Exit Lesson
            </button>
          </div>
          
          {/* Toolbar */}
          <div className="h-12 sm:h-16 bg-white border-b border-gray-200 flex items-center px-2 sm:px-5 gap-2 sm:gap-4 overflow-x-auto">
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => navigate(`/CourseDetails?id=${courseId}`)}>
              <Home size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Exit</span>
            </div>
            <div className="w-[1px] h-8 sm:h-10 bg-gray-200 hidden sm:block" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]">
                  <Layout size={16} className="sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Style</span>
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
                        await base44.entities.Lesson.update(lessonId, { 
                          default_player: 'LessonPlayerPowerPoint' 
                        });
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
            <div className="w-[1px] h-8 sm:h-10 bg-gray-200 hidden md:block" />
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={togglePresentation}>
              <Presentation size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Present</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={16} className="sm:w-5 sm:h-5 text-gray-600" /> : <Maximize size={16} className="sm:w-5 sm:h-5 text-gray-600" />}
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Full</span>
            </div>
            <div className="w-[1px] h-8 sm:h-10 bg-gray-200 hidden md:block" />
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => setShowSearch(!showSearch)}>
              <Search size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Search</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={generateAISummary}>
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-purple-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">AI</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => toggleBookmark(currentSlideIndex)}>
              {bookmarkedSlides.includes(currentSlideIndex) ? 
                <BookmarkCheck size={16} className="sm:w-5 sm:h-5 text-amber-600" /> : 
                <Bookmark size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              }
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Save</span>
            </div>
            <div className="w-[1px] h-8 sm:h-10 bg-gray-200 hidden md:block" />
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => setShowOutline(!showOutline)}>
              <Layout size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Outline</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => askAIAboutSlide()}>
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-purple-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Ask AI</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => setShowNotes(!showNotes)}>
              <BookOpen size={16} className="sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Notes</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={generateFlashcards}>
              <Target size={16} className="sm:w-5 sm:h-5 text-green-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Cards</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => setShowAccessibility(!showAccessibility)}>
              <Settings size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Access</span>
            </div>
            <div className="w-[1px] h-8 sm:h-10 bg-gray-200 hidden md:block" />
            {quizzes.length > 0 && (
              <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)}>
                <ClipboardCheck size={16} className="sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Quiz</span>
              </div>
            )}
            {!isCompleted && (
              <div className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] sm:min-w-[64px]" onClick={() => markCompleteMutation.mutate()}>
                <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-600" />
                <span className="text-[9px] sm:text-[11px] mt-0.5 sm:mt-1 hidden sm:block">Done</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exit Presentation & Back Button */}
      {isPresenting && (
        <>
          <div className="fixed top-6 right-6 z-[100] flex gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="bg-black/70 hover:bg-black/90 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105"
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Back</span>
            </button>
            <button 
              onClick={togglePresentation}
              className="bg-red-600/80 hover:bg-red-600 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105"
            >
              <X size={18} /> <span className="hidden sm:inline">Exit</span>
            </button>
          </div>

          {/* Drawing Tools in Presentation Mode */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-black/70 backdrop-blur-md border-2 border-white/50 rounded-lg p-2">
            <button
              onClick={() => setIsDrawing(!isDrawing)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                isDrawing ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Pencil size={16} />
              {isDrawing ? 'Drawing' : 'Draw'}
            </button>
            {isDrawing && (
              <>
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => setDrawColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <button
                  onClick={clearDrawings}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 text-sm font-medium transition-all"
                >
                  <Eraser size={16} />
                  Clear
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Filmstrip (Hidden in Presentation and Mobile) */}
        {!isPresenting && (
          <aside className="w-40 sm:w-52 border-r border-gray-200 bg-white overflow-y-auto flex flex-col p-2 sm:p-3 gap-2 sm:gap-3 hidden md:flex">
            {sortedLessons.map((l, idx) => {
              const completed = enrollment?.completed_lessons?.includes(l.id);
              const isCurrent = l.id === lessonId;
              
              return (
                <div 
                  key={l.id}
                  onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${l.id}&course=${courseId}`)}
                  className={`relative aspect-video border rounded transition-all cursor-pointer p-1 ${
                    isCurrent 
                      ? 'border-[#FF8C00] border-2 bg-orange-50' 
                      : 'border-gray-300 hover:border-[#FF8C00]'
                  }`}
                >
                  <span className="absolute -left-4 top-0 text-[10px] text-gray-400">{idx + 1}</span>
                  {completed && (
                    <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                  )}
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[8px] text-center p-2 text-gray-600 font-bold uppercase tracking-tighter">
                    {l.title}
                  </div>
                </div>
              );
            })}
          </aside>
        )}

        {/* Stage */}
        <main className={`flex-1 flex flex-col items-center overflow-auto ${
          isPresenting ? 'p-0 bg-black justify-center' : 'bg-[#edebe9] p-4 sm:p-6 md:p-10'
        }`}>
          {/* Quiz Link (Not in Presentation Mode) */}
          {!isPresenting && quizzes.length > 0 && (
            <div className="w-full max-w-[960px] mb-4">
              <button
                onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 flex items-center justify-between hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Take Quiz</h3>
                    <p className="text-xs opacity-90">Test your knowledge</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Learning Objectives (Not in Presentation Mode) */}
          {!isPresenting && lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
            <div className="w-full max-w-[960px] mb-4">
              <button
                onClick={() => setShowObjectives(!showObjectives)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-between text-left hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Learning Objectives</h3>
                    <p className="text-xs opacity-90">What you'll learn</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
              </button>
              
              {showObjectives && (
                <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-4 shadow-lg">
                  <div className="space-y-2">
                    {lesson.learning_objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm">{objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slide Display */}
          <div className={`bg-white shadow-2xl relative flex flex-col transition-all duration-500 flex-none ${
            isPresenting 
              ? 'w-full h-full aspect-auto m-0 shadow-none' 
              : 'w-full max-w-[960px] aspect-video mb-4 sm:mb-10 rounded-lg'
          }`}>
            {/* Drawing Canvas Overlay */}
            {isPresenting && (
              <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="absolute inset-0 z-50 pointer-events-auto"
                style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={() => {}}
              />
            )}
            <div className="flex-1 w-full overflow-hidden relative professional-slide-stage">
              {slideUrl ? (
                <div className="w-full h-full bg-black">
                  <iframe 
                    src={slideUrl} 
                    className="w-full h-full border-0"
                    style={{ width: '100%', height: '100%' }}
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    title="Educational Slides"
                  />
                </div>
              ) : hasSlides ? (
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={3}
                  centerOnInit={true}
                  disabled={isPresenting}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {!isPresenting && (
                        <div className="absolute top-2 right-2 z-10 flex gap-1 sm:gap-2">
                          <button onClick={() => zoomIn()} className="p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded shadow">
                            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => zoomOut()} className="p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded shadow">
                            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => resetTransform()} className="p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded shadow">
                            <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                      <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                        <div 
                          className="w-full h-full bg-white p-4 sm:p-8 md:p-12 overflow-y-auto"
                          style={{
                            fontSize: `${accessibilityMode.fontSize}%`,
                            filter: accessibilityMode.contrast === 'high' ? 'contrast(1.5)' : accessibilityMode.contrast === 'inverted' ? 'invert(1)' : 'none',
                            fontFamily: accessibilityMode.dyslexiaFont ? 'Comic Sans MS, cursive' : 'inherit'
                          }}
                        >
                          <div className="max-w-4xl mx-auto">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                              {sortedSlides[currentSlideIndex]?.title}
                            </h2>
                            <div 
                              className="prose prose-sm sm:prose-base md:prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: sortedSlides[currentSlideIndex]?.content || '' }}
                            />
                          </div>
                          {!isPresenting && (
                            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-gray-900/80 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm">
                              {currentSlideIndex + 1} / {sortedSlides.length}
                            </div>
                          )}
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>No content available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* STATUS BAR (Hidden in Presentation and Mobile) */}
      {!isPresenting && (
        <footer className="h-8 sm:h-10 bg-white border-t border-gray-200 flex items-center justify-between px-2 sm:px-4 text-[10px] sm:text-xs text-gray-600 flex-none hidden md:flex">
          <div className="flex items-center gap-5">
            <span>Lesson {currentLessonIndex + 1} of {sortedLessons.length}</span>
            <span className="flex items-center gap-1 text-[#FF8C00] font-semibold">
              <CheckCircle size={12} /> 
              {enrollment?.completed_lessons?.length || 0} completed
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex gap-3">
              {hasSlides ? (
                <>
                  <button 
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} 
                    disabled={currentSlideIndex === 0} 
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-xs flex items-center">
                    Slide {currentSlideIndex + 1}/{sortedSlides.length}
                  </span>
                  <button 
                    onClick={() => setCurrentSlideIndex(Math.min(sortedSlides.length - 1, currentSlideIndex + 1))} 
                    disabled={currentSlideIndex === sortedSlides.length - 1} 
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-200 mx-2" />
                </>
              ) : null}
              <button onClick={handlePrevLesson} disabled={!prevLesson} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextLesson} disabled={!nextLesson} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={togglePresentation} className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">
              <Presentation size={14} />
              <span>Present</span>
            </button>
            <button onClick={toggleFullscreen} className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </footer>
        )}

        {/* Search Dialog */}
        <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Lesson Content
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search for keywords, concepts, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {searchQuery && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{searchResults.length} results found</p>
                {searchResults.map((result) => (
                  <button
                    key={result.index}
                    onClick={() => {
                      setCurrentSlideIndex(result.index);
                      setShowSearch(false);
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Slide {result.index + 1}: {result.title}</span>
                      {bookmarkedSlides.includes(result.index) && (
                        <BookmarkCheck className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
        </Dialog>

        {/* Outline View Dialog */}
        <Dialog open={showOutline} onOpenChange={setShowOutline}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Lesson Outline
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {hasSlides && sortedSlides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowOutline(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    idx === currentSlideIndex
                      ? 'bg-indigo-50 border-2 border-indigo-600'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{idx + 1}</span>
                      <span className="font-medium text-gray-900">{slide.title}</span>
                    </div>
                    {bookmarkedSlides.includes(idx) && (
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Help Dialog */}
        <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Tutor Assistant
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about this slide..."
                  value={aiHelpQuery}
                  onChange={(e) => setAIHelpQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAIAboutSlide(aiHelpQuery)}
                  className="flex-1"
                />
                <Button onClick={() => askAIAboutSlide(aiHelpQuery)} disabled={aiHelpLoading}>
                  Ask
                </Button>
              </div>

              {aiHelpLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : aiHelpResponse ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
                    <p className="text-gray-700">{aiHelpResponse.answer}</p>
                  </div>
                  {aiHelpResponse.key_points && aiHelpResponse.key_points.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Key Points</h3>
                      <ul className="space-y-2">
                        {aiHelpResponse.key_points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiHelpResponse.related_topics && aiHelpResponse.related_topics.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Related Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {aiHelpResponse.related_topics.map((topic, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={showNotes} onOpenChange={setShowNotes}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                My Notes ({notes.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note about this slide..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  className="flex-1"
                />
                <Button onClick={addNote} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notes yet. Add your first note!</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-600">
                            Slide {note.slideNumber}: {note.slideTitle}
                          </span>
                        </div>
                        <button
                          onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Flashcards Dialog */}
        <Dialog open={showFlashcards} onOpenChange={setShowFlashcards}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Flashcards ({flashcards.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {flashcards.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No flashcards yet. Generate some from slides!</p>
              ) : (
                flashcards.map((card, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-green-700">Q{idx + 1}</span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-3">{card.question}</p>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-700">{card.answer}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Accessibility Toolbar Dialog */}
        <Dialog open={showAccessibility} onOpenChange={setShowAccessibility}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Accessibility Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Font Size: {accessibilityMode.fontSize}%
                </label>
                <input
                  type="range"
                  min="80"
                  max="150"
                  value={accessibilityMode.fontSize}
                  onChange={(e) => setAccessibilityMode({...accessibilityMode, fontSize: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Contrast Mode</label>
                <select
                  value={accessibilityMode.contrast}
                  onChange={(e) => setAccessibilityMode({...accessibilityMode, contrast: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Contrast</option>
                  <option value="inverted">Inverted</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Dyslexia-Friendly Font</label>
                <input
                  type="checkbox"
                  checked={accessibilityMode.dyslexiaFont}
                  onChange={(e) => setAccessibilityMode({...accessibilityMode, dyslexiaFont: e.target.checked})}
                  className="w-5 h-5"
                />
              </div>

              <Button onClick={speakSlideContent} className="w-full gap-2">
                <Volume2 className="w-4 h-4" />
                Read Slide Aloud
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Summary Dialog */}
        <Dialog open={showAISummary} onOpenChange={setShowAISummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Generated Lesson Summary
            </DialogTitle>
          </DialogHeader>
          {loadingSummary ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : aiSummary ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700">{aiSummary.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {aiSummary.key_points?.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {aiSummary.suggested_focus && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Suggested Focus</h3>
                  <p className="text-gray-700">{aiSummary.suggested_focus}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
        </Dialog>

        {/* Mobile Navigation (Only in Presentation Mode) */}
        {isPresenting && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50 md:hidden">
            <button onClick={handlePrevLesson} disabled={!prevLesson} className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center disabled:opacity-30">
              <ChevronLeft />
            </button>
            <button onClick={handleNextLesson} disabled={!nextLesson} className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center disabled:opacity-30">
              <ChevronRight />
            </button>
          </div>
        )}

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