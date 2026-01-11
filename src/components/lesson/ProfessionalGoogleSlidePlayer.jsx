import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Maximize, Minimize, RotateCcw, StickyNote, Sparkles, Keyboard, X, Film, Bookmark, Search, Languages, FileText, BookOpen, Clock, Play, Pause, Moon, Sun, Download, GitCompare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProfessionalGoogleSlidePlayer({ googleSlidesUrl, lessonId, totalSlides = 20 }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTab, setAiTab] = useState('ask');
  const [slideSummary, setSlideSummary] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [viewedSlides, setViewedSlides] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(5);
  const [darkMode, setDarkMode] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlide, setCompareSlide] = useState(null);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentNote(notes[currentSlide] || '');
    if (!viewedSlides.includes(currentSlide)) {
      setViewedSlides(prev => [...prev, currentSlide]);
    }
  }, [currentSlide, notes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (autoAdvance && !isLoading) {
      timerRef.current = setTimeout(() => {
        if (currentSlide < totalSlides) {
          setCurrentSlide(prev => prev + 1);
        } else {
          setAutoAdvance(false);
          toast.success('Presentation complete!');
        }
      }, autoAdvanceDelay * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoAdvance, currentSlide, autoAdvanceDelay, isLoading, totalSlides]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') setCurrentSlide(prev => Math.min(totalSlides, prev + 1));
      if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') setCurrentSlide(prev => Math.max(1, prev - 1));
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'n' || e.key === 'N') setShowNotes(true);
      if (e.key === 'a' || e.key === 'A') setShowAI(true);
      if (e.key === 't' || e.key === 'T') setShowThumbnails(prev => !prev);
      if (e.key === 'b' || e.key === 'B') toggleBookmark();
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'd' || e.key === 'D') setDarkMode(prev => !prev);
      if (e.key === 'c' || e.key === 'C') setCompareMode(prev => !prev);
      if (e.key === 'p' || e.key === 'P') setAutoAdvance(prev => !prev);
      if (e.key === '?' || e.key === '/') setShowKeyboardHelp(true);
      if (e.key === 'Escape') {
        if (isFullscreen) exitFullscreen();
        else if (showNotes) setShowNotes(false);
        else if (showAI) setShowAI(false);
        else if (showKeyboardHelp) setShowKeyboardHelp(false);
        else if (showSearch) setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, showNotes, showAI, showKeyboardHelp, showSearch, totalSlides]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('slide-container');
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleSaveNote = () => {
    setNotes(prev => ({ ...prev, [currentSlide]: currentNote }));
    toast.success('Note saved for this slide');
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping a student understand slide ${currentSlide} of their lesson. The student asks: "${aiQuestion}". Provide a clear, educational response that helps them learn.`,
        add_context_from_internet: false
      });
      setAiResponse(response);
      setAiQuestion('');
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  // Touch gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) setCurrentSlide(prev => Math.min(totalSlides, prev + 1));
    if (isRightSwipe) setCurrentSlide(prev => Math.max(1, prev - 1));
  };

  const toggleBookmark = () => {
    setBookmarks(prev => {
      if (prev.includes(currentSlide)) {
        toast.success('Bookmark removed');
        return prev.filter(s => s !== currentSlide);
      } else {
        toast.success('Slide bookmarked');
        return [...prev, currentSlide];
      }
    });
  };

  const handleGetSummary = async () => {
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a concise summary of the key points from slide ${currentSlide} of this lesson. Focus on the main concepts and learning objectives. Keep it brief and educational.`,
        add_context_from_internet: false
      });
      setSlideSummary(response);
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDefineWord = async (word) => {
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Define the term "${word}" in simple, student-friendly language. Include an example if relevant. Keep it concise.`,
        add_context_from_internet: true
      });
      setAiResponse(response);
      setAiTab('ask');
    } catch (error) {
      toast.error('Failed to define word');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTranslate = async () => {
    setAiLoading(true);
    try {
      const languageNames = {
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        zh: 'Chinese',
        ar: 'Arabic',
        ur: 'Urdu',
        pl: 'Polish'
      };
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the content of slide ${currentSlide} into ${languageNames[targetLanguage]}. Maintain the educational context and clarity.`,
        add_context_from_internet: false
      });
      setTranslatedContent(response);
    } catch (error) {
      toast.error('Failed to translate');
    } finally {
      setAiLoading(false);
    }
  };

  if (!googleSlidesUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No Google Slides presentation available</p>
      </div>
    );
  }

  const presentationId = googleSlidesUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!presentationId) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-red-500">Invalid Google Slides URL</p>
      </div>
    );
  }

  const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=${currentSlide}`;

  return (
    <div className="w-full h-full">
      <style dangerouslySetInnerHTML={{ __html: `
        #slide-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #000;
        }

        #slide-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }

        .slide-wrapper {
          flex: 1;
          position: relative;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
        }

        .slide-iframe {
          width: 100%;
          height: 100%;
          border: none;
          max-width: 100%;
          max-height: 100%;
          transition: opacity 0.3s;
        }

        .slide-iframe.loading {
          opacity: 0.5;
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        @media (orientation: portrait) and (max-width: 768px) {
          .slide-wrapper {
            min-height: 50vh;
          }
          .slide-iframe {
            height: 100%;
            min-height: 50vh;
          }
        }

        @media (orientation: landscape) and (max-width: 768px) {
          .slide-iframe {
            height: 100%;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .slide-wrapper {
            padding: 1rem;
          }
          .slide-iframe {
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
        }

        @media (min-width: 1024px) {
          .slide-wrapper {
            padding: 2rem;
          }
          
          .slide-iframe {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border-radius: 8px;
          }
        }

        .controls-bar {
          background: ${darkMode ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.95)'};
          backdrop-filter: blur(10px);
          border-top: 1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'};
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s;
          z-index: 10;
        }

        @media (max-width: 640px) {
          .controls-bar {
            padding: 0.5rem;
            gap: 0.5rem;
          }
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .control-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .control-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .control-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .control-btn {
            padding: 0.4rem 0.6rem;
            font-size: 0.75rem;
          }
          
          .control-btn svg {
            width: 16px;
            height: 16px;
          }
        }

        .slide-counter {
          color: rgba(255,255,255,0.9);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 640px) {
          .slide-counter {
            padding: 0.4rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}} />

      <div 
        id="slide-container" 
        className={isFullscreen ? 'fullscreen' : ''}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="progress-bar" style={{ width: `${calculateProgress()}%` }} />
        
        <div className="slide-wrapper">
          {isLoading && (
            <div className="loading-overlay">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}
          
          {compareMode && compareSlide ? (
            <div className="w-full h-full flex gap-2 p-4">
              <div className="flex-1 relative">
                <iframe 
                  src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=${currentSlide}`}
                  className="w-full h-full border-2 border-blue-500 rounded"
                  allowFullScreen={true}
                />
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                  Slide {currentSlide}
                </div>
              </div>
              <div className="flex-1 relative">
                <iframe 
                  src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=${compareSlide}`}
                  className="w-full h-full border-2 border-purple-500 rounded"
                  allowFullScreen={true}
                />
                <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-sm">
                  Slide {compareSlide}
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              key={iframeKey}
              src={embedUrl}
              className={`slide-iframe ${isLoading ? 'loading' : ''}`}
              allowFullScreen={true}
              allow="fullscreen"
              onLoad={() => setIsLoading(false)}
              aria-label={`Slide ${currentSlide}`}
            />
          )}
        </div>

        <div className="controls-bar">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
              className="control-btn"
              disabled={currentSlide === 1}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </button>

            <button 
              onClick={() => setCurrentSlide(prev => Math.min(totalSlides, prev + 1))}
              className="control-btn"
              disabled={currentSlide >= totalSlides}
              aria-label="Next slide"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="slide-counter" role="status" aria-live="polite">
              {currentSlide} / {totalSlides}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </span>
              <span className="text-white/60">
                {calculateProgress()}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAutoAdvance(prev => !prev)}
              className={`control-btn ${autoAdvance ? 'bg-green-500/30' : ''}`}
              title="Auto-advance (P)"
              aria-label="Toggle auto-advance"
            >
              {autoAdvance ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setShowThumbnails(prev => !prev)}
              className={`control-btn ${showThumbnails ? 'bg-blue-500/30' : ''}`}
              title="Thumbnails (T)"
              aria-label="Toggle thumbnails"
            >
              <Film className="w-5 h-5" />
            </button>

            <button 
              onClick={() => {
                if (!compareMode) {
                  setCompareSlide(currentSlide > 1 ? currentSlide - 1 : 2);
                }
                setCompareMode(prev => !prev);
              }}
              className={`control-btn hidden lg:flex ${compareMode ? 'bg-purple-500/30' : ''}`}
              title="Compare slides (C)"
              aria-label="Compare slides"
            >
              <GitCompare className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleBookmark}
              className={`control-btn ${bookmarks.includes(currentSlide) ? 'bg-yellow-500/30 text-yellow-300' : ''}`}
              title="Bookmark (B)"
              aria-label="Toggle bookmark"
            >
              <Bookmark className={`w-5 h-5 ${bookmarks.includes(currentSlide) ? 'fill-current' : ''}`} />
            </button>

            <button 
              onClick={() => setShowSearch(true)}
              className="control-btn hidden md:flex"
              title="Search (Ctrl+F)"
              aria-label="Search slides"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowNotes(true)}
              className="control-btn"
              title="Notes (N)"
              aria-label="Open notes"
            >
              <StickyNote className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowAI(true)}
              className="control-btn"
              title="AI Assistant (A)"
              aria-label="Open AI assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setDarkMode(prev => !prev)}
              className="control-btn hidden md:flex"
              title="Dark mode (D)"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={handleReload}
              className="control-btn hidden lg:flex"
              title="Reload slide (R)"
              aria-label="Reload slide"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowKeyboardHelp(true)}
              className="control-btn hidden lg:flex"
              title="Keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleFullscreen}
              className="control-btn"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              <span className="hidden xl:inline ml-1">
                {isFullscreen ? 'Exit' : 'Full'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-blue-500" />
              Notes for Slide {currentSlide}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add your notes for this slide..."
              className="min-h-[150px]"
              aria-label="Slide notes"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveNote} className="flex-1">
                Save Note
              </Button>
              {Object.keys(notes).length > 0 && (
                <Button onClick={exportNotes} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Assistant - Slide {currentSlide}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={aiTab} onValueChange={setAiTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ask">Ask</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="define">Define</TabsTrigger>
              <TabsTrigger value="translate">Translate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ask" className="space-y-4 mt-4">
              <Textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask a question about this slide..."
                className="min-h-[100px]"
                aria-label="AI question"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
              />
              <Button 
                onClick={handleAskAI} 
                disabled={aiLoading || !aiQuestion.trim()}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Thinking...
                  </>
                ) : (
                  'Ask AI'
                )}
              </Button>
              {aiResponse && (
                <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-purple-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4 mt-4">
              <Button 
                onClick={handleGetSummary} 
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
              {slideSummary && (
                <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-blue-50">
                  <h4 className="font-semibold mb-2">Slide Summary:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{slideSummary}</p>
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="define" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a word to define..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleDefineWord(e.target.value.trim());
                    }
                  }}
                />
                <Button 
                  onClick={(e) => {
                    const input = e.target.closest('.space-y-4').querySelector('input');
                    if (input?.value.trim()) handleDefineWord(input.value.trim());
                  }}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {aiResponse && aiTab === 'define' && (
                <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-green-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="translate" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <select 
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="ur">Urdu</option>
                  <option value="pl">Polish</option>
                </select>
                <Button 
                  onClick={handleTranslate} 
                  disabled={aiLoading}
                  className="whitespace-nowrap"
                >
                  {aiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
              </div>
              {translatedContent && (
                <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-orange-50">
                  <h4 className="font-semibold mb-2">Translation:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{translatedContent}</p>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Auto-Advance Settings */}
      {autoAdvance && (
        <div className="fixed top-20 right-4 bg-green-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <Play className="w-4 h-4" />
          <span className="text-sm">Auto-advancing every {autoAdvanceDelay}s</span>
          <select
            value={autoAdvanceDelay}
            onChange={(e) => setAutoAdvanceDelay(Number(e.target.value))}
            className="bg-white/20 rounded px-2 py-1 text-sm"
          >
            <option value="3">3s</option>
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="15">15s</option>
            <option value="30">30s</option>
          </select>
        </div>
      )}

      {/* Thumbnails Panel */}
      {showThumbnails && (
        <div className="fixed bottom-20 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Film className="w-4 h-4" />
              Slide Thumbnails ({viewedSlides.length}/{totalSlides} viewed)
            </h3>
            <button onClick={() => setShowThumbnails(false)} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <ScrollArea className="h-32">
            <div className="flex gap-2 p-4">
              {Array.from({ length: totalSlides }, (_, i) => i + 1).map(slideNum => (
                <button
                  key={slideNum}
                  onClick={() => setCurrentSlide(slideNum)}
                  className={`
                    relative flex-shrink-0 w-40 h-24 rounded border-2 transition-all
                    ${currentSlide === slideNum ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/20 hover:border-white/40'}
                    ${viewedSlides.includes(slideNum) ? 'opacity-100' : 'opacity-50'}
                  `}
                >
                  <div className={`w-full h-full rounded flex items-center justify-center ${viewedSlides.includes(slideNum) ? 'bg-green-500/10' : 'bg-white/5'}`}>
                    <span className="text-white/50 text-sm">Slide {slideNum}</span>
                  </div>
                  {bookmarks.includes(slideNum) && (
                    <Bookmark className="absolute top-1 right-1 w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                  {notes[slideNum] && (
                    <StickyNote className="absolute bottom-1 right-1 w-4 h-4 text-blue-400" />
                  )}
                  {viewedSlides.includes(slideNum) && (
                    <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs py-1 text-center">
                    {slideNum}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Compare Mode Panel */}
      {compareMode && (
        <div className="fixed top-20 left-4 bg-purple-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-3">
            <GitCompare className="w-4 h-4" />
            <span className="text-sm">Compare with slide:</span>
            <Input
              type="number"
              min="1"
              max={totalSlides}
              value={compareSlide}
              onChange={(e) => setCompareSlide(Number(e.target.value))}
              className="w-16 h-8 bg-white/20 border-white/30 text-white text-center"
            />
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Search Slides
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search for keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="text-sm text-gray-500">
              <p className="mb-2">Quick navigation:</p>
              {bookmarks.length > 0 && (
                <div className="space-y-1">
                  <p className="font-semibold text-gray-700">Bookmarked Slides:</p>
                  <div className="flex flex-wrap gap-2">
                    {bookmarks.sort((a, b) => a - b).map(slide => (
                      <button
                        key={slide}
                        onClick={() => {
                          setCurrentSlide(slide);
                          setShowSearch(false);
                        }}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Slide {slide}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(notes).length > 0 && (
                <div className="space-y-1 mt-3">
                  <p className="font-semibold text-gray-700">Slides with Notes:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(notes).sort((a, b) => Number(a) - Number(b)).map(slide => (
                      <button
                        key={slide}
                        onClick={() => {
                          setCurrentSlide(Number(slide));
                          setShowSearch(false);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        Slide {slide}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Help */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-blue-500" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-4">
              {[
                { keys: ['←', 'H'], action: 'Previous slide' },
                { keys: ['→', 'L'], action: 'Next slide' },
                { keys: ['F'], action: 'Toggle fullscreen' },
                { keys: ['P'], action: 'Auto-advance play/pause' },
                { keys: ['T'], action: 'Toggle thumbnails' },
                { keys: ['C'], action: 'Compare mode' },
                { keys: ['B'], action: 'Toggle bookmark' },
                { keys: ['D'], action: 'Toggle dark mode' },
                { keys: ['N'], action: 'Open notes' },
                { keys: ['A'], action: 'AI assistant' },
                { keys: ['Ctrl', 'F'], action: 'Search slides' },
                { keys: ['?', '/'], action: 'Show shortcuts' },
                { keys: ['Esc'], action: 'Close/Exit' }
              ].map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, i) => (
                      <kbd key={i} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}