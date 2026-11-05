import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Award, Target } from 'lucide-react';

export default function LearningStatisticsSection() {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-stats'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 10000),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-stats'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-stats'],
    queryFn: () => base44.entities.Review.list(),
  });

  // Calculate statistics
  const totalStudents = new Set(enrollments.map(e => e.created_by)).size;
  const completedEnrollments = enrollments.filter(e => e.is_completed).length;
  const completionRate = enrollments.length > 0 
    ? Math.round((completedEnrollments / enrollments.length) * 100)
    : 0;
  
  const totalHours = enrollments.reduce((sum, e) => {
    const course = courses.find(c => c.id === e.course_id);
    return sum + (course?.duration_hours || 0);
  }, 0);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const stats = [
    {
      icon: Users,
      value: totalStudents.toLocaleString(),
      label: 'Active Students',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: BookOpen,
      value: courses.length.toString(),
      label: 'Courses Available',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: TrendingUp,
      value: `${completionRate}%`,
      label: 'Course Completion Rate',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      icon: Award,
      value: totalHours.toLocaleString(),
      label: 'Hours Learned',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    },
    {
      icon: Target,
      value: reviews.length > 0 ? `${avgRating}/5` : '—',
      label: 'Average Rating',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div



          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-slate-300/20 text-slate-700 dark:text-slate-300 text-sm font-bold mb-4 border border-slate-400/30">
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Platform Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            By The Numbers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See the real impact we're making in education
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}




                whileHover={{ y: -8, scale: 1.05 }}
                className={`relative ${stat.bgColor} rounded-2xl p-8 border border-border overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 text-center`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className={`relative z-10 mb-4 w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-4xl md:text-3xl lg:text-4xl font-black text-foreground mb-3 leading-tight">
                  {stat.value}
                </h3>

                <p className="text-foreground/70 font-semibold text-sm lg:text-base">
                  {stat.label}
                </p>

                <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white/10 blur-2xl -z-10" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div




          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Join many of our young people already using this platform
          </p>
        </motion.div>
      </div>
    </section>
  );
}