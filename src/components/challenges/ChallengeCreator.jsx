import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X, Trophy, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeCreator({ onSuccess, studyGroupId = null }) {
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    type: 'quiz',
    difficulty: 'medium',
    time_limit_minutes: 15,
    points_reward: 100,
    quiz_questions: [],
    is_public: !studyGroupId,
    study_group_id: studyGroupId
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    points: 10
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Challenge.create({
        ...data,
        creator_email: user.email,
        creator_name: user.full_name,
        start_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      toast.success('Challenge created successfully!');
      onSuccess?.();
    }
  });

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(o => !o)) {
      toast.error('Please fill in all question fields');
      return;
    }

    setChallenge(prev => ({
      ...prev,
      quiz_questions: [...prev.quiz_questions, currentQuestion]
    }));

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 10
    });
  };

  const removeQuestion = (index) => {
    setChallenge(prev => ({
      ...prev,
      quiz_questions: prev.quiz_questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (challenge.type === 'quiz' && challenge.quiz_questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    createMutation.mutate(challenge);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Challenge Title</label>
          <Input
            value={challenge.title}
            onChange={(e) => setChallenge({...challenge, title: e.target.value})}
            placeholder="Speed Quiz: World History"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Type</label>
          <Select value={challenge.type} onValueChange={(v) => setChallenge({...challenge, type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quiz">Quiz Challenge</SelectItem>
              <SelectItem value="coding">Coding Challenge</SelectItem>
              <SelectItem value="reading">Reading Sprint</SelectItem>
              <SelectItem value="speed">Speed Challenge</SelectItem>
              <SelectItem value="study_time">Study Marathon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Difficulty</label>
          <Select value={challenge.difficulty} onValueChange={(v) => setChallenge({...challenge, difficulty: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Time Limit (minutes)</label>
          <Input
            type="number"
            value={challenge.time_limit_minutes}
            onChange={(e) => setChallenge({...challenge, time_limit_minutes: parseInt(e.target.value)})}
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea
          value={challenge.description}
          onChange={(e) => setChallenge({...challenge, description: e.target.value})}
          placeholder="Describe what participants need to do..."
          rows={3}
        />
      </div>

      {challenge.type === 'quiz' && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Quiz Questions
          </h3>

          {/* Current Question Builder */}
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Question text"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
            />

            {currentQuestion.options.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[i] = e.target.value;
                    setCurrentQuestion({...currentQuestion, options: newOptions});
                  }}
                />
                <input
                  type="radio"
                  checked={currentQuestion.correct_answer === i}
                  onChange={() => setCurrentQuestion({...currentQuestion, correct_answer: i})}
                  className="w-5"
                />
              </div>
            ))}

            <Button type="button" onClick={addQuestion} size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Question List */}
          {challenge.quiz_questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Added Questions ({challenge.quiz_questions.length})</p>
              {challenge.quiz_questions.map((q, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{i + 1}. {q.question}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <Input
          type="number"
          value={challenge.points_reward}
          onChange={(e) => setChallenge({...challenge, points_reward: parseInt(e.target.value)})}
          className="w-32"
        />
        <span className="text-sm text-gray-600">points reward</span>
      </div>

      <Button type="submit" disabled={createMutation.isPending} className="w-full" size="lg">
        {createMutation.isPending ? 'Creating...' : 'Create Challenge'}
      </Button>
    </form>
  );
}