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
      gradient: 'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)',
    },
    {
      icon: ClipboardList,
      title: 'Digital Logbooks',
      description: 'Track your progress with easy-to-use digital logbooks and receive feedback',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      icon: Calendar,
      title: 'Weekly Activities',
      description: 'Participate in workshops, events, and team-building activities',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      icon: Award,
      title: 'Certification',
      description: 'Earn recognized certificates upon completing programme milestones',
      gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and achieve personal and professional development goals',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)',
    },
    {
      icon: TrendingUp,
      title: 'Skills Development',
      description: 'Build leadership, communication, and project management skills',
      gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    },
  ];

  const benefits = [
    'Develop essential leadership skills',
    'Build confidence and self-awareness',
    'Network with peers and professionals',
    'Gain practical work experience',
    'Enhance your CV and future prospects',
    'Access ongoing support and guidance',
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/f78692c3c_PXL_20240718_134233296PORTRAIT.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3.5rem' } }}>
                Leadership Development Programme
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 800, mx: 'auto', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                Unlock your potential and become the leader you're meant to be
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  onClick={handleJoinProgramme}
                  className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-6 text-lg"
                  size="lg"
                >
                  {user ? 'Join Programme' : 'Sign In to Join'}
                  <ArrowRight className="ml-2" />
                </Button>
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  size="lg"
                >
                  <Home className="mr-2" />
                  Back to Homepage
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            bgcolor: 'white',
            opacity: 0.1,
            borderRadius: '50%',
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
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
                        mb: 2,
                      }}
                    >
                      <Icon size={30} color="white" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              boxShadow: 3,
            }}
          >
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4 }}>
              Why Join Our Programme?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle size={24} color="#10b981" />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              mt: 8,
              color: 'white',
            }}
          >
            <Heart size={48} className="mx-auto mb-4" />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.95, maxWidth: 600, mx: 'auto' }}>
              Join hundreds of young leaders who are transforming their communities and building brighter futures.
            </Typography>
            <Button
              onClick={handleJoinProgramme}
              className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-6 text-lg"
              size="lg"
            >
              {user ? 'Join Programme Now' : 'Sign In to Get Started'}
              <ArrowRight className="ml-2" />
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}