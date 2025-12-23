import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, Users, BookOpen, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const DATA_SOURCES = [
  { value: 'courses', label: 'Course Analytics', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { value: 'enrollments', label: 'Student Progress', icon: Users, color: 'bg-green-100 text-green-700' },
  { value: 'quizzes', label: 'Quiz Performance', icon: Award, color: 'bg-purple-100 text-purple-700' },
  { value: 'programs', label: 'Program Overview', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' }
];

export default function EntityDataMode({ onSlidesGenerated }) {
  const [selectedSource, setSelectedSource] = useState('');
  const [generating, setGenerating] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 100),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts'],
    queryFn: () => base44.entities.QuizAttempt.list('-created_date', 100),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date', 50),
  });

  const generatePresentation = async () => {
    if (!selectedSource) {
      toast.error('Please select a data source');
      return;
    }

    setGenerating(true);
    try {
      let data = {};
      let prompt = '';

      switch (selectedSource) {
        case 'courses':
          data = courses.slice(0, 10);
          prompt = `Create a presentation about course statistics. Data: ${JSON.stringify(data)}. Include slides for: overview, top courses, categories breakdown, enrollment trends.`;
          break;
        case 'enrollments':
          data = enrollments.slice(0, 20);
          prompt = `Create a presentation about student progress and engagement. Data: ${JSON.stringify(data)}. Include slides for: total students, completion rates, progress distribution, top performers.`;
          break;
        case 'quizzes':
          data = quizAttempts.slice(0, 20);
          prompt = `Create a presentation about quiz performance analytics. Data: ${JSON.stringify(data)}. Include slides for: average scores, pass rates, difficulty analysis, improvement trends.`;
          break;
        case 'programs':
          data = programs;
          prompt = `Create a presentation about program overview. Data: ${JSON.stringify(data)}. Include slides for: active programs, participants, timeline, achievements.`;
          break;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}

Create professional presentation slides with:
- Beautiful HTML formatting with colors and styling
- Data visualizations described in text (e.g., "Bar chart showing...")
- Key metrics and insights
- Professional design

Return slides with title and HTML content.`,
        response_json_schema: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  order: { type: 'number' }
                }
              }
            }
          }
        }
      });

      onSlidesGenerated(result.slides || []);
      toast.success('Presentation generated!');
    } catch (error) {
      toast.error('Failed to generate presentation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Select Data Source</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate slides from your existing app data
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {DATA_SOURCES.map(source => {
            const Icon = source.icon;
            return (
              <button
                key={source.value}
                onClick={() => setSelectedSource(source.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSource === source.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${source.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900 text-sm">{source.label}</p>
              </button>
            );
          })}
        </div>

        <Button
          onClick={generatePresentation}
          disabled={!selectedSource || generating}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Presentation...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Data Preview</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• {courses.length} courses</p>
          <p>• {enrollments.length} enrollments</p>
          <p>• {quizAttempts.length} quiz attempts</p>
          <p>• {programs.length} programs</p>
        </div>
      </div>
    </div>
  );
}