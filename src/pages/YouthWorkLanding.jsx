import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Box, Typography } from '@mui/material';
import { 
  Users, Briefcase, Award, Target, TrendingUp, Heart, 
  BookOpen, CheckCircle, ArrowRight, Star, Calendar, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function YouthWorkLanding() {
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

  const { data: testimonials = [] } = useQuery({
    queryKey: ['youth-work-testimonials'],
    queryFn: () => base44.entities.Review.filter({ rating_type: 'course' }, '-created_date', 100),
  });

  const handleJoinYouthWork = async () => {
    if (user) {
      await base44.auth.updateMe({ interest_type: 'youth_work' });
      navigate(createPageUrl('HomeYouthWork'));
    } else {
      localStorage.setItem('pending_interest', 'youth_work');
      base44.auth.redirectToLogin(window.location.origin + createPageUrl('YouthWorkLanding'));
    }
  };

  const features = [
    {
      icon: Award,
      title: 'OCN Qualifications',
      description: 'Earn nationally recognized Open College Network qualifications',
      gradient: '#4f46e5'
    },
    {
      icon: BookOpen,
      title: 'Flexible Learning',
      description: 'Study at your own pace with interactive workbooks and resources',
      gradient: '#4f46e5'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Learn alongside peers and get guidance from experienced mentors',
      gradient: '#4f46e5'
    },
    {
      icon: Briefcase,
      title: 'Career Ready',
      description: 'Develop practical skills valued by employers across industries',
      gradient: '#4f46e5'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress reports',
      gradient: '#4f46e5'
    },
    {
      icon: CheckCircle,
      title: 'Competency Based',
      description: 'Demonstrate real-world skills through practical assessments',
      gradient: '#4f46e5'
    }
  ];

  const qualifications = [
    {
      level: 'Entry Level',
      title: 'Youth Work Essentials',
      duration: '8-10 weeks',
      description: 'Perfect for beginners. Learn fundamental youth work principles and skills.',
      skills: ['Communication', 'Team Work', 'Basic Youth Support']
    },
    {
      level: 'Level 2',
      title: 'Youth Work Practice',
      duration: '12-16 weeks',
      description: 'Build practical competencies in youth engagement and support.',
      skills: ['Program Planning', 'Youth Engagement', 'Safeguarding']
    },
    {
      level: 'Level 3',
      title: 'Youth Work Leadership',
      duration: '16-20 weeks',
      description: 'Develop advanced leadership and management capabilities.',
      skills: ['Team Leadership', 'Project Management', 'Mentoring']
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Enroll',
      description: 'Sign up for your chosen qualification level'
    },
    {
      number: '2',
      title: 'Learn',
      description: 'Complete interactive lessons and workbooks at your pace'
    },
    {
      number: '3',
      title: 'Practice',
      description: 'Demonstrate competencies through practical activities'
    },
    {
      number: '4',
      title: 'Achieve',
      description: 'Earn your OCN qualification and certificate'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 12, md: 16 },
          overflow: 'hidden',
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/adfaefdeb_PXL_20240718_134233296PORTRAIT.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(102, 126, 234, 0.75)',
            zIndex: 0,
          }
        }}>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box sx={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', px: 3, py: 1, borderRadius: '50px', mb: 3 }}>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>OCN Qualifications</Typography>
              </Box>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: 'white', lineHeight: 1.2, textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.5)' }}>
                Transform Lives Through Youth Work
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', fontSize: { xs: '1.1rem', md: '1.5rem' }, color: 'white', textShadow: '0 2px 12px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.4)' }}>
                Earn nationally recognized OCN qualifications and develop your skills in youth engagement, support, and leadership
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  onClick={handleJoinYouthWork}
                  className="bg-card text-indigo-700 dark:text-indigo-300 hover:bg-muted px-8 py-3 text-base font-semibold rounded-full"
                  size="lg">
                  {user ? 'Start Learning Now' : 'Get Started'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl('YouthWork'))}
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm px-8 py-3 text-base font-semibold rounded-full border border-white/30"
                  size="lg">
                  Learn More
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>

          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}>
            Why Choose Youth Work Qualifications?
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 8 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}>

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
                </motion.div>
              );
            })}
          </Box>
        </motion.div>
      </Container>

      {/* Qualifications Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}>

            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}>
              Available Qualifications
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
              {qualifications.map((qual, index) => (
                <motion.div
                  key={qual.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}>

                  <Card sx={{ 
                    p: 4, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'inline-block', px: 2, py: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {qual.level}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {qual.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
                      <Calendar size={16} />
                      <Typography variant="sm">{qual.duration}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                      {qual.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 2 }}>
                        Key Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {qual.skills.map(skill => (
                          <Box
                            key={skill}
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              bgcolor: 'primary.main',
                              color: 'white',
                            }}>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              {skill}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Button
                      fullWidth
                      onClick={handleJoinYouthWork}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Enroll Now
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>

          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}>
            How It Works
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}>

                <Card sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.5rem'
                    }}>
                    {step.number}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}>

            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}>
              What Learners Say
            </Typography>

            {testimonials.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                {testimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}>

                  <Card sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {[...Array(Math.round(testimonial.rating))].map((_, i) => (
                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 4, fontStyle: 'italic', color: 'text.secondary' }}>
                      "{testimonial.comment}"
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {testimonial.user_name || 'Anonymous'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.instructor_name || 'Learner'}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  Be the first to share your experience with our Youth Work qualification!
                </Typography>
              </Box>
            )}
          </motion.div>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          bgcolor: '#4f46e5',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}>

        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}>

            <Heart size={48} className="mx-auto mb-4" />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Make an Impact?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.95, maxWidth: 600, mx: 'auto' }}>
              Start your OCN Youth Work qualification journey today and unlock your potential in youth engagement and support.
            </Typography>
            <Button
              onClick={handleJoinYouthWork}
              className="bg-card text-indigo-700 dark:text-indigo-300 hover:bg-muted px-8 py-6 text-lg"
              size="lg">
              Enroll Now & Get Started
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}