import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Minimize2, Zap, MessageSquare, BookmarkPlus, BookmarkCheck,
  RotateCw, Settings, Share2, Download, ChevronLeft, ChevronRight,
  Clock, Volume2, X, Menu, Lightbulb, Loader2, Send, Settings2
} from 'lucide-react';
import useLessonPlayer from './useLessonPlayer';
import UniversalLessonPlayer from './UniversalLessonPlayer';

export default function ModernLessonPlayer({
  lesson,
  course,
  onNext,
  onPrev,
  currentSlideIndex = 0,
  totalSlides = 1,
  user,
}) {
  const containerRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [currentSlide, setCurrentSlide] = useState(currentSlideIndex);
  const [aiQuestion, setAiQuestion] = useState('');
  const hideToolbarTimer = useRef(null);

  const player = useLessonPlayer({
    lessonId: lesson?.id,
    containerRef,
    user,
    onNext: () => {
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
        onNext?.();
      }
    },
    onPrev: () => {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
        onPrev?.();
      }
    },
  });

  // Auto-hide toolbar on mouse idle
  useEffect(() => {
    const handleMouseMove = () => {
      setIsToolbarVisible(true);
      clearTimeout(hideToolbarTimer.current);
      if (!isPresentationMode) return;
      hideToolbarTimer.current = setTimeout(() => setIsToolbarVisible(false), 3000);
    };

    const handleMouseLeave = () => {
      if (isPresentationMode) {
        clearTimeout(hideToolbarTimer.current);
        hideToolbarTimer.current = setTimeout(() => setIsToolbarVisible(false), 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(hideToolbarTimer.current);
    };
  }, [isPresentationMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPresentationMode(!isPresentationMode);
          break;
        case 'f':
          e.preventDefault();
          player.toggleFullscreen();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          player.onNext?.();
          break;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          player.onPrev?.();
          break;
        case 'n':
          e.preventDefault();
          player.setShowNotes(v => !v);
          break;
        case 'a':
          e.preventDefault();
          player.setShowAI(v => !v);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [player, isPresentationMode]);

  const slideProgress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-black overflow-hidden ${
        player.isFullscreen ? 'fullscreen' : ''
      }`}
    >
      {/* Content Area */}
      <div
        className={`w-full h-full flex items-center justify-center ${
          isPresentationMode ? 'bg-black' : 'bg-gray-900'
        }`}
      >
        {lesson?.google_slides_url ? (
          <UniversalLessonPlayer
            lesson={lesson}
            totalSlides={totalSlides}
            isFullscreen={player.isFullscreen}
            toggleFullscreen={player.toggleFullscreen}
          />
        ) : lesson?.video_url ? (
          <iframe
            src={lesson.video_url}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        ) : lesson?.file_url ? (
          <iframe
            src={lesson.file_url}
            className="w-full h-full border-0"
            title={lesson.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl font-bold mb-4">{lesson?.title || 'Lesson'}</div>
              <div className="text-2xl text-gray-400 mb-8">Slide {currentSlide + 1} of {totalSlides}</div>
              <div className="text-xl text-gray-500">No content available</div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar - Hidden in true presentation mode */}
      <AnimatePresence>
        {!isPresentationMode && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-8 pb-4"
          >
            {/* Progress Bar */}
            <div className="px-4 mb-4">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="px-4 flex items-center justify-between gap-3">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-white"
                  title="Previous (H)"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-sm text-gray-400">
                  {currentSlide + 1} / {totalSlides}
                </div>
                <button
                  onClick={() => currentSlide < totalSlides - 1 && setCurrentSlide(currentSlide + 1)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-white"
                  title="Next (L)"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => player.setShowNotes(!player.showNotes)}
                  className={`p-2 rounded-lg transition ${
                    player.showNotes
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                  title="Notes (N)"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  onClick={() => player.toggleBookmark(currentSlide)}
                  className={`p-2 rounded-lg transition ${
                    player.bookmarks.includes(String(currentSlide))
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                  title="Bookmark (B)"
                >
                  {player.bookmarks.includes(String(currentSlide)) ? (
                    <BookmarkCheck size={20} />
                  ) : (
                    <BookmarkPlus size={20} />
                  )}
                </button>
                <button
                  onClick={() => player.setShowAI(!player.showAI)}
                  className={`p-2 rounded-lg transition ${
                    player.showAI
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                  title="AI Assistant (A)"
                >
                  <Zap size={20} />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={() => setIsPresentationMode(!isPresentationMode)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"
                  title="Presentation Mode (Space)"
                >
                  <Settings2 size={20} />
                </button>

                <button
                  onClick={player.toggleFullscreen}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"
                  title="Fullscreen (F)"
                >
                  {player.isFullscreen ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Maximize2 size={20} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presentation Mode Minimal Controls */}
      <AnimatePresence>
        {isPresentationMode && isToolbarVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50"
          >
            <button
              onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
              className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full text-white transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="px-4 py-3 bg-gray-800 rounded-full text-white text-sm flex items-center">
              {currentSlide + 1} / {totalSlides}
            </div>
            <button
              onClick={() => currentSlide < totalSlides - 1 && setCurrentSlide(currentSlide + 1)}
              className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full text-white transition"
            >
              <ChevronRight size={24} />
            </button>
            <button
              onClick={() => setIsPresentationMode(false)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition"
              title="Exit (Space)"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Panel - Notes */}
      <AnimatePresence>
        {player.showNotes && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 p-4 z-40 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Slide Notes</h3>
              <button
                onClick={() => player.setShowNotes(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={player.notes[String(currentSlide)] || ''}
              onChange={(e) => player.saveNote(String(currentSlide), e.target.value)}
              className="flex-1 bg-gray-800 text-white p-3 rounded border border-gray-700 resize-none"
              placeholder="Add notes for this slide..."
            />
            <button
              onClick={player.exportNotes}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-medium transition"
            >
              <Download size={18} className="inline mr-2" />
              Export Notes
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Panel - AI Assistant */}
      <AnimatePresence>
        {player.showAI && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="absolute left-0 top-0 bottom-0 w-96 bg-gray-900 border-r border-gray-700 p-4 z-40 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-400" />
                AI Assistant
              </h3>
              <button
                onClick={() => player.setShowAI(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-gray-700">
              {['ask', 'summarize', 'define', 'translate'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => player.setAiTab(tab)}
                  className={`py-2 px-3 text-sm font-medium transition ${
                    player.aiTab === tab
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Response Display */}
            <div className="flex-1 bg-gray-800 rounded p-3 mb-4 overflow-y-auto text-sm text-gray-300">
              {player.aiLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="animate-spin text-orange-500" />
                </div>
              ) : player.aiResponse ? (
                <p>{player.aiResponse}</p>
              ) : player.aiSummary ? (
                <p>{player.aiSummary}</p>
              ) : player.aiTranslation ? (
                <p>{player.aiTranslation}</p>
              ) : (
                <p className="text-gray-500">Ask a question or select an action...</p>
              )}
            </div>

            {/* Input */}
            {player.aiTab === 'ask' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      player.askAI(aiQuestion);
                      setAiQuestion('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    player.askAI(aiQuestion);
                    setAiQuestion('');
                  }}
                  disabled={player.aiLoading || !aiQuestion.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded transition"
                >
                  <Send size={18} />
                </button>
              </div>
            )}

            {player.aiTab === 'summarize' && (
              <button
                onClick={() => player.summariseSlide()}
                disabled={player.aiLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
              >
                {player.aiLoading ? 'Summarizing...' : 'Summarize This Slide'}
              </button>
            )}

            {player.aiTab === 'translate' && (
              <div className="flex gap-2">
                <select
                  value={player.targetLanguage}
                  onChange={(e) => player.setTargetLanguage(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-sm"
                >
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="ur">Urdu</option>
                  <option value="pl">Polish</option>
                </select>
                <button
                  onClick={() => player.translateSlide()}
                  disabled={player.aiLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition"
                >
                  {player.aiLoading ? '...' : 'Translate'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 right-4 text-xs text-gray-500 pointer-events-none">
        <div>F - Fullscreen | Space - Presentation | N - Notes | A - AI</div>
        <div>← → or H/L - Navigate | Esc - Exit</div>
      </div>
    </div>
  );
}