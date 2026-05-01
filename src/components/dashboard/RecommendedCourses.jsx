import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendedCourses({ userEnrollments }) {
  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
    staleTime: 5 * 60 * 1000,
  });

  const enrolledCourseIds = userEnrollments.map(e => e.course_id);
  
  // Get user's categories from enrolled courses
  const enrolledCategories = allCourses
    .filter(c => enrolledCourseIds.includes(c.id))
    .map(c => c.category);

  // Recommend courses: same category but not enrolled, or popular courses
  const recommendedCourses = allCourses
    .filter(course => !enrolledCourseIds.includes(course.id))
    .sort((a, b) => {
      const aMatchesCategory = enrolledCategories.includes(a.category) ? 1 : 0;
      const bMatchesCategory = enrolledCategories.includes(b.category) ? 1 : 0;
      if (aMatchesCategory !== bMatchesCategory) return bMatchesCategory - aMatchesCategory;
      return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    })
    .slice(0, 3);

  if (recommendedCourses.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Recommended For You</h3>
        </div>
        <Link to={createPageUrl('Explore')}>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {recommendedCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex gap-4">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {course.category}
                      </Badge>
                      {course.duration_hours && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours}h
                        </div>
                      )}
                      {course.enrolled_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {course.enrolled_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}