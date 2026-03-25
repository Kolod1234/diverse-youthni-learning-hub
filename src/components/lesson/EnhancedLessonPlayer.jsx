import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ChevronLeft, ChevronRight, Check, Menu, Search, X, Lock, Key,
  BookOpen, CheckCircle, Sparkles, MessageSquare, Clock, Eye,
  Bookmark, BookmarkCheck, Settings, Maximize2, Minimize2, Download,
  Send, Lightbulb, Zap, Settings2, Loader2, RefreshCw, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalLessonPlayer from '@/components/lesson/UniversalLessonPlayer';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import useLessonPlayer from '@/components/lesson/useLessonPlayer';
import InteractiveQuiz from '@/components/lesson/InteractiveQuiz';
import TrueFalseQuiz from '@/components/lesson/TrueFalseQuiz';
import MatchingGame from '@/components/lesson/MatchingGame';
import ShortAnswerQuiz from '@/components/lesson/ShortAnswerQuiz';
import QuizGeneratorPanel from '@/components/lesson/QuizGeneratorPanel';

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
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [interactiveContent, setInteractiveContent] = useState(null);
  const [loadingInteractives, setLoadingInteractives] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const containerRef = useRef(null);
  const mainContentRef = useRef(null);

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

  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];
  const progressPercent = sortedLessons.length > 0 ? ((currentLessonIndex + 1) / sortedLessons.length * 100) : 0;

  // Load interactive content
  useEffect(() => {
    if (!lesson?.id) return;
    
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
          progress_percent: Math.round(((completedLessons.length + 1) / courseLessons.length) * 100)
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

  return (
    <div ref={containerRef} className={`flex h-screen bg-slate-950 text-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="hidden lg:flex w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex-col overflow-hidden fixed lg:relative h-full z-40 lg:z-0"
          >
            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:border-orange-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-orange-500 mb-1">COURSE</h3>
              <p className="text-sm text-slate-300 mb-3">{course?.title || 'Course'}</p>
              
              {enrollment && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{Math.round((enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
                      style={{ width: `${(enrollment.completed_lessons?.length || 0) / sortedLessons.length * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
                <div key={section} className="border-b border-slate-700 last:border-b-0">
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {section}
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections[section] ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedSections[section] && (
                    <div className="space-y-1 px-2 py-2">
                      {sectionLessons.filter(l =>
                        !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map(l => {
                        const completed = enrollment?.completed_lessons?.includes(l.id);
                        const isCurrent = l.id === lesson.id;

                        return (
                          <button
                            key={l.id}
                            onClick={() => {
                              navigate(`/LessonPlayerClassic?lesson=${l.id}&course=${courseId}`);
                              setExpandedSections(prev => ({ ...prev, [section]: false }));
                            }}
                            className={`w-full px-3 py-2.5 text-left rounded-lg text-sm transition flex items-center gap-2 ${
                              isCurrent
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : 'hover:bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-500 flex-shrink-0" />
                            )}
                            <span className="truncate flex-1">{l.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{lesson.title}</h1>
              <p className="text-xs text-slate-400">{lesson.section || 'Lesson'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 mr-4">
              Slide {currentLessonIndex + 1} / {sortedLessons.length}
            </div>
            <button
              onClick={() => setShowAI(!showAI)}
              className={`p-2 rounded-lg transition ${showAI ? 'bg-orange-500/20 text-orange-300' : 'hover:bg-slate-800 text-slate-400'}`}
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition ${showNotes ? 'bg-orange-500/20 text-orange-300' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Notes"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowQuizPanel(!showQuizPanel)}
              className={`p-2 rounded-lg transition ${showQuizPanel ? 'bg-orange-500/20 text-orange-300' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Quiz Generator"
            >
              <Brain className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex gap-4 p-4">
          {/* Main Content */}
          <div ref={mainContentRef} className="flex-1 bg-slate-800/30 rounded-lg overflow-auto">
            {lesson.google_slides_url || lesson.video_url || lesson.file_url ? (
              <UniversalLessonPlayer
                lesson={lesson}
                totalSlides={lesson.total_slides || lesson.slides?.length || 50}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No content available
              </div>
            )}
          </div>

          {/* Side Panels */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                className="w-80 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                  </div>
                  <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Tabs */}
                <div className="flex gap-2 px-4 py-3 border-b border-slate-700">
                  {['ask', 'summarize', 'define', 'translate'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAiTab(tab)}
                      className={`px-3 py-1 text-xs font-medium rounded transition ${
                        aiTab === tab
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* AI Response */}
                <div className="flex-1 overflow-y-auto p-4">
                  {aiLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    </div>
                  ) : aiResponse || aiSummary || aiTranslation ? (
                    <p className="text-sm text-slate-300">{aiResponse || aiSummary || aiTranslation}</p>
                  ) : (
                    <p className="text-xs text-slate-500">Ask a question or select an action...</p>
                  )}
                </div>

                {/* AI Input */}
                {aiTab === 'ask' && (
                  <div className="p-4 border-t border-slate-700 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask..."
                      className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm border border-slate-600 focus:border-orange-500 outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          askAI(e.currentTarget.value, lesson.title);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {showQuizPanel && (
              <QuizGeneratorPanel lesson={lesson} onClose={() => setShowQuizPanel(false)} />
            )}

            {showNotes && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                className="w-80 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notes</h3>
                  <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={notes[String(currentLessonIndex)] || ''}
                  onChange={(e) => saveNote(String(currentLessonIndex), e.target.value)}
                  className="flex-1 bg-slate-700 text-white p-4 resize-none border-0 focus:outline-none"
                  placeholder="Add notes..."
                />

                <button
                  onClick={exportNotes}
                  className="p-3 border-t border-slate-700 hover:bg-slate-700/50 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Bottom Controls */}
        <div className="bg-slate-900 border-t border-slate-700 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 items-center">
            <button
              onClick={onPrev}
              disabled={!prevLesson}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition flex items-center gap-2 text-sm font-medium border border-slate-600"
              title="Go to previous topic"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev Topic
            </button>
            <button
              onClick={onNext}
              disabled={!nextLesson}
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 transition flex items-center gap-2 text-sm font-medium"
              title="Go to next topic"
            >
              Next Topic
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCompleted && (
            <button
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              {markCompleteMutation.isPending ? 'Saving...' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Animations */}
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