import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Container, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import { Award, BookOpen, CheckCircle, Users, ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import PathwayOnboarding from '@/components/onboarding/PathwayOnboarding';

export default function HomeYouthWork() {
  const [user, setUser] = useState(null);
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

  const { data: qualifications = [] } = useQuery({
    queryKey: ['user-qualifications'],
    queryFn: () => base44.entities.YouthWorkQualification.filter({ user_email: user?.email }, '-created_date', 10),
    enabled: !!user,
  });

  const { data: workbookProgress = [] } = useQuery({
    queryKey: ['workbook-progress'],
    queryFn: () => base44.entities.WorkbookProgress.filter({ user_email: user?.email }, '-updated_date', 10),
    enabled: !!user,
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Onboarding Flow */}
      {showOnboarding && (
        <PathwayOnboarding
          pathway="youth_work"
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Hero Section */}
      <Box sx={{ position: 'relative', background: 'linear-gradient(to bottom right, #059669, #047857, #065f46)', py: 12, overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Chip
                icon={<Award size={20} />}
                label="Youth Work OCN"
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
                Youth Work Qualifications
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
                Complete your OCN qualifications with structured workbooks and guidance
              </Typography>
              <Link to={createPageUrl('YouthWork')} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    bgcolor: 'white',
                    color: '#059669',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 50,
                    '&:hover': { bgcolor: '#d1fae5', transform: 'scale(1.05)' }
                  }}
                >
                  Start Learning
                </Button>
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Progress Overview */}
      {workbookProgress.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Your Progress</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
            {workbookProgress.slice(0, 4).map((progress) => (
              <Card key={progress.id} sx={{ p: 3, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{progress.workbook_title}</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ bgcolor: '#e5e7eb', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: '#059669', height: '100%', width: `${progress.completion_percentage || 0}%` }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {progress.completion_percentage || 0}% Complete
                  </Typography>
                </Box>
                <Link to={createPageUrl('YouthWorkWorkbook') + `?id=${progress.workbook_id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" size="small" endIcon={<ArrowRight size={16} />}>
                    Continue
                  </Button>
                </Link>
              </Card>
            ))}
          </Box>
        </Container>
      )}

      {/* Quick Actions */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>Quick Access</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <BookOpen size={48} color="#059669" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Workbooks</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Complete your assignments</Typography>
              <Link to={createPageUrl('YouthWork')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
                  View Workbooks
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Attendance</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Track your attendance</Typography>
              <Link to={createPageUrl('YouthWork')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
                  View Attendance
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -8 }}>
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <Award size={48} color="#ca8a04" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Certificates</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>View your achievements</Typography>
              <Link to={createPageUrl('YouthWork')} style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#ca8a04', '&:hover': { bgcolor: '#a16207' } }}>
                  View Certificates
                </Button>
              </Link>
            </Card>
          </motion.div>
        </Box>
      </Container>

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Your Qualifications</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
            {qualifications.map((qual) => (
              <Card key={qual.id} sx={{ p: 4, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                  <Award size={32} color="#059669" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{qual.title}</Typography>
                    <Chip 
                      label={qual.status} 
                      color={qual.status === 'completed' ? 'success' : 'primary'} 
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="body2">
                      Level: {qual.level || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      )}
    </Box>
  );
}