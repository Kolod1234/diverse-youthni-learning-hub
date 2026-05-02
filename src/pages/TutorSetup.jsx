import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Box, Container, Typography, Card, Button, TextField, Stack, Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'sonner';

const SUBJECTS = ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'history', 'geography'];

export default function TutorSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('tutorsUnlocked') === 'true');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ full_name: '', bio: '', expertise_subjects: [] });

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      if (!userData.is_tutor && userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setFormData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        expertise_subjects: userData.expertise_subjects || [],
      });
    });
  }, []);

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      expertise_subjects: prev.expertise_subjects.includes(subject)
        ? prev.expertise_subjects.filter(s => s !== subject)
        : [...prev.expertise_subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) { toast.error('Please enter your name'); return; }
    if (formData.expertise_subjects.length === 0) { toast.error('Please select at least one subject'); return; }
    try {
      await base44.auth.updateMe(formData);
      toast.success('Profile updated successfully!');
      navigate(createPageUrl('TutorDashboard'));
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (accessCode === 'DYNI26') {
      setIsUnlocked(true);
      localStorage.setItem('tutorsUnlocked', 'true');
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  if (!isUnlocked) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ width: '100%', maxWidth: 448, p: 4, borderRadius: 4, boxShadow: 6 }}>
          <Stack spacing={3} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#e0e7ff', borderRadius: 3 }}>
              <SchoolIcon sx={{ fontSize: 32, color: '#4f46e5' }} />
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700}>Tutor Setup Access</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Enter the access code to continue</Typography>
            </Box>
            <Box component="form" onSubmit={handleUnlock} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                value={accessCode}
                onChange={(e) => { setAccessCode(e.target.value); setError(''); }}
                placeholder="Enter access code"
                autoFocus
                error={!!error}
                helperText={error}
                inputProps={{ style: { textAlign: 'center', fontSize: '1.125rem', height: 32 } }}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, height: 48 }}>
                Unlock
              </Button>
            </Box>
          </Stack>
        </Card>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar sx={{ width: 64, height: 64, background: 'linear-gradient(to bottom right, #4f46e5, #7c3aed)', borderRadius: 3 }}>
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>Set Up Your Tutor Profile</Typography>
          <Typography color="text.secondary">Tell us about yourself and your expertise</Typography>
        </Stack>

        <Card sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Full Name *"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                fullWidth
                required
              />

              <TextField
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell students about your teaching experience and qualifications..."
                multiline
                rows={4}
                fullWidth
              />

              <Box>
                <Typography fontWeight={500} sx={{ mb: 0.5 }}>Subjects You Teach *</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Select all subjects you're qualified to teach</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                  {SUBJECTS.map((subject) => {
                    const selected = formData.expertise_subjects.includes(subject);
                    return (
                      <Button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 2,
                          textTransform: 'capitalize',
                          borderColor: selected ? '#4f46e5' : 'divider',
                          bgcolor: selected ? '#eef2ff' : 'transparent',
                          color: selected ? '#4338ca' : 'text.primary',
                          '&:hover': { borderColor: selected ? '#4f46e5' : '#9ca3af', bgcolor: selected ? '#e0e7ff' : 'action.hover' }
                        }}
                      >
                        {subject}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Button type="submit" variant="contained" fullWidth size="large" startIcon={<SaveIcon />} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, height: 48 }}>
                Save Profile
              </Button>
            </Stack>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}