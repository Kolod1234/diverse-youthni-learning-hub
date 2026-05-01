import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
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
          background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff, #fdf2f8)',
          p: 2,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 448, boxShadow: 8, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
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
                <LockIcon sx={{ color: '#4f46e5', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} align="center">
                Course Access Required
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Please enter the password to access courses
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Box>
                  <TextField
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    autoFocus
                    inputProps={{
                      style: { textAlign: 'center', fontSize: '1.125rem' },
                    }}
                  />
                  {error && (
                    <Alert
                      icon={<ErrorOutlineIcon fontSize="small" />}
                      severity="error"
                      sx={{ mt: 1.5, py: 0.5 }}
                    >
                      {error}
                    </Alert>
                  )}
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleGoBack}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                  >
                    Go Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!password}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#4f46e5',
                      '&:hover': { bgcolor: '#4338ca' },
                    }}
                  >
                    Access Courses
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 3 }}
            >
              Don't have the password? Contact your administrator
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}