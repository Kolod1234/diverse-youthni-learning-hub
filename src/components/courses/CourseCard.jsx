import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const getCategoryBgColor = (category) => {
  const colors = {
    mathematics: 'bg-blue-100 text-blue-700',
    english: 'bg-purple-100 text-purple-700',
    biology: 'bg-emerald-100 text-emerald-700',
    chemistry: 'bg-amber-100 text-amber-700',
    physics: 'bg-indigo-100 text-indigo-700',
    history: 'bg-rose-100 text-rose-700',
    geography: 'bg-teal-100 text-teal-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
};

export default function CourseCard({ course, index = 0 }) {
  // ✅ PERF: cap stagger so the 50th card doesn't wait 5s. Also keep the
  // animation short so cards become visible almost immediately.
  const animDelay = Math.min(index, 6) * 0.03;
  // First few visible cards load eagerly; the rest defer until they scroll into view.
  const isAboveFold = index < 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animDelay }}
    >
      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
        <Card className="rounded-3xl overflow-hidden shadow-md border-2 border-transparent hover:shadow-xl hover:border-primary group h-full transition-all duration-500">
          {/* Image Section */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
            <img
              src={course.thumbnail || (course.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=75')}
              alt={course.title}
              loading={isAboveFold ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {course.is_featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg border-0">
                  ⭐ Featured
                </Badge>
              )}
              <Badge className={`${getCategoryBgColor(course.category)} capitalize font-semibold text-xs shadow-md border-0`}>
                {course.category}
              </Badge>
            </div>

            {/* Top-right badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              <Badge className={`${levelColors[course.level] || levelColors.beginner} capitalize font-semibold shadow-md border-0`}>
                {course.level}
              </Badge>
              {!course.price || course.price === 0 ? (
                <Badge className="bg-green-500 text-white font-bold text-xs shadow-lg border-0">Free</Badge>
              ) : (
                <Badge className="bg-indigo-600 text-white font-bold text-xs shadow-lg border-0">£{course.price}</Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-6 relative z-10">
            {/* Title */}
            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {course.description}
            </p>

            {/* Stats Row */}
            <div className="flex divide-x divide-gray-200 mb-4">
              <div className="flex-1 text-center">
                <div className="text-sm font-bold">{course.duration_hours || 0}h</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Duration
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-bold">{course.lesson_count || course.total_lessons || 0}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <BookOpen className="w-3 h-3" />
                  Lessons
                </div>
              </div>
              <div className="flex-1 text-center">
                {course.rating ? (
                  <>
                    <div className="text-sm font-bold">{course.rating.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-500">
                      <Star className="w-3 h-3" />
                      Rating
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-gray-400">N/A</div>
                    <div className="text-xs text-gray-500">No Rating</div>
                  </>
                )}
              </div>
            </div>

            {/* Enrollment count */}
            {course.enrolled_count > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4 py-2 bg-gray-50 rounded-xl">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold">{course.enrolled_count.toLocaleString()}</span>
                <span className="text-sm text-gray-500">students enrolled</span>
              </div>
            )}

            {/* CTA Button */}
            <Button className="w-full py-3 px-4 rounded-2xl font-bold bg-gradient-to-r from-[#003366] to-blue-700 hover:from-[#002244] hover:to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              View Course →
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}