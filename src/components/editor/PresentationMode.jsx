import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, ChevronRight, X, MessageSquare, 
  BarChart3, User, Clock, Send, Maximize, Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PresentationMode({ slides, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [showQA, setShowQA] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [speakerNotes, setSpeakerNotes] = useState({});
  const [pollResults, setPollResults] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlideData = slides[currentSlide] || null;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question = {
      id: Date.now(),
      text: newQuestion,
      author: 'Audience',
      timestamp: new Date().toLocaleTimeString(),
      upvotes: 0
    };
    
    setQuestions([question, ...questions]);
    setNewQuestion('');
    toast.success('Question added');
  };

  const upvoteQuestion = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    ));
  };

  const simulatePollVote = (slideIndex, optionIndex) => {
    setPollResults(prev => ({
      ...prev,
      [slideIndex]: {
        ...prev[slideIndex],
        [optionIndex]: (prev[slideIndex]?.[optionIndex] || 0) + 1
      }
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex">
      {/* Main Presentation Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              Slide {currentSlide + 1} / {slides.length}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-white hover:bg-gray-700"
            >
              Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQA(!showQA)}
              className="text-white hover:bg-gray-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Q&A
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Slide Display */}
        <div className="flex-1 relative overflow-hidden bg-black">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 flex items-center justify-center p-12"
            >
              <Card className="w-full h-full max-w-6xl bg-white overflow-auto">
                <div className="p-12">
                  {currentSlideData && (
                    <>
                      <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        {currentSlideData.title || `Slide ${currentSlide + 1}`}
                      </h1>
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentSlideData.content || '' }}
                      />
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={() => paginate(-1)}
            disabled={currentSlide === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all ${
              currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          
          <button
            onClick={() => paginate(1)}
            disabled={currentSlide === slides.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all ${
              currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Speaker Notes */}
        {showNotes && (
          <div className="flex-1 flex flex-col border-b border-gray-700">
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Speaker Notes
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <Textarea
                value={speakerNotes[currentSlide] || ''}
                onChange={(e) => setSpeakerNotes({ ...speakerNotes, [currentSlide]: e.target.value })}
                placeholder="Add notes for this slide..."
                className="min-h-[150px] bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 These notes are only visible to you
              </p>
            </ScrollArea>
          </div>
        )}

        {/* Q&A Section */}
        {showQA && (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Audience Questions ({questions.length})
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No questions yet. Audience can submit questions below.
                  </p>
                ) : (
                  questions.map((q) => (
                    <Card key={q.id} className="p-3 bg-gray-700 border-gray-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{q.author}</span>
                          <span className="text-xs text-gray-500">{q.timestamp}</span>
                        </div>
                        <button
                          onClick={() => upvoteQuestion(q.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
                        >
                          <span className="text-xs text-white">▲ {q.upvotes}</span>
                        </button>
                      </div>
                      <p className="text-sm text-white">{q.text}</p>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                  placeholder="Ask a question..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={addQuestion} size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 left-4 bg-gray-800/90 rounded-lg px-4 py-2 text-xs text-gray-300">
        <span className="font-semibold">Shortcuts:</span> ← → Space: Navigate | ESC: Exit
      </div>
    </div>
  );
}