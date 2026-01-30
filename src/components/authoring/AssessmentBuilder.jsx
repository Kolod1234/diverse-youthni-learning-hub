import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function AssessmentBuilder({ courseId, quizzes, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    passing_score: 70,
    difficulty: 'medium',
    questions: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.create({
      course_id: courseId,
      ...data,
      is_published: true,
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.update(editingQuiz.id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (quizId) => base44.entities.Quiz.delete(quizId),
  });

  const handleSaveQuiz = async () => {
    if (!formData.title) {
      alert('Please enter a quiz title');
      return;
    }

    try {
      if (editingQuiz) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
      onUpdate();
      setShowForm(false);
      setFormData({ title: '', topic: '', passing_score: 70, difficulty: 'medium', questions: [] });
      alert('Assessment saved successfully');
    } catch (error) {
      alert('Error saving assessment: ' + error.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Delete this assessment?')) {
      try {
        await deleteMutation.mutateAsync(quizId);
        onUpdate();
      } catch (error) {
        alert('Error deleting assessment: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Assessment
        </Button>
      ) : null}

      {/* Assessment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingQuiz ? 'Edit Assessment' : 'Create Assessment'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assessment Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 1 Quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Algebra Basics"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full border border-input rounded-md p-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveQuiz} className="flex-1">
                Save Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingQuiz(null);
                  setFormData({ title: '', topic: '', passing_score: 70, difficulty: 'medium', questions: [] });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{quiz.title}</h3>
                  {quiz.topic && <p className="text-sm text-gray-600">{quiz.topic}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Pass: {quiz.passing_score}% | Difficulty: {quiz.difficulty} | {quiz.questions?.length || 0} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        title: quiz.title,
                        topic: quiz.topic,
                        passing_score: quiz.passing_score,
                        difficulty: quiz.difficulty,
                        questions: quiz.questions || [],
                      });
                      setEditingQuiz(quiz);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {quizzes.length === 0 && (
          <p className="text-gray-500 text-sm italic">No assessments created yet</p>
        )}
      </div>
    </div>
  );
}