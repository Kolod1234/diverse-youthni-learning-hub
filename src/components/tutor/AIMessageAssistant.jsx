import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Wand2, Loader2, BookOpen, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIMessageAssistant({ onInsertText, courseName, courseId }) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateMessageMutation = useMutation({
    mutationFn: async ({ prompt, courseName }) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful educational assistant helping a tutor compose a message to their students about the course "${courseName}".

Student query or context: ${prompt}

Generate a professional, friendly, and helpful message that the tutor can send to their students. The message should:
- Be clear and concise
- Be encouraging and supportive
- Address the student's needs or the tutor's intent
- Maintain a professional yet warm tone
- Be 2-3 sentences long unless more detail is needed

Generate the message:`,
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedText(data);
      toast.success('Message generated!');
    },
    onError: () => {
      toast.error('Failed to generate message');
    },
  });

  const suggestMaterialsMutation = useMutation({
    mutationFn: async ({ query, courseId }) => {
      const lessons = await base44.entities.Lesson.filter({ course_id: courseId }, 'order', 50);
      const quizzes = await base44.entities.Quiz.filter({ course_id: courseId });
      
      const courseContent = lessons.map(l => `Lesson: ${l.title} - ${l.description || ''}`).join('\n');
      const quizContent = quizzes.map(q => `Quiz: ${q.title}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an educational assistant helping a tutor find relevant course materials.

Student Query: ${query}

Available Course Content:
${courseContent}

Available Quizzes:
${quizContent}

Based on the student's query, suggest the most relevant lessons or materials they should review. List 2-3 specific recommendations with brief explanations why each is relevant.

Format as a friendly message the tutor can send.`,
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedText(data);
      toast.success('Material suggestions generated!');
    },
    onError: () => {
      toast.error('Failed to generate suggestions');
    },
  });

  const quickPrompts = [
    { label: 'Encouragement', prompt: 'Write an encouraging message to students who are struggling with the course material' },
    { label: 'Reminder', prompt: 'Remind students about upcoming assignments and encourage them to stay on track' },
    { label: 'Congratulations', prompt: 'Congratulate students on their progress and encourage them to keep learning' },
    { label: 'Tips', prompt: 'Share study tips and best practices for succeeding in this course' },
  ];

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">AI Message Assistant</h3>
      </div>

      {!showSuggestions ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {quickPrompts.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPrompt(item.prompt);
                  generateMessageMutation.mutate({ prompt: item.prompt, courseName });
                }}
                className="text-xs"
                disabled={generateMessageMutation.isPending}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the message you want to send or ask for help..."
            rows={2}
            className="mb-3 text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => generateMessageMutation.mutate({ prompt, courseName })}
              disabled={!prompt || generateMessageMutation.isPending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateMessageMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 mr-2" />
                  Generate Message
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(true)}
            >
              <BookOpen className="w-3 h-3 mr-2" />
              Suggest Materials
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2">What topic or question do students need help with?</p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., students are confused about cell division, need help with quadratic equations..."
            rows={2}
            className="mb-3 text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => suggestMaterialsMutation.mutate({ query: prompt, courseId })}
              disabled={!prompt || suggestMaterialsMutation.isPending}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {suggestMaterialsMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3 mr-2" />
                  Find Materials
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(false)}
            >
              Back
            </Button>
          </div>
        </>
      )}

      {generatedText && (
        <div className="mt-4 p-3 bg-card rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-purple-600">Generated Message</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onInsertText(generatedText);
                setGeneratedText('');
                toast.success('Text inserted!');
              }}
              className="h-6 text-xs"
            >
              Insert
            </Button>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedText}</p>
        </div>
      )}
    </Card>
  );
}