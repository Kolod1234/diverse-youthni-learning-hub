import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Check, Menu, Search, X,
  BookOpen, CheckCircle, Sparkles, MessageSquare, Clock,
  Bookmark, BookmarkCheck, Settings, Maximize2, Minimize2,
  Download, Send, Loader2, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import UniversalLessonPlayer from '@/components/lesson/UniversalLessonPlayer';
import ManusSlidePlayer from '@/components/lesson/ManusSlidePlayer';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import useLessonPlayer from '@/components/lesson/useLessonPlayer';
import QuizGeneratorPanel from '@/components/lesson/QuizGeneratorPanel';
import MathJaxContent from '@/components/lesson/MathJaxContent';
import TopicQuizModal from '@/components/lesson/TopicQuizModal';
import WaterPolarityLessonVisual from '@/components/lesson/WaterPolarityLessonVisual';

const SolarSystem3D = React.lazy(() => import('@/components/lesson/SolarSystem3D'));
const CrystalLattice3D = React.lazy(() => import('@/components/lesson/CrystalLattice3D'));
const AmmoniaFountainLive = React.lazy(() => import('@/components/lesson/AmmoniaFountainLive'));
const WATER_INTERACTIVE_LESSON_ID = '6992f49f4f5ddcd614cb9d2e';
const WATER_POLARITY_MARKER = 'interactive:water-polarity';

export default function EnhancedLessonPlayer({
  lesson,
  course,
  isCompleted,
  onComplete,
  onNext,
  onPrev,
  user,
  enrollment,
  courseId
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [showTopicQuiz, setShowTopicQuiz] = useState(false);
  const [topicQuizCompleted, setTopicQuizCompleted] = useState(false);
  const [showMobileOutline, setShowMobileOutline] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [defineTerm, setDefineTerm] = useState('');
  const [interactiveContent, setInteractiveContent] = useState(null);
  const [loadingInteractives, setLoadingInteractives] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [currentContentSlide, setCurrentContentSlide] = useState(0);
  const containerRef = useRef(null);
  const mainContentRef = useRef(null);
  const touchStartRef = useRef(null);

  const {
    isFullscreen, toggleFullscreen, showAI, setShowAI,
    aiTab, setAiTab, aiLoading, aiResponse, setAiResponse,
    aiSummary, aiTranslation, targetLanguage, setTargetLanguage,
    askAI, summariseSlide, defineWord, translateSlide,
    notes, showNotes, setShowNotes, saveNote, exportNotes,
    bookmarks, toggleBookmark
  } = useLessonPlayer({
    lessonId: lesson?.id,
    containerRef,
    user
  });

  // Get course lessons
  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const mathPathwayUnits = {
    m1_m5: ['M1', 'M5'],
    m2_m6: ['M2', 'M6'],
    m3_m7: ['M3', 'M7'],
    m4_m8: ['M4', 'M8'],
  };
  const selectedMathUnits = mathPathwayUnits[enrollment?.math_pathway] || [];
  const hasMappedMathLessons = courseLessons.some(lessonItem => lessonItem.ccea_units?.length > 0);
  const pathwayLessons = course?.requires_math_pathway && enrollment?.math_pathway && hasMappedMathLessons
    ? courseLessons.filter(lessonItem => !lessonItem.ccea_units?.length || lessonItem.ccea_units.some(unitCode => selectedMathUnits.includes(unitCode)))
    : courseLessons;
  const sortedLessons = [...pathwayLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];
  const progressPercent = sortedLessons.length > 0 ? ((currentLessonIndex + 1) / sortedLessons.length * 100) : 0;
  const contentSlides = lesson?.slides || [];
  const activeContentSlide = contentSlides[currentContentSlide];
  const isWaterPolarityPage = lesson?.id === WATER_INTERACTIVE_LESSON_ID
    && activeContentSlide?.notes === WATER_POLARITY_MARKER;

  useEffect(() => {
    if (!lesson?.id) return;

    const savedPage = Number.parseInt(sessionStorage.getItem('lesson-player-page:' + lesson.id), 10);
    const restoredPage = Number.isInteger(savedPage) && savedPage >= 0 && savedPage < contentSlides.length
      ? savedPage
      : 0;

    setCurrentContentSlide(restoredPage);
    setShowTopicQuiz(false);
    setTopicQuizCompleted(false);
  }, [lesson?.id, contentSlides.length]);

  useEffect(() => {
    if (!lesson?.id || contentSlides.length === 0) return;
    sessionStorage.setItem('lesson-player-page:' + lesson.id, String(currentContentSlide));
  }, [lesson?.id, contentSlides.length, currentContentSlide]);

  useEffect(() => {
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    const previousBodyOverscroll = document.body.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.overscrollBehaviorY = 'none';

    const lessonScroller = mainContentRef.current;
    let gestureStartX = 0;
    let gestureStartY = 0;

    const preventRefreshStart = (event) => {
      if (event.touches.length !== 1) return;
      gestureStartX = event.touches[0].clientX;
      gestureStartY = event.touches[0].clientY;
    };

    const preventRefreshMove = (event) => {
      if (!lessonScroller || event.touches.length !== 1 || lessonScroller.scrollTop > 0) return;

      const deltaX = event.touches[0].clientX - gestureStartX;
      const deltaY = event.touches[0].clientY - gestureStartY;
      const isDownwardVerticalPull = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
      if (isDownwardVerticalPull) event.preventDefault();
    };

    lessonScroller?.addEventListener('touchstart', preventRefreshStart, { passive: true });
    lessonScroller?.addEventListener('touchmove', preventRefreshMove, { passive: false });

    return () => {
      document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
      document.body.style.overscrollBehaviorY = previousBodyOverscroll;
      lessonScroller?.removeEventListener('touchstart', preventRefreshStart);
      lessonScroller?.removeEventListener('touchmove', preventRefreshMove);
    };
  }, []);

  useEffect(() => {
    if (lesson?.section) {
      setExpandedSections(prev => ({ ...prev, [lesson.section]: true }));
    }
  }, [lesson?.id, lesson?.section]);

  useEffect(() => {
    const handlePageKeys = (event) => {
      const tag = event.target?.tagName;
      if (showTopicQuiz || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentContentSlide < contentSlides.length - 1) {
          setCurrentContentSlide(index => index + 1);
        } else if (contentSlides.length > 0 && !topicQuizCompleted) {
          setShowTopicQuiz(true);
        } else {
          onNext?.();
        }
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentContentSlide > 0) {
          setCurrentContentSlide(index => index - 1);
        } else {
          onPrev?.();
        }
      }
    };
    window.addEventListener('keydown', handlePageKeys);
    return () => window.removeEventListener('keydown', handlePageKeys);
  }, [currentContentSlide, contentSlides.length, onNext, onPrev, showTopicQuiz, topicQuizCompleted]);

  useEffect(() => {
    mainContentRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [currentContentSlide, lesson?.id]);

  // Load interactive content
  useEffect(() => {
    if (!lesson?.id || lesson.id === WATER_INTERACTIVE_LESSON_ID) return;
    
    setLoadingInteractives(true);
    base44.functions.invoke('generateLessonInteractives', {
      lessonId: lesson.id,
      difficulty: 'intermediate',
      questionTypes: ['multiple_choice', 'fill_blanks'],
      keywords: lesson.learning_objectives || []
    }).then(response => {
      if (response.data.success) {
        setInteractiveContent(response.data);
      }
    }).catch(err => {
      console.error('Failed to load interactive content:', err);
    }).finally(() => {
      setLoadingInteractives(false);
    });
  }, [lesson?.id]);

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const completedLessons = enrollment.completed_lessons || [];
      if (!completedLessons.includes(lesson.id)) {
        await base44.entities.Enrollment.update(enrollment.id, {
          completed_lessons: [...completedLessons, lesson.id],
          progress_percent: Math.round(((completedLessons.length + 1) / Math.max(sortedLessons.length, 1)) * 100)
        });
        
        const response = await base44.functions.invoke('awardPoints', {
          action: 'complete_lesson'
        });
        
        if (response.data.success) {
          setEarnedPoints(response.data.pointsEarned);
          setShowPointsAnimation(true);
          if (response.data.newBadges?.length > 0) {
            setNewBadges(response.data.newBadges);
            setShowBadges(true);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      onComplete?.();
      toast.success('Lesson completed!');
    }
  });

  if (!lesson) return null;

  const groupedLessons = sortedLessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Lessons';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  const completedIds = enrollment?.completed_lessons || [];
  const lessonProgress = sortedLessons.length > 0
    ? Math.round((completedIds.length / sortedLessons.length) * 100)
    : Math.round(progressPercent);
  const hasPages = contentSlides.length > 0;
  const isFirstPage = !hasPages || currentContentSlide === 0;
  const isLastPage = !hasPages || currentContentSlide === contentSlides.length - 1;
  const pageProgress = hasPages ? ((currentContentSlide + 1) / contentSlides.length) * 100 : 100;
  const estimatedMinutes = lesson.duration_minutes || Math.max(2, contentSlides.length * 2);
  const currentPageKey = lesson.id + ':' + currentContentSlide;
  const animatedStemContent = /mathematics|maths|physics|chemistry/i.test([
    course?.title,
    course?.subject,
    course?.category,
    lesson?.subject
  ].filter(Boolean).join(' '));
  const isBookmarked = bookmarks.includes(currentPageKey);
  const topicQuizQuestions = interactiveContent?.quizQuestions || [];
  const canOpenTopicQuiz = isLastPage && hasPages && !topicQuizCompleted;

  const closeTools = () => {
    setShowAI(false);
    setShowNotes(false);
    setShowQuizPanel(false);
  };

  const toggleTool = (tool) => {
    const opening = tool === 'ai' ? !showAI : tool === 'notes' ? !showNotes : !showQuizPanel;
    closeTools();
    if (opening && tool === 'ai') setShowAI(true);
    if (opening && tool === 'notes') setShowNotes(true);
    if (opening && tool === 'quiz') setShowQuizPanel(true);
  };

  const goToPrevious = () => {
    if (hasPages && currentContentSlide > 0) {
      setCurrentContentSlide(index => index - 1);
    } else {
      onPrev?.();
    }
  };

  const goToNext = () => {
    if (hasPages && currentContentSlide < contentSlides.length - 1) {
      setCurrentContentSlide(index => index + 1);
    } else if (hasPages && !topicQuizCompleted) {
      setShowTopicQuiz(true);
    } else {
      onNext?.();
    }
  };

  const handleTopicQuizContinue = () => {
    setTopicQuizCompleted(true);
    setShowTopicQuiz(false);
    if (nextLesson) onNext?.();
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1 || event.target?.closest?.('button, a, input, textarea, select, [role="button"], [data-no-swipe]')) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const isDeliberateHorizontalSwipe = Math.abs(deltaX) >= 64 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;
    if (!isDeliberateHorizontalSwipe) return;

    if (deltaX < 0) goToNext();
    else goToPrevious();
  };

  const selectLesson = (id) => {
    navigate('/LessonPlayerClassic?lesson=' + id + '&course=' + courseId);
    setShowMobileOutline(false);
  };

  const richContentClasses = [
    'lesson-rich-content text-[16px] sm:text-[17px] leading-7 sm:leading-8 text-slate-700',
    '[&_p]:mb-5 [&_p]:max-w-none',
    '[&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#0b1b32]',
    '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#12345a]',
    '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2',
    '[&_strong]:font-semibold [&_strong]:text-[#0b1b32]',
    '[&_a]:text-indigo-700 [&_a]:underline [&_a]:underline-offset-2',
    '[&_details]:my-5 [&_details]:rounded-xl [&_details]:border [&_details]:border-slate-200 [&_details]:bg-white [&_details]:p-4',
    '[&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-[#10233f]',
    '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:text-[15px]',
    '[&_th]:border [&_th]:border-slate-200 [&_th]:p-3 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:p-3',
    '[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_video]:h-auto [&_video]:max-w-full [&_video]:rounded-xl [&_svg]:h-auto [&_svg]:max-w-full [&_figure]:my-7 [&_figure]:overflow-visible',
    '[&_math]:mx-1 [&_math]:inline-block [&_math]:align-middle [&_math]:font-serif [&_math]:text-[1.1em] [&_math]:text-[#0b1b32]',
    '[&_.key-rule]:my-6 [&_.key-rule]:rounded-xl [&_.key-rule]:border [&_.key-rule]:border-emerald-200 [&_.key-rule]:bg-emerald-50 [&_.key-rule]:p-5',
    '[&_.notation-note]:my-6 [&_.notation-note]:rounded-xl [&_.notation-note]:border [&_.notation-note]:border-orange-200 [&_.notation-note]:bg-orange-50 [&_.notation-note]:p-5',
    '[&_.worked-example]:my-6 [&_.worked-example]:rounded-xl [&_.worked-example]:border [&_.worked-example]:border-blue-200 [&_.worked-example]:bg-blue-50 [&_.worked-example]:p-5',
    '[&_.method-steps]:my-6 [&_.method-steps]:rounded-xl [&_.method-steps]:border [&_.method-steps]:border-indigo-200 [&_.method-steps]:bg-indigo-50 [&_.method-steps]:p-5',
    '[&_.practice-block]:my-6 [&_.practice-block]:rounded-xl [&_.practice-block]:border [&_.practice-block]:border-amber-200 [&_.practice-block]:bg-amber-50 [&_.practice-block]:p-5',
    '[&_.answer-block]:my-5 [&_.answer-block]:rounded-xl [&_.answer-block]:border [&_.answer-block]:border-green-200 [&_.answer-block]:bg-green-50 [&_.answer-block]:p-5',
    '[&_.check-point]:my-5 [&_.check-point]:rounded-xl [&_.check-point]:border [&_.check-point]:border-violet-200 [&_.check-point]:bg-violet-50 [&_.check-point]:p-5',
    '[&_.step-number]:mr-2 [&_.step-number]:inline-flex [&_.step-number]:h-7 [&_.step-number]:w-7 [&_.step-number]:items-center [&_.step-number]:justify-center [&_.step-number]:rounded-full [&_.step-number]:bg-indigo-600 [&_.step-number]:text-sm [&_.step-number]:font-bold [&_.step-number]:text-white'
  ].join(' ');

  const outlineContent = (
    <>
      <div className="border-b border-white/10 px-5 pb-5 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Course outline</span>
          <button
            type="button"
            onClick={() => { setShowSidebar(false); setShowMobileOutline(false); }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Collapse course outline"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/CourseDetails?id=' + courseId)}
          className="mb-4 flex w-full items-start gap-3 text-left"
        >
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
          <span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-slate-400">CCEA course</span>
            <span className="mt-1 block text-sm font-semibold leading-5 text-white">{course?.title || 'Course'}</span>
          </span>
        </button>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>{lessonProgress}% complete</span>
          <span>{completedIds.length} of {sortedLessons.length} lessons</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: lessonProgress + '%' }} />
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search course outline"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Course outline">
        {Object.entries(groupedLessons).map(([section, sectionLessons]) => {
          const isExpanded = expandedSections[section] !== false;
          const filtered = sectionLessons.filter(item =>
            !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (searchQuery && filtered.length === 0) return null;
          return (
            <div key={section} className="border-b border-white/10 py-1">
              <button
                type="button"
                onClick={() => setExpandedSections(previous => ({ ...previous, [section]: !isExpanded }))}
                className="flex min-h-12 w-full items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-200 hover:bg-white/5"
              >
                <span>{section}</span>
                <ChevronRight className={'h-4 w-4 transition-transform ' + (isExpanded ? 'rotate-90' : '')} />
              </button>
              {isExpanded && (
                <div className="px-2 pb-3">
                  {filtered.map((item, index) => {
                    const completed = completedIds.includes(item.id);
                    const current = item.id === lesson.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => selectLesson(item.id)}
                        aria-current={current ? 'page' : undefined}
                        className={'relative mb-1 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ' + (current ? 'bg-[#16314f] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')}
                      >
                        {current && <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-orange-500" />}
                        <span className={'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ' + (completed ? 'border-emerald-400 bg-emerald-500 text-white' : current ? 'border-orange-400 text-orange-300' : 'border-slate-600 text-slate-400')}>
                          {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span className="line-clamp-2 flex-1 leading-5">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">
        Use <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-slate-200">←</kbd>
        <span className="mx-1">/</span>
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-slate-200">→</kbd> to change pages
      </div>
    </>
  );

  return (
    <div ref={containerRef} className={'flex h-[100dvh] overscroll-y-none overflow-hidden bg-[#071326] text-white ' + (isFullscreen ? 'fixed inset-0 z-[100]' : '')}>
      {showSidebar && (
        <aside className="hidden h-full w-[288px] shrink-0 flex-col border-r border-white/10 bg-[#07182b] lg:flex">
          {outlineContent}
        </aside>
      )}

      {showMobileOutline && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileOutline(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close course outline"
          />
          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col bg-[#07182b] shadow-2xl">
            {outlineContent}
          </aside>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#eef1f5]">
        <header className="z-30 flex min-h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#071326] px-3 text-white sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => window.innerWidth < 1024 ? setShowMobileOutline(true) : setShowSidebar(!showSidebar)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10"
              aria-label="Toggle course outline"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/CourseDetails?id=' + courseId)}
              className="hidden min-w-0 items-center gap-2 text-left sm:flex"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 text-slate-300" />
              <span className="hidden min-w-0 xl:block">
                <span className="block truncate text-sm font-semibold">{course?.title || 'Course'}</span>
                <span className="block truncate text-xs text-slate-400">{lesson.section || 'Lesson'}</span>
              </span>
            </button>
          </div>

          <div className="min-w-0 flex-1 px-2 text-left sm:px-5 sm:text-center">
            <h1 className="truncate font-serif text-base font-semibold sm:text-lg">{lesson.title}</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {hasPages ? 'Page ' + (currentContentSlide + 1) + ' of ' + contentSlides.length : 'Lesson ' + (currentLessonIndex + 1) + ' of ' + sortedLessons.length}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => toggleTool('ai')}
              className={'inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs transition sm:gap-2 ' + (showAI ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open AI learning assistant"
              title="AI learning assistant"
            >
              <Sparkles className="h-4 w-4" /><span className="hidden 2xl:inline">Ask</span>
            </button>
            <button
              type="button"
              onClick={() => toggleTool('notes')}
              className={'inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs transition sm:gap-2 ' + (showNotes ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open notes"
              title="Notes"
            >
              <MessageSquare className="h-4 w-4" /><span className="hidden 2xl:inline">Notes</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 md:inline-flex"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => toggleTool('quiz')}
              className={'inline-flex h-11 w-11 items-center justify-center rounded-lg sm:hidden ' + (showQuizPanel ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open lesson tools"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main
            ref={mainContentRef}
            className="min-w-0 flex-1 touch-pan-y touch-pinch-zoom overscroll-y-none overflow-y-auto scroll-smooth px-3 py-4 sm:px-6 sm:py-7 lg:px-8"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none', touchAction: 'pan-y pinch-zoom' }}
            aria-label="Lesson content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
          >
            {lesson.manus_slides_url ? (
              <div className="mx-auto min-h-full max-w-5xl rounded-xl bg-white p-4 shadow-sm">
                <ManusSlidePlayer url={lesson.manus_slides_url} title={lesson.title} />
              </div>
            ) : lesson.google_slides_url || lesson.video_url || lesson.file_url ? (
              <div className="mx-auto min-h-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-sm">
                <UniversalLessonPlayer
                  lesson={lesson}
                  totalSlides={lesson.total_slides || lesson.slides?.length || 1}
                  isFullscreen={isFullscreen}
                  toggleFullscreen={toggleFullscreen}
                />
              </div>
            ) : hasPages && activeContentSlide ? (
                <motion.article
                  key={currentPageKey}
                  className={'mx-auto w-full max-w-[920px] rounded-xl border border-slate-200 bg-[#fbfcfe] px-5 py-7 text-[#13233b] shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10 lg:px-14 lg:py-12' + (animatedStemContent ? ' lesson-page-stagger' : '')}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                >
                <div className="lesson-page-meta mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
                      Page {currentContentSlide + 1} of {contentSlides.length} <span className="mx-1.5 text-slate-300">•</span> {lesson.section || 'Lesson'}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-4 w-4" /> About {estimatedMinutes} min for this lesson
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentPageKey)}
                    className={'inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ' + (isBookmarked ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
                    aria-label={isBookmarked ? 'Remove page bookmark' : 'Bookmark this page'}
                  >
                    {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                </div>
                <h2 className="lesson-page-title mb-6 font-serif text-3xl font-bold leading-tight text-[#0b1b32] sm:text-4xl">{activeContentSlide.title}</h2>
                  {isWaterPolarityPage ? (
                    <>
                      <WaterPolarityLessonVisual shouldReduceMotion={shouldReduceMotion} />
                      <MathJaxContent
                        className={richContentClasses + ' mt-8' + (animatedStemContent ? ' lesson-page-body' : '')}
                        html={(activeContentSlide.content || '').split('</figure>').slice(1).join('</figure>')}
                      />
                    </>
                  ) : (
                    <MathJaxContent
                      className={richContentClasses + (animatedStemContent ? ' lesson-page-body' : '')}
                      html={activeContentSlide.content || ''}
                    />
                  )}
                  {activeContentSlide.content?.includes('data-interactive="solar-system-3d"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading interactive Solar System" />}>
                      <SolarSystem3D />
                    </React.Suspense>
                  )}
                  {activeContentSlide.content?.includes('data-interactive="crystal-lattice-3d"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading interactive crystal structure" />}>
                      <CrystalLattice3D model={activeContentSlide.content.includes('data-model="graphite"') ? 'graphite' : 'diamond'} />
                    </React.Suspense>
                  )}
                  {activeContentSlide.content?.includes('data-interactive="ammonia-fountain-live"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading live ammonia fountain" />}>
                      <AmmoniaFountainLive />
                    </React.Suspense>
                  )}
                </motion.article>
            ) : (
              <div className="mx-auto flex min-h-[420px] max-w-[920px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                No lesson content is available yet.
              </div>
            )}
          </main>

          <aside className="hidden w-[78px] shrink-0 flex-col items-center gap-2 border-l border-slate-200 bg-[#f7f8fb] px-2 py-6 xl:flex" aria-label="Lesson tools">
            {[
              { id: 'ai', label: 'Ask', icon: Sparkles, active: showAI },
              { id: 'notes', label: 'Notes', icon: MessageSquare, active: showNotes },
              { id: 'quiz', label: 'Practice', icon: Brain, active: showQuizPanel }
            ].map(tool => {
              const ToolIcon = tool.icon;
              return (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={'flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition ' + (tool.active ? 'bg-[#071326] text-white' : 'text-slate-600 hover:bg-white hover:text-[#071326]')}
                  aria-pressed={tool.active}
                >
                  <ToolIcon className="h-5 w-5" />
                  {tool.label}
                </button>
              );
            })}
          </aside>

          {(showAI || showNotes || showQuizPanel) && (
            <aside className="fixed inset-x-0 bottom-[72px] top-[72px] z-[70] flex flex-col overflow-hidden border-t border-slate-200 bg-white text-slate-900 shadow-2xl sm:left-auto sm:w-[360px] sm:border-l sm:border-t-0 lg:relative lg:inset-auto lg:z-20 lg:w-[360px] lg:shrink-0 lg:shadow-none">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0b1b32]">
                  {showAI && <><Sparkles className="h-5 w-5 text-orange-500" /> Learning assistant</>}
                  {showNotes && <><MessageSquare className="h-5 w-5 text-indigo-600" /> Page notes</>}
                  {showQuizPanel && <><Brain className="h-5 w-5 text-violet-600" /> Practice questions</>}
                </h3>
                <button type="button" onClick={closeTools} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close lesson tools">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {showAI && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="grid grid-cols-4 gap-1 border-b border-slate-200 p-2">
                    {['ask', 'summary', 'define', 'translate'].map(tab => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setAiTab(tab)}
                        className={'min-h-10 rounded-md px-2 text-xs font-semibold capitalize ' + (aiTab === tab ? 'bg-[#071326] text-white' : 'text-slate-600 hover:bg-slate-100')}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {aiTab === 'ask' && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="lesson-ai-question">Ask about this page</label>
                        <textarea
                          id="lesson-ai-question"
                          value={aiQuestion}
                          onChange={event => setAiQuestion(event.target.value)}
                          placeholder="What would you like explained?"
                          className="min-h-28 w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => { askAI(aiQuestion, activeContentSlide?.content || lesson.title); setAiQuestion(''); }}
                          disabled={!aiQuestion.trim() || aiLoading}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-[#071326] hover:bg-orange-400 disabled:opacity-50"
                        >
                          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask
                        </button>
                      </div>
                    )}
                    {aiTab === 'summary' && (
                      <button type="button" onClick={() => summariseSlide(activeContentSlide?.content || '')} disabled={aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">
                        {aiLoading ? 'Creating summary…' : 'Summarise this page'}
                      </button>
                    )}
                    {aiTab === 'define' && (
                      <div className="space-y-3">
                        <input value={defineTerm} onChange={event => setDefineTerm(event.target.value)} placeholder="Enter a word or term" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-500" />
                        <button type="button" onClick={() => { defineWord(defineTerm); setDefineTerm(''); }} disabled={!defineTerm.trim() || aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">Explain this term</button>
                      </div>
                    )}
                    {aiTab === 'translate' && (
                      <div className="space-y-3">
                        <select value={targetLanguage} onChange={event => setTargetLanguage(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                          <option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="zh">Chinese</option><option value="ar">Arabic</option><option value="ur">Urdu</option><option value="pl">Polish</option>
                        </select>
                        <button type="button" onClick={() => translateSlide(activeContentSlide?.content || '', targetLanguage)} disabled={aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">Translate this page</button>
                      </div>
                    )}
                    {(aiResponse || aiSummary || aiTranslation) && (
                      <div className="mt-5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {aiTab === 'summary' ? aiSummary : aiTab === 'translate' ? aiTranslation : aiResponse}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showNotes && (
                <div className="flex min-h-0 flex-1 flex-col p-5">
                  <p className="mb-3 text-sm text-slate-500">Notes are saved for page {currentContentSlide + 1}.</p>
                  <textarea
                    value={notes[currentPageKey] || ''}
                    onChange={event => saveNote(currentPageKey, event.target.value)}
                    className="min-h-0 flex-1 resize-none rounded-lg border border-slate-300 bg-amber-50/40 p-4 text-sm leading-6 outline-none focus:border-indigo-500"
                    placeholder="Write your notes here…"
                  />
                  <button type="button" onClick={exportNotes} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-4 w-4" /> Export notes
                  </button>
                </div>
              )}

              {showQuizPanel && <div className="min-h-0 flex-1 overflow-y-auto"><QuizGeneratorPanel lesson={lesson} onClose={closeTools} /></div>}
            </aside>
          )}
        </div>

        <footer className="z-40 flex min-h-[72px] shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 text-slate-900 sm:px-5">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={isFirstPage && !prevLesson}
            aria-label={isFirstPage ? 'Go to previous topic' : 'Go to previous page'}
            title={isFirstPage ? 'Previous topic' : 'Previous page'}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">{isFirstPage ? 'Previous topic' : 'Previous page'}</span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>{hasPages ? 'Page ' + (currentContentSlide + 1) + ' of ' + contentSlides.length : 'Lesson'}</span>
              <span className="sm:hidden">Swipe or tap</span>
              <span className="hidden sm:inline">Use ← / → to navigate</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: pageProgress + '%' }} />
            </div>
          </div>

          {hasPages && (
            <select
              value={currentContentSlide}
              onChange={event => setCurrentContentSlide(Number(event.target.value))}
              aria-label="Choose lesson page"
              className="hidden h-11 max-w-[210px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500 md:block"
            >
              {contentSlides.map((slide, index) => <option key={index} value={index}>Page {index + 1}: {slide.title || 'Untitled'}</option>)}
            </select>
          )}

          {(!isCompleted && isLastPage) && (
            <button
              type="button"
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 sm:px-4"
            >
              <CheckCircle className="h-4 w-4" /><span className="hidden sm:inline">{markCompleteMutation.isPending ? 'Saving…' : 'Mark complete'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={goToNext}
            disabled={isLastPage && !nextLesson && !canOpenTopicQuiz}
            aria-label={canOpenTopicQuiz ? 'Open topic quiz' : isLastPage ? 'Go to next topic' : 'Go to next page'}
            title={canOpenTopicQuiz ? 'Topic quiz' : isLastPage ? 'Next topic' : 'Next page'}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-[#071326] shadow-sm hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
          >
            <span className="hidden sm:inline">{canOpenTopicQuiz ? 'Topic quiz' : isLastPage ? 'Next topic' : 'Next page'}</span><ChevronRight className="h-5 w-5" />
          </button>
        </footer>
      </section>

      <TopicQuizModal
        open={showTopicQuiz}
        lesson={lesson}
        questions={topicQuizQuestions}
        loading={loadingInteractives}
        hasNextTopic={!!nextLesson}
        onClose={() => setShowTopicQuiz(false)}
        onContinue={handleTopicQuizContinue}
      />

      <PointsAnimation show={showPointsAnimation} points={earnedPoints} onComplete={() => setShowPointsAnimation(false)} />
      <BadgeUnlock badges={newBadges} onClose={() => setShowBadges(false)} />
      <LessonUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        lessonId={lesson.id}
        courseId={courseId}
        lessonTitle={lesson.title}
        onUnlockSuccess={() => setIsLessonLocked(false)}
      />
    </div>
  );
}