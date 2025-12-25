import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ThumbsUp, Check, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QAPanel({ sessionId, user, isTutor, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [filter, setFilter] = useState('all'); // all, answered, unanswered

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchQuestions = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'get-questions',
        sessionId
      });
      if (response.data.questions) {
        setQuestions(response.data.questions.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'ask-question',
        sessionId,
        question: newQuestion,
        askerName: user?.full_name || 'Anonymous'
      });
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const upvoteQuestion = async (questionId) => {
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'upvote-question',
        sessionId,
        questionId
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const submitAnswer = async (questionId) => {
    if (!answer.trim()) return;

    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'answer-question',
        sessionId,
        questionId,
        answer
      });
      setAnswer('');
      setAnsweringId(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const markAsAnswered = async (questionId) => {
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'mark-answered',
        sessionId,
        questionId
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error marking as answered:', error);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'answered') return q.is_answered;
    if (filter === 'unanswered') return !q.is_answered;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Q&A Session
          </h3>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b bg-gray-50 flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({questions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'unanswered' ? 'default' : 'outline'}
            onClick={() => setFilter('unanswered')}
          >
            Unanswered ({questions.filter(q => !q.is_answered).length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'answered' ? 'default' : 'outline'}
            onClick={() => setFilter('answered')}
          >
            Answered ({questions.filter(q => q.is_answered).length})
          </Button>
        </div>

        {/* Ask Question */}
        <div className="p-4 border-b bg-blue-50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitQuestion()}
              className="flex-1"
            />
            <Button onClick={submitQuestion} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredQuestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No questions yet</p>
            </div>
          )}

          {filteredQuestions.map((question) => (
            <Card key={question.id} className={`p-4 ${question.is_answered ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex gap-3">
                {/* Upvote Section */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => upvoteQuestion(question.id)}
                    className="h-8 w-8 p-0"
                  >
                    <ThumbsUp className={`w-4 h-4 ${question.upvotes > 0 ? 'fill-blue-500 text-blue-500' : ''}`} />
                  </Button>
                  <span className="text-sm font-semibold text-gray-700">{question.upvotes || 0}</span>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{question.question}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Asked by {question.asker_name}
                      </p>
                    </div>
                    {question.is_answered && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Answered
                      </Badge>
                    )}
                  </div>

                  {/* Answer Section */}
                  {question.answer && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-1">Answer:</p>
                      <p className="text-sm text-gray-700">{question.answer}</p>
                    </div>
                  )}

                  {/* Answer Input (Tutor Only) */}
                  {isTutor && !question.is_answered && (
                    <div className="mt-3">
                      {answeringId === question.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Type your answer..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => submitAnswer(question.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Submit Answer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnsweringId(null);
                                setAnswer('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAnsweringId(question.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Answer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsAnswered(question.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as Answered
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}