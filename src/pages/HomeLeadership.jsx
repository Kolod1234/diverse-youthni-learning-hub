import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Container, Typography, Box, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { ClipboardList, Award, Users, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import PathwayOnboarding from '@/components/onboarding/PathwayOnboarding';

export default function HomeLeadership() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [leadershipEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

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

  const { data: leadershipCarouselImages = [] } = useQuery({
    queryKey: ['leadership-carousel-images'],
    queryFn: async () => {
      const images = await base44.entities.CarouselImage.list('-created_date', 1000);
      return images.filter((img) => img.carousel_type === 'leadership' && img.is_active !== false).
      sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['active-programs'],
    queryFn: () => base44.entities.Program.filter({ status: 'active' }, '-created_date', 10)
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Onboarding Flow */}
      {showOnboarding &&
      <PathwayOnboarding
        pathway="leadership"
        onComplete={() => setShowOnboarding(false)} />

      }

      {/* Hero Section */}
      <Box sx={{ position: 'relative', bgcolor: '#4f46e5', py: 12, overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <motion.div

>

            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Chip
                icon={<Award size={20} />}
                label="Leadership Development"
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '1rem'
                }} />

              <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 800, mb: 3 }} className="MuiTypography-root MuiTypography-h2 css-19dgo2p-MuiTypography-root">Welcome to Leadership Development Pathway

              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
                Develop your skills, track your progress, and become a leader
              </Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    bgcolor: 'background.paper',
                    color: '#4f46e5',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 50,
                    '&:hover': { bgcolor: '#f3e8ff', transform: 'scale(1.05)' }
                  }}>

                  View Programs
                </Button>
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Leadership Carousel */}
      {leadershipCarouselImages.length > 0 &&
      <Container maxWidth="xl" sx={{ py: 8 }}>
          <Box sx={{ overflow: 'hidden', borderRadius: 4, boxShadow: 6 }} ref={leadershipEmblaRef}>
            <Box sx={{ display: 'flex' }}>
              {leadershipCarouselImages.map((img, idx) =>
            <Box key={img.id || idx} sx={{ flex: '0 0 100%', minWidth: 0 }}>
                  <Box sx={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                    <CardMedia
                  component="img"
                  image={img.image_url}
                  alt={`Leadership ${idx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  </Box>
                </Box>
            )}
            </Box>
          </Box>
        </Container>
      }

      {/* Quick Actions */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>Your Leadership Journey</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <ClipboardList size={48} color="#7c3aed" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Programs</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Join and track your leadership programs</Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#6d28d9' } }}>
                  View Programs
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <Calendar size={48} color="#9333ea" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Activities</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>View upcoming events and activities</Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#7e22ce' } }}>
                  View Activities
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <Users size={48} color="#c026d3" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My Logbooks</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Track your weekly progress</Typography>
              <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#c026d3', '&:hover': { bgcolor: '#a21caf' } }}>
                  View Logbooks
                </Button>
              </Link>
            </Card>
          </motion.div>
        </Box>
      </Container>

      {/* Active Programs */}
      {programs.length > 0 &&
      <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Active Programs</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
            {programs.map((program) =>
          <Card key={program.id} sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{program.name}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>{program.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Chip label={program.status} color="success" size="small" />
                    {program.coordinator && <Chip label={`Led by ${program.coordinator}`} size="small" />}
                  </Box>
                  <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                    <Button endIcon={<ArrowRight />}>View Details</Button>
                  </Link>
                </CardContent>
              </Card>
          )}
          </Box>
        </Container>
      }
    </Box>);

}