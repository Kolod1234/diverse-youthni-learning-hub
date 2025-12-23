import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Users, MessageCircle, ChevronLeft, ChevronRight, X, 
  Send, CheckCircle, User, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveSessionView({ session, lesson, isPresenter, onClose }) {
  const [user, setUser] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Poll for session updates every 2 seconds
  const { data: liveSession } = useQuery({
    queryKey: ['live-session', session.id],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.filter({ id: session.id });
      return sessions[0];
    },
    refetchInterval: 2000,
    enabled: !!session.id,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['session-participants', session.id],
    queryFn: () => base44.entities.SessionParticipant.filter({ 
      session_id: session.id, 
      is_active: true 
    }),
    refetchInterval: 3000,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['session-questions', session.id],
    queryFn: () => base44.entities.SessionQuestion.filter({ session_id: session.id }, '-created_date', 100),
    refetchInterval: 2000,
  });

  const updateSlideMutation = useMutation({
    mutationFn: (slideIndex) => base44.entities.LiveSession.update(session.id, { 
      current_slide_index: slideIndex 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: (data) => base44.entities.SessionQuestion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['session-questions']);
      setQuestionText('');
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({ questionId, answer }) => 
      base44.entities.SessionQuestion.update(questionId, { answer, is_answered: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['session-questions']);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: () => base44.entities.LiveSession.update(session.id, {
      is_active: false,
      ended_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      onClose();
    },
  });

  const handleSlideChange = (newIndex) => {
    if (isPresenter) {
      updateSlideMutation.mutate(newIndex);
    }
  };

  const handleAskQuestion = () => {
    if (!questionText.trim()) return;
    
    askQuestionMutation.mutate({
      session_id: session.id,
      question: questionText,
      asker_email: user?.email,
      asker_name: user?.full_name,
      slide_index: liveSession?.current_slide_index || 0,
    });
  };

  const currentSlideIndex = liveSession?.current_slide_index || 0;
  const currentSlide = lesson.slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Main Slide Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Badge className="bg-red-500 text-white px-3 py-1">
              🔴 LIVE
            </Badge>
            <span className="text-sm font-medium">
              Slide {currentSlideIndex + 1} / {lesson.slides.length}
            </span>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participants.length} watching</span>
            </div>
            <span className="text-xs text-gray-400">Code: {session.session_code}</span>
          </div>
          <div className="flex items-center gap-2">
            {isPresenter && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => endSessionMutation.mutate()}
              >
                End Session
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Slide Display */}
        <div className="flex-1 flex items-center justify-center relative p-8 bg-gray-950">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl aspect-video p-12 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentSlide?.content || '' }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows (Presenter only) */}
          {isPresenter && (
            <>
              <button
                onClick={() => handleSlideChange(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-900 transition-all shadow-xl border-2 border-gray-200"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={() => handleSlideChange(Math.min(lesson.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === lesson.slides.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-900 transition-all shadow-xl border-2 border-gray-200"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Slide Thumbnails (Presenter only) */}
        {isPresenter && (
          <div className="bg-gray-900 border-t border-gray-700 p-4">
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {lesson.slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlideChange(idx)}
                    className={`shrink-0 rounded-lg border-2 transition-all ${
                      idx === currentSlideIndex
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="w-32 aspect-video bg-white p-2 rounded-md flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500 mb-1">Slide {idx + 1}</span>
                      <span className="text-xs font-medium text-gray-900 line-clamp-2 text-center px-2">
                        {slide.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Sidebar - Q&A and Participants */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="flex border-b border-gray-700">
          <button className="flex-1 px-4 py-3 text-white bg-gray-800 border-b-2 border-indigo-500">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Q&A ({questions.length})
          </button>
          <button className="flex-1 px-4 py-3 text-gray-400 hover:text-white">
            <Users className="w-4 h-4 inline mr-2" />
            Participants ({participants.length})
          </button>
        </div>

        {/* Questions */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.id} className="p-3 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{q.asker_name}</span>
                      {q.is_answered && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{q.question}</p>
                    <span className="text-xs text-gray-500 mt-1">Slide {q.slide_index + 1}</span>
                    
                    {q.is_answered && q.answer && (
                      <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Answer:</p>
                        <p className="text-sm text-white">{q.answer}</p>
                      </div>
                    )}

                    {isPresenter && !q.is_answered && (
                      <div className="mt-2">
                        <Input
                          placeholder="Type your answer..."
                          className="bg-gray-900 border-gray-700 text-white text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              answerQuestionMutation.mutate({
                                questionId: q.id,
                                answer: e.target.value,
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Ask Question Input */}
        {!isPresenter && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ask a question..."
                className="bg-gray-800 border-gray-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!questionText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}