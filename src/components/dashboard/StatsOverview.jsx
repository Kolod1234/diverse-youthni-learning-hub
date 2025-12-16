import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsOverview({ enrollments, courses, achievements }) {
  const completedCourses = enrollments?.filter(e => e.is_completed).length || 0;
  const totalHoursLearned = enrollments?.reduce((acc, e) => {
    const course = courses?.find(c => c.id === e.course_id);
    return acc + ((course?.duration_hours || 0) * (e.progress_percent || 0) / 100);
  }, 0) || 0;
  const averageProgress = enrollments?.length > 0
    ? enrollments.reduce((acc, e) => acc + (e.progress_percent || 0), 0) / enrollments.length
    : 0;

  const stats = [
    {
      label: 'Courses Enrolled',
      value: enrollments?.length || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Hours Learned',
      value: Math.round(totalHoursLearned),
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: Award,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Avg Progress',
      value: `${Math.round(averageProgress)}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} 
                  style={{ stroke: `url(#gradient-${index})` }}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('emerald') ? '#10b981' : '#f97316'} />
                      <stop offset="100%" stopColor={stat.color.includes('blue') ? '#06b6d4' : stat.color.includes('purple') ? '#ec4899' : stat.color.includes('emerald') ? '#14b8a6' : '#f59e0b'} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}