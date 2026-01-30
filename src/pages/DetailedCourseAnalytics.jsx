import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import DetailedProgressChart from '@/components/analytics/DetailedProgressChart';
import QuizPerformanceMetrics from '@/components/analytics/QuizPerformanceMetrics';
import LessonDropoffAnalytics from '@/components/analytics/LessonDropoffAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function DetailedCourseAnalytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Fetch course
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses?.[0];
    },
    enabled: !!courseId,
  });

  // Fetch all lessons in course
  const { data: lessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  // Fetch lesson progress data
  const { data: lessonProgressData = [] } = useQuery({
    queryKey: ['lessonProgress', courseId],
    queryFn: async () => {
      const progress = await base44.entities.LessonProgress.filter({ course_id: courseId }, '-last_viewed_at', 1000);
      return progress;
    },
    enabled: !!courseId,
  });

  // Fetch quiz performance data
  const { data: quizPerformanceData = [] } = useQuery({
    queryKey: ['quizPerformance', courseId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter({ course_id: courseId });
      const quizIds = quizzes.map(q => q.id);
      
      if (quizIds.length === 0) return [];
      
      const allPerformance = await base44.entities.QuizPerformance.filter({ course_id: courseId }, '-attempted_at', 1000);
      return allPerformance;
    },
    enabled: !!courseId,
  });

  // Fetch lesson metrics
  const { data: lessonMetrics = [] } = useQuery({
    queryKey: ['lessonMetrics', courseId],
    queryFn: async () => {
      const metrics = await base44.entities.LessonMetrics.filter({ course_id: courseId });
      return metrics;
    },
    enabled: !!courseId,
  });

  // Filter data by selected lesson if applicable
  const filteredProgressData = selectedLesson
    ? lessonProgressData.filter(p => p.lesson_id === selectedLesson)
    : lessonProgressData;

  const filteredQuizData = selectedLesson
    ? quizPerformanceData.filter(q => q.lesson_id === selectedLesson)
    : quizPerformanceData;

  const filteredMetrics = selectedLesson
    ? lessonMetrics.filter(m => m.lesson_id === selectedLesson)
    : lessonMetrics;

  // Calculate aggregate stats
  const uniqueUsers = new Set(lessonProgressData.map(p => p.user_email)).size;
  const totalProgress = lessonProgressData.length;
  const completedLessons = lessonProgressData.filter(p => p.completion_status === 'completed').length;
  const avgEngagement = Math.round(
    lessonProgressData.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / Math.max(totalProgress, 1)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{course?.title || 'Course Analytics'}</h1>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Active Users</div>
                  <div className="text-2xl font-bold text-blue-600">{uniqueUsers}</div>
                </div>
                <Users className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-2xl font-bold text-green-600">{completedLessons}/{totalProgress}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-purple-50 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Avg Engagement</div>
                  <div className="text-2xl font-bold text-purple-600">{avgEngagement}%</div>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-red-50 border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Total Lessons</div>
                  <div className="text-2xl font-bold text-red-600">{lessons.length}</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Lesson Filter */}
      {lessons.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Lesson</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedLesson(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !selectedLesson
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Lessons
              </button>
              {lessons.slice(0, 10).map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition truncate max-w-xs ${
                    selectedLesson === lesson.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={lesson.title}
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="progress">User Progress</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Performance</TabsTrigger>
            <TabsTrigger value="dropoff">Drop-Off Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <DetailedProgressChart progressData={filteredProgressData} />
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <QuizPerformanceMetrics quizData={filteredQuizData} />
          </TabsContent>

          <TabsContent value="dropoff" className="space-y-6">
            <LessonDropoffAnalytics lessonMetrics={filteredMetrics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}