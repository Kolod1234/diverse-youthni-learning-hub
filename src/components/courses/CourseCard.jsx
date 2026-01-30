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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white">
          <div className="relative overflow-hidden aspect-video">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {course.is_featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Featured
              </Badge>
            )}
            <Badge className={`absolute top-3 right-3 ${levelColors[course.level] || levelColors.beginner} border-0 capitalize`}>
              {course.level}
            </Badge>
          </div>
          
          <div className="p-5">
            <Badge className={`${categoryColors[course.category] || 'bg-gray-100 text-gray-600'} border-0 text-xs font-medium mb-3 capitalize`}>
              {course.category}
            </Badge>
            
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-gray-500 text-sm line-clamp-2 mb-4">
              {course.description}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <img
                src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'Instructor')}&background=6366f1&color=fff`}
                alt={course.instructor}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm text-gray-600">{course.instructor || 'Expert Instructor'}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration_hours || 0}h
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.lesson_count || course.total_lessons || 0}
                </span>
              </div>
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-700">{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              {course.enrolled_count > 0 && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Users className="w-4 h-4" />
                  {course.enrolled_count.toLocaleString()} students
                </div>
              )}
              <span className="text-lg font-bold text-indigo-600">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}