import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Button, IconButton, Card, CardContent, CardMedia, Typography, Chip, Box, Container, Avatar } from '@mui/material';
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
import CalendarWidget from '@/components/home/CalendarWidget';
import UpcomingLessonsWidget from '@/components/home/UpcomingLessonsWidget';
import FactOfDayWidget from '@/components/home/FactOfDayWidget';
import EnhancedFactOfDay from '@/components/home/EnhancedFactOfDay';
import RSSNotificationsWidget from '@/components/home/RSSNotificationsWidget';
import SocialFeedWidget from '@/components/home/SocialFeedWidget';
import DiscoverWidget from '@/components/home/DiscoverWidget';
import WidgetCustomizer from '@/components/home/WidgetCustomizer';
import WidgetSkeleton from '@/components/home/WidgetSkeleton';
import PageSEO from '@/components/seo/PageSEO';
import ImageGallerySection from '@/components/sections/ImageGallerySection';
import VideoEmbedSection from '@/components/sections/VideoEmbedSection';
import TeamMembersSection from '@/components/sections/TeamMembersSection';
import FAQSection from '@/components/sections/FAQSection';
import ContinueLearningSection from '@/components/home/ContinueLearningSection';
import QuickStatsCard from '@/components/home/QuickStatsCard';
import TrendingCoursesCarousel from '@/components/home/TrendingCoursesCarousel';
import CategoryQuickAccess from '@/components/home/CategoryQuickAccess';
import StudentSuccessStories from '@/components/home/StudentSuccessStories';
import SubjectMasteryRoadmaps from '@/components/home/SubjectMasteryRoadmaps';
import InstructorShowcase from '@/components/home/InstructorShowcase';
import LearningStatisticsSection from '@/components/home/LearningStatisticsSection';
import FreeResourcesCenter from '@/components/home/FreeResourcesCenter';
import AboutUsSection from '@/components/home/AboutUsSection';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [user, setUser] = useState(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [leadershipEmblaRef, leadershipEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [heroEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => setUser(data),
  });

  // Pull to refresh
  const { isPulling, pullDistance } = usePullToRefresh(async () => {
    await Promise.all([
      refetchUser(),
      queryClient.invalidateQueries(['courses']),
      queryClient.invalidateQueries(['all-carousel-images']),
      queryClient.invalidateQueries(['site-content'])
    ]);
  });

  useEffect(() => {
    if (currentUser) setUser(currentUser);
  }, [currentUser]);

  // Redirect based on interest_type (skip for admins and users accessing directly)
  useEffect(() => {
    const checkInterest = async () => {
      try {
        // Check if user came directly to Home (skip redirect)
        const skipRedirect = sessionStorage.getItem('skip_home_redirect');
        if (skipRedirect === 'true') {
          sessionStorage.removeItem('skip_home_redirect');
          return;
        }

        const userData = await base44.auth.me();
        
        // Admins can see all homepages - no redirect
        if (userData?.role === 'admin') {
          return;
        }

        const interestType = userData?.interest_type;
        
        if (!interestType || interestType === '') {
          navigate(createPageUrl('WelcomeCover'), { replace: true });
          return;
        }

        // Redirect to appropriate homepage
        switch (interestType) {
          case 'leadership':
            navigate(createPageUrl('HomeLeadership'), { replace: true });
            break;
          case 'learning':
            navigate(createPageUrl('HomeLearning'), { replace: true });
            break;
          case 'youth_work':
            navigate(createPageUrl('HomeYouthWork'), { replace: true });
            break;
          case 'guest':
            navigate(createPageUrl('HomeGuest'), { replace: true });
            break;
          default:
            navigate(createPageUrl('WelcomeCover'), { replace: true });
        }
      } catch (error) {
        // Not logged in - check localStorage
        const guestInterest = localStorage.getItem('interest_type');
        if (!guestInterest) {
          navigate(createPageUrl('WelcomeCover'), { replace: true });
        } else if (guestInterest === 'guest') {
          navigate(createPageUrl('HomeGuest'), { replace: true });
        } else {
          navigate(createPageUrl('WelcomeCover'), { replace: true });
        }
      }
    };
    checkInterest();
  }, [navigate]);

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list('-created_date', 100);
      return allCourses;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: allCarouselImages = [] } = useQuery({
    queryKey: ['all-carousel-images'],
    queryFn: async () => {
      const images = await base44.entities.CarouselImage.list('-created_date', 1000);
      return images || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const carouselImages = allCarouselImages
    .filter(img => img.carousel_type === 'main' && img.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const leadershipCarouselImages = allCarouselImages
    .filter(img => img.carousel_type === 'leadership' && img.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const heroCarouselImages = allCarouselImages
    .filter(img => img.carousel_type === 'hero' && img.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const { data: heroSections = [] } = useQuery({
    queryKey: ['page-sections-home'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', is_active: true, section_type: 'hero_carousel' }, 'order', 10),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const { data: allPageSections = [] } = useQuery({
    queryKey: ['page-sections-home-all'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', is_active: true }, 'order', 100),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const defaultHeroBackgroundImages = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=2400&q=95&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=2400&q=95&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=2400&q=95&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=2400&q=95&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=2400&q=95&auto=format&fit=crop'
  ];
  
  const heroBackgroundImages = heroCarouselImages.length > 0 
    ? heroCarouselImages.map(img => img.image_url)
    : defaultHeroBackgroundImages;

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
    staleTime: 1000 * 60 * 10,
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
    staleTime: 1000 * 60 * 10,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 3),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const { data: funderLogos = [] } = useQuery({
    queryKey: ['funder-logos'],
    queryFn: () => base44.entities.PartnerLogo.filter({ type: 'funder', is_active: true }, 'order', 50),
    initialData: [],
    staleTime: 1000 * 60 * 60,
  });

  const { data: gallerySection = [] } = useQuery({
    queryKey: ['page-sections-gallery'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'image_gallery', is_active: true }, 'order', 1),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const { data: videoSection = [] } = useQuery({
    queryKey: ['page-sections-video'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'video_embed', is_active: true }, 'order', 1),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const { data: teamSection = [] } = useQuery({
    queryKey: ['page-sections-team'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'team_members', is_active: true }, 'order', 1),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  const { data: faqSection = [] } = useQuery({
    queryKey: ['page-sections-faq'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'faq_section', is_active: true }, 'order', 1),
    initialData: [],
    staleTime: 1000 * 60 * 30,
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

  // Get real user reviews from GCSE/A-level courses only
  const gcseCourseIds = coursesWithActualData
    .filter(c => ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'science', 'history', 'geography'].includes(c.category))
    .map(c => c.id);
  
  const realReviews = allReviews
    .filter(r => 
      gcseCourseIds.includes(r.course_id) &&
      r.comment && 
      r.comment.trim().length >= 20 && 
      r.rating >= 4 &&
      (r.rating_type === 'lesson' || r.rating_type === 'course' || !r.rating_type)
    )
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 3);

  return (
    <Box ref={scrollContainerRef} sx={{ bgcolor: 'background.default' }}>
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.2s',
            transform: `translateY(${Math.min(pullDistance, 80)}px)`,
            pointerEvents: 'none'
          }}
        >
          <Box sx={{ bgcolor: '#2563eb', color: 'white', px: 3, py: 1.5, borderRadius: 50, boxShadow: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: pullDistance > 80 ? 'spin 1s linear infinite' : 'none'
              }}
            />
            <Typography variant="body2" fontWeight={600}>
              {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            </Typography>
          </Box>
        </Box>
      )}
      <PageSEO pageName="Home" sections={allPageSections} />
      {/* Search Bar - Sticky at top with glass effect */}
      <Box component="section" sx={{ position: 'sticky', top: 64, zIndex: 40, background: 'linear-gradient(to right, rgba(0,51,102,0.95), rgba(0,68,136,0.95), rgba(0,51,102,0.95))', backdropFilter: 'blur(24px)', boxShadow: 6, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Container maxWidth="xl" sx={{ py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </Box>
        </Container>
      </Box>

      {/* Dynamic Hero Carousel */}
      {heroSections.length > 0 && heroSections[0].carousel_items?.length > 0 ? (
        <HeroCarousel items={heroSections[0].carousel_items} />
      ) : (
        <Box component="section" sx={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom right, #003366, #004488, #0055aa)' }}>
          <Box sx={{ position: 'absolute', inset: 0 }} ref={heroEmblaRef}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {heroBackgroundImages.map((imgUrl, idx) => (
               <Box key={idx} sx={{ flex: '0 0 100%', minWidth: 0, height: '100%' }}>
                 <Box
                   component="img"
                   src={imgUrl}
                   alt={`Educational background ${idx + 1}`}
                   sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                   loading="eager"
                 />
                 <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,51,102,0.6), rgba(0,51,102,0.3), rgba(0,34,68,0.7))' }} />
               </Box>
              ))}
            </Box>
          </Box>
          
          <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ textAlign: 'center' }}>
              <motion.div 
                className="inline-block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-[#003366] px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-2xl font-black mb-6 shadow-2xl"
                whileHover={{ scale: 1.08, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)" }}
                transition={{ duration: 0.2 }}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2" />
                {getContent('hero_online_learning', 'ONLINE LEARNING')}
              </motion.div>

              <motion.div 
                className="bg-white inline-block px-12 py-8 rounded-3xl shadow-2xl mb-6 transform rotate-1 border-4 border-yellow-400/30"
                whileHover={{ scale: 1.08, rotate: 2, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#003366] via-blue-700 to-purple-700 bg-clip-text text-transparent tracking-tight" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.1)' }}>
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
                className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 inline-block px-12 py-6 rounded-2xl shadow-2xl relative overflow-hidden"
                whileHover={{ scale: 1.12, boxShadow: "0 25px 50px rgba(251, 146, 60, 0.5)", rotate: -1 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
                <p className="text-5xl md:text-7xl font-black text-[#003366] relative z-10" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.3)' }}>
                  {getContent('hero_free_access', 'FREE ACCESS')}
                  <span className="block text-3xl md:text-4xl mt-2 flex items-center justify-center gap-3">
                    <Zap className="w-8 h-8 md:w-10 md:h-10" />
                    {getContent('hero_all_courses', 'ALL COURSES')}
                  </span>
                </p>
              </motion.div>

              <p className="text-white text-xl md:text-2xl font-bold mt-8 mb-8" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)' }}>
                {getContent('hero_description', 'Access them at the comfort of your home')}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight size={32} />}
                    sx={{
                      background: 'linear-gradient(to right, #fbbf24, #f59e0b, #f97316)',
                      color: '#003366',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      px: 6,
                      py: 3,
                      borderRadius: 50,
                      boxShadow: '0 10px 40px rgba(251, 191, 36, 0.5)',
                      textTransform: 'uppercase',
                      '&:hover': {
                        background: 'linear-gradient(to right, #fcd34d, #fbbf24, #f59e0b)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 15px 50px rgba(251, 191, 36, 0.6)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {getContent('hero_button', 'BROWSE COURSES')}
                  </Button>
                </Link>
              </motion.div>
              </Box>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* Quick Stats Banner - For logged in users */}
      {user && (
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <QuickStatsCard user={user} />
        </Container>
      )}

      {/* Continue Learning Section */}
      {user && (
        <ContinueLearningSection user={user} />
      )}

      {/* Category Quick Access */}
      <CategoryQuickAccess />

      {/* Trending Courses */}
      <TrendingCoursesCarousel />

      {/* Home Widgets */}
      <Box component="section" sx={{ position: 'relative', background: 'linear-gradient(to bottom right, #1e293b, #172554, #1e293b)', py: 16, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: '25%', width: 384, height: 384, bgcolor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, right: '25%', width: 384, height: 384, bgcolor: 'rgba(147, 51, 234, 0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 8 }}>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>Your Dashboard</Typography>
                <Typography sx={{ color: '#93c5fd' }}>Stay updated with your personalized widgets</Typography>
              </Box>
              {user && <WidgetCustomizer user={user} widgetPreferences={user.widget_preferences || {}} />}
            </Box>
          </motion.div>
          
          {userLoading ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                <WidgetSkeleton />
                <WidgetSkeleton />
                <WidgetSkeleton />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                <WidgetSkeleton />
                <WidgetSkeleton />
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                {(!user?.widget_preferences?.weather || user.widget_preferences.weather.enabled !== false) && <WeatherWidget />}
                {(!user?.widget_preferences?.clock || user.widget_preferences.clock.enabled !== false) && <ClockWidget />}
                {(!user?.widget_preferences?.calendar || user.widget_preferences.calendar.enabled !== false) && <CalendarWidget />}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                {(!user?.widget_preferences?.upcoming_lessons || user.widget_preferences.upcoming_lessons.enabled !== false) && <UpcomingLessonsWidget />}
                {(!user?.widget_preferences?.rss_notifications || user.widget_preferences.rss_notifications.enabled !== false) && <RSSNotificationsWidget />}
              </Box>
              <Box sx={{ mb: 2 }}>
                {(!user?.widget_preferences?.fact || user.widget_preferences.fact.enabled !== false) && <EnhancedFactOfDay />}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                {(!user?.widget_preferences?.quote || user.widget_preferences.quote.enabled !== false) && <QuoteWidget />}
                {(!user?.widget_preferences?.discover || user.widget_preferences.discover.enabled !== false) && <DiscoverWidget />}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                {(!user?.widget_preferences?.student_of_month || user.widget_preferences.student_of_month.enabled !== false) && <StudentOfMonthWidget />}
                {(!user?.widget_preferences?.social_feed || user.widget_preferences.social_feed.enabled !== false) && <SocialFeedWidget />}
              </Box>
            </>
          )}
        </Container>
      </Box>

      {/* Snap Finance Style Promo Banner */}
      <Box component="section" sx={{ position: 'relative', background: 'linear-gradient(to bottom right, #003366, #004488, #0055aa)', py: { xs: 8, md: 10 }, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 384, height: 384, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 384, height: 384, bgcolor: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 6, alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: 'white', mb: 3, lineHeight: 1.2 }}>
                {getContent('leadership_title', 'Leadership Programmes')}
                <Box component="span" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>{getContent('leadership_subtitle', 'available here.')}</Box>
              </Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    bgcolor: '#e91e63',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    px: 5,
                    py: 2.5,
                    borderRadius: 50,
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: '#c2185b',
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {getContent('leadership_button', 'FIND OUT MORE')}
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ overflow: 'hidden', borderRadius: 4, boxShadow: 6 }} ref={leadershipEmblaRef}>
                  <Box sx={{ display: 'flex' }}>
                  {leadershipCarouselImages.map((img, idx) => (
                    <Box key={img.id || idx} sx={{ flex: '0 0 100%', minWidth: 0 }}>
                      <Box sx={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', bgcolor: '#f0f0f0' }}>
                        <CardMedia
                          component="img"
                          image={img.image_url}
                          alt={`Leadership programme ${idx + 1}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1)', transition: 'transform 0.7s' }}
                        />
                      </Box>
                    </Box>
                  ))}
                  </Box>
                </Box>
                <IconButton
                  onClick={() => leadershipEmblaApi?.scrollPrev()}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 3,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)', boxShadow: 4 },
                    transition: 'all 0.3s'
                  }}
                >
                  <ChevronLeft size={20} color="#1f2937" />
                </IconButton>
                <IconButton
                  onClick={() => leadershipEmblaApi?.scrollNext()}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 3,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)', boxShadow: 4 },
                    transition: 'all 0.3s'
                  }}
                >
                  <ChevronRight size={20} color="#1f2937" />
                </IconButton>
                <Box sx={{ position: 'absolute', bottom: -24, right: -24, bgcolor: 'white', p: 3, borderRadius: '50%', boxShadow: 6, zIndex: 10 }}>
                  <Award size={64} color="#003366" />
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Funders Section */}
      {funderLogos.length > 0 && (
        <Box component="section" sx={{ py: 8, bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 12 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>{getContent('funders_heading', 'Proudly Supported By')}</Typography>
              <Typography color="text.secondary">{getContent('funders_description', 'Our funders who make this possible')}</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 4 }}>
              {funderLogos.map((logo, idx) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {logo.website_url ? (
                      <a 
                        href={logo.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ display: 'block', opacity: 0.7, transition: 'all 0.3s', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                      >
                        <Box
                          component="img"
                          src={logo.logo_url}
                          alt={logo.name}
                          sx={{ maxHeight: 120, width: '100%', objectFit: 'contain' }}
                        />
                      </a>
                    ) : (
                      <Box
                        component="img"
                        src={logo.logo_url}
                        alt={logo.name}
                        sx={{ maxHeight: 120, width: '100%', objectFit: 'contain', opacity: 0.7 }}
                      />
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Partners Section */}
      <PartnersSection />

      {/* Success Stories Section */}
      <SuccessStoriesCarousel />

      {/* Image Carousel */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Chip
                icon={<Sparkles size={16} className="text-orange-500" />}
                label="Our Community"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  background: 'linear-gradient(to right, rgba(255, 102, 0, 0.1), rgba(244, 63, 94, 0.1), rgba(244, 114, 182, 0.1))',
                  border: '2px solid rgba(255, 102, 0, 0.2)',
                  fontWeight: 600,
                  mb: 2,
                  '& .MuiChip-label': {
                    background: 'linear-gradient(to right, #ff6600, #f43f5e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }
                }}
              />
            </motion.div>
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '3rem' }, fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Experience the <Box component="span" sx={{ background: 'linear-gradient(to right, #ff6600, #f43f5e, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Diverse Youth NI</Box> Journey
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', color: 'text.secondary', maxWidth: 800, mx: 'auto', lineHeight: 1.75 }}>
              See what's happening in our vibrant learning community through inspiring moments and achievements
            </Typography>
          </Box>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ overflow: 'hidden', borderRadius: 6, boxShadow: 6 }} ref={emblaRef}>
              <Box sx={{ display: 'flex' }}>
              {carouselImages.map((img, idx) => (
                <Box key={img.id || idx} sx={{ flex: '0 0 100%', minWidth: 0 }}>
                  <Box sx={{ position: 'relative', aspectRatio: { xs: '4/3', sm: '16/9', lg: '16/9' }, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={img.image_url}
                      alt={`Community ${idx + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transform: 'scale(1)', transition: 'transform 0.7s' }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1), transparent)' }} />
                  </Box>
                </Box>
              ))}
              </Box>
            </Box>
          </Box>
          
          <IconButton
            onClick={() => emblaApi?.scrollPrev()}
            sx={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56,
              height: 56,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e5e7eb',
              boxShadow: 4,
              '&:hover': {
                background: 'linear-gradient(to right, #f97316, #e11d48)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: 6,
                border: 'none',
                '& svg': { color: 'white' }
              },
              transition: 'all 0.3s'
            }}
          >
            <ChevronLeft size={28} color="#1f2937" />
          </IconButton>
          <IconButton
            onClick={() => emblaApi?.scrollNext()}
            sx={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56,
              height: 56,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e5e7eb',
              boxShadow: 4,
              '&:hover': {
                background: 'linear-gradient(to right, #f97316, #e11d48)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: 6,
                border: 'none',
                '& svg': { color: 'white' }
              },
              transition: 'all 0.3s'
            }}
          >
            <ChevronRight size={28} color="#1f2937" />
          </IconButton>
        </motion.div>
      </Container>

      {/* Leadership Programmes CTA */}
      <LeadershipCTASection />

      {/* Solutions Section */}
      <SolutionsSection />

      {/* Programs Section - Dynamic */}
      <ProgramsSection />

      {/* Upcoming Sessions Banner */}
      {user && (
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <UpcomingSessionsWidget user={user} />
        </Container>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <Box component="section" sx={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.02), transparent)', py: 10 }}>
          <Container maxWidth="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
                <Box>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Chip
                      icon={<Award size={16} />}
                      label="Top Picks"
                      sx={{
                        px: 2.5,
                        py: 1.25,
                        borderRadius: 50,
                        background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(217, 70, 239, 0.1))',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        fontWeight: 700,
                        mb: 2,
                        '& .MuiChip-label': {
                          background: 'linear-gradient(to right, #7c3aed, #9333ea, #d946ef)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        },
                        '& .MuiChip-icon': { color: '#8b5cf6' }
                      }}
                    />
                  </motion.div>
                  <Typography variant="h3" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, fontWeight: 700, mb: 1.5 }}>
                    Featured Courses
                  </Typography>
                  <Typography variant="h6" color="text.secondary">Hand-picked by our expert instructors</Typography>
                </Box>
                <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      background: 'linear-gradient(to right, #2563eb, #9333ea, #ec4899)',
                      color: 'white',
                      borderRadius: 50,
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #1d4ed8, #7e22ce, #db2777)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 20px 0 rgba(147, 51, 234, 0.5)',
                      },
                    }}
                  >
                    View all
                  </Button>
                </Link>
              </Box>
            </motion.div>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
              {featuredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Explore Online Courses - LeanDirect Style */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Chip
                icon={<TrendingUp size={16} />}
                label="Popular Courses"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 50,
                  background: 'linear-gradient(to right, rgba(255, 140, 0, 0.1), rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                  border: '2px solid rgba(255, 140, 0, 0.3)',
                  fontWeight: 700,
                  mb: 3,
                  '& .MuiChip-label': {
                    background: 'linear-gradient(to right, #FF8C00, #2563eb, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  },
                  '& .MuiChip-icon': { color: '#FF8C00' }
                }}
              />
            </motion.div>
            <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' }, fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Explore Our Online Courses
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.75 }}>
              Start learning today with our expert-led courses designed for your success
            </Typography>
          </Box>
        </motion.div>
        
        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden', boxShadow: 3, border: 1, borderColor: 'divider' }}>
                <Box sx={{ aspectRatio: '16/9', bgcolor: 'action.hover' }} className="animate-pulse" />
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1 }} className="animate-pulse" />
                  <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '66%' }} className="animate-pulse" />
                  <Box sx={{ height: 48, bgcolor: 'action.hover', borderRadius: 1 }} className="animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : sortedCourses.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {sortedCourses.slice(0, 6).map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(24px)', borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)', '&:hover': { boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)', transform: 'translateY(-12px)' }, transition: 'all 0.3s', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)', zIndex: 1 } }}>
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(37,99,235,0), rgba(147,51,234,0), rgba(236,72,153,0))', '&:hover': { background: 'linear-gradient(to bottom right, rgba(37,99,235,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))' }, transition: 'all 0.5s' }} />
                  <Box sx={{ aspectRatio: '16/9', overflow: 'hidden', background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)', position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={course.thumbnail || (course.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop')}
                      alt={course.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', '&:hover': { transform: 'scale(1.1) rotate(1deg)' }, transition: 'transform 0.7s' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'; }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.3s' }} />
                    {course.category && (
                      <Chip
                        label={course.category}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                          color: '#1f2937',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          boxShadow: 3,
                          '&:hover': { transform: 'scale(1.1)' },
                          transition: 'transform 0.3s'
                        }}
                      />
                    )}
                    {course.lesson_count > 0 && (
                      <Chip
                        icon={<BookOpen size={12} />}
                        label={`${course.lesson_count} lessons`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(8px)',
                          color: '#1f2937',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          boxShadow: 3
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ p: 3, position: 'relative' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 1.5, '&:hover': { color: 'primary.main' }, transition: 'color 0.3s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.5rem' }}>
                      {course.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.875rem', lineHeight: 1.75 }}>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                      {course.duration_hours > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={12} />
                          <Typography variant="caption">{course.duration_hours}h</Typography>
                        </Box>
                      )}
                      {course.enrolled_count > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Users size={12} />
                          <Typography variant="caption">{course.enrolled_count}</Typography>
                        </Box>
                      )}
                      {course.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star size={12} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                          <Typography variant="caption">{course.rating.toFixed(1)}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowRight size={18} />}
                        sx={{
                          background: 'linear-gradient(to right, #003366, #1d4ed8)',
                          color: 'white',
                          fontWeight: 700,
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1rem',
                          boxShadow: 2,
                          '&:hover': {
                            background: 'linear-gradient(to right, #002244, #1e3a8a)',
                            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                          },
                        }}
                      >
                        LEARN MORE
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookOpen size={64} color="rgba(156, 163, 175, 0.5)" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>No courses found</Typography>
            <Typography color="text.secondary">Check back soon for new courses</Typography>
          </Box>
        )}
        
        {sortedCourses.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={24} />}
                sx={{
                  bgcolor: '#003366',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  px: 6,
                  py: 2.5,
                  borderRadius: 50,
                  boxShadow: 4,
                  '&:hover': {
                    bgcolor: '#002244',
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
              >
                View All Courses
              </Button>
            </Link>
            </Box>
          </motion.div>
        )}
      </Container>

      {/* Why Choose Us Section - Dynamic */}
      <FeaturesSection />

      {/* RSS Feed Section */}
      <Box component="section" sx={{ py: 10, background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.05), transparent)' }}>
        <Container maxWidth="xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<Rss size={16} />}
                label="Latest Updates"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 2,
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}
              />
              <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.25rem' }, fontWeight: 700, mb: 2 }}>
                News & Announcements
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '1.125rem' }}>Stay informed with our latest news and updates</Typography>
            </Box>
          </motion.div>
          <RSSFeedWidget limit={6} />
        </Container>
      </Box>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <Box component="section" sx={{ py: 10, bgcolor: '#1e293b' }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Latest Insights"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  color: '#60a5fa',
                  fontWeight: 600,
                  mb: 2,
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}
              />
              <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.25rem' }, fontWeight: 700, color: 'white', mb: 2 }}>
                From Our Blog
              </Typography>
              <Typography sx={{ fontSize: '1.125rem', color: '#94a3b8' }}>Stay updated with the latest news and tips</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
              {blogPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)', '&:hover': { boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)', borderColor: 'rgba(59, 130, 246, 0.5)', transform: 'translateY(-4px)' }, transition: 'all 0.3s', position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.4), transparent)', zIndex: 1 } }}>
                    {post.featured_image && (
                      <Box sx={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          image={post.featured_image}
                          alt={post.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.3s' }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Chip label={post.category} size="small" sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.75rem' }} />
                        {post.read_time_minutes && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8', fontSize: '0.75rem' }}>
                            <Clock size={12} />
                            <Typography variant="caption">{post.read_time_minutes} min read</Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1.5, '&:hover': { color: '#60a5fa' }, transition: 'color 0.3s' }}>
                        {post.title}
                      </Typography>
                      <Typography sx={{ color: '#94a3b8', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {post.author_avatar && (
                            <Avatar src={post.author_avatar} alt={post.author_name} sx={{ width: 32, height: 32 }} />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'white', fontSize: '0.875rem' }}>{post.author_name}</Typography>
                            {post.published_date && (
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(post.published_date).toLocaleDateString()}</Typography>
                            )}
                          </Box>
                        </Box>
                        <ArrowRight size={20} color="#60a5fa" style={{ transition: 'transform 0.3s' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Ecosystem Section - Dynamic */}
      <EcosystemSection />

      {/* New Dynamic Sections */}
      {gallerySection[0] && <ImageGallerySection section={gallerySection[0]} />}
      {videoSection[0] && <VideoEmbedSection section={videoSection[0]} />}
      {teamSection[0] && <TeamMembersSection section={teamSection[0]} />}
      {faqSection[0] && <FAQSection section={faqSection[0]} />}

      {/* Learning Statistics Section */}
      <LearningStatisticsSection />

      {/* Subject Mastery Roadmaps */}
      <SubjectMasteryRoadmaps />

      {/* Instructor Showcase */}
      <InstructorShowcase />

      {/* Free Resources Center */}
      <FreeResourcesCenter />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Student Success Stories */}
      <StudentSuccessStories />

      {/* Real User Reviews Section */}
      {realReviews.length > 0 && (
        <Box component="section" sx={{ py: 10, background: 'linear-gradient(to bottom right, rgba(0,0,0,0.02), rgba(0,0,0,0.05))' }}>
          <Container maxWidth="xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Chip
                    icon={<Star size={16} style={{ fill: '#2563eb' }} />}
                    label="Real Student Reviews"
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 50,
                      background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      fontWeight: 700,
                      mb: 3,
                      '& .MuiChip-label': {
                        background: 'linear-gradient(to right, #2563eb, #6366f1, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }
                    }}
                  />
                </motion.div>
                <Typography variant="h3" sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
                  What our learners say
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Authentic feedback from students currently learning with us
                </Typography>
              </Box>
            </motion.div>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
              {realReviews.slice(0, 3).map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(24px)', position: 'relative', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)', '&:hover': { boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)', transform: 'translateY(-8px)' }, transition: 'all 0.3s', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.6), transparent)', zIndex: 1 } }}>
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))', borderRadius: '50%', filter: 'blur(64px)', '&:hover': { transform: 'scale(1.5)' }, transition: 'transform 0.5s' }} />
                  <Box sx={{ position: 'relative', zIndex: 10 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} style={{ fill: i < review.rating ? '#fbbf24' : 'transparent', color: i < review.rating ? '#fbbf24' : '#d1d5db', transform: i < review.rating ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }} />
                      ))}
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontSize: '4rem', color: 'primary.main', opacity: 0.2, fontFamily: 'serif', mb: 1 }}>"</Typography>
                      <Typography sx={{ color: 'text.primary', lineHeight: 1.75, fontStyle: 'italic' }}>{review.comment}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pt: 2, borderTop: 1, borderColor: 'rgba(0,0,0,0.1)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircle size={12} color="#22c55e" />
                        {review.rating_type === 'course' ? 'Course Graduate' : 'Verified Learner'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <FinalCTASection />
    </Box>
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
    <Box component="section" sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'flex' }}>
          {items.map((item, idx) => (
            <Box key={idx} sx={{ flex: '0 0 100%', minWidth: 0 }}>
              <Box sx={{ position: 'relative', height: { xs: 600, md: 700 } }}>
                <CardMedia
                  component="img"
                  image={item.image_url}
                  alt={item.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,51,102,0.7), rgba(0,51,102,0.5), rgba(0,34,68,0.8))' }} />
                
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Container maxWidth="xl" sx={{ textAlign: 'center', width: '100%' }}>
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 100 }}
                      animate={currentIndex === idx ? { opacity: 1, x: 0 } : currentIndex > idx ? { opacity: 0, x: -100 } : { opacity: 0, x: 100 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {item.badge && (
                        <motion.div 
                          initial={{ x: -50, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        >
                          <Chip
                            label={item.badge}
                            sx={{
                              bgcolor: '#fbbf24',
                              color: '#003366',
                              px: { xs: 3, md: 4 },
                              py: { xs: 1, md: 1.5 },
                              fontSize: { xs: '1rem', md: '1.5rem' },
                              fontWeight: 900,
                              mb: 3,
                              boxShadow: 6,
                              height: 'auto'
                            }}
                          />
                        </motion.div>
                      )}

                      {item.title && (
                        <motion.div 
                          initial={{ x: 80, opacity: 0, rotate: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1, rotate: 1 } : { x: -80, opacity: 0, rotate: 0 }}
                          transition={{ duration: 0.7, delay: 0.15, ease: "easeInOut" }}
                        >
                          <Box sx={{ bgcolor: 'white', display: 'inline-block', px: { xs: 4, md: 6 }, py: { xs: 3, md: 4 }, borderRadius: 6, boxShadow: 6, mb: 3 }}>
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, fontWeight: 900, color: '#003366', letterSpacing: '-0.025em' }}>
                              {item.title}
                            </Typography>
                          </Box>
                        </motion.div>
                      )}

                      {item.subtitle && (
                        <motion.div
                          initial={{ x: -60, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
                        >
                          <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '3rem' }, fontWeight: 800, color: 'white', mb: 2, textShadow: '3px 3px 8px rgba(0,0,0,0.8)' }}>
                            {item.subtitle}
                          </Typography>
                        </motion.div>
                      )}

                      {item.description && (
                        <motion.div
                          initial={{ x: 70, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: -70, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.25, ease: "easeInOut" }}
                        >
                          <Typography sx={{ color: 'white', fontSize: { xs: '1.125rem', md: '1.5rem' }, fontWeight: 700, mt: 3, mb: 4, maxWidth: 800, mx: 'auto', textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}>
                            {item.description}
                          </Typography>
                        </motion.div>
                      )}

                      {item.cta_text && item.cta_link && (
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={currentIndex === idx ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                          transition={{ duration: 0.7, delay: 0.3, ease: "easeInOut" }}
                        >
                          <Link to={item.cta_link} style={{ textDecoration: 'none' }}>
                            <Button
                              variant="contained"
                              size="large"
                              endIcon={<ArrowRight size={32} />}
                              sx={{
                                bgcolor: '#fbbf24',
                                color: '#003366',
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                fontWeight: 900,
                                px: { xs: 5, md: 6 },
                                py: { xs: 2.5, md: 3 },
                                borderRadius: 50,
                                boxShadow: 6,
                                '&:hover': {
                                  bgcolor: '#fcd34d',
                                  transform: 'scale(1.1)',
                                  boxShadow: 8,
                                },
                              }}
                            >
                              {item.cta_text}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  </Container>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <IconButton
        onClick={() => emblaApi?.scrollPrev()}
        sx={{
          position: 'absolute',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 56,
          height: 56,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: 4,
          zIndex: 10,
          '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' },
          transition: 'all 0.3s'
        }}
      >
        <ChevronLeft size={28} color="#1f2937" />
      </IconButton>
      <IconButton
        onClick={() => emblaApi?.scrollNext()}
        sx={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 56,
          height: 56,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: 4,
          zIndex: 10,
          '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' },
          transition: 'all 0.3s'
        }}
      >
        <ChevronRight size={28} color="#1f2937" />
      </IconButton>

      <Box sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1.5, zIndex: 10 }}>
        {items.map((_, idx) => (
          <Box
            key={idx}
            component="button"
            onClick={() => emblaApi?.scrollTo(idx)}
            sx={{
              height: 12,
              borderRadius: 50,
              transition: 'all 0.3s',
              border: 'none',
              cursor: 'pointer',
              ...(currentIndex === idx ? { width: 48, bgcolor: '#fbbf24' } : { width: 12, bgcolor: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } })
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function ProgramsSection() {
  const { data: programs = [] } = useQuery({
    queryKey: ['page-sections-programs'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'programs', is_active: true }, 'order', 20),
  });

  if (programs.length === 0) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Solutions for every age, stage, and transitional moment
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Explore our comprehensive programs designed to support your educational journey
          </Typography>
        </Box>
      </motion.div>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
        {programs.map((program, idx) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s', border: 1, borderColor: 'divider' }}>
              <Box sx={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={program.image_url}
                  alt={program.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>{program.title}</Typography>
                <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.75, fontSize: '1.125rem' }}>
                  {program.description}
                </Typography>
                <Link to={program.link_url} style={{ textDecoration: 'none' }}>
                  <Button sx={{ color: 'primary.main', fontWeight: 600, p: 0, '&:hover': { color: 'primary.dark' } }}>
                    See how →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}

function FeaturesSection() {
  const { data: features = [] } = useQuery({
    queryKey: ['page-sections-features'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'features', is_active: true }, 'order', 20),
  });

  if (features.length === 0) return null;

  return (
    <Box component="section" sx={{ py: 10, background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))' }}>
      <Container maxWidth="xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="Why Choose Us"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 50,
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                color: 'primary.main',
                fontWeight: 600,
                mb: 2,
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            />
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
              Why learners love our platform
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Experience the future of education with our innovative features
            </Typography>
          </Box>
        </motion.div>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 4 }}>
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)', '&:hover': { boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)', transform: 'translateY(-4px)' }, transition: 'all 0.3s', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', zIndex: 1 } }}>
                <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom right, ${feature.color_from}, ${feature.color_to})`, opacity: 0, '&:hover': { opacity: 0.05 }, transition: 'opacity 0.3s' }} />
                <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: `linear-gradient(to bottom right, ${feature.color_from}, ${feature.color_to})`, borderRadius: 3, mb: 2, boxShadow: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>{feature.icon}</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>{feature.title}</Typography>
                <Typography sx={{ lineHeight: 1.75, color: 'text.secondary' }}>{feature.description}</Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function SuccessStoriesCarousel() {
  const { data: sections = [] } = useQuery({
    queryKey: ['page-sections-success-stories'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'success_stories', is_active: true }, 'order', 1),
  });

  if (sections.length === 0) return null;

  const section = sections[0];
  const stories = [1, 2, 3].map(num => ({
    category: section[`story${num}_category`] || '',
    tag: section[`story${num}_tag`] || '',
    tagColor: section[`story${num}_tag_color`] || 'bg-red-600',
    title: section[`story${num}_title`] || '',
    description: section[`story${num}_description`] || '',
    bgColor: section[`story${num}_bg_color`] || 'from-gray-900 via-red-950 to-gray-900'
  })).filter(s => s.title);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <Container maxWidth="xl" sx={{ py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>{section.title || 'Success stories and resources'}</Typography>
          {section.description && (
            <Typography variant="h6" color="text.secondary">{section.description}</Typography>
          )}
        </Box>
      </motion.div>
      
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ overflow: 'hidden' }} ref={emblaRef}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {stories.map((story, idx) => (
              <Box key={idx} sx={{ flex: { xs: '0 0 100%', md: '0 0 45%', lg: '0 0 30%' }, minWidth: 0 }}>
                <motion.div whileHover={{ y: -8 }}>
                  <Box sx={{ position: 'relative', height: 320, borderRadius: 6, overflow: 'hidden', background: `linear-gradient(to bottom right, ${story.bgColor})`, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 6 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 500 }}>{story.category}</Typography>
                        <Chip
                          label={story.tag}
                          size="small"
                          sx={{
                            bgcolor: story.tagColor.replace('bg-', '#'),
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 2, lineHeight: 1.2 }}>
                        {story.title}
                      </Typography>
                      
                      {story.description && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: 1.75 }}>
                          {story.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: 'white',
                        borderWidth: 2,
                        color: 'white',
                        bgcolor: 'transparent',
                        borderRadius: 50,
                        px: 3,
                        '&:hover': {
                          bgcolor: 'white',
                          color: '#1f2937',
                          borderColor: 'white',
                        },
                      }}
                    >
                      Learn more
                    </Button>
                  </Box>
                </motion.div>
              </Box>
            ))}
            </Box>
            </Box>
        
        <IconButton
          onClick={() => emblaApi?.scrollPrev()}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            bgcolor: 'white',
            boxShadow: 4,
            zIndex: 10,
            '&:hover': { transform: 'translateY(-50%) scale(1.1)' },
            transition: 'transform 0.3s'
          }}
        >
          <ChevronLeft size={24} color="#1f2937" />
        </IconButton>
        
        <IconButton
          onClick={() => emblaApi?.scrollNext()}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            bgcolor: 'white',
            boxShadow: 4,
            zIndex: 10,
            '&:hover': { transform: 'translateY(-50%) scale(1.1)' },
            transition: 'transform 0.3s'
          }}
        >
          <ChevronRight size={24} color="#1f2937" />
        </IconButton>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {stories.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              sx={{
                height: 8,
                borderRadius: 50,
                transition: 'all 0.3s',
                border: 'none',
                cursor: 'pointer',
                ...(selectedIndex === idx ? { width: 32, bgcolor: '#f97316' } : { width: 8, bgcolor: '#d1d5db' })
              }}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
}

function SolutionsSection() {
  const { data: sections = [] } = useQuery({
    queryKey: ['page-sections-solutions'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'solutions', is_active: true }, 'order', 1),
  });

  if (sections.length === 0) return null;

  const section = sections[0];
  const cards = [1, 2, 3, 4].map(num => ({
    image: section[`card${num}_image`],
    title: section[`card${num}_title`],
    description: section[`card${num}_description`],
    link: section[`card${num}_link`]
  })).filter(c => c.title);

  return (
    <Container maxWidth="xl" sx={{ py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            {section.title || 'Solutions for every age, stage, and transitional moment'}
          </Typography>
          {section.description && (
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>{section.description}</Typography>
          )}
        </Box>
      </motion.div>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s', border: 1, borderColor: 'divider' }}>
              {card.image && (
                <Box sx={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={card.image}
                    alt={card.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>{card.title}</Typography>
                <Typography sx={{ mb: 2, lineHeight: 1.75, color: 'text.secondary' }}>{card.description}</Typography>
                {card.link && (
                  <Link to={card.link} style={{ textDecoration: 'none' }}>
                    <Button sx={{ color: 'primary.main', fontWeight: 600, p: 0, '&:hover': { color: 'primary.dark' } }}>
                      See how →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}

function LeadershipCTASection() {
  const { data: sections = [] } = useQuery({
    queryKey: ['page-sections-leadership-cta'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'leadership_cta', is_active: true }, 'order', 1),
  });

  if (sections.length === 0) return null;

  const section = sections[0];

  return (
    <Container maxWidth="xl" sx={{ py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 6, background: 'linear-gradient(to bottom right, #7c3aed, #9333ea, #c026d3)', p: 6, boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.5)' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 384, height: 384, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: '50%', filter: 'blur(96px)' }} />

          <Box sx={{ position: 'relative', zIndex: 10, maxWidth: 800 }}>
            {section.badge_text && (
              <Chip
                icon={<ClipboardList size={16} />}
                label={section.badge_text}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 50,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontWeight: 500,
                  mb: 3,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            )}

            <Typography variant="h3" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, fontWeight: 700, color: 'white', mb: 3, lineHeight: 1.2 }}>
              {section.title || 'Join Our Leadership Empowerment Programmes'}
            </Typography>

            {section.description && (
              <Typography sx={{ fontSize: '1.25rem', color: '#e9d5ff', mb: 4, lineHeight: 1.75 }}>
                {section.description}
              </Typography>
            )}

            {section.cta_text && section.cta_link && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Link to={section.cta_link} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      bgcolor: 'white',
                      color: '#7c3aed',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      px: 5,
                      py: 2,
                      borderRadius: 50,
                      boxShadow: '0 10px 30px rgba(255, 255, 255, 0.4)',
                      '&:hover': {
                        bgcolor: '#ede9fe',
                        transform: 'scale(1.05)',
                        boxShadow: '0 15px 40px rgba(139, 92, 246, 0.7)',
                      },
                    }}
                  >
                    {section.cta_text}
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

function FinalCTASection() {
  const { data: sections = [] } = useQuery({
    queryKey: ['page-sections-cta'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'cta_section', is_active: true }, 'order', 1),
  });

  if (sections.length === 0) return null;

  const section = sections[0];

  return (
    <Box component="section" sx={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #581c87)', py: 12 }}>
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 384, height: 384, bgcolor: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(96px)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 384, height: 384, bgcolor: 'rgba(168, 85, 247, 0.2)', borderRadius: '50%', filter: 'blur(96px)' }} />
      </Box>
      
      <Container maxWidth="xl" sx={{ position: 'relative', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {section.badge_text && (
            <Chip
              icon={<Zap size={16} color="#fde047" />}
              label={section.badge_text}
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 50,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                fontWeight: 500,
                mb: 4,
                '& .MuiChip-icon': { color: '#fde047' }
              }}
            />
          )}
          
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', sm: '3rem', lg: '3.75rem' }, fontWeight: 800, color: 'white', mb: 3, lineHeight: 1.2 }}>
            {section.title || 'Ready to Transform'}
            {section.subtitle && (
              <Box component="span" sx={{ display: 'block', mt: 1, background: 'linear-gradient(to right, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {section.subtitle}
              </Box>
            )}
          </Typography>
          
          {section.description && (
            <Typography sx={{ fontSize: '1.25rem', color: '#cbd5e1', mb: 5, maxWidth: 800, mx: 'auto', lineHeight: 1.75 }}>
              {section.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            {section.cta1_text && section.cta1_link && (
              <Link to={section.cta1_link} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    background: 'linear-gradient(to right, #2563eb, #9333ea)',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    px: 5,
                    py: 2,
                    borderRadius: 50,
                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.5)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #1d4ed8, #7e22ce)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 15px 40px rgba(147, 51, 234, 0.7)',
                    },
                  }}
                >
                  {section.cta1_text}
                </Button>
              </Link>
            )}
            {section.cta2_text && section.cta2_link && (
              <Link to={section.cta2_link} style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<TrendingUp size={20} />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    px: 5,
                    py: 2,
                    borderRadius: 50,
                    boxShadow: 4,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {section.cta2_text}
                </Button>
              </Link>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

function EcosystemSection() {
  const { data: ecosystem = [] } = useQuery({
    queryKey: ['page-sections-ecosystem'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'ecosystem', is_active: true }, 'order', 1),
    initialData: []
  });

  if (ecosystem.length === 0) return null;

  const section = ecosystem[0];

  return (
    <Box component="section" sx={{ position: 'relative', py: 10, bgcolor: '#003B5C', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 700, color: 'white', mb: 3 }}>
              {section.title || 'Explore the Instructure ecosystem'}
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', color: '#d1d5db', mb: 4, maxWidth: 1000, mx: 'auto' }}>
              {section.description || 'Our capabilities, partner network, services, and community are here to help you create your ideal edtech environment and deliver on important outcomes.'}
            </Typography>
            {section.cta_text && section.cta_link && (
              <Link to={section.cta_link} style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    px: 4,
                    py: 2,
                    borderRadius: 50,
                    '&:hover': {
                      bgcolor: 'white',
                      color: '#003B5C',
                      borderColor: 'white',
                    },
                  }}
                >
                  {section.cta_text}
                </Button>
              </Link>
            )}
          </Box>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 6, mt: 10 }}>
          {/* Product 1 - Red */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 4 }}>
                <Box sx={{ width: '100%', aspectRatio: '2/1', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Box sx={{ width: 300, height: 150, bgcolor: '#FF6B6B', borderRadius: '150px 150px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '25px' }}>
                    <Box sx={{ width: 240, height: 120, bgcolor: '#EE5A5A', borderRadius: '120px 120px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '50px' }}>
                    <Box sx={{ width: 180, height: 90, bgcolor: '#D84848', borderRadius: '90px 90px 0 0' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <BookOpen size={40} color="white" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>{section.product1_name || 'Canvas'}</Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>{section.product1_subtitle || 'By Instructure'}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>
                {section.product1_desc1 || 'Teaching'}<br />{section.product1_desc2 || 'and learning'}
              </Typography>
            </Box>
          </motion.div>

          {/* Product 2 - Green */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 4 }}>
                <Box sx={{ width: '100%', aspectRatio: '2/1', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Box sx={{ width: 300, height: 150, bgcolor: '#51CF66', borderRadius: '150px 150px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '25px' }}>
                    <Box sx={{ width: 240, height: 120, bgcolor: '#40C057', borderRadius: '120px 120px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '50px' }}>
                    <Box sx={{ width: 180, height: 90, bgcolor: '#2F9E44', borderRadius: '90px 90px 0 0' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <Target size={40} color="white" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>{section.product2_name || 'Mastery'}</Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>{section.product2_subtitle || 'By Instructure'}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>
                {section.product2_desc1 || 'Assessment'}<br />{section.product2_desc2 || 'and growth'}
              </Typography>
            </Box>
          </motion.div>

          {/* Product 3 - Blue */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 4 }}>
                <Box sx={{ width: '100%', aspectRatio: '2/1', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Box sx={{ width: 300, height: 150, bgcolor: '#74C0FC', borderRadius: '150px 150px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '25px' }}>
                    <Box sx={{ width: 240, height: 120, bgcolor: '#4DABF7', borderRadius: '120px 120px 0 0' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: '50px' }}>
                    <Box sx={{ width: 180, height: 90, bgcolor: '#339AF0', borderRadius: '90px 90px 0 0' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <Award size={40} color="white" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>{section.product3_name || 'Parchment'}</Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>{section.product3_subtitle || 'By Instructure'}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>
                {section.product3_desc1 || 'Credentials'}<br />{section.product3_desc2 || 'and opportunity'}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

function PartnersSection() {
  const { data: logos = [] } = useQuery({
    queryKey: ['partner-logos'],
    queryFn: () => base44.entities.PartnerLogo.filter({ type: 'partner', is_active: true }, 'order', 100),
  });

  const [partnersEmblaRef, partnersEmblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1
  }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

  if (logos.length === 0) return null;

  return (
    <Box component="section" sx={{ py: 8, bgcolor: 'rgba(0,0,0,0.02)' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Our Partners</Typography>
          <Typography color="text.secondary">Working together to empower youth</Typography>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ overflow: 'hidden' }} ref={partnersEmblaRef}>
            <Box sx={{ display: 'flex', gap: 4 }}>
              {logos.map((logo, idx) => (
                <Box key={logo.id} sx={{ flex: '0 0 calc(50% - 16px)', minWidth: 0 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                  >
                    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 3, p: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)', '&:hover': { boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)', transform: 'translateY(-4px)' }, transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)' } }}>
                      {logo.website_url ? (
                        <a href={logo.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box
                            component="img"
                            src={logo.logo_url}
                            alt={logo.name}
                            sx={{ maxHeight: { xs: 80, sm: 120, md: 144 }, width: 'auto', objectFit: 'contain', '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.3s' }}
                          />
                        </a>
                      ) : (
                        <Box
                          component="img"
                          src={logo.logo_url}
                          alt={logo.name}
                          sx={{ maxHeight: { xs: 80, sm: 120, md: 144 }, width: 'auto', objectFit: 'contain' }}
                        />
                      )}
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </Box>
          </Box>
          
          <IconButton
            onClick={() => partnersEmblaApi?.scrollPrev()}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translate(-16px, -50%)',
              width: 48,
              height: 48,
              bgcolor: '#2563eb',
              color: 'white',
              boxShadow: 4,
              zIndex: 10,
              '&:hover': { bgcolor: '#1d4ed8', transform: 'translate(-16px, -50%) scale(1.1)' },
              transition: 'all 0.3s'
            }}
          >
            <ChevronLeft size={24} />
          </IconButton>
          <IconButton
            onClick={() => partnersEmblaApi?.scrollNext()}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translate(16px, -50%)',
              width: 48,
              height: 48,
              bgcolor: '#2563eb',
              color: 'white',
              boxShadow: 4,
              zIndex: 10,
              '&:hover': { bgcolor: '#1d4ed8', transform: 'translate(16px, -50%) scale(1.1)' },
              transition: 'all 0.3s'
            }}
          >
            <ChevronRight size={24} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}