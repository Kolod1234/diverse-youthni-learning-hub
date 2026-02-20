import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, CheckCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function LessonQA({ lessonId, courseId, user, currentSlideIndex }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answeringId, setAnsweringId] = useState(null);
  const queryClient = useQueryClient();

  const { data: questions = [] } = useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: () => base44.entities.LessonQuestion.filter({ lesson_id: lessonId }, '-created_date', 50),
    enabled: !!lessonId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonQuestion.create(data),
    onMutate: async (newQuestion) => {
      await queryClient.cancelQueries(['lesson-questions', lessonId]);
      const previousQuestions = queryClient.getQueryData(['lesson-questions', lessonId]);
      
      queryClient.setQueryData(['lesson-questions', lessonId], (old = []) => [
        {
          id: 'temp-' + Date.now(),
          ...newQuestion,
          created_date: new Date().toISOString(),
          upvotes: 0,
          is_answered: false
        },
        ...old
      ]);
      
      return { previousQuestions };
    },
    onError: (err, newQuestion, context) => {
      queryClient.setQueryData(['lesson-questions', lessonId], context.previousQuestions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-questions', lessonId]);
      setQuestion('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LessonQuestion.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['lesson-questions', lessonId]);
      const previousQuestions = queryClient.getQueryData(['lesson-questions', lessonId]);
      
      queryClient.setQueryData(['lesson-questions', lessonId], (old = []) =>
        old.map(q => q.id === id ? { ...q, ...data } : q)
      );
      
      return { previousQuestions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['lesson-questions', lessonId], context.previousQuestions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-questions', lessonId]);
      setAnswer('');
      setAnsweringId(null);
    },
  });

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    createMutation.mutate({
      lesson_id: lessonId,
      course_id: courseId,
      question: question.trim(),
      asker_name: user?.full_name || 'Anonymous',
      slide_index: currentSlideIndex,
    });
  };

  const handleAnswer = (questionId) => {
    if (!answer.trim()) return;
    updateMutation.mutate({
      id: questionId,
      data: {
        answer: answer.trim(),
        is_answered: true,
      },
    });
  };

  const handleUpvote = (questionId, currentUpvotes) => {
    updateMutation.mutate({
      id: questionId,
      data: { upvotes: (currentUpvotes || 0) + 1 },
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Questions & Answers</h3>
        <span className="ml-auto text-sm text-gray-500">{questions.length} questions</span>
      </div>

      {/* Ask Question */}
      <div className="mb-6">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this lesson..."
          className="mb-3"
          rows={3}
        />
        <Button
          onClick={handleAskQuestion}
          disabled={createMutation.isPending || !question.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          {createMutation.isPending ? 'Posting...' : 'Ask Question'}
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {questions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No questions yet. Be the first to ask!</p>
        ) : (
          questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`p-4 ${q.is_answered ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                      {q.asker_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{q.asker_name}</span>
                      {q.slide_index !== undefined && (
                        <span className="text-xs text-gray-500">• Slide {q.slide_index + 1}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        • {format(new Date(q.created_date), 'MMM d, HH:mm')}
                      </span>
                      {q.is_answered && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{q.question}</p>

                    {q.is_answered && q.answer && (
                      <div className="bg-white/60 rounded-lg p-3 mb-3 border-l-4 border-emerald-500">
                        <p className="text-sm font-medium text-gray-900 mb-1">Answer:</p>
                        <p className="text-sm text-gray-700">{q.answer}</p>
                      </div>
                    )}

                    {/* Answer Form */}
                    {!q.is_answered && user?.is_tutor && answeringId === q.id && (
                      <div className="mt-3">
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Write your answer..."
                          className="mb-2"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAnswer(q.id)}
                            disabled={updateMutation.isPending || !answer.trim()}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {updateMutation.isPending ? 'Posting...' : 'Post Answer'}
                          </Button>
                          <Button
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswer('');
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        onClick={() => handleUpvote(q.id, q.upvotes)}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-gray-600 hover:text-indigo-600 min-h-[44px] min-w-[44px]"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{q.upvotes || 0}</span>
                      </Button>
                      
                      {!q.is_answered && user?.is_tutor && answeringId !== q.id && (
                        <Button
                          onClick={() => setAnsweringId(q.id)}
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 min-h-[44px]"
                        >
                          Answer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}