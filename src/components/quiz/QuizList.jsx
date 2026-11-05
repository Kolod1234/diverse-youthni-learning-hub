import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Eye, Clock, Award, CheckCircle, XCircle, FolderOpen, Tag, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuizList({ quizzes, courses }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const queryClient = useQueryClient();

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('order', 1000),
  });

  // Filter to only show GCSE course topics
  const gcseCourseIds = courses.filter(c => 
    c.title?.includes('GCSE') || 
    ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'history', 'geography'].includes(c.category)
  ).map(c => c.id);

  const gcseLessons = allLessons.filter(l => gcseCourseIds.includes(l.course_id));

  const deleteQuizMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success('Quiz deleted');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }) => 
      base44.entities.Quiz.update(id, { is_published: !isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success('Quiz updated');
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, lessonId, topic }) => {
      const lesson = allLessons.find(l => l.id === lessonId);
      return base44.entities.Quiz.update(id, { 
        lesson_id: lessonId,
        topic: lesson?.section || topic,
        subtopic: lesson?.title || ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success('Quiz linked to lesson');
      setEditingTopicId(null);
      setSelectedLessonId('');
    },
  });

  if (quizzes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Quizzes Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first quiz using the Manual Builder or AI Generator</p>
        </div>
      </Card>
    );
  }

  // Organize quizzes by topic
  const topics = [...new Set(quizzes.map(q => q.topic).filter(Boolean))];
  const quizzesByTopic = quizzes.reduce((acc, quiz) => {
    const topic = quiz.topic || 'Uncategorized';
    if (!acc[topic]) acc[topic] = {};
    const subtopic = quiz.subtopic || 'General';
    if (!acc[topic][subtopic]) acc[topic][subtopic] = [];
    acc[topic][subtopic].push(quiz);
    return acc;
  }, {});

  // Filter
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = !searchTerm || 
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || quiz.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Topic Directory View */}
      <div className="space-y-6">
        {Object.entries(quizzesByTopic).map(([topic, subtopics]) => {
          const topicQuizzes = Object.values(subtopics).flat();
          const hasMatchingQuiz = topicQuizzes.some(q => filteredQuizzes.includes(q));
          
          if (!hasMatchingQuiz && selectedTopic !== 'all' && selectedTopic !== topic) return null;

          return (
            <div key={topic} className="bg-card rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-foreground">{topic}</h3>
                  <Badge variant="secondary">{topicQuizzes.length} quiz{topicQuizzes.length !== 1 ? 'zes' : ''}</Badge>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {Object.entries(subtopics).map(([subtopic, subtopicQuizzes]) => {
                  const hasMatch = subtopicQuizzes.some(q => filteredQuizzes.includes(q));
                  if (!hasMatch) return null;

                  return (
                    <div key={subtopic}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                        {subtopic}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {subtopicQuizzes.filter(q => filteredQuizzes.includes(q)).map((quiz) => {
                          const course = courses.find(c => c.id === quiz.course_id);
                          const totalMarks = quiz.total_marks || quiz.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0;
                          const difficultyColors = {
                            easy: 'bg-green-100 text-green-700',
                            medium: 'bg-yellow-100 text-yellow-700',
                            hard: 'bg-red-100 text-red-700'
                          };
                          
                          const questionTypes = quiz.questions?.reduce((acc, q) => {
                            acc[q.question_type] = (acc[q.question_type] || 0) + 1;
                            return acc;
                          }, {}) || {};

                          return (
                            <Card key={quiz.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                                    {quiz.is_published ? (
                                      <Badge className="bg-green-100 text-green-700" size="sm">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Published
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" size="sm">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                  {quiz.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
                                  )}
                                  
                                  <div className="flex gap-1 flex-wrap">
                                   <Badge className={difficultyColors[quiz.difficulty] || difficultyColors.medium} variant="secondary">
                                     {quiz.difficulty || 'medium'}
                                   </Badge>
                                   <Badge variant="secondary">
                                     <Award className="w-3 h-3 mr-1" />
                                     {totalMarks} marks
                                   </Badge>
                                   {quiz.time_limit_minutes && (
                                     <Badge variant="secondary">
                                       <Clock className="w-3 h-3 mr-1" />
                                       {quiz.time_limit_minutes} min
                                     </Badge>
                                   )}
                                   {questionTypes.multiple_choice > 0 && (
                                     <Badge variant="outline">MC: {questionTypes.multiple_choice}</Badge>
                                   )}
                                   {questionTypes.short_answer > 0 && (
                                     <Badge variant="outline">SA: {questionTypes.short_answer}</Badge>
                                   )}
                                   {questionTypes.long_answer > 0 && (
                                     <Badge variant="outline">LA: {questionTypes.long_answer}</Badge>
                                   )}
                                   {questionTypes.image_based > 0 && (
                                     <Badge variant="outline">IMG: {questionTypes.image_based}</Badge>
                                   )}
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  <Link to={createPageUrl('Quiz') + `?quizId=${quiz.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  {editingTopicId === quiz.id ? (
                                  <>
                                    <select
                                      value={selectedLessonId}
                                      onChange={(e) => setSelectedLessonId(e.target.value)}
                                      className="h-9 px-3 rounded-md border border-gray-300"
                                    >
                                      <option value="">Select a lesson</option>
                                      {gcseLessons
                                        .filter(l => l.section && l.title)
                                        .sort((a, b) => {
                                          if (a.section !== b.section) {
                                            return a.section.localeCompare(b.section);
                                          }
                                          return a.order - b.order;
                                        })
                                        .map((lesson) => {
                                          const course = courses.find(c => c.id === lesson.course_id);
                                          return (
                                            <option key={lesson.id} value={lesson.id}>
                                              {lesson.section} → {lesson.title} ({course?.title})
                                            </option>
                                          );
                                        })}
                                    </select>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (selectedLessonId) {
                                          updateTopicMutation.mutate({ id: quiz.id, lessonId: selectedLessonId });
                                        } else {
                                          toast.error('Please select a lesson');
                                        }
                                      }}
                                      disabled={!selectedLessonId}
                                    >
                                      Link
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingTopicId(null);
                                        setSelectedLessonId('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                  ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTopicId(quiz.id);
                                      setSelectedLessonId(quiz.lesson_id || '');
                                    }}
                                  >
                                    <LinkIcon className="w-4 h-4 mr-1" />
                                    {quiz.lesson_id ? 'Change Lesson' : 'Link to Lesson'}
                                  </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => togglePublishMutation.mutate({ id: quiz.id, isPublished: quiz.is_published })}
                                  >
                                    {quiz.is_published ? 'Unpublish' : 'Publish'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Delete this quiz?')) deleteQuizMutation.mutate(quiz.id);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}