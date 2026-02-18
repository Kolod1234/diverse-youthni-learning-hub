import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Container, Typography, Box, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { BookOpen, GraduationCap, Video, TrendingUp, ArrowRight, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import SearchBar from '@/components/courses/SearchBar';
import PathwayOnboarding from '@/components/onboarding/PathwayOnboarding';

export default function HomeLearning() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Show onboarding if not completed
        if (!userData?.onboarding_completed) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }, '-updated_date', 10),
    enabled: !!user,
  });

  const filteredCourses = courses.filter(course => 
    !searchQuery || 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCourses = filteredCourses.filter(c => c.is_featured).slice(0, 3);
  const popularCourses = filteredCourses.slice(0, 6);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Onboarding Flow */}
      {showOnboarding && (
        <PathwayOnboarding
          pathway="learning"
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Hero Section */}
      <Box sx={{ position: 'relative', background: 'linear-gradient(to bottom right, #2563eb, #1e40af, #1e3a8a)', py: 12, overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Chip
                icon={<GraduationCap size={20} />}
                label="GCSE & A-Level Learning"
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '1rem'
                }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 800, mb: 3 }}>
                Excel in Your Studies
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
                Access comprehensive courses, interactive lessons, and expert support
              </Typography>
              <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    bgcolor: 'white',
                    color: '#2563eb',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 50,
                    '&:hover': { bgcolor: '#dbeafe', transform: 'scale(1.05)' }
                  }}
                >
                  Browse Courses
                </Button>
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Search Bar */}
      <Box sx={{ position: 'sticky', top: 64, zIndex: 40, bgcolor: 'background.paper', boxShadow: 2, py: 2 }}>
        <Container maxWidth="xl">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </Container>
      </Box>

      {/* Continue Learning */}
      {enrollments.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Continue Learning</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {enrollments.slice(0, 3).map((enrollment) => {
              const course = courses.find(c => c.id === enrollment.course_id);
              if (!course) return null;
              return (
                <Card key={enrollment.id} sx={{ boxShadow: 3 }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
                    alt={course.title}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{course.title}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ bgcolor: '#e5e7eb', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: '#2563eb', height: '100%', width: `${enrollment.progress_percent || 0}%` }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{enrollment.progress_percent || 0}% Complete</Typography>
                    </Box>
                    <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="contained" fullWidth>Continue</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Container>
      )}

      {/* Quick Access */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <BookOpen size={48} color="#2563eb" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My Courses</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Access your enrolled courses</Typography>
              <Link to={createPageUrl('Dashboard')} style={{ textDecoration: 'none' }}>
                <Button variant="contained">View Dashboard</Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <Video size={48} color="#7c3aed" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Live Sessions</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Join interactive classes</Typography>
              <Link to={createPageUrl('Sessions')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}>
                  View Sessions
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <BookOpen size={48} color="#059669" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Library</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Access study materials</Typography>
              <Link to={createPageUrl('Library')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
                  Browse Library
                </Button>
              </Link>
            </Card>
          </motion.div>
        </Box>
      </Container>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Featured Courses</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Box>
        </Container>
      )}

      {/* Popular Courses */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Popular Courses</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {popularCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Box>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              sx={{ px: 5, py: 2, fontSize: '1.125rem', fontWeight: 700, borderRadius: 50 }}
            >
              View All Courses
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}