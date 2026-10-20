import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Trophy, Flame } from 'lucide-react';

export default function ProgressStats({ user }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: progress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user?.email,
    select: (data) => data[0],
  });

  const totalLessons = enrollments.reduce((sum, e) => sum + (e.completed_lessons?.length || 0), 0);
  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const totalPoints = progress?.total_points || 0;
  const streakDays = progress?.streak_days || 0;

  const stats = [
    { label: 'Lessons Completed', value: totalLessons, icon: BookOpen, color: 'blue' },
    { label: 'Courses Finished', value: completedCourses, icon: Trophy, color: 'green' },
    { label: 'Achievements', value: achievements.length, icon: Award, color: 'purple' },
    { label: 'Day Streak', value: streakDays, icon: Flame, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}