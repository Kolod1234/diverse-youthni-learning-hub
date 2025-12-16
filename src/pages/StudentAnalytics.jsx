import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Clock, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentAnalytics() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentEmail = urlParams.get('studentEmail');
  const courseId = urlParams.get('courseId');

  const { data: student } = useQuery({
    queryKey: ['student', studentEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: studentEmail });
      return users[0];
    },
    enabled: !!studentEmail,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, studentEmail],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ 
        course_id: courseId, 
        created_by: studentEmail 
      });
      return enrollments[0];
    },
    enabled: !!courseId && !!studentEmail,
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', studentEmail],
    queryFn: () => base44.entities.Submission.filter({ student_email: studentEmail }),
    enabled: !!studentEmail,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['student-quiz-attempts', studentEmail, courseId],
    queryFn: () => base44.entities.QuizAttempt.filter({ 
      created_by: studentEmail,
      course_id: courseId 
    }),
    enabled: !!studentEmail && !!courseId,
  });

  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
    : 0;

  const gradedSubmissions = submissions.filter(s => s.is_graded);
  const avgAssignmentScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Analytics</h1>
          <p className="text-gray-500">{student?.full_name} • {course?.title}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progress', value: `${enrollment?.progress_percent || 0}%`, icon: TrendingUp, color: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Completed Lessons', value: enrollment?.completed_lessons?.length || 0, icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: Award, color: 'bg-purple-50', iconColor: 'text-purple-600' },
            { label: 'Assignments Done', value: submissions.length, icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quiz Performance</h3>
            <div className="space-y-3">
              {quizAttempts.length > 0 ? quizAttempts.map((attempt, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Attempt {idx + 1}</span>
                  <Badge variant={attempt.passed ? 'default' : 'secondary'}>
                    {attempt.score}% {attempt.passed ? '✓' : '✗'}
                  </Badge>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No quiz attempts yet</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Assignment Grades</h3>
            <div className="space-y-3">
              {gradedSubmissions.length > 0 ? gradedSubmissions.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Assignment {idx + 1}</span>
                  <Badge>{sub.grade} pts</Badge>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No graded assignments yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}