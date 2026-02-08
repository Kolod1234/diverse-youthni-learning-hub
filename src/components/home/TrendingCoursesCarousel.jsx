import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TrendingCoursesCarousel() {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments-trending'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-trending'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-trending'],
    queryFn: () => base44.entities.Review.list(),
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, slidesToScroll: 1, align: 'start' });

  // Calculate trending score: enrollment count + rating
  const trendingCourses = courses
    .map(course => {
      const enrollmentCount = enrollments.filter(e => e.course_id === course.id).length;
      const courseReviews = reviews.filter(r => r.course_id === course.id);
      const rating = courseReviews.length > 0
        ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
        : 0;
      return {
        ...course,
        enrollmentCount,
        rating,
        trendingScore: (enrollmentCount * 0.6) + (rating * 0.4)
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 8);

  if (trendingCourses.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
        </div>
        <p className="text-muted-foreground">Most popular courses this week</p>
      </motion.div>

      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-6">
            {trendingCourses.map((course, idx) => (
              <div key={course.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-200 h-full flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-400 to-red-500">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Trending badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Flame className="w-3 h-3" /> Trending
                    </div>

                    {/* Enrollment count */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900">
                      {course.enrollmentCount.toLocaleString()} students
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                      {course.description}
                    </p>

                    {/* Rating */}
                    {course.rating > 0 && (
                      <div className="flex items-center gap-1 mb-4 text-sm">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(course.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                      </div>
                    )}

                    <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold gap-2">
                        View Course <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-5 top-1/3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 z-10"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-5 top-1/3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 z-10"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </section>
  );
}