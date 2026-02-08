import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, Users, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstructorShowcase() {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-instructors'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-instructors'],
    queryFn: () => base44.entities.Review.list(),
  });

  // Get unique instructors with their stats (filter out generic/empty names)
  const instructorStats = courses
    .filter(c => c.instructor && c.instructor.trim() && c.instructor.toLowerCase() !== 'instructor' && c.instructor.toLowerCase() !== 'unknown')
    .reduce((acc, course) => {
      const existing = acc.find(i => i.name === course.instructor);
      const instructorReviews = reviews.filter(r => 
        r.course_id === course.id && 
        (r.rating_type === 'course' || !r.rating_type)
      );
      const avgRating = instructorReviews.length > 0
        ? instructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviews.length
        : 0;

      if (existing) {
        existing.courses += 1;
        existing.students += course.enrolled_count || 0;
        existing.rating = (existing.rating + avgRating) / 2;
      } else {
        acc.push({
          name: course.instructor,
          avatar: course.instructor_avatar,
          courses: 1,
          students: course.enrolled_count || 0,
          rating: avgRating,
          specialties: [course.category]
        });
      }
      return acc;
    }, [])
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  if (instructorStats.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-bold mb-4 border border-purple-500/30">
            <Award className="w-4 h-4 inline-block mr-2" />
            Expert Instructors
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Our Instructors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn from experienced educators dedicated to your success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructorStats.map((instructor, idx) => (
            <motion.div
              key={instructor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-border"
            >
              {/* Avatar Section */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 h-40 relative">
                {instructor.avatar && (
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-32 h-32 rounded-full border-4 border-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 object-cover shadow-lg"
                  />
                )}
              </div>

              {/* Content */}
              <div className="pt-20 px-6 pb-6 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">{instructor.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(instructor.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">
                    {(instructor.rating || 0).toFixed(1)}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-muted p-4 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {instructor.courses}
                    </div>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      <Users className="w-5 h-5" />
                      {Math.round(instructor.students / 100) * 100}
                    </div>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">Specialties</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {instructor.specialties.map(spec => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium capitalize"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Courses
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}