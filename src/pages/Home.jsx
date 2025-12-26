import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Star, Award, ChevronLeft, ChevronRight, BookOpen, TrendingUp, Zap, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import CategoryFilter from '@/components/courses/CategoryFilter';
import SearchBar from '@/components/courses/SearchBar';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: carouselImages = [] } = useQuery({
    queryKey: ['carousel-images'],
    queryFn: () => base44.entities.CarouselImage.filter({ is_active: true }, 'order', 20),
    initialData: [],
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
  });

  // Calculate actual ratings and enrollments for each course
  const coursesWithActualData = courses.map(course => {
    const courseReviews = allReviews.filter(r => 
      r.course_id === course.id && (r.rating_type === 'course' || !r.rating_type)
    );
    const actualRating = courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
      : null;
    
    const enrollmentCount = enrollments.filter(e => e.course_id === course.id).length;
    
    return {
      ...course,
      rating: actualRating,
      enrolled_count: enrollmentCount
    };
  });

  const totalStudents = new Set(enrollments.map(e => e.created_by)).size;
  
  // Calculate average rating from actual reviews only
  const coursesWithRatings = coursesWithActualData.filter(c => c.rating !== null);
  const averageRating = coursesWithRatings.length > 0 
    ? (coursesWithRatings.reduce((sum, c) => sum + c.rating, 0) / coursesWithRatings.length).toFixed(1)
    : null;

  const featuredCourses = coursesWithActualData.filter(c => c.is_featured).slice(0, 3);

  const filteredCourses = coursesWithActualData.filter(course => {
    const matchesCategory = category === 'all' || course.category === category;
    const matchesSearch = !searchQuery || 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return new Date(b.created_date) - new Date(a.created_date);
      case 'price_low': return (a.price || 0) - (b.price || 0);
      case 'price_high': return (b.price || 0) - (a.price || 0);
      default: return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-rose-600 to-fuchsia-600">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/25 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/30"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Transform Your Future with Quality Education</span>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 text-white drop-shadow-lg">
                Diverse Youth NI
                <span className="block mt-3 bg-gradient-to-r from-yellow-200 via-amber-200 to-white bg-clip-text text-transparent">
                  Learning Hub
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-orange-50 mb-10 max-w-3xl mx-auto leading-relaxed">
                Empowering young minds through innovative education. 
                <span className="block mt-2 text-white/90">Join our thriving community today.</span>
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to={createPageUrl('Explore')}>
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-yellow-50 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-white/50 hover:shadow-orange-400/70 transition-all duration-300">
                    Start Learning Now
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Enhanced Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-2xl shadow-cyan-500/50">
                <Users className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold mb-2 text-white">
                {totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : '0'}
              </div>
              <div className="text-orange-100 text-base font-medium">Active Learners</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 mb-4 shadow-2xl shadow-violet-500/50">
                <BookOpen className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold mb-2 text-white">
                {courses.length > 0 ? courses.length : '0'}
              </div>
              <div className="text-orange-100 text-base font-medium">Expert Courses</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-2xl shadow-amber-500/50">
                <Star className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold mb-2 text-white">
                {averageRating || '4.5'}
              </div>
              <div className="text-orange-100 text-base font-medium">Average Rating</div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Modern wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 sm:h-32" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </section>

      {/* Image Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600 text-sm font-semibold mb-4 border border-orange-200">
            Our Community
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Experience the <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">Diverse Youth NI</span> Journey
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what's happening in our vibrant learning community
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl shadow-2xl" ref={emblaRef}>
            <div className="flex">
              {(carouselImages.length > 0 ? carouselImages : [
                { image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80' },
                { image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80' },
                { image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80' },
              ]).map((img, idx) => (
                <div key={img.id || idx} className="flex-[0_0_100%] min-w-0">
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/9]">
                    <img
                      src={img.image_url}
                      alt={`Community ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 group border border-gray-200 hover:border-transparent"
          >
            <ChevronLeft className="w-7 h-7 text-gray-800 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 group border border-gray-200 hover:border-transparent"
          >
            <ChevronRight className="w-7 h-7 text-gray-800 group-hover:text-white transition-colors" />
          </button>
        </motion.div>
      </section>

      {/* Leadership Programmes CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-12 shadow-2xl shadow-purple-500/50"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
              <ClipboardList className="w-4 h-4" />
              <span>Leadership Development</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Join Our Leadership Employment Programmes
            </h2>

            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Develop essential leadership skills, gain real-world experience, and unlock your potential through our structured mentorship and employment programmes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Programs')}>
                <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-white/40 hover:shadow-violet-400/70 hover:scale-105 transition-all">
                  Explore Programmes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 text-sm font-semibold mb-3 border border-violet-200">
                  Top Picks
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Courses</h2>
                <p className="text-gray-600 text-lg">Hand-picked by our expert instructors</p>
              </div>
              <Link to={createPageUrl('Explore')}>
                <Button className="bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-full shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-rose-500/50 transition-all">
                  View all <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold mb-4 border border-emerald-200">
            Explore Learning Paths
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Discover courses tailored to your interests and accelerate your learning journey
          </p>
        </motion.div>
        
        <div className="mb-8">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCourses.slice(0, 8).map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
        
        {sortedCourses.length > 8 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to={createPageUrl('Explore')}>
              <Button size="lg" className="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 hover:from-orange-700 hover:via-rose-700 hover:to-pink-700 text-white rounded-full px-10 h-14 text-base font-semibold shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-105">
                View All Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why learners love our platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of education with our innovative features
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Learning',
                description: 'Personalized course recommendations and intelligent quiz generation',
                color: 'from-blue-500 to-indigo-600'
              },
              {
                icon: Video,
                title: 'Live Sessions',
                description: 'Interactive video sessions with expert tutors and real-time collaboration',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: Target,
                title: 'Gamified Experience',
                description: 'Earn points, unlock achievements, and track your progress',
                color: 'from-orange-500 to-red-600'
              },
              {
                icon: Users,
                title: 'Community-Driven',
                description: 'Learn together with peers, share knowledge, and grow as a community',
                color: 'from-emerald-500 to-teal-600'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What our learners say
            </h2>
            <p className="text-lg text-gray-600">Real stories from real students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {topReviews.slice(0, 3).map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.user_name}</p>
                    <p className="text-sm text-gray-500">Verified Student</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-rose-600 to-fuchsia-600 py-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300/40 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-8">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Join Thousands of Successful Learners</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Ready to Transform
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-amber-200 to-white bg-clip-text text-transparent">
                Your Future?
              </span>
            </h2>
            
            <p className="text-xl text-orange-50 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start your learning journey today and unlock endless possibilities with our expert-led courses
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" className="bg-white text-orange-600 hover:bg-yellow-50 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-white/50 hover:shadow-orange-400/70 transition-all duration-300">
                  Get Started for Free
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" variant="outline" className="border-2 border-white bg-white/5 text-white hover:bg-white/20 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-xl transition-all duration-300">
                  Browse Courses
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function PartnersSection() {
  const { data: logos = [] } = useQuery({
    queryKey: ['partner-logos'],
    queryFn: () => base44.entities.PartnerLogo.list('order', 100),
  });

  const partners = logos.filter(l => l.type === 'partner');
  const funders = logos.filter(l => l.type === 'funder');

  if (logos.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {funders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Funders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {funders.map((logo) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center"
                >
                  {logo.website_url ? (
                    <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={logo.logo_url}
                        alt={logo.name}
                        className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <img
                      src={logo.logo_url}
                      alt={logo.name}
                      className="h-16 w-auto object-contain opacity-70"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {partners.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Partners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {partners.map((logo) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center"
                >
                  {logo.website_url ? (
                    <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={logo.logo_url}
                        alt={logo.name}
                        className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <img
                      src={logo.logo_url}
                      alt={logo.name}
                      className="h-16 w-auto object-contain opacity-70"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}