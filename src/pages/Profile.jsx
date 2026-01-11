import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Calendar, Award, BookOpen, Clock, 
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
  const queryClient = useQueryClient();

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

  const totalHours = enrollments.reduce((acc, e) => {
    return acc + (e.progress_percent || 0) * 0.5; // Estimate
  }, 0);

  const completedCourses = enrollments.filter(e => e.is_completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 border-0 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-3xl font-semibold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.full_name || 'User'}</h1>
                <p className="text-gray-500 mb-4">{user?.email}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user?.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  {user?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📍 {user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{enrollments.length}</div>
                  <div className="text-xs text-gray-500">Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">{completedCourses}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{Math.round(totalHours)}</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Progress Stats */}
        <ProgressStats user={user} />

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full mt-8">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <BookOpen className="w-4 h-4 mr-2" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <User className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <BookOpen className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="courses">
            <EnrolledCourses user={user} />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">About</h2>
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio || ''}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user?.bio ? (
                        <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                      ) : (
                        <p className="text-gray-400 italic">No bio added yet</p>
                      )}
                      {user?.website && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Website</p>
                          <a 
                            href={user.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            {user.website}
                          </a>
                        </div>
                      )}
                    </div>
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
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
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
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}