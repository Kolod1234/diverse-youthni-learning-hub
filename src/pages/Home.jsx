import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Play, Users, Star, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import CategoryFilter from '@/components/courses/CategoryFilter';
import SearchBar from '@/components/courses/SearchBar';
import useEmblaCarousel from 'embla-carousel-react';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New courses added weekly
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Diverse Youth NI
                <span className="block bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                  Learning Hub
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl">
                Empowering young people through education. Join our community and unlock your potential with expert-led courses.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl('Explore')}>
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-indigo-900/20">
                    Explore Courses
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-base font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl"
          >
            {[
              { value: totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : '0', label: 'Students', icon: Users },
              { value: courses.length > 0 ? `${courses.length}` : '0', label: 'Courses', icon: Play },
              { value: averageRating, label: 'Rating', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-indigo-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Community</h2>
          <p className="text-gray-500">See what's happening at Diverse Youth NI</p>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {[
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
                'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200',
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
                'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
                'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200',
              ].map((img, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0">
                  <div className="relative aspect-[21/9] sm:aspect-[16/6]">
                    <img
                      src={img}
                      alt={`Community ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-500">Hand-picked by our experts</p>
            </div>
            <Link to={createPageUrl('Explore')}>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore our wide range of courses across different domains and find the perfect match for your learning goals.
          </p>
        </div>
        
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
          <div className="text-center mt-10">
            <Link to={createPageUrl('Explore')}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-8">
                View All Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Your Learning Journey Today
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Join our community of learners and unlock your potential with expert-led courses.
            </p>
            <Link to={createPageUrl('Dashboard')}>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 h-14 text-base font-semibold">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}