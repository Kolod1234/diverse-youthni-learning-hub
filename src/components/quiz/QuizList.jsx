import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuizList({ quizzes, courses }) {
  const queryClient = useQueryClient();

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

  if (quizzes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
          <p className="text-gray-500 mb-6">Create your first quiz using the Manual Builder or AI Generator</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const course = courses.find(c => c.id === quiz.course_id);
        const totalMarks = quiz.total_marks || quiz.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0;
        const difficultyColors = {
          easy: 'bg-green-100 text-green-700',
          medium: 'bg-yellow-100 text-yellow-700',
          hard: 'bg-red-100 text-red-700'
        };

        return (
          <Card key={quiz.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                  {quiz.is_published ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{quiz.description}</p>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{course?.title || 'Course'}</Badge>
                  <Badge className={difficultyColors[quiz.difficulty] || difficultyColors.medium}>
                    {quiz.difficulty || 'medium'}
                  </Badge>
                  <Badge variant="secondary">
                    {quiz.questions?.length || 0} questions
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
                  <Badge variant="secondary">
                    Pass: {quiz.passing_score}%
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Created {new Date(quiz.created_date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={createPageUrl('Quiz') + `?quizId=${quiz.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
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
  );
}