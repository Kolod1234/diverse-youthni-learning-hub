import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, Button, TextField, Box, Typography, Container, Tabs, Tab, 
  Avatar, IconButton, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import TuneIcon from '@mui/icons-material/Tune';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const User = _w(PersonIcon), Lock = _w(LockIcon), SettingsIcon = _w(TuneIcon), Presentation = _w(SlideshowIcon);
const Layout = _w(DashboardIcon), Camera = _w(PhotoCameraIcon), Save = _w(SaveIcon), ArrowLeft = _w(ArrowBackIcon);
const CheckCircle2 = _w(CheckCircleIcon), AlertTriangle = _w(WarningIcon), Trash2 = _w(DeleteIcon), Bell = _w(NotificationsIcon);
import { Switch, FormGroup } from '@mui/material';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_profile'))?.full_name || ''; } catch { return ''; }
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_profile'))?.avatar || ''; } catch { return ''; }
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [playerPreference, setPlayerPreference] = useState('LessonPlayerPowerPoint');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [tabValue, setTabValue] = useState('profile');
  const [notifPrefs, setNotifPrefs] = useState({
    email_course_updates: true,
    email_new_sessions: true,
    email_app_updates: false,
    email_quiz_reminders: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authMe = base44.auth.me;
        const userData = await authMe();
        setUser(userData);
        setFullName(userData.full_name || '');
        setAvatarUrl(userData.avatar || '');
        setPlayerPreference(userData.player_preference || 'LessonPlayerPowerPoint');
        if (userData.notification_prefs) {
          setNotifPrefs(p => ({ ...p, ...userData.notification_prefs }));
        }
        localStorage.setItem('user_profile', JSON.stringify({
          full_name: userData.full_name,
          avatar: userData.avatar,
        }));
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const updateMe = base44.auth.updateMe;
      await updateMe(data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries(['user']);
      const cached = JSON.parse(localStorage.getItem('user_profile') || '{}');
      localStorage.setItem('user_profile', JSON.stringify({ ...cached, ...data }));
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async (preference) => {
      const updateMe = base44.auth.updateMe;
      await updateMe({ player_preference: preference });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Preference updated successfully');
    },
    onError: () => toast.error('Failed to update preference'),
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      updateProfileMutation.mutate({ avatar: file_url });
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({ full_name: fullName, avatar: avatarUrl });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    toast.info('Password change feature coming soon');
  };

  const handlePlayerPreferenceChange = (preference) => {
    setPlayerPreference(preference);
    updatePreferenceMutation.mutate(preference);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) { toast.error('Email does not match'); return; }
    try {
      await base44.entities.User.delete(user.id);
      localStorage.removeItem('user_profile');
      toast.success('Account deleted successfully.');
      setShowDeleteDialog(false);
      setDeleteConfirmEmail('');
      const logout = base44.auth.logout;
      setTimeout(() => logout(), 1500);
    } catch {
      toast.error('Failed to delete account. Please contact support.');
    }
  };

  const saveNotifPrefs = async (newPrefs) => {
    setNotifPrefs(newPrefs);
    const updateMe = base44.auth.updateMe;
    await updateMe({ notification_prefs: newPrefs });
    toast.success('Notification preferences saved');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 48, height: 48, border: '3px solid', borderColor: 'primary.main', borderBottomColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>

        <motion.div>
          <Button variant="text" onClick={() => navigate(-1)} startIcon={<ArrowLeft size={16} />} sx={{ mb: 2 }}>
            Back
          </Button>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>Settings</Typography>
          <Typography color="text.secondary">Manage your account settings and preferences</Typography>
        </motion.div>

        <Box sx={{ mt: 4 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} variant="scrollable" scrollButtons="auto">
            <Tab value="profile"       icon={<User size={16} />}          iconPosition="start" label="Profile" />
            <Tab value="account"       icon={<Lock size={16} />}          iconPosition="start" label="Account" />
            <Tab value="notifications" icon={<Bell size={16} />}          iconPosition="start" label="Notifications" />
            <Tab value="preferences"   icon={<SettingsIcon size={16} />}  iconPosition="start" label="Preferences" />
            <Tab value="danger"        icon={<AlertTriangle size={16} />} iconPosition="start" label="Danger Zone" sx={{ color: 'error.main' }} />
          </Tabs>

          {/* ── Profile Tab ── */}
          {tabValue === 'profile' && (
            <motion.div>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Profile Information</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update your profile details and avatar</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={avatarUrl} sx={{ width: 96, height: 96, fontSize: '2rem' }}>
                        {fullName?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                      <IconButton aria-label="Change profile photo"
                        component="label"
                        size="small"
                        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                      >
                        <Camera size={16} />
                        <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{fullName || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Role: <Box component="span" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{user?.role}</Box>
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <InputLabel>Full Name</InputLabel>
                    <TextField fullWidth value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" sx={{ mt: 1 }} />
                  </Box>

                  <Box>
                    <InputLabel>Email</InputLabel>
                    <TextField fullWidth value={user?.email || ''} disabled sx={{ mt: 1, bgcolor: 'action.hover' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>Email cannot be changed</Typography>
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

          {/* ── Account Tab ── */}
          {tabValue === 'account' && (
            <motion.div>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Change Password</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update your password to keep your account secure</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <InputLabel>Current Password</InputLabel>
                    <TextField fullWidth type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" sx={{ mt: 1 }} />
                  </Box>
                  <Box>
                    <InputLabel>New Password</InputLabel>
                    <TextField fullWidth type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" sx={{ mt: 1 }} />
                  </Box>
                  <Box>
                    <InputLabel>Confirm New Password</InputLabel>
                    <TextField fullWidth type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" sx={{ mt: 1 }} />
                  </Box>
                  <Button onClick={handlePasswordChange} variant="contained" startIcon={<Lock size={16} />} sx={{ alignSelf: 'flex-start' }}>
                    Update Password
                  </Button>
                  <Box sx={{ border: 1, borderColor: '#fbbf24', borderRadius: 2, p: 2 }}>
                    <Typography variant="body2" color="#92400e">Password change feature requires additional backend setup</Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* ── Notifications Tab ── */}
          {tabValue === 'notifications' && (
            <motion.div>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Notification Preferences</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Choose which emails and in-app notifications you receive</Typography>
                <FormGroup sx={{ gap: 1 }}>
                  {[
                    { key: 'email_course_updates', label: 'Course updates & new lessons',  desc: 'Get notified when courses you enrolled in are updated' },
                    { key: 'email_new_sessions',   label: 'Upcoming live sessions',        desc: 'Reminders for scheduled sessions you have booked' },
                    { key: 'email_app_updates',    label: 'App version releases',          desc: 'Be notified when a new app version is available' },
                    { key: 'email_quiz_reminders', label: 'Quiz & assignment reminders',   desc: 'Deadline and result notifications for quizzes' },
                  ].map(({ key, label, desc }) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary">{desc}</Typography>
                      </Box>
                      <Switch checked={!!notifPrefs[key]} onChange={e => saveNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} color="primary" />
                    </Box>
                  ))}
                </FormGroup>
              </Card>
            </motion.div>
          )}

          {/* ── Preferences Tab ── */}
          {tabValue === 'preferences' && (
            <motion.div>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Lesson Player Preference</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Choose your preferred lesson viewing experience</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>

                    <Button
                      onClick={() => handlePlayerPreferenceChange('LessonPlayerPowerPoint')}
                      disabled={updatePreferenceMutation.isPending}
                      sx={{
                        position: 'relative', p: 3, borderRadius: 3, border: 2, textAlign: 'left',
                        borderColor: playerPreference === 'LessonPlayerPowerPoint' ? '#4f46e5' : 'divider',
                        bgcolor: playerPreference === 'LessonPlayerPowerPoint' ? '#fff7ed' : 'background.paper',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        '&:hover': { borderColor: playerPreference === 'LessonPlayerPowerPoint' ? '#4f46e5' : 'text.secondary' }
                      }}
                    >
                      {playerPreference === 'LessonPlayerPowerPoint' && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#4f46e5', color: 'white', p: 0.5, borderRadius: '50%' }}>
                          <CheckCircle2 size={20} />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, bgcolor: '#4f46e5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Presentation size={24} color="white" />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>PowerPoint Style</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Professional presentation mode with ribbon toolbar and filmstrip navigation
                      </Typography>
                    </Button>

                    <Button
                      onClick={() => handlePlayerPreferenceChange('LessonPlayerClassic')}
                      disabled={updatePreferenceMutation.isPending}
                      sx={{
                        position: 'relative', p: 3, borderRadius: 3, border: 2, textAlign: 'left',
                        borderColor: playerPreference === 'LessonPlayerClassic' ? '#6366f1' : 'divider',
                        bgcolor: playerPreference === 'LessonPlayerClassic' ? '#eef2ff' : 'background.paper',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        '&:hover': { borderColor: playerPreference === 'LessonPlayerClassic' ? '#4f46e5' : 'text.secondary' }
                      }}
                    >
                      {playerPreference === 'LessonPlayerClassic' && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#6366f1', color: 'white', p: 0.5, borderRadius: '50%' }}>
                          <CheckCircle2 size={20} />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, bgcolor: '#4f46e5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Box component="strong">Note:</Box> Your preference will be applied to all lessons you view. You can change this anytime.
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* ── Danger Zone Tab ── */}
          {tabValue === 'danger' && (
            <motion.div>
              <Card sx={{ p: 3, border: '2px solid #dc2626', bgcolor: '#fef2f2' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <AlertTriangle size={24} color="#dc2626" />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'error.main' }}>Danger Zone</Typography>
                    <Typography variant="body2" color="text.secondary">Irreversible actions that will permanently affect your account</Typography>
                  </Box>
                </Box>
                <Box sx={{ bgcolor: '#fee2e2', border: 1, borderColor: '#fca5a5', borderRadius: 2, p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#991b1b' }}>Delete Account</Typography>
                  <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 1.5, border: 1, borderColor: '#fca5a5' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#991b1b' }}>What happens when you delete your account:</Typography>
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
                    sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: '#b91c1c' }, minHeight: 44 }}
                    startIcon={<Trash2 size={16} />}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Card>

              <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#fef2f2', color: 'error.main', fontWeight: 700 }}>
                  Delete Account — Final Confirmation
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                    This action is permanent and cannot be reversed!
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
                    onChange={e => setDeleteConfirmEmail(e.target.value)}
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
                    sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: '#b91c1c' }, minHeight: 44 }}
                  >
                    Delete My Account
                  </Button>
                </DialogActions>
              </Dialog>
            </motion.div>
          )}

        </Box>
      </Container>
    </Box>
  );
}