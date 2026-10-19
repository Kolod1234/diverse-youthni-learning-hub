import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { toast } from 'sonner';

export default function CoursePasswordProtection({ children, user }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  const { data: siteContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getCoursePassword = () => {
    const item = siteContent.find(c => c.key === 'course_access_password');
    return item?.value || 'LEARNERS26';
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (user === null && userLoading) {
        return;
      }

      setUserLoading(false);

      if (user?.role === 'admin') {
        setHasAccess(true);
        return;
      }

      const accessGranted = sessionStorage.getItem('course_access_granted');
      if (accessGranted === 'true') {
        setHasAccess(true);
        return;
      }

      setHasAccess(false);
    };

    checkAccess();
  }, [user, userLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const correctPassword = getCoursePassword();

    if (password === correctPassword) {
      sessionStorage.setItem('course_access_granted', 'true');
      setHasAccess(true);
      toast.success('Access granted!');
    } else {
      setError('Incorrect password. Please try again.');
      toast.error('Incorrect password');
    }
  };

  const handleGoBack = () => {
    navigate(createPageUrl('Home'));
  };

  if (userLoading || contentLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #eef2ff, #f3e8ff, #fce7f3)',
          p: 2,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 448, boxShadow: 8, borderRadius: 6 }}>
          <CardHeader
            sx={{ textAlign: 'center', pb: 0 }}
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 32, color: '#4f46e5' }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>Course Access Required</Typography>
                <Typography variant="body2" color="text.secondary">
                  Please enter the password to access courses
                </Typography>
              </Box>
            }
          />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <TextField
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  fullWidth
                  inputProps={{ style: { textAlign: 'center', fontSize: '1.125rem' } }}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button type="button" variant="outlined" onClick={handleGoBack} sx={{ flex: 1 }}>
                  Go Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!password}
                  sx={{ flex: 1, bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                >
                  Access Courses
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              Don't have the password? Contact your administrator
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}