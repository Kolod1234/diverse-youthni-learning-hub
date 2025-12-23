import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, List, BookOpen, ArrowLeft, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QuizBuilder from '@/components/quiz/QuizBuilder';
import AIQuizGenerator from '@/components/quiz/AIQuizGenerator';
import QuizList from '@/components/quiz/QuizList';
import { toast } from 'sonner';

export default function QuizGenerator() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', user?.email],
    queryFn: () => base44.entities.Quiz.filter({ created_by: user?.email }, '-created_date', 200),
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Generator</h1>
              <p className="text-gray-500">Create assessments with AI or build manually</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <List className="w-4 h-4 mr-2" />
              Manual Builder
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              My Quizzes ({quizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <QuizBuilder courses={courses} />
          </TabsContent>

          <TabsContent value="ai">
            <AIQuizGenerator courses={courses} />
          </TabsContent>

          <TabsContent value="manage">
            <QuizList quizzes={quizzes} courses={courses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}