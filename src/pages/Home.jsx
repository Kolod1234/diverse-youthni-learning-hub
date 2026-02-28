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
import CommunityCarousel from '@/components/home/CommunityCarousel';
...
        <CommunityCarousel images={carouselImages} />
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