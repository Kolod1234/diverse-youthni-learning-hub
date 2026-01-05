import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Star, Award, ChevronLeft, ChevronRight, BookOpen, TrendingUp, Zap, ClipboardList, Brain, Video, Target, Play, CheckCircle, Calendar, Clock, Rss } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import CategoryFilter from '@/components/courses/CategoryFilter';
import SearchBar from '@/components/courses/SearchBar';
import UpcomingSessionsWidget from '@/components/sessions/UpcomingSessionsWidget';
import RSSFeedWidget from '@/components/feed/RSSFeedWidget';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import WeatherWidget from '@/components/home/WeatherWidget';
import ClockWidget from '@/components/home/ClockWidget';
import QuoteWidget from '@/components/home/QuoteWidget';
import StudentOfMonthWidget from '@/components/home/StudentOfMonthWidget';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [user, setUser] = useState(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [leadershipEmblaRef, leadershipEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [heroEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: carouselImages = [] } = useQuery({
    queryKey: ['carousel-images'],
    queryFn: () => base44.entities.CarouselImage.filter({ is_active: true, carousel_type: 'main' }, 'order', 20),
    initialData: [],
  });

  const { data: leadershipCarouselImages = [] } = useQuery({
    queryKey: ['leadership-carousel-images'],
    queryFn: () => base44.entities.CarouselImage.filter({ is_active: true, carousel_type: 'leadership' }, 'order', 20),
    initialData: [],
  });

  const { data: heroCarouselImages = [] } = useQuery({
    queryKey: ['hero-carousel-images'],
    queryFn: () => base44.entities.CarouselImage.filter({ is_active: true, carousel_type: 'hero' }, 'order', 20),
    initialData: [],
  });

  const { data: heroSections = [] } = useQuery({
    queryKey: ['page-sections-home'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', is_active: true, section_type: 'hero_carousel' }, 'order', 10),
    initialData: [],
  });

  const defaultHeroBackgroundImages = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1920&q=80'
  ];
  
  const heroBackgroundImages = heroCarouselImages.length > 0 
    ? heroCarouselImages.map(img => img.image_url)
    : defaultHeroBackgroundImages;

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 3),
    initialData: [],
  });

  const { data: funderLogos = [] } = useQuery({
    queryKey: ['funder-logos'],
    queryFn: () => base44.entities.PartnerLogo.filter({ type: 'funder', is_active: true }, 'order', 50),
    initialData: [],
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
  
  // Get real user reviews with detailed comments
  // Get real user reviews only
  const realReviews = allReviews
    .filter(r => 
      r.comment && 
      r.comment.trim().length >= 20 && 
      r.rating >= 4 &&
      r.user_name &&
      (r.rating_type === 'lesson' || r.rating_type === 'course' || !r.rating_type)
    )
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

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
    <div className="bg-white">
      {/* Search Bar - Sticky at top */}
      <section className="sticky top-16 z-40 bg-[#003366] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>
      </section>

      {/* Dynamic Hero Carousel */}
      {heroSections.length > 0 && heroSections[0].carousel_items?.length > 0 ? (
        <HeroCarousel items={heroSections[0].carousel_items} />
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#003366] to-[#002244]">
          <div className="absolute inset-0" ref={heroEmblaRef}>
            <div className="flex h-full">
              {heroBackgroundImages.map((imgUrl, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 h-full">
                  <img
                    src={imgUrl}
                    alt={`Educational background ${idx + 1}`}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#003366]/50 via-transparent to-[#002244]/50" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div 
                className="inline-block bg-yellow-400 text-[#003366] px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-2xl font-black mb-6 shadow-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                {getContent('hero_online_learning', 'ONLINE LEARNING')}
              </motion.div>

              <motion.div 
                className="bg-white inline-block px-12 py-8 rounded-3xl shadow-2xl mb-6 transform rotate-1"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-5xl md:text-7xl font-black text-[#003366] tracking-tight" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.2)' }}>
                  {getContent('hero_afterschool_hours', 'Afterschool Hours')}
                </h1>
              </motion.div>

              <motion.h2 
                className="text-3xl md:text-5xl font-extrabold text-white mb-4"
                whileHover={{ scale: 1.08, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
              >
                {getContent('hero_online_quizzes', 'Online Quizzes')}
              </motion.h2>

              <motion.div 
                className="bg-yellow-400 inline-block px-12 py-6 rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.1, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-5xl md:text-7xl font-black text-[#003366]" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.3)' }}>
                  {getContent('hero_free_access', 'FREE ACCESS')}
                  <span className="block text-3xl md:text-4xl mt-2">{getContent('hero_all_courses', 'ALL COURSES')}</span>
                </p>
              </motion.div>

              <p className="text-white text-xl md:text-2xl font-bold mt-8 mb-8" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)' }}>
                {getContent('hero_description', 'Access them at the comfort of your home')}
              </p>

              <Link to={createPageUrl('Explore')}>
                <Button size="lg" className="bg-yellow-400 text-[#003366] hover:bg-yellow-300 text-2xl px-12 py-8 h-auto font-black rounded-full shadow-2xl hover:scale-110 transition-all">
                  {getContent('hero_button', 'BROWSE COURSES')}
                  <ArrowRight className="w-8 h-8 ml-3" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Home Widgets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <WeatherWidget />
          <ClockWidget />
          <div className="sm:col-span-2">
            <QuoteWidget />
          </div>
        </div>
        <StudentOfMonthWidget />
      </section>

      {/* Snap Finance Style Promo Banner */}
      <section className="bg-[#003366] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {getContent('leadership_title', 'Leadership Programmes')}
                <span className="block text-white/90">{getContent('leadership_subtitle', 'available here.')}</span>
              </h2>
              <Link to={createPageUrl('Programs')}>
                <Button size="lg" className="bg-[#e91e63] hover:bg-[#c2185b] text-white text-lg px-10 py-7 h-auto font-bold rounded-full shadow-xl hover:scale-105 transition-all">
                  {getContent('leadership_button', 'FIND OUT MORE')}
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl" ref={leadershipEmblaRef}>
                <div className="flex">
                  {(leadershipCarouselImages.length > 0 ? leadershipCarouselImages : [
                    { image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },
                    { image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80' },
                    { image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80' },
                    { image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80' }
                  ]).map((img, idx) => (
                    <div key={img.id || idx} className="flex-[0_0_100%] min-w-0">
                      <div className="relative aspect-[4/3]">
                        <img
                          src={img.image_url}
                          alt={`Leadership programme ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => leadershipEmblaApi?.scrollPrev()}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={() => leadershipEmblaApi?.scrollNext()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-full shadow-2xl z-10">
                <Award className="w-16 h-16 text-[#003366]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Funders Section */}
      {funderLogos.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{getContent('funders_heading', 'Proudly Supported By')}</h2>
              <p className="text-gray-600">{getContent('funders_description', 'Our funders who make this possible')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {funderLogos.map((logo, idx) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center justify-center"
                >
                  {logo.website_url ? (
                    <a 
                      href={logo.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                    >
                      <img
                        src={logo.logo_url}
                        alt={logo.name}
                        className="h-20 w-auto object-contain"
                      />
                    </a>
                  ) : (
                    <img
                      src={logo.logo_url}
                      alt={logo.name}
                      className="h-20 w-auto object-contain opacity-70"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners Section */}
      <PartnersSection />

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
              Join Our Leadership Empowerment Programmes
            </h2>

            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Develop essential leadership skills, gain real-world experience, and unlock your potential through our structured mentorship and empowerment programmes.
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

      {/* Upcoming Sessions Banner */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <UpcomingSessionsWidget user={user} />
        </section>
      )}

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
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
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

      {/* Explore Online Courses - LeanDirect Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Online Courses
          </h2>
        </motion.div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCourses.slice(0, 6).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-20 h-20 text-white/50" />
                    </div>
                  )}
                  {course.category && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold uppercase">
                      {course.category}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#003366] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {course.description}
                  </p>
                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                    <Button className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-6 rounded-lg text-base">
                      LEARN MORE
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Check back soon for new courses</p>
          </div>
        )}
        
        {sortedCourses.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to={createPageUrl('Explore')}>
              <Button size="lg" className="bg-[#003366] hover:bg-[#002244] text-white px-12 py-7 h-auto text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-all">
                View All Courses
                <ArrowRight className="w-6 h-6 ml-3" />
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

      {/* RSS Feed Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold mb-4 border border-blue-200">
              <Rss className="w-4 h-4 inline-block mr-2" />
              Latest Updates
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              News & Announcements
            </h2>
            <p className="text-lg text-gray-600">Stay informed with our latest news and updates</p>
          </div>
          <RSSFeedWidget limit={6} />
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold mb-4 border border-blue-500/20">
                Latest Insights
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                From Our Blog
              </h2>
              <p className="text-lg text-slate-400">Stay updated with the latest news and tips</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-slate-700 hover:border-blue-500/50"
                >
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full capitalize">
                        {post.category}
                      </span>
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {post.read_time_minutes} min read
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.author_avatar && (
                          <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{post.author_name}</p>
                          {post.published_date && (
                            <p className="text-xs text-slate-500">{new Date(post.published_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Real User Reviews Section */}
      {realReviews.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold mb-4 border border-blue-200">
                Real Student Reviews
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What our learners say
              </h2>
              <p className="text-lg text-gray-600">
                Authentic feedback from students currently learning with us
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {realReviews.slice(0, 3).map((review, idx) => (
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
                <p className="text-gray-700 mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.user_name}</p>
                      <p className="text-sm text-gray-500">
                        {review.rating_type === 'course' ? 'Course Graduate' : 'Verified Learner'}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
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
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Future?
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start your learning journey today and unlock endless possibilities with our expert-led courses
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/70 transition-all duration-300">
                  Get Started for Free
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" variant="outline" className="border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 hover:scale-105 rounded-full px-10 h-16 text-lg font-bold shadow-xl transition-all duration-300">
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

function HeroCarousel({ items }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 7000, stopOnInteraction: false })]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {items.map((item, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <div className="relative h-[600px] md:h-[700px]">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#003366]/70 via-[#003366]/50 to-[#002244]/80" />
                
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 100 }}
                      animate={currentIndex === idx ? { opacity: 1, x: 0 } : currentIndex > idx ? { opacity: 0, x: -100 } : { opacity: 0, x: 100 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {item.badge && (
                        <motion.div 
                          className="inline-block bg-yellow-400 text-[#003366] px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-2xl font-black mb-6 shadow-2xl"
                          initial={{ x: -50, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        >
                          {item.badge}
                        </motion.div>
                      )}

                      {item.title && (
                        <motion.div 
                          className="bg-white inline-block px-8 md:px-12 py-6 md:py-8 rounded-3xl shadow-2xl mb-6"
                          initial={{ x: 80, opacity: 0, rotate: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1, rotate: 1 } : { x: -80, opacity: 0, rotate: 0 }}
                          transition={{ duration: 0.7, delay: 0.15, ease: "easeInOut" }}
                        >
                          <h1 className="text-4xl md:text-7xl font-black text-[#003366] tracking-tight">
                            {item.title}
                          </h1>
                        </motion.div>
                      )}

                      {item.subtitle && (
                        <motion.h2 
                          className="text-2xl md:text-5xl font-extrabold text-white mb-4"
                          initial={{ x: -60, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
                          style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.8)' }}
                        >
                          {item.subtitle}
                        </motion.h2>
                      )}

                      {item.description && (
                        <motion.p 
                          className="text-white text-lg md:text-2xl font-bold mt-6 mb-8 max-w-3xl mx-auto"
                          initial={{ x: 70, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: -70, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.25, ease: "easeInOut" }}
                          style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}
                        >
                          {item.description}
                        </motion.p>
                      )}

                      {item.cta_text && item.cta_link && (
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.3, ease: "easeInOut" }}
                        >
                          <Link to={item.cta_link}>
                            <Button size="lg" className="bg-yellow-400 text-[#003366] hover:bg-yellow-300 text-xl md:text-2xl px-10 md:px-12 py-6 md:py-8 h-auto font-black rounded-full shadow-2xl hover:scale-110 transition-all">
                              {item.cta_text}
                              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 ml-3" />
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-10"
      >
        <ChevronLeft className="w-7 h-7 text-gray-800" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-10"
      >
        <ChevronRight className="w-7 h-7 text-gray-800" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`h-3 rounded-full transition-all ${
              currentIndex === idx ? 'w-12 bg-yellow-400' : 'w-3 bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function PartnersSection() {
  const { data: logos = [] } = useQuery({
    queryKey: ['partner-logos'],
    queryFn: () => base44.entities.PartnerLogo.filter({ type: 'partner', is_active: true }, 'order', 100),
  });

  if (logos.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partners</h2>
          <p className="text-gray-600">Working together to empower youth</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {logos.map((logo, idx) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="flex items-center justify-center"
            >
              {logo.website_url ? (
                <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  />
                </a>
              ) : (
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="h-20 w-auto object-contain opacity-70"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}