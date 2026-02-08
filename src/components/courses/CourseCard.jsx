import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors = {
  mathematics: 'bg-blue-500/10 text-blue-600',
  english: 'bg-purple-500/10 text-purple-600',
  biology: 'bg-emerald-500/10 text-emerald-600',
  chemistry: 'bg-amber-500/10 text-amber-600',
  physics: 'bg-indigo-500/10 text-indigo-600',
  history: 'bg-rose-500/10 text-rose-600',
  geography: 'bg-teal-500/10 text-teal-600',
};

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CourseCard({ course, index = 0 }) {
  const getCategoryColor = (category) => {
    const colors = {
      mathematics: 'from-blue-600 to-blue-400',
      english: 'from-purple-600 to-purple-400',
      biology: 'from-emerald-600 to-emerald-400',
      chemistry: 'from-amber-600 to-amber-400',
      physics: 'from-indigo-600 to-indigo-400',
      history: 'from-rose-600 to-rose-400',
      geography: 'from-teal-600 to-teal-400',
    };
    return colors[category] || 'from-gray-600 to-gray-400';
  };

  const getCategoryBgColor = (category) => {
    const colors = {
      mathematics: 'bg-blue-500/10 text-blue-600',
      english: 'bg-purple-500/10 text-purple-600',
      biology: 'bg-emerald-500/10 text-emerald-600',
      chemistry: 'bg-amber-500/10 text-amber-600',
      physics: 'bg-indigo-500/10 text-indigo-600',
      history: 'bg-rose-500/10 text-rose-600',
      geography: 'bg-teal-500/10 text-teal-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
        <div className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-gradient-to-r ${getCategoryColor(course.category)} relative h-full`}>
          {/* Gradient border on hover */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(course.category)} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
          
          {/* Image Section */}
          <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-gray-200 to-gray-300">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {course.is_featured && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ Featured
                </div>
              )}
              <Badge className={`${getCategoryBgColor(course.category)} border-0 text-xs font-semibold capitalize shadow-md`}>
                {course.category}
              </Badge>
            </div>
            
            {/* Top-right badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              <Badge className={`${levelColors[course.level] || levelColors.beginner} border-0 capitalize font-semibold shadow-md`}>
                {course.level}
              </Badge>
              {!course.price || course.price === 0 ? (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Free
                </div>
              ) : (
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  £{course.price}
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6 relative z-10">
            {/* Title */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-gray-900">
              {course.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {course.description}
            </p>
            
            {/* Instructor */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <img
                src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'Instructor')}&background=6366f1&color=fff`}
                alt={course.instructor}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{course.instructor || 'Expert Instructor'}</p>
                <p className="text-xs text-gray-500">Course Instructor</p>
              </div>
            </div>
            
            {/* Stats Row 1 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900">{course.duration_hours || 0}h</div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Duration
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900">{course.lesson_count || course.total_lessons || 0}</div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3" /> Lessons
                </div>
              </div>
              <div className="text-center">
                {course.rating ? (
                  <>
                    <div className="text-sm font-bold text-gray-900">{course.rating.toFixed(1)}</div>
                    <div className="text-xs text-amber-500 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Rating
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
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4 py-2 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">{course.enrolled_count.toLocaleString()}</span>
                <span className="text-gray-500">students enrolled</span>
              </div>
            )}
            
            {/* CTA Button */}
            <button className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 transform group-hover:scale-[1.02] shadow-md hover:shadow-lg bg-gradient-to-r ${getCategoryColor(course.category)}`}>
              View Course →
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}