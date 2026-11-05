import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Box, Typography } from '@mui/material';
import { Users, TrendingUp, Award, Calendar, ClipboardList, ArrowRight, Home, CheckCircle, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function LeadershipLanding() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleJoinProgramme = async () => {
    if (user) {
      await base44.auth.updateMe({ interest_type: 'leadership' });
      navigate(createPageUrl('HomeLeadership'));
    } else {
      localStorage.setItem('pending_interest', 'leadership');
      base44.auth.redirectToLogin(window.location.origin + createPageUrl('LeadershipLanding'));
    }
  };

  const handleBackToHome = () => {
    sessionStorage.setItem('skip_home_redirect', 'true');
    navigate(createPageUrl('Home'));
  };

  const features = [
  {
    icon: Users,
    title: 'Personal Mentorship',
    description: 'Get paired with experienced mentors who guide your leadership journey',
    gradient: '#4f46e5'
  },
  {
    icon: ClipboardList,
    title: 'Digital Logbooks',
    description: 'Track your progress with easy-to-use digital logbooks and receive feedback',
    gradient: '#4f46e5'
  },
  {
    icon: Calendar,
    title: 'Weekly Activities',
    description: 'Participate in workshops, events, and team-building activities',
    gradient: '#4f46e5'
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Earn recognized certificates upon completing programme milestones',
    gradient: '#4f46e5'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and achieve personal and professional development goals',
    gradient: '#4f46e5'
  },
  {
    icon: TrendingUp,
    title: 'Skills Development',
    description: 'Build leadership, communication, and project management skills',
    gradient: '#4f46e5'
  }];


  const benefits = [
  'Develop essential leadership skills',
  'Build confidence and self-awareness',
  'Network with peers and professionals',
  'Gain practical work experience',
  'Enhance your CV and future prospects',
  'Access ongoing support and guidance'];


  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
            <Box
              sx={{
                position: 'relative',
                color: 'white',
                py: { xs: 12, md: 16 },
                overflow: 'hidden',
                backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/c3924d15a_DSC00124.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 0,
                }
              }}>

              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div

>

                  <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', px: 3, py: 1, borderRadius: '50px', mb: 3 }}>
                      <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>Leadership Development</Typography>
                    </Box>
                    <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: 'white', lineHeight: 1.2 }}>Welcome to Leadership Development Pathway</Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 800, mx: 'auto', fontSize: { xs: '1.1rem', md: '1.5rem' }, color: 'white' }}>
                Develop your skills, track your progress, and become a leader
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  onClick={handleJoinProgramme}
                  className="bg-card text-indigo-700 dark:text-indigo-300 hover:bg-muted px-8 py-3 text-base font-semibold rounded-full"
                  size="lg">

                  {user ? 'View Programs' : 'Sign In to View Programs'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>

        </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div

>

          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}>
            What You'll Experience
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 8 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}

>

                  <Card sx={{ p: 3, height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 3,
                        background: feature.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}>

                      <Icon size={30} color="white" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>);

            })}
          </Box>
        </motion.div>

        {/* Benefits Section */}
        <motion.div

>

          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              boxShadow: 3
            }}>

            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4 }}>
              Why Join Our Programme?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {benefits.map((benefit, index) =>
              <motion.div
                key={benefit}

>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle size={24} color="#10b981" />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </motion.div>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* CTA Section */}
        <motion.div

>

          <Box
            sx={{
              bgcolor: '#4f46e5',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              mt: 8,
              color: 'white'
            }}>

            <Heart size={48} className="mx-auto mb-4" />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.95, maxWidth: 600, mx: 'auto' }}>
              Join hundreds of young leaders who are transforming their communities and building brighter futures.
            </Typography>
            <Button
              onClick={handleJoinProgramme}
              className="bg-card text-indigo-700 dark:text-indigo-300 hover:bg-muted px-8 py-6 text-lg"
              size="lg">

              {user ? 'Join Programme Now' : 'Sign In to Get Started'}
              <ArrowRight className="ml-2" />
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>);

}