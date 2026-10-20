import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button, Container, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import { Eye, GraduationCap, Users, BookOpen, ArrowRight, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import PathwayOnboarding from '@/components/onboarding/PathwayOnboarding';

export default function HomeGuest() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Onboarding Flow */}
      {showOnboarding && (
        <PathwayOnboarding
          pathway="guest"
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Hero Section */}
      <Box sx={{ position: 'relative', bgcolor: '#0b2f5c', py: 12, overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Chip
                icon={<Eye size={20} />}
                label="Guest Preview"
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
                Welcome to Diverse Youth NI
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
                Explore our platform - Sign in to unlock full access
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  onClick={() => base44.auth.redirectToLogin()}
                  sx={{
                    bgcolor: 'background.paper',
                    color: '#1e293b',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 50,
                    '&:hover': { bgcolor: '#f1f5f9', transform: 'scale(1.05)' }
                  }}
                >
                  Sign In
                </Button>
                <Link to={createPageUrl('WelcomeCover')} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 5,
                      py: 2,
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      borderRadius: 50,
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Choose Your Path
                  </Button>
                </Link>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Overview */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
          What We Offer
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s', height: '100%' }}>
              <Users size={64} color="#7c3aed" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Leadership Programmes</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Mentoring, activities, logbooks, and personal development opportunities to help you grow as a leader
              </Typography>
              <Chip label="Sign in to access" size="small" />
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s', height: '100%' }}>
              <GraduationCap size={64} color="#2563eb" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>GCSE & A-Level</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Comprehensive courses, interactive lessons, quizzes, past papers, and live sessions with expert tutors
              </Typography>
              <Chip label="Sign in to access" size="small" />
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s', height: '100%' }}>
              <Award size={64} color="#059669" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Youth Work OCN</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                OCN qualifications, structured workbooks, attendance tracking, and certification support
              </Typography>
              <Chip label="Sign in to access" size="small" />
            </Card>
          </motion.div>
        </Box>
      </Container>

      {/* Limited Preview */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', py: 10 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Limited Preview Available
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
            <Card sx={{ p: 4, boxShadow: 3 }}>
              <BookOpen size={40} color="#2563eb" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Browse Courses</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                View available GCSE and A-Level courses (sign in to enroll)
              </Typography>
              <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" endIcon={<ArrowRight />}>Explore Courses</Button>
              </Link>
            </Card>

            <Card sx={{ p: 4, boxShadow: 3 }}>
              <Users size={40} color="#7c3aed" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>View Programmes</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                See our leadership development programmes (sign in to participate)
              </Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" endIcon={<ArrowRight />}>View Programmes</Button>
              </Link>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', p: 6, bgcolor: 'primary.main', borderRadius: 4, color: 'white' }}>
          <Sparkles size={48} style={{ marginBottom: 16 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Ready to Get Started?</Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Sign in to choose your pathway and access all features
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowRight />}
            onClick={() => base44.auth.redirectToLogin()}
            sx={{
              bgcolor: 'background.paper',
              color: 'primary.main',
              px: 5,
              py: 2,
              fontSize: '1.125rem',
              fontWeight: 700,
              borderRadius: 50,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Sign In Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}