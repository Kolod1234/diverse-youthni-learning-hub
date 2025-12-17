import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Star, Award, ChevronLeft, ChevronRight, BookOpen, TrendingUp, Zap } from 'lucide-react';
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

  const totalStudents = new Set(enrollments.map(e => e.created_by)).size;
  const averageRating = courses.length > 0 
    ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
    : '4.8';

  const featuredCourses = courses.filter(c => c.is_featured).slice(0, 3);

  const filteredCourses = courses.filter(course => {
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF8C00] via-[#FF9500] to-[#FFB366]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
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
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 text-white">
                Diverse Youth NI
                <span className="block mt-3 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
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
                  <Button size="lg" className="bg-white text-[#FF8C00] hover:bg-gray-50 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-2xl transition-all duration-300">
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
            className="grid grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {[
              { value: totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : '0', label: 'Active Learners', icon: Users, gradient: 'from-blue-400 to-cyan-400' },
              { value: courses.length > 0 ? `${courses.length}` : '0', label: 'Expert Courses', icon: BookOpen, gradient: 'from-purple-400 to-pink-400' },
              { value: averageRating, label: 'Average Rating', icon: Star, gradient: 'from-yellow-400 to-orange-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold mb-2 text-white">{stat.value}</div>
                  <div className="text-orange-100 text-base font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Modern wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 sm:h-32" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
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
          <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF8C00] text-sm font-semibold mb-4">
            Our Community
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Experience the <span className="text-[#FF8C00]">Diverse Youth NI</span> Journey
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
                { image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200' },
                { image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200' },
                { image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200' },
              ]).map((img, idx) => (
                <div key={img.id || idx} className="flex-[0_0_100%] min-w-0">
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
                    <img
                      src={img.image_url}
                      alt={`Community ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white hover:bg-orange-50 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 group"
          >
            <ChevronLeft className="w-7 h-7 text-gray-800 group-hover:text-[#FF8C00] transition-colors" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white hover:bg-orange-50 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 group"
          >
            <ChevronRight className="w-7 h-7 text-gray-800 group-hover:text-[#FF8C00] transition-colors" />
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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-12 shadow-2xl"
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
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 rounded-full px-10 h-14 text-lg font-bold shadow-xl hover:scale-105 transition-all">
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
                <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-3">
                  Top Picks
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Courses</h2>
                <p className="text-gray-600 text-lg">Hand-picked by our expert instructors</p>
              </div>
              <Link to={createPageUrl('Explore')}>
                <Button className="bg-[#FF8C00] hover:bg-[#CC7000] rounded-full shadow-lg hover:shadow-xl transition-all">
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
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
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
        
        <div className="mb-8">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
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
              <Button size="lg" className="bg-gradient-to-r from-[#FF8C00] to-[#FFB366] hover:from-[#CC7000] hover:to-[#FF9933] rounded-full px-10 h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                View All Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF8C00] via-[#FF9500] to-[#FFB366] py-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
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
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Your Future?
              </span>
            </h2>
            
            <p className="text-xl text-orange-50 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start your learning journey today and unlock endless possibilities with our expert-led courses
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" className="bg-white text-[#FF8C00] hover:bg-gray-50 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-2xl transition-all duration-300">
                  Get Started for Free
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 h-16 text-lg font-bold transition-all duration-300">
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