import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import DescriptionIcon from '@mui/icons-material/Description';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixOffIcon from '@mui/icons-material/AutoFixOff';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import BookmarkIcon from '@mui/icons-material/Bookmark';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const FileText = _w(DescriptionIcon), Presentation = _w(SlideshowIcon), ChevronLeft = _w(ChevronLeftIcon), ChevronRight = _w(ChevronRightIcon);
const X = _w(CloseIcon), CheckCircle = _w(CheckCircleIcon), Target = _w(GpsFixedIcon);
const Maximize = _w(FullscreenIcon), Minimize = _w(FullscreenExitIcon), Home = _w(HomeIcon), BookOpen = _w(MenuBookIcon);
const Layout = _w(DashboardIcon), ClipboardCheck = _w(FactCheckIcon), ZoomIn = _w(ZoomInIcon), ZoomOut = _w(ZoomOutIcon);
const Minimize2 = _w(FullscreenExitIcon), BookmarkCheck = _w(BookmarkAddedIcon), Search = _w(SearchIcon);
const Sparkles = _w(AutoAwesomeIcon), Pencil = _w(EditIcon), Eraser = _w(AutoFixOffIcon);
const Settings = _w(SettingsIcon), Volume2 = _w(VolumeUpIcon), Eye = _w(VisibilityIcon), Brain = _w(PsychologyIcon);
const List = _w(ListIcon), Plus = _w(AddIcon), Trash2 = _w(DeleteIcon), Lock = _w(LockIcon), Key = _w(VpnKeyIcon);
const ChevronDown = _w(KeyboardArrowDownIcon), ChevronUp = _w(KeyboardArrowUpIcon), Info = _w(InfoIcon);
const StickyNote = _w(StickyNote2Icon), Bookmark = _w(BookmarkIcon);
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@mui/material';
import { Card } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { TextField } from '@mui/material';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import DocumentViewer from '@/components/lesson/DocumentViewer';
import FeedbackButton from '@/components/lesson/FeedbackButton';
import UniversalLessonPlayer from '@/components/lesson/UniversalLessonPlayer';
import ManusSlidePlayer from '@/components/lesson/ManusSlidePlayer';
import useLessonPlayer from '@/components/lesson/useLessonPlayer';
import { NotesDialog, AIAssistantDialog, BookmarksPanel } from '@/components/lesson/LessonPlayerSharedUI';
import { injectFontStylesheet } from '@/components/editor/lessonBuilder/fontFamilies';

import { sanitizeHtml } from '@/components/security/SafeHtml';
export default function LessonPlayerPowerPoint() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const urlCourseId = params.get('course');

  // ── Local state ────────────────────────────────────────────────────────────
  const [isPresenting, setIsPresenting] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#FF0000');
  const [drawings, setDrawings] = useState([]);
  const [showOutline, setShowOutline] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [showPresentationControls, setShowPresentationControls] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState({
    fontSize: 100, contrast: 'normal', dyslexiaFont: false, textToSpeech: false
  });
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  // ── Load user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    base44.auth.me().then(setUser);
  }, [lessonId]);

  // Ensure the lesson-builder web fonts (Roboto, Montserrat, Source Code Pro,
  // etc.) are loaded into the document so font-family inline styles set by
  // the editor render the actual web font face in the player. Idempotent —
  // a single <link> is added the first time any consumer mounts.
  useEffect(() => { injectFontStylesheet(); }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: currentLessonArray = [], isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.filter({ id: lessonId }),
    enabled: !!lessonId
  });
  const lesson = currentLessonArray[0];
  const courseId = urlCourseId || lesson?.course_id;

  const hasSlides = lesson?.slides && lesson.slides.length > 0;
  const sortedSlides = hasSlides
    ? [...lesson.slides].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: async () => {
      // The viewer's own enrolment only (admins can read everyone's).
      const e = await base44.entities.Enrollment.filter({ course_id: courseId, created_by: user.email });
      return e[0] || null;
    },
    enabled: !!courseId && !!user?.email
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['lessonQuizzes', lessonId, courseId],
    queryFn: async () => {
      if (!courseId || courseId === 'null') return [];
      const all = await base44.entities.Quiz.filter({ course_id: courseId });
      return all.filter(q => q.lesson_id === lessonId || !q.lesson_id || q.lesson_id === 'null');
    },
    enabled: !!courseId && courseId !== 'null'
  });

  // ── Shared player hook (fullscreen, notes, bookmarks, AI, keyboard) ────────
  const sharedPlayer = useLessonPlayer({
    lessonId,
    containerRef: playerRef,
    user,
    onNext: () => hasSlides && setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1)),
    onPrev: () => hasSlides && setCurrentSlideIndex(p => Math.max(0, p - 1)),
  });

  const {
    isFullscreen, toggleFullscreen,
    notes: sharedNotes, showNotes, setShowNotes, saveNote, exportNotes,
    bookmarks: bookmarkedSlides, showBookmarks, setShowBookmarks, toggleBookmark,
    showAI, setShowAI, aiTab, setAiTab, aiLoading,
    aiResponse, setAiResponse, aiSummary, aiTranslation,
    targetLanguage, setTargetLanguage,
    askAI, summariseSlide, defineWord, translateSlide,
  } = sharedPlayer;

  // Current slide context for AI
  const getCurrentSlideContext = () => {
    const slide = sortedSlides[currentSlideIndex];
    return slide ? `${slide.title}: ${slide.content?.replace(/<[^>]*>/g, '')}` : lesson?.title || '';
  };

  // ── Lock logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lesson || !enrollment || !courseLessons.length) return;
    if (user && (user.role === 'admin' || user.is_tutor)) { setIsLessonLocked(false); return; }
    const sorted = [...courseLessons].sort((a, b) => a.order - b.order);
    if (sorted[0]?.id === lessonId) { setIsLessonLocked(false); return; }
    // Unlock keys retired: lesson access and progression are open.
    setIsLessonLocked(false);
  }, [lesson, enrollment, courseLessons, lessonId, user]);

  // ── Mark complete mutation ─────────────────────────────────────────────────
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const done = enrollment.completed_lessons || [];
      if (!done.includes(lessonId)) {
        await base44.entities.Enrollment.update(enrollment.id, {
          completed_lessons: [...done, lessonId],
          progress_percent: Math.round(((done.length + 1) / courseLessons.length) * 100)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
      toast.success('Lesson marked as complete!');
    }
  });

  // ── Presentation controls ─────────────────────────────────────────────────
  const togglePresentation = () => {
    setIsPresenting(v => !v);
    toast(!isPresenting ? 'Presentation Mode: ON' : 'Presentation Mode: OFF');
  };

  const handleShowControls = () => {
    if (!isPresenting) return;
    setShowPresentationControls(true);
    clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => setShowPresentationControls(false), 3000);
  };

  useEffect(() => {
    if (isPresenting) handleShowControls();
    return () => clearTimeout(hideControlsTimeoutRef.current);
  }, [isPresenting]);

  // ── Local keyboard (presentation + slide nav) ─────────────────────────────
  useEffect(() => {
    if (!lesson) return;
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape' && isPresenting) { setIsPresenting(false); return; }
      if (!hasSlides) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex(p => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPresenting, lesson, hasSlides, sortedSlides.length]);

  // ── Touch / swipe ─────────────────────────────────────────────────────────
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove  = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd   = () => {
    if (!touchStart || !touchEnd || !hasSlides) return;
    const d = touchStart - touchEnd;
    if (d > 50)  setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1));
    if (d < -50) setCurrentSlideIndex(p => Math.max(0, p - 1));
  };

  // ── Drawing ───────────────────────────────────────────────────────────────
  const startDrawing = (e) => {
    if (!isDrawing) return;
    const r = canvasRef.current.getBoundingClientRect();
    setDrawings(d => [...d, { x: e.clientX - r.left, y: e.clientY - r.top, color: drawColor, type: 'start' }]);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const r = canvasRef.current.getBoundingClientRect();
    setDrawings(d => [...d, { x: e.clientX - r.left, y: e.clientY - r.top, color: drawColor, type: 'draw' }]);
  };
  const clearDrawings = () => { setDrawings([]); toast.success('Drawings cleared'); };

  useEffect(() => {
    if (!canvasRef.current || drawings.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    let active = false;
    drawings.forEach(p => {
      if (p.type === 'start') { ctx.beginPath(); ctx.moveTo(p.x, p.y); active = true; }
      else if (active) {
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.stroke();
      }
    });
  }, [drawings]);

  // ── Flashcards ────────────────────────────────────────────────────────────
  const generateFlashcards = async () => {
    if (!hasSlides) return;
    const slide = sortedSlides[currentSlideIndex];
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 3-5 flashcard Q&A from:\nTitle: ${slide.title}\nContent: ${slide.content}\n\nReturn JSON: {flashcards:[{question,answer}]}`,
      response_json_schema: { type:'object', properties:{ flashcards:{ type:'array', items:{ type:'object', properties:{ question:{type:'string'}, answer:{type:'string'} } } } } }
    });
    setFlashcards(f => [...f, ...(res.flashcards || [])]);
    setShowFlashcards(true);
    toast.success(`Generated ${res.flashcards?.length || 0} flashcards`);
  };

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speakSlideContent = () => {
    if (!hasSlides || !window.speechSynthesis) return;
    const slide = sortedSlides[currentSlideIndex];
    const utt = new SpeechSynthesisUtterance(`${slide.title}. ${slide.content?.replace(/<[^>]*>/g, '')}`);
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
    toast.success('Reading slide content');
  };

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults = hasSlides && searchQuery
    ? sortedSlides.map((s, i) => ({ index: i, title: s.title, match: s.content?.toLowerCase().includes(searchQuery.toLowerCase()) || s.title?.toLowerCase().includes(searchQuery.toLowerCase()) })).filter(r => r.match)
    : [];

  // ── Course nav ────────────────────────────────────────────────────────────
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];
  const handleNextLesson = () => nextLesson && navigate(`/LessonPlayerPowerPoint?lesson=${nextLesson.id}&course=${courseId}`);
  const handlePrevLesson = () => prevLesson && navigate(`/LessonPlayerPowerPoint?lesson=${prevLesson.id}&course=${courseId}`);
  const isCompleted = enrollment?.completed_lessons?.includes(lessonId);

  // ── Loading / error / locked ──────────────────────────────────────────────
  if (lessonLoading || lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
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
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg">Go Back</button>
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
            <p className="text-gray-600 mb-6">This lesson requires an unlock key. Contact your tutor to get access.</p>
            <Button onClick={() => setShowUnlockDialog(true)} className="w-full" variant="contained" startIcon={<Key className="w-4 h-4" />}>Enter Unlock Key</Button>
            <Button variant="outlined" onClick={() => navigate(-1)} className="w-full mt-3">Back to Course</Button>
          </Card>
        </div>
        <LessonUnlockDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog} lessonId={lessonId} courseId={courseId} lessonTitle={lesson?.title} onUnlockSuccess={() => { refetchEnrollment(); setIsLessonLocked(false); }} />
      </>
    );
  }

  // ── Reusable quiz/objectives block ────────────────────────────────────────
  const LessonInfoContent = () => (
    <div className="space-y-4">
      {quizzes.length > 0 && (
        <button onClick={() => navigate(createPageUrl('Quiz') + `?id=${quizzes[0].id}&course=${courseId}`)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3"><ClipboardCheck className="w-5 h-5" /><span className="font-semibold text-sm sm:text-base">Take Quiz</span></div>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      {lesson.learning_objectives?.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base text-foreground"><Target className="w-4 h-4 text-blue-600" /> Learning Objectives</h3>
          <div className="space-y-2">
            {lesson.learning_objectives.map((obj, i) => (
              <p key={i} className="text-xs sm:text-sm text-muted-foreground flex gap-2 items-start">
                <CheckCircle size={14} className="mt-0.5 text-green-500 shrink-0" /><span>{obj}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── CSS fullscreen style ──────────────────────────────────────────────────
  const fullscreenStyle = isFullscreen && !document.fullscreenElement && !document.webkitFullscreenElement
    ? { position: 'fixed', inset: 0, zIndex: 9999, height: '100vh', width: '100vw' }
    : { height: '100vh' };

  return (
    <div ref={playerRef}
      className={`flex flex-col overflow-hidden font-sans select-none bg-background ${isPresenting ? 'bg-black' : ''}`}
      style={fullscreenStyle}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      {!isPresenting && (
        <div className="flex-none z-50 shadow-md">
          {/* Title bar */}
          <div className="bg-[#FF8C00] text-white h-12 sm:h-10 flex items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => navigate(-1)} className="sm:hidden p-1 active:bg-white/20 rounded"><ChevronLeft size={20} /></button>
              <Presentation size={16} className="hidden sm:block" />
              <span className="font-semibold text-sm truncate">{lesson?.title}</span>
            </div>
            <div className="flex gap-1">
              {/* Mobile quick actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="sm:hidden p-2 active:bg-white/20 rounded"><Layout size={18} /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}><Presentation className="w-4 h-4 mr-2" />PowerPoint</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}><Layout className="w-4 h-4 mr-2" />Classic</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={togglePresentation}><Presentation size={18} /></button>
              <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={toggleFullscreen}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
              <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={() => { setShowAI(true); }}>
                <Sparkles size={18} />
              </button>
              <button className="sm:hidden p-2 active:bg-white/20 rounded" onClick={() => setShowNotes(true)}>
                <StickyNote size={18} />
              </button>
              <button className="hidden sm:block hover:bg-white/10 px-3 py-1 rounded transition-colors text-xs" onClick={() => navigate(-1)}>Exit</button>
            </div>
          </div>

          {/* Desktop toolbar */}
          <div className="hidden sm:flex h-16 bg-card border-b border-border items-center px-5 gap-4 overflow-x-auto">
            <div onClick={() => navigate(`/CourseDetails?id=${courseId}`)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Home size={20} className="text-foreground" /><span className="text-[11px] mt-1 text-muted-foreground">Exit</span></div>
            <div className="w-[1px] h-10 bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Layout size={20} className="text-foreground" /><span className="text-[11px] mt-1 text-muted-foreground">Style</span></div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`)}><Presentation className="w-4 h-4 mr-2" />PowerPoint (Default)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`)}><Layout className="w-4 h-4 mr-2" />Classic Style</DropdownMenuItem>
                {(user?.role === 'admin' || user?.is_tutor) && lesson && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { await base44.entities.Lesson.update(lessonId, { default_player: 'LessonPlayerPowerPoint' }); toast.success('PowerPoint set as default'); }}>
                      <CheckCircle className="w-4 h-4 mr-2" />Set as Default
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {lesson?.google_slides_url && !hasSlides && (user?.role === 'admin' || user?.is_tutor) && (
              <div onClick={async () => {
                if (!confirm('Convert Google Slides to custom slides? Some formatting may be lost.')) return;
                toast.loading('Converting...');
                const r = await base44.functions.invoke('convertGoogleSlideToCustom', { lessonId });
                if (r.data.success) { toast.success(`Converted ${r.data.slideCount} slides!`); queryClient.invalidateQueries(['lesson', lessonId]); setTimeout(() => window.location.reload(), 1000); }
              }} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><FileText size={20} className="text-indigo-600" /><span className="text-[11px] mt-1 text-muted-foreground">Convert</span></div>
            )}
            <div onClick={togglePresentation} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Presentation size={20} className="text-foreground" /><span className="text-[11px] mt-1 text-muted-foreground">Present</span></div>
            <div onClick={toggleFullscreen} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]">{isFullscreen ? <Minimize size={20} className="text-foreground" /> : <Maximize size={20} className="text-foreground" />}<span className="text-[11px] mt-1 text-muted-foreground">Full</span></div>
            <div onClick={() => setShowSearch(true)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Search size={20} className="text-foreground" /><span className="text-[11px] mt-1 text-muted-foreground">Search</span></div>
            <div onClick={() => setShowAI(true)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><Sparkles size={20} className="text-purple-600" /><span className="text-[11px] mt-1 text-muted-foreground">AI</span></div>
            <div onClick={() => setShowNotes(true)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><StickyNote size={20} className="text-blue-600" /><span className="text-[11px] mt-1 text-muted-foreground">Notes</span></div>
            <div onClick={() => toggleBookmark(String(currentSlideIndex + 1))} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]">
              {bookmarkedSlides.includes(String(currentSlideIndex + 1)) ? <BookmarkCheck size={20} className="text-yellow-500" /> : <Bookmark size={20} className="text-foreground" />}
              <span className="text-[11px] mt-1 text-muted-foreground">Bookmark</span>
            </div>
            <div onClick={() => setShowBookmarks(true)} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><List size={20} className="text-foreground" /><span className="text-[11px] mt-1 text-muted-foreground">Outline</span></div>
            {!isCompleted && <div onClick={() => markCompleteMutation.mutate()} className="flex flex-col items-center p-2 hover:bg-accent rounded cursor-pointer min-w-[64px]"><CheckCircle size={20} className="text-green-600" /><span className="text-[11px] mt-1 text-muted-foreground">Done</span></div>}
          </div>
        </div>
      )}

      {/* ── PRESENTATION MODE EXIT BUTTONS ──────────────────────────────────── */}
      {isPresenting && (
        <div className="fixed top-6 right-6 z-[100] flex gap-3">
          <button onClick={() => navigate(-1)} className="bg-black/70 hover:bg-black/90 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105">
            <ChevronLeft size={18} /><span className="hidden sm:inline">Back</span>
          </button>
          <button onClick={togglePresentation} className="bg-red-600/80 hover:bg-red-600 text-white border-2 border-white/50 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all hover:scale-105">
            <X size={18} /><span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      )}

      {/* ── WORKSPACE ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative flex-col sm:flex-row" style={{ minHeight: 0 }}>

        {/* Sidebar outline (desktop) */}
        {!isPresenting && showBookmarks && (
          <aside className="hidden md:flex w-52 border-r border-border bg-card overflow-y-auto flex-col p-3 gap-3 z-40">
            {sortedLessons.map(l => (
              <div key={l.id} onClick={() => navigate(`/LessonPlayerPowerPoint?lesson=${l.id}&course=${courseId}`)}
                className={`aspect-video border rounded p-1 cursor-pointer ${l.id === lessonId ? 'border-orange-500 bg-orange-50 border-2' : 'border-border'}`}>
                <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-center p-1 font-medium text-foreground">{l.title}</div>
              </div>
            ))}
          </aside>
        )}

        {/* Main stage */}
        <main
          className={`flex-1 flex flex-col items-center transition-all relative
            ${isPresenting ? 'bg-black justify-center p-0 overflow-hidden' : 'bg-black sm:bg-muted p-0 sm:p-6 md:p-10 overflow-y-auto'}`}
          style={{ minHeight: 0 }}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseMove={handleShowControls}
          tabIndex={0}
        >
          {/* Mobile info accordion */}
          {!isPresenting && (
            <div className="md:hidden w-full bg-card border-b border-border shadow-sm z-20 flex-none flex-shrink-0">
              <button onClick={() => setIsMobileInfoOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-foreground bg-muted hover:bg-accent transition-colors">
                <span className="flex items-center gap-2"><Info size={14} className="text-blue-500" />Lesson Info & Quiz</span>
                {isMobileInfoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isMobileInfoOpen && <div className="p-3 bg-muted border-t border-border max-h-[35vh] overflow-y-auto"><LessonInfoContent /></div>}
            </div>
          )}

          {/* Desktop info blocks */}
          {!isPresenting && <div className="hidden md:block w-full max-w-[960px] mb-4"><LessonInfoContent /></div>}

          {/* Lesson video (if any) */}
          {!isPresenting && lesson?.video_url && (
            <div className="w-full max-w-[960px] mb-4 sm:mb-6 flex-none">
              <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 dark:from-slate-800 dark:via-slate-800/20 dark:to-slate-900/20 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50">
                <div className="aspect-video bg-black">
                  <video src={lesson.video_url} controls className="w-full h-full" controlsList="nodownload" />
                </div>
              </div>
            </div>
          )}

          {/* Slide container */}
          <div className={`relative flex flex-col transition-all duration-500 bg-black mb-6
            ${isPresenting ? 'w-full h-full min-h-screen' : 'w-full sm:max-w-[960px] aspect-video sm:shadow-2xl sm:rounded-lg sm:bg-card'}`}>

            {/* Drawing canvas */}
            {isPresenting && (
              <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}
                className="absolute inset-0 z-50"
                style={{ cursor: isDrawing ? 'crosshair' : 'default', pointerEvents: isDrawing ? 'auto' : 'none' }}
                onMouseDown={startDrawing} onMouseMove={draw}
              />
            )}

            {/* Slide content */}
            <div className="flex-1 w-full h-full overflow-hidden bg-black relative" style={{ minHeight: 0 }}>
              {lesson?.file_url && lesson?.file_type === 'pptx' ? (
                <DocumentViewer fileUrl={lesson.file_url} fileType={lesson.file_type} />
              ) : lesson?.manus_slides_url && !hasSlides ? (
                <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
                  <div className="w-full max-w-3xl">
                    <ManusSlidePlayer url={lesson.manus_slides_url} title={lesson.title} />
                  </div>
                </div>
              ) : (lesson?.google_slides_url) && !hasSlides ? (
                <UniversalLessonPlayer lesson={lesson} totalSlides={sortedSlides.length || 20} />
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
                        <div className="w-full h-full bg-card text-foreground p-4 sm:p-12 overflow-y-auto flex flex-col justify-center items-center"
                          style={{
                            fontSize: `${accessibilityMode.fontSize}%`,
                            filter: accessibilityMode.contrast === 'high' ? 'contrast(1.5)' : accessibilityMode.contrast === 'inverted' ? 'invert(1)' : 'none',
                            fontFamily: accessibilityMode.dyslexiaFont ? 'Comic Sans MS, cursive' : 'inherit'
                          }}>
                          <div className="max-w-4xl w-full">
                            <h2 className="text-xl sm:text-3xl font-bold mb-4 text-foreground">{sortedSlides[currentSlideIndex]?.title}</h2>
                            <div className="prose prose-sm sm:prose-lg max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(typeof sortedSlides[currentSlideIndex]?.content === 'string'
                                ? sortedSlides[currentSlideIndex].content.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
                                : sortedSlides[currentSlideIndex]?.content)
                              }} />
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

            {/* Floating mobile controls */}
            {!isPresenting && (
              <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-center sm:hidden z-50 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                  {hasSlides && (
                    <button onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))} disabled={currentSlideIndex === 0}
                      className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-orange-500 disabled:opacity-30 border border-white/20">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                </div>
                <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-white/10">
                  {currentSlideIndex + 1} / {sortedSlides.length || 1}
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  {hasSlides && (
                    <button onClick={() => setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1))} disabled={currentSlideIndex === sortedSlides.length - 1}
                      className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-orange-500 disabled:opacity-30 border border-white/20">
                      <ChevronRight size={20} />
                    </button>
                  )}
                  <button onClick={toggleFullscreen} className="w-10 h-10 bg-gray-900/80 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-blue-600 border border-white/20">
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Feedback row */}
        {!isPresenting && lesson && (
          <div className="bg-card border-t border-border px-4 sm:px-6 py-3 flex justify-end">
            <FeedbackButton lesson={lesson} courseId={courseId} />
          </div>
        )}
      </div>

      {/* ── DESKTOP FOOTER ────────────────────────────────────────────────── */}
      {!isPresenting && (
        <footer className="hidden sm:flex h-12 bg-card border-t border-border items-center justify-between px-4 text-xs text-muted-foreground flex-none">
          <div className="flex items-center gap-5">
            <span>Lesson {currentLessonIndex + 1} of {sortedLessons.length}</span>
            <div className="flex gap-2">
              <button onClick={handlePrevLesson} disabled={!prevLesson} className="flex items-center gap-1 hover:text-orange-500 disabled:opacity-50"><ChevronLeft size={14} /> Prev Lesson</button>
              <button onClick={handleNextLesson} disabled={!nextLesson} className="flex items-center gap-1 hover:text-orange-500 disabled:opacity-50">Next Lesson <ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasSlides && (
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))} className="p-1 hover:bg-accent rounded disabled:opacity-30" disabled={currentSlideIndex === 0}><ChevronLeft size={16} /></button>
                <span className="px-2 font-mono text-foreground">{currentSlideIndex + 1} / {sortedSlides.length}</span>
                <button onClick={() => setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1))} className="p-1 hover:bg-accent rounded disabled:opacity-30" disabled={currentSlideIndex === sortedSlides.length - 1}><ChevronRight size={16} /></button>
              </div>
            )}
            <button onClick={togglePresentation} className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded"><Presentation size={14} /><span>Present</span></button>
            <button onClick={toggleFullscreen} className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded">{isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</button>
          </div>
        </footer>
      )}

      {/* ── PRESENTATION CONTROLS (on hover) ─────────────────────────────── */}
      {isPresenting && showPresentationControls && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[90] bg-black/80 backdrop-blur-md border-2 border-white/50 rounded-lg p-3 shadow-2xl">
          {hasSlides ? (
            <>
              <button onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))} disabled={currentSlideIndex === 0} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"><ChevronLeft size={24} /></button>
              <span className="px-6 py-2 text-white text-base font-medium flex items-center bg-white/5 rounded-lg">{currentSlideIndex + 1} / {sortedSlides.length}</span>
              <button onClick={() => setCurrentSlideIndex(p => Math.min(sortedSlides.length - 1, p + 1))} disabled={currentSlideIndex === sortedSlides.length - 1} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"><ChevronRight size={24} /></button>
            </>
          ) : (
            <span className="px-6 py-3 text-white text-sm font-medium flex items-center gap-2"><Presentation size={16} />Presentation Mode</span>
          )}
        </div>
      )}

      {/* Drawing tools (presentation hover) */}
      {isPresenting && showPresentationControls && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-black/70 backdrop-blur-md border-2 border-white/50 rounded-lg p-2">
          <button onClick={() => setIsDrawing(v => !v)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${isDrawing ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Pencil size={16} />{isDrawing ? 'Drawing' : 'Draw'}
          </button>
          {isDrawing && (
            <>
              <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <button onClick={clearDrawings} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 text-sm"><Eraser size={16} />Clear</button>
            </>
          )}
        </div>
      )}

      {/* ── SHARED DIALOGS ────────────────────────────────────────────────── */}
      <NotesDialog
        open={showNotes}
        onOpenChange={setShowNotes}
        slideKey={String(currentSlideIndex + 1)}
        notes={sharedNotes}
        onSave={saveNote}
        onExport={exportNotes}
      />

      <AIAssistantDialog
        open={showAI}
        onOpenChange={setShowAI}
        aiTab={aiTab} setAiTab={setAiTab}
        aiLoading={aiLoading}
        aiResponse={aiResponse} setAiResponse={setAiResponse}
        aiSummary={aiSummary}
        aiTranslation={aiTranslation}
        targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
        onAsk={q => askAI(q, getCurrentSlideContext())}
        onSummarise={() => summariseSlide(getCurrentSlideContext())}
        onDefine={defineWord}
        onTranslate={() => translateSlide(getCurrentSlideContext())}
        slideLabel={`Slide ${currentSlideIndex + 1}`}
      />

      <BookmarksPanel
        open={showBookmarks}
        onOpenChange={setShowBookmarks}
        bookmarks={bookmarkedSlides}
        onJump={key => setCurrentSlideIndex(Math.max(0, Number(key) - 1))}
      />

      {/* Search dialog (MUI, stays here as it's PowerPoint-specific) */}
      <Dialog open={showSearch} onClose={() => setShowSearch(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Search Slides</DialogTitle>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <TextField placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small" fullWidth />
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

      {/* Accessibility dialog */}
      <Dialog open={showAccessibility} onClose={() => setShowAccessibility(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Accessibility</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Font Size: {accessibilityMode.fontSize}%</label>
              <input type="range" min="80" max="150" value={accessibilityMode.fontSize} onChange={e => setAccessibilityMode(m => ({ ...m, fontSize: parseInt(e.target.value) }))} className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contrast</label>
              <select value={accessibilityMode.contrast} onChange={e => setAccessibilityMode(m => ({ ...m, contrast: e.target.value }))} className="w-full p-2 border rounded">
                <option value="normal">Normal</option><option value="high">High</option><option value="inverted">Inverted</option>
              </select>
            </div>
            <Button onClick={speakSlideContent} className="w-full gap-2" variant="outlined" startIcon={<Volume2 className="w-4 h-4" />}>Read Aloud</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flashcards dialog */}
      <Dialog open={showFlashcards} onClose={() => setShowFlashcards(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-green-600" />Flashcards ({flashcards.length})</DialogTitle>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-3">
            {flashcards.length === 0
              ? <p className="text-center text-muted-foreground py-8">No flashcards yet</p>
              : flashcards.map((c, i) => (
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
        onUnlockSuccess={() => { refetchEnrollment(); setIsLessonLocked(false); }}
      />
    </div>
  );
}