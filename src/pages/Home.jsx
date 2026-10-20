import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Button, IconButton, Card, CardContent, CardMedia, Typography, Chip, Box, Container, Avatar } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RssFeedIcon from '@mui/icons-material/RssFeed';
// Aliases keep the rest of the JSX unchanged
const ArrowRight = (props) => <ArrowForwardIcon sx={{ fontSize: props.size || 20 }} {...props} />;
const Sparkles = (props) => <AutoAwesomeIcon sx={{ fontSize: props.size || 16, color: props.color }} {...props} />;
const Users = (props) => <PeopleIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const Star = (props) => <StarIcon sx={{ fontSize: props.size || 16, color: props.color, ...(props.style || {}) }} {...props} />;
const Award = (props) => <EmojiEventsIcon sx={{ fontSize: props.size || 16, color: props.color }} {...props} />;
const ChevronLeft = (props) => <ChevronLeftIcon sx={{ fontSize: props.size || 24, color: props.color }} {...props} />;
const ChevronRight = (props) => <ChevronRightIcon sx={{ fontSize: props.size || 24, color: props.color }} {...props} />;
const BookOpen = (props) => <MenuBookIcon sx={{ fontSize: props.size || 16, color: props.color }} {...props} />;
const TrendingUp = (props) => <TrendingUpIcon sx={{ fontSize: props.size || 16, color: props.color }} {...props} />;
const Zap = (props) => <BoltIcon sx={{ fontSize: props.size || 16, color: props.color }} {...props} />;
const ClipboardList = (props) => <AssignmentIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const Brain = (props) => <AutoAwesomeIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const Video = (props) => <AutoAwesomeIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const Target = (props) => <EmojiEventsIcon sx={{ fontSize: props.size || 40, color: props.color }} {...props} />;
const Play = (props) => <ArrowForwardIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const CheckCircle = (props) => <CheckCircleIcon sx={{ fontSize: props.size || 11, color: props.color }} {...props} />;
const Calendar = (props) => <AccessTimeIcon sx={{ fontSize: props.size || 16 }} {...props} />;
const Clock = (props) => <AccessTimeIcon sx={{ fontSize: props.size || 12 }} {...props} />;
const Rss = (props) => <RssFeedIcon sx={{ fontSize: props.size || 16 }} {...props} />;
import { motion } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import PageSEO from '@/components/seo/PageSEO';
import RedesignHero from '@/components/home/RedesignHero';
import HomeQuickStart from '@/components/home/HomeQuickStart';
import HomeCommunity from '@/components/home/HomeCommunity';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

console.log('[Testing] Home module loaded');

// Removed unused eager imports: CategoryFilter, SearchBar, WeatherWidget, ClockWidget,
// QuoteWidget, StudentOfMonthWidget, CalendarWidget, UpcomingLessonsWidget,
// FactOfDayWidget, EnhancedFactOfDay, RSSNotificationsWidget, SocialFeedWidget,
// DiscoverWidget, WidgetCustomizer, WidgetSkeleton, ContinueLearningSection,
// QuickStatsCard, TrendingCoursesCarousel, CategoryQuickAccess (none rendered in JSX)

// Lazy-load below-the-fold heavy components
const UpcomingSessionsWidget = lazy(() => import('@/components/sessions/UpcomingSessionsWidget'));
const RSSFeedWidget = lazy(() => import('@/components/feed/RSSFeedWidget'));
const CommunityCarousel = lazy(() => import('@/components/home/CommunityCarousel'));
const ImageGallerySection = lazy(() => import('@/components/sections/ImageGallerySection'));
const VideoEmbedSection = lazy(() => import('@/components/sections/VideoEmbedSection'));
const TeamMembersSection = lazy(() => import('@/components/sections/TeamMembersSection'));
const FAQSection = lazy(() => import('@/components/sections/FAQSection'));
const LearningStatisticsSection = lazy(() => import('@/components/home/LearningStatisticsSection'));
const SubjectMasteryRoadmaps = lazy(() => import('@/components/home/SubjectMasteryRoadmaps'));
const InstructorShowcase = lazy(() => import('@/components/home/InstructorShowcase'));
const FreeResourcesCenter = lazy(() => import('@/components/home/FreeResourcesCenter'));
const CreationHubSection = lazy(() => import('@/components/home/CreationHubSection'));
const AboutUsSection = lazy(() => import('@/components/home/AboutUsSection.jsx'));
const StudentSuccessStories = lazy(() => import('@/components/home/StudentSuccessStories'));

// Simple fallback for lazy sections
const SectionFallback = () => <Box sx={{ height: 200 }} />;

// Hook to observe when an element enters the viewport
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px', ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const queryClient = useQueryClient();
  usePullToRefresh(() => {
    queryClient.invalidateQueries();
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['home-courses'],
    queryFn: () => base44.entities.Course.list('-enrolled_count', 50),
    staleTime: 5 * 60 * 1000,
  });

  const { data: carouselImages = [] } = useQuery({
    queryKey: ['carousel-images', 'main'],
    queryFn: () => base44.entities.CarouselImage.filter({ carousel_type: 'main', is_active: true }, 'order', 50),
    staleTime: 10 * 60 * 1000,
  });

  const { data: heroImages = [] } = useQuery({
    queryKey: ['carousel-images', 'hero'],
    queryFn: () => base44.entities.CarouselImage.filter({ carousel_type: 'hero', is_active: true }, 'order', 10),
    staleTime: 10 * 60 * 1000,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts-home'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 3),
    staleTime: 5 * 60 * 1000,
  });

  const { data: realReviews = [] } = useQuery({
    queryKey: ['home-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 6),
    staleTime: 5 * 60 * 1000,
  });

  // Consolidated page sections query (one round-trip)
  const { data: allPageSections = [] } = useQuery({
    queryKey: ['page-sections-home-all'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', is_active: true }, 'order', 100),
    staleTime: 10 * 60 * 1000,
  });

  const gallerySection = allPageSections.filter(s => s.section_type === 'gallery').slice(0, 1);
  const videoSection = allPageSections.filter(s => s.section_type === 'video').slice(0, 1);
  const teamSection = allPageSections.filter(s => s.section_type === 'team').slice(0, 1);
  const faqSection = allPageSections.filter(s => s.section_type === 'faq').slice(0, 1);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const visibleCourses = courses.filter(c => c.is_published !== false);
  const featuredCourses = visibleCourses.filter(c => c.is_featured).slice(0, 3);
  const sortedCourses = [...visibleCourses].sort((a, b) => {
    if (sortBy === 'popular') return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    return 0;
  }).filter(c => selectedCategory === 'all' || c.category === selectedCategory);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageSEO pageName="Learning Hub" />
      {/* Redesign: hero, stats, popular courses, how it works, community, partner banner.
          The old section components below are kept unused for now, so any of them can be restored. */}
      <RedesignHero images={heroImages.length > 0 ? heroImages : carouselImages} user={user} />
      <HomeQuickStart courses={visibleCourses} />
      <HomeCommunity photos={carouselImages} reviews={realReviews} posts={blogPosts} />
    </Box>
  );
}

function AfterschoolHero() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content-hero'],
    queryFn: () => base44.entities.SiteContent.filter({ section: 'home' }, 'key', 50),
  });

  const get = (key, fallback) => siteContent.find(c => c.key === key)?.value || fallback;

  const badge = get('hero_online_learning', 'ONLINE LEARNING');
  const title = get('hero_afterschool_hours', 'Afterschool Hours');
  const subtitle = get('hero_online_quizzes', 'Online Quizzes');
  const freeAccess = get('hero_free_access', 'FREE ACCESS');
  const allCourses = get('hero_all_courses', 'ALL COURSES');
  const description = get('hero_description', 'Access them at the comfort of your home');
  const buttonText = get('hero_button', 'BROWSE COURSES');
  const bgImage = get('hero_background_image', '');

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 500, md: 600 },
        background: 'linear-gradient(135deg, #0b2f5c 0%, #0d2e6e 40%, #1a1060 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        py: 10,
      }}
    >
      {/* Background image overlay */}
      {bgImage && (
        <>
          <Box component="img" src={bgImage} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,51,102,0.75) 0%, rgba(13,46,110,0.65) 100%)', zIndex: 1 }} />
        </>
      )}

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Chip
            icon={<Sparkles size={16} color="#0b2f5c" />}
            label={badge}
            sx={{ bgcolor: '#fbbf24', color: '#0b2f5c', fontWeight: 800, fontSize: '0.875rem', px: 2, py: 1, mb: 3, height: 'auto', letterSpacing: 1, '& .MuiChip-icon': { color: '#0b2f5c' } }}
          />
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Box sx={{ bgcolor: 'white', display: 'inline-block', px: { xs: 4, md: 6 }, py: { xs: 2.5, md: 4 }, borderRadius: 5, boxShadow: 8, mb: 4 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 900, background: 'linear-gradient(to right, #0b2f5c, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {title}
            </Typography>
          </Box>
        </motion.div>

        {/* Subtitle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>{subtitle}</Typography>
        </motion.div>

        {/* FREE ACCESS box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Box sx={{ background: 'linear-gradient(to right, #fbbf24, #f59e0b)', borderRadius: 3, display: 'inline-block', px: { xs: 5, md: 7 }, py: 2.5, mb: 4, boxShadow: '0 8px 30px rgba(251,191,36,0.4)' }}>
            <Typography variant="h4" sx={{ color: '#0b2f5c', fontWeight: 900, letterSpacing: 1 }}>{freeAccess}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Zap size={16} color="#0b2f5c" />
              <Typography sx={{ color: '#0b2f5c', fontWeight: 700, fontSize: '0.875rem', letterSpacing: 2 }}>{allCourses}</Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '1.125rem', mb: 5 }}>{description}</Typography>
        </motion.div>

        {/* CTA Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={20} />}
              sx={{ bgcolor: '#fbbf24', color: '#0b2f5c', fontWeight: 900, fontSize: '1.1rem', px: 6, py: 2, borderRadius: 50, boxShadow: '0 8px 30px rgba(251,191,36,0.5)', '&:hover': { bgcolor: '#fcd34d', transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(251,191,36,0.6)' } }}
            >
              {buttonText}
            </Button>
          </Link>
        </motion.div>
      </Container>
    </Box>
  );
}

// Carousel with the Afterschool write-up always displayed on top, images slide in background
function HeroCarouselWithWriteup({ images }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content-hero'],
    queryFn: () => base44.entities.SiteContent.filter({ section: 'home' }, 'key', 50),
  });

  const get = (key, fallback) => siteContent.find(c => c.key === key)?.value || fallback;

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrentIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <Box component="section" sx={{ position: 'relative', minHeight: { xs: 500, md: 620 }, overflow: 'hidden' }}>
      {/* Background image carousel */}
      <Box ref={emblaRef} sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {images.map((img, idx) => (
            <Box key={idx} sx={{ flex: '0 0 100%', minWidth: 0, position: 'relative' }}>
              <CardMedia
                component="img"
                image={img.image_url}
                alt=""
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Dark overlay */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,51,102,0.72) 0%, rgba(13,46,110,0.60) 40%, rgba(0,34,68,0.75) 100%)', zIndex: 1 }} />

      {/* Carousel nav arrows */}
      <IconButton onClick={() => emblaApi?.scrollPrev()} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.85)', zIndex: 10, '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' }, transition: 'all 0.3s' }}>
        <ChevronLeft size={26} color="#1f2937" />
      </IconButton>
      <IconButton onClick={() => emblaApi?.scrollNext()} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.85)', zIndex: 10, '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' }, transition: 'all 0.3s' }}>
        <ChevronRight size={26} color="#1f2937" />
      </IconButton>

      {/* Dot indicators */}
      <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1, zIndex: 10 }}>
        {images.map((_, idx) => (
          <Box key={idx} component="button" onClick={() => emblaApi?.scrollTo(idx)} sx={{ height: 10, borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'all 0.3s', ...(currentIndex === idx ? { width: 40, bgcolor: '#fbbf24' } : { width: 10, bgcolor: 'rgba(255,255,255,0.55)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }) }} />
        ))}
      </Box>

      {/* Write-up overlay - always visible, animated on hover */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', py: { xs: 8, md: 12 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div whileHover={{ scale: 1.1, rotate: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Chip
              icon={<Sparkles size={16} color="#0b2f5c" />}
              label={get('hero_online_learning', 'ONLINE LEARNING')}
              sx={{ bgcolor: '#fbbf24', color: '#0b2f5c', fontWeight: 800, fontSize: '0.875rem', px: 2, py: 1, mb: 3, height: 'auto', letterSpacing: 1, cursor: 'default', '& .MuiChip-icon': { color: '#0b2f5c' } }}
            />
          </motion.div>
        </motion.div>

        {/* Title box */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <motion.div whileHover={{ scale: 1.04, rotate: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <Box sx={{ bgcolor: 'white', display: 'inline-block', px: { xs: 4, md: 6 }, py: { xs: 2.5, md: 4 }, borderRadius: 5, boxShadow: 8, mb: 4, cursor: 'default' }}>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 900, background: 'linear-gradient(to right, #0b2f5c, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {get('hero_afterschool_hours', 'Afterschool Hours')}
              </Typography>
            </Box>
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <motion.div whileHover={{ scale: 1.06 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3, textShadow: '2px 2px 8px rgba(0,0,0,0.7)', cursor: 'default' }}>
              {get('hero_online_quizzes', 'Online Quizzes')}
            </Typography>
          </motion.div>
        </motion.div>

        {/* FREE ACCESS box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <motion.div whileHover={{ scale: 1.07, y: -4 }} transition={{ type: 'spring', stiffness: 250 }}>
            <Box sx={{ background: 'linear-gradient(to right, #fbbf24, #f59e0b)', borderRadius: 3, display: 'inline-block', px: { xs: 5, md: 7 }, py: 2.5, mb: 4, boxShadow: '0 8px 30px rgba(251,191,36,0.5)', cursor: 'default' }}>
              <Typography variant="h4" sx={{ color: '#0b2f5c', fontWeight: 900, letterSpacing: 1 }}>{get('hero_free_access', 'FREE ACCESS')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Zap size={16} color="#0b2f5c" />
                <Typography sx={{ color: '#0b2f5c', fontWeight: 700, fontSize: '0.875rem', letterSpacing: 2 }}>{get('hero_all_courses', 'ALL COURSES')}</Typography>
              </Box>
            </Box>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: '1.125rem', mb: 5, textShadow: '1px 1px 4px rgba(0,0,0,0.6)', cursor: 'default' }}>
            {get('hero_description', 'Access them at the comfort of your home')}
          </Typography>
        </motion.div>

        {/* CTA Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{ bgcolor: '#fbbf24', color: '#0b2f5c', fontWeight: 900, fontSize: '1.1rem', px: 6, py: 2, borderRadius: 50, boxShadow: '0 8px 30px rgba(251,191,36,0.6)', '&:hover': { bgcolor: '#fcd34d' } }}
              >
                {get('hero_button', 'BROWSE COURSES')}
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </Container>
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
                              color: '#0b2f5c',
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
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, fontWeight: 900, color: '#0b2f5c', letterSpacing: '-0.025em' }}>
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
                                color: '#0b2f5c',
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

  const section = sections[0] || {};
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

  if (sections.length === 0) return null;

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