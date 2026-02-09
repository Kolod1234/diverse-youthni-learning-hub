import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Button, TextField, InputLabel, Card, Tabs, Tab, Avatar, 
  Box, Typography, Container, IconButton, Chip
} from '@mui/material';
import { 
  User, Calendar, Award, BookOpen, Clock, 
  Settings, Bell, Shield, Save, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import AccountSettings from '@/components/profile/AccountSettings';
import EnrolledCourses from '@/components/profile/EnrolledCourses';
import ProgressStats from '@/components/profile/ProgressStats';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
      });
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }, '-updated_date', 100),
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }, '-earned_date', 50),
    enabled: !!user?.email,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.Certificate.filter({ created_by: user?.email }, '-issue_date', 50),
    enabled: !!user?.email,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries();
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error(error);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalHours = enrollments.reduce((acc, e) => {
    return acc + (e.progress_percent || 0) * 0.5; // Estimate
  }, 0);

  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const [tabValue, setTabValue] = useState('courses');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card sx={{ p: 4, mb: 4, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
              <Box sx={{ position: 'relative', '&:hover .avatar-overlay': { opacity: 1 } }} onClick={handleAvatarClick}>
                <Avatar src={user?.avatar} sx={{ width: 96, height: 96, border: 4, borderColor: 'white', boxShadow: 3, bgcolor: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)', fontSize: '2rem', fontWeight: 600, cursor: 'pointer' }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
                <Box className="avatar-overlay" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', cursor: 'pointer' }}>
                  <Camera size={24} color="white" />
                </Box>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                style={{ display: 'none' }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>{user?.full_name || 'User'}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Chip icon={<Calendar size={16} />} label={`Joined ${new Date(user?.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} variant="outlined" />
                  {user?.location && (
                    <Chip label={`📍 ${user.location}`} variant="outlined" />
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary">{enrollments.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Courses</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>{completedCourses}</Typography>
                  <Typography variant="caption" color="text.secondary">Completed</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#f97316' }}>{Math.round(totalHours)}</Typography>
                  <Typography variant="caption" color="text.secondary">Hours</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Progress Stats */}
        <ProgressStats user={user} />

        {/* Tabs */}
        <Box sx={{ mt: 4 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab value="courses" icon={<BookOpen size={16} />} iconPosition="start" label="My Courses" />
            <Tab value="overview" icon={<User size={16} />} iconPosition="start" label="Overview" />
            <Tab value="achievements" icon={<Award size={16} />} iconPosition="start" label="Achievements" />
            <Tab value="certificates" icon={<BookOpen size={16} />} iconPosition="start" label="Certificates" />
            <Tab value="settings" icon={<Settings size={16} />} iconPosition="start" label="Settings" />
          </Tabs>

          {/* My Courses Tab */}
          {tabValue === 'courses' && (
            <EnrolledCourses user={user} />
          )}

          {/* Overview Tab */}
          {tabValue === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">About</h2>
                    {!isEditing && (
                      <Button variant="outlined" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <InputLabel>Full Name</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <InputLabel>Bio</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.bio || ''}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <InputLabel>Location</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <InputLabel>Website</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1.5, pt: 2 }}>
                        <Button 
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          variant="contained"
                          startIcon={<Save size={16} />}
                          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {user?.bio ? (
                        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>{user.bio}</Typography>
                      ) : (
                        <Typography color="text.disabled" fontStyle="italic">No bio added yet</Typography>
                      )}
                      {user?.website && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Website</Typography>
                          <Typography
                            component="a"
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {user.website}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 border-0 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        Total Courses
                      </span>
                      <span className="font-semibold text-gray-900">{enrollments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        Hours Learned
                      </span>
                      <span className="font-semibold text-gray-900">{Math.round(totalHours)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        Achievements
                      </span>
                      <span className="font-semibold text-gray-900">{achievements.length}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <h3 className="font-semibold mb-2">Keep Learning!</h3>
                  <p className="text-indigo-100 text-sm mb-4">
                    You're {completedCourses > 0 ? 'doing great' : 'just getting started'}! Continue your journey to unlock more achievements.
                  </p>
                  <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                    Browse Courses
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {tabValue === 'achievements' && (
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Achievements</h2>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {achievements.map((achievement, index) => (
                    <AchievementBadge 
                      key={achievement.id} 
                      achievement={achievement}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No achievements yet</p>
                  <p className="text-sm text-gray-400 mt-2">Complete courses to earn achievements!</p>
                </div>
              )}
            </Card>
          )}

          {/* Certificates Tab */}
          {tabValue === 'certificates' && (
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Certificates</h2>
              {certificates.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{cert.course_title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Certificate #{cert.certificate_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          Issued: {new Date(cert.issue_date).toLocaleDateString()}
                        </p>
                        {cert.final_score && (
                          <p className="text-sm font-medium text-emerald-600 mt-2">
                            Final Score: {cert.final_score}%
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No certificates yet</p>
                  <p className="text-sm text-gray-400 mt-2">Complete courses to earn certificates!</p>
                </div>
              )}
            </Card>
          )}

          {/* Settings Tab */}
          {tabValue === 'settings' && (
            <div className="space-y-6">
              <AccountSettings user={user} />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-0 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your courses</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Course Reminders</p>
                        <p className="text-sm text-gray-500">Get reminded to continue learning</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Achievement Alerts</p>
                        <p className="text-sm text-gray-500">Celebrate your milestones</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Account Email</p>
                      <Input value={user?.email} disabled />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Password</p>
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Box>
      </Container>
    </Box>
  );
}