import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContinueLearningSection({ user }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }, '-updated_date', 10),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-continue'],
    queryFn: () => base44.entities.Course.list(),
    enabled: enrollments.length > 0
  });

  // Deduplicate enrollments - keep most recent per course
  const uniqueCourseEnrollments = enrollments
    .filter(e => !e.is_completed)
    .reduce((acc, enrollment) => {
      const existing = acc.find(e => e.course_id === enrollment.course_id);
      if (!existing || new Date(enrollment.updated_date) > new Date(existing.updated_date)) {
        return [...acc.filter(e => e.course_id !== enrollment.course_id), enrollment];
      }
      return acc;
    }, []);

  const activeEnrollments = uniqueCourseEnrollments
    .slice(0, 3)
    .map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      return { ...enrollment, course };
    })
    .filter(e => e.course);

  if (activeEnrollments.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl">
      <motion.div
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Continue Learning</h2>
        </div>
        <p className="text-muted-foreground">Pick up where you left off</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {activeEnrollments.map((enrollment, idx) => (
          <motion.div
            key={enrollment.id}
            whileHover={{ y: -8 }}
            className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 group"
          >
            {/* Course Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500">
              <img
                src={enrollment.course?.thumbnail || (enrollment.course?.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop')}
                alt={enrollment.course?.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Progress badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-indigo-600">
                {enrollment.progress_percent || 0}%
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {enrollment.course?.title}
              </h3>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${enrollment.progress_percent || 0}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {enrollment.progress_percent || 0}% completed
                </p>
              </div>

              {/* Current Lesson */}
              {enrollment.current_lesson_id && (
                <p className="text-sm text-gray-600 mb-4 p-2 bg-indigo-50 rounded-lg">
                  Current lesson: Lesson {enrollment.completed_lessons?.length + 1 || 1}
                </p>
              )}

              <Link to={enrollment.current_lesson_id 
                ? createPageUrl('LessonPlayerClassic') + `?lesson=${enrollment.current_lesson_id}&course=${enrollment.course_id}`
                : createPageUrl('CourseDetails') + `?id=${enrollment.course_id}`
              }>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold gap-2">
                  Resume <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}