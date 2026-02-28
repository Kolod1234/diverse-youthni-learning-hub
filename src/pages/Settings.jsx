import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, Button, TextField, Box, Typography, Container, Tabs, Tab, 
  Avatar, IconButton, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  User, Lock, Settings as SettingsIcon, Presentation, Layout,
  Camera, Save, ArrowLeft, CheckCircle2, AlertTriangle, Trash2, Bell
} from 'lucide-react';
import { Switch, FormControlLabel, FormGroup } from '@mui/material';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences state
  const [playerPreference, setPlayerPreference] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFullName(userData.full_name || '');
        setAvatarUrl(userData.avatar || '');
        setPlayerPreference(userData.player_preference || 'LessonPlayerPowerPoint');
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load user data');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  // Update player preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: async (preference) => {
      await base44.auth.updateMe({ player_preference: preference });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Preference updated successfully');
    },
    onError: () => {
      toast.error('Failed to update preference');
    }
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      updateProfileMutation.mutate({ avatar: file_url });
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      full_name: fullName,
      avatar: avatarUrl
    });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.info('Password change feature coming soon');
    // Note: Password change requires backend implementation
  };

  const handlePlayerPreferenceChange = (preference) => {
    setPlayerPreference(preference);
    updatePreferenceMutation.mutate(preference);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) {
      toast.error('Email does not match');
      return;
    }
    try {
      await base44.entities.User.delete(user.id);
      toast.success('Account deleted successfully.');
      setShowDeleteDialog(false);
      setDeleteConfirmEmail('');
      setTimeout(() => base44.auth.logout(), 1500);
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    }
  };

  const [tabValue, setTabValue] = useState('profile');

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box className="animate-spin rounded-full" sx={{ width: 48, height: 48, border: 2, borderColor: 'primary.main', borderBottomColor: 'transparent', borderRadius: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            startIcon={<ArrowLeft size={16} />}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>Settings</Typography>
          <Typography color="text.secondary">Manage your account settings and preferences</Typography>
        </motion.div>

        <Box sx={{ mt: 4 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab value="profile" icon={<User size={16} />} iconPosition="start" label="Profile" />
            <Tab value="account" icon={<Lock size={16} />} iconPosition="start" label="Account" />
            <Tab value="preferences" icon={<SettingsIcon size={16} />} iconPosition="start" label="Preferences" />
            <Tab value="danger" icon={<AlertTriangle size={16} />} iconPosition="start" label="Danger Zone" sx={{ color: '#dc2626' }} />
          </Tabs>

          {/* Profile Tab */}
          {tabValue === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Profile Information</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your profile details and avatar
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Avatar Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={avatarUrl} sx={{ width: 96, height: 96, fontSize: '2rem' }}>
                        {fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <IconButton
                        component="label"
                        sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          right: 0, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        size="small"
                      >
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarUpload}
                        />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Role: <Box component="span" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{user?.role}</Box>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Name Field */}
                  <Box>
                    <InputLabel>Full Name</InputLabel>
                    <TextField
                      fullWidth
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {/* Email (Read-only) */}
                  <Box>
                    <InputLabel>Email</InputLabel>
                    <TextField
                      fullWidth
                      value={user?.email}
                      disabled
                      sx={{ mt: 1, bgcolor: '#f9fafb' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Email cannot be changed
                    </Typography>
                  </Box>

                  <Button
                    onClick={handleProfileUpdate}
                    disabled={updateProfileMutation.isPending}
                    variant="contained"
                    startIcon={<Save size={16} />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* Account Tab */}
          {tabValue === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Change Password</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your password to keep your account secure
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <InputLabel>Current Password</InputLabel>
                    <TextField
                      fullWidth
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box>
                    <InputLabel>New Password</InputLabel>
                    <TextField
                      fullWidth
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box>
                    <InputLabel>Confirm New Password</InputLabel>
                    <TextField
                      fullWidth
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Button
                    onClick={handlePasswordChange}
                    variant="contained"
                    startIcon={<Lock size={16} />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Update Password
                  </Button>

                  <Box sx={{ bgcolor: '#fef3c7', border: 1, borderColor: '#fbbf24', borderRadius: 2, p: 2 }}>
                    <Typography variant="body2" color="#92400e">
                      Password change feature requires additional backend setup
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* Danger Zone Tab */}
          {tabValue === 'danger' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ p: 3, border: '2px solid #dc2626', bgcolor: '#fef2f2' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <AlertTriangle size={24} color="#dc2626" />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#dc2626' }}>Danger Zone</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Irreversible actions that will permanently affect your account
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: '#fee2e2', border: 1, borderColor: '#fca5a5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#991b1b' }}>Delete Account</Typography>
                  <Box sx={{ mb: 3, bgcolor: 'white', p: 2, borderRadius: 1.5, border: 1, borderColor: '#fca5a5' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#991b1b' }}>
                      What happens when you delete your account:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 0.5, fontSize: '0.875rem', color: 'text.secondary' } }}>
                      <li>All your course progress and enrollments will be permanently deleted</li>
                      <li>Your achievements, certificates, and badges will be lost</li>
                      <li>Any messages, discussions, and comments will be removed</li>
                      <li>Your account cannot be recovered after deletion</li>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This action is permanent and cannot be undone. Please consider exporting your data before proceeding.
                  </Typography>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="contained"
                    sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, minHeight: 44 }}
                    startIcon={<Trash2 size={16} />}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Card>

              {/* Delete Confirmation Dialog */}
              <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>
                  Delete Account - Final Confirmation
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                    ⚠️ This action is permanent and cannot be reversed!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    All your data including courses, progress, achievements, and certificates will be permanently deleted.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    To confirm deletion, please type your email address below:
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    error={deleteConfirmEmail !== '' && deleteConfirmEmail !== user?.email}
                    helperText={deleteConfirmEmail !== '' && deleteConfirmEmail !== user?.email ? 'Email does not match your account' : ''}
                  />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                  <Button onClick={() => { setShowDeleteDialog(false); setDeleteConfirmEmail(''); }} color="inherit" sx={{ minHeight: 44 }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmEmail !== user?.email}
                    variant="contained"
                    sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, minHeight: 44 }}
                  >
                    Delete My Account
                  </Button>
                </DialogActions>
              </Dialog>
            </motion.div>
          )}

          {/* Preferences Tab */}
           {tabValue === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Lesson Player Preference</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose your preferred lesson viewing experience
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                    {/* PowerPoint Style */}
                    <Button
                      onClick={() => handlePlayerPreferenceChange('LessonPlayerPowerPoint')}
                      disabled={updatePreferenceMutation.isPending}
                      sx={{
                        position: 'relative',
                        p: 3,
                        borderRadius: 3,
                        border: 2,
                        borderColor: playerPreference === 'LessonPlayerPowerPoint' ? '#f97316' : 'divider',
                        bgcolor: playerPreference === 'LessonPlayerPowerPoint' ? '#fff7ed' : 'background.paper',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        '&:hover': { borderColor: playerPreference === 'LessonPlayerPowerPoint' ? '#ea580c' : 'text.secondary' }
                      }}
                    >
                      {playerPreference === 'LessonPlayerPowerPoint' && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#f97316', color: 'white', p: 0.5, borderRadius: '50%' }}>
                          <CheckCircle2 size={20} />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, background: 'linear-gradient(to bottom right, #f97316, #dc2626)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Presentation size={24} color="white" />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>PowerPoint Style</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Professional presentation mode with ribbon toolbar and filmstrip navigation
                      </Typography>
                    </Button>

                    {/* Classic Style */}
                    <Button
                      onClick={() => handlePlayerPreferenceChange('LessonPlayerClassic')}
                      disabled={updatePreferenceMutation.isPending}
                      sx={{
                        position: 'relative',
                        p: 3,
                        borderRadius: 3,
                        border: 2,
                        borderColor: playerPreference === 'LessonPlayerClassic' ? '#6366f1' : 'divider',
                        bgcolor: playerPreference === 'LessonPlayerClassic' ? '#eef2ff' : 'background.paper',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        '&:hover': { borderColor: playerPreference === 'LessonPlayerClassic' ? '#4f46e5' : 'text.secondary' }
                      }}
                    >
                      {playerPreference === 'LessonPlayerClassic' && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#6366f1', color: 'white', p: 0.5, borderRadius: '50%' }}>
                          <CheckCircle2 size={20} />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layout size={24} color="white" />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Classic Style</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Clean, minimal interface perfect for distraction-free learning
                      </Typography>
                    </Button>
                  </Box>

                  <Box sx={{ bgcolor: '#dbeafe', border: 1, borderColor: '#60a5fa', borderRadius: 2, p: 2 }}>
                    <Typography variant="body2" color="#1e3a8a">
                      <Box component="strong">Note:</Box> Your preference will be applied to all lessons you view. 
                      You can change this anytime.
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}
        </Box>
      </Container>
    </Box>
  );
}