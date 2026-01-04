import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, Users, BookOpen, MessageSquare, Image as ImageIcon,
  Palette, FileText, Award, Settings, Trash2, Ban, CheckCircle,
  Upload, Eye, Edit, Search, Send, UserCog, Video, Brain, Calendar,
  TrendingUp, Key, Database, Lock, Plus, EyeOff, Download, UserCheck, GraduationCap, X, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CurriculumImporter from '@/components/admin/CurriculumImporter';
import LessonKeyManager from '@/components/admin/LessonKeyManager';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('users');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('-created_date', 1000),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list('-created_date', 500),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['all-sessions'],
    queryFn: () => base44.entities.VideoSession.list('-created_date', 500),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['all-templates'],
    queryFn: () => base44.entities.Template.list('-created_date', 500),
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => base44.entities.Attendance.list('-date', 1000),
  });

  const { data: contactInfo = [] } = useQuery({
    queryKey: ['contact-info'],
    queryFn: () => base44.entities.ContactInfo.list('-created_date', 1),
  });

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const { data: tutorRequests = [] } = useQuery({
    queryKey: ['tutor-requests'],
    queryFn: () => base44.entities.TutorRequest.filter({ status: 'pending' }, '-created_date', 100),
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Complete control over the platform</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: allUsers.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
            { label: 'Total Lessons', value: lessons.length, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Quizzes', value: quizzes.length, icon: Brain, color: 'bg-orange-50 text-orange-600' },
            { label: 'Enrollments', value: enrollments.length, icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
            { label: 'Live Sessions', value: sessions.length, icon: Video, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Templates', value: templates.length, icon: Database, color: 'bg-teal-50 text-teal-600' },
            { label: 'Reviews', value: reviews.length, icon: Award, color: 'bg-amber-50 text-amber-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6 flex-wrap h-auto">
            <TabsTrigger value="users" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="tutor-requests" className="rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              Tutor Requests
              {tutorRequests.length > 0 && (
                <Badge className="ml-2 bg-orange-500">{tutorRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg">
              <Award className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="carousel" className="rounded-lg">
              <ImageIcon className="w-4 h-4 mr-2" />
              Main Carousel
            </TabsTrigger>
            <TabsTrigger value="leadership-carousel" className="rounded-lg">
              <ImageIcon className="w-4 h-4 mr-2" />
              Leadership Carousel
            </TabsTrigger>
            <TabsTrigger value="hero-carousel" className="rounded-lg">
              <ImageIcon className="w-4 h-4 mr-2" />
              Hero Carousel
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-lg">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-lg">
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-lg">
              <Brain className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-lg">
              <Video className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Enrollments
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">
              <Database className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="passwords" className="rounded-lg">
              <Key className="w-4 h-4 mr-2" />
              User Passwords
            </TabsTrigger>
            <TabsTrigger value="site-passwords" className="rounded-lg">
              <Lock className="w-4 h-4 mr-2" />
              Site Passwords
            </TabsTrigger>
            <TabsTrigger value="partners" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Partners
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg">
              <UserCheck className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Site Content
            </TabsTrigger>
            <TabsTrigger value="unlock-keys" className="rounded-lg">
              <Key className="w-4 h-4 mr-2" />
              Unlock Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement users={allUsers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </TabsContent>

          <TabsContent value="tutor-requests">
            <TutorRequestsManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesManagement courses={courses} users={allUsers} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement reviews={reviews} courses={courses} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesMonitor messages={messages} users={allUsers} />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManager carouselType="main" title="Main Carousel Images" />
          </TabsContent>

          <TabsContent value="leadership-carousel">
            <CarouselManager carouselType="leadership" title="Leadership Programme Carousel" />
          </TabsContent>

          <TabsContent value="hero-carousel">
            <CarouselManager carouselType="hero" title="Hero Background Images" />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesManagement enrollments={enrollments} courses={courses} users={allUsers} />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeSettings />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="lessons">
            <LessonsManagement lessons={lessons} courses={courses} />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizzesManagement quizzes={quizzes} courses={courses} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsManagement sessions={sessions} courses={courses} />
          </TabsContent>

          <TabsContent value="enrollments">
            <EnrollmentsManagement enrollments={enrollments} courses={courses} users={allUsers} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesManagement templates={templates} />
          </TabsContent>

          <TabsContent value="passwords">
            <PasswordManagement users={allUsers} />
          </TabsContent>

          <TabsContent value="site-passwords">
            <SitePasswordsManagement siteContent={siteContent} />
          </TabsContent>

          <TabsContent value="partners">
            <PartnersManagement />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManagement attendanceRecords={attendanceRecords} users={allUsers} />
          </TabsContent>

          <TabsContent value="contact">
            <ContactInfoManagement contactInfo={contactInfo[0]} />
          </TabsContent>

          <TabsContent value="content">
            <SiteContentManagement siteContent={siteContent} />
          </TabsContent>

          <TabsContent value="unlock-keys">
            <LessonKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PartnersManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '', website_url: '', type: 'partner' });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: logos = [] } = useQuery({
    queryKey: ['partner-logos'],
    queryFn: () => base44.entities.PartnerLogo.list('order', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PartnerLogo.create({ ...data, is_active: true, order: logos.length }),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      queryClient.invalidateQueries(['funder-logos']);
      setShowForm(false);
      setFormData({ name: '', logo_url: '', website_url: '', type: 'partner' });
      toast.success('Logo added!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PartnerLogo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      queryClient.invalidateQueries(['funder-logos']);
      setEditingLogo(null);
      setFormData({ name: '', logo_url: '', website_url: '', type: 'partner' });
      toast.success('Logo updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PartnerLogo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      queryClient.invalidateQueries(['funder-logos']);
      toast.success('Logo deleted!');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PartnerLogo.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      queryClient.invalidateQueries(['funder-logos']);
      toast.success('Visibility updated!');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.logo_url) {
      toast.error('Name and logo are required');
      return;
    }

    if (editingLogo) {
      updateMutation.mutate({ id: editingLogo.id, data: { ...formData, order: editingLogo.order } });
    } else {
      createMutation.mutate({ ...formData, order: logos.length });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Partners & Funders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage logos displayed on the homepage</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Logo
        </Button>
      </div>

      {(showForm || editingLogo) && (
        <Card className="p-4 mb-6 bg-indigo-50 border-indigo-200">
          <div className="space-y-4">
            <div>
              <Label>Organization Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Company Name"
              />
            </div>

            <div>
              <Label>Type</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="partner">Partner</option>
                <option value="funder">Funder</option>
              </select>
            </div>

            <div>
              <Label>Logo Image *</Label>
              <div className="space-y-2">
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-300 flex-1" />
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="h-px bg-gray-300 flex-1" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload').click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              {formData.logo_url && (
                <img src={formData.logo_url} alt="Preview" className="mt-2 h-16 object-contain border rounded" />
              )}
            </div>

            <div>
              <Label>Website URL (optional)</Label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingLogo ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingLogo(null);
                setFormData({ name: '', logo_url: '', website_url: '', type: 'partner' });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {logos.map((logo) => (
          <Card key={logo.id} className={`p-4 ${!logo.is_active ? 'opacity-50' : ''}`}>
            <div className="aspect-video flex items-center justify-center mb-3 bg-gray-50 rounded">
              <img src={logo.logo_url} alt={logo.name} className="max-h-full max-w-full object-contain" />
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">{logo.name}</h3>
            <div className="flex gap-1 mb-3">
              <Badge variant="secondary" className="text-xs capitalize">{logo.type}</Badge>
              <Badge variant={logo.is_active ? 'default' : 'outline'} className="text-xs">
                {logo.is_active ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleActiveMutation.mutate({ id: logo.id, is_active: !logo.is_active })}
                className="flex-1"
              >
                {logo.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingLogo(logo);
                  setFormData(logo);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this logo?')) deleteMutation.mutate(logo.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {logos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No logos added yet</p>
        </div>
      )}
    </Card>
  );
}

// Users Management Component
function UsersManagement({ users, searchQuery, setSearchQuery }) {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.asServiceRole.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User updated successfully');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.asServiceRole.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User removed successfully');
    },
  });

  const filteredUsers = users.filter(u => 
    !searchQuery || 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanToggle = (user) => {
    const action = user.is_suspended ? 'unban' : 'ban';
    if (confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
      updateUserMutation.mutate({
        userId: user.id,
        data: { is_suspended: !user.is_suspended }
      });
    }
  };

  const handleTutorToggle = (user) => {
    const action = user.is_tutor ? 'remove tutor status from' : 'make a tutor';
    if (confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
      updateUserMutation.mutate({
        userId: user.id,
        data: { is_tutor: !user.is_tutor }
      });
    }
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <Badge>{filteredUsers.length} users</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    {user.role === 'admin' && (
                      <Badge className="bg-red-100 text-red-700">Admin</Badge>
                    )}
                    {user.is_tutor && (
                      <Badge className="bg-purple-100 text-purple-700">Tutor</Badge>
                    )}
                    {user.is_suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTutorToggle(user)}
                  disabled={user.role === 'admin'}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  {user.is_tutor ? 'Remove Tutor' : 'Make Tutor'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBanToggle(user)}
                  disabled={user.role === 'admin'}
                >
                  {user.is_suspended ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.role === 'admin'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Courses Management Component
function CoursesManagement({ courses, users }) {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTutorEmail, setSelectedTutorEmail] = useState('');

  const tutors = users.filter(u => u.is_tutor || u.role === 'admin');

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-courses']);
      toast.success('Course updated successfully');
      setSelectedCourse(null);
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-courses']);
      toast.success('Course deleted successfully');
    },
  });

  const assignTutor = () => {
    if (!selectedCourse || !selectedTutorEmail) return;
    
    const tutor = tutors.find(t => t.email === selectedTutorEmail);
    if (!tutor) return;

    updateCourseMutation.mutate({
      id: selectedCourse.id,
      data: {
        instructor: tutor.full_name,
        instructor_avatar: tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.full_name)}&background=6366f1&color=fff`
      }
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Course Management</h2>
        <p className="text-gray-500">Manage courses and assign tutors</p>
      </div>

      {selectedCourse && (
        <Card className="p-4 mb-6 bg-indigo-50 border-indigo-200">
          <h3 className="font-semibold mb-3">Assign Tutor to: {selectedCourse.title}</h3>
          <div className="flex gap-3">
            <select
              value={selectedTutorEmail}
              onChange={(e) => setSelectedTutorEmail(e.target.value)}
              className="flex-1 h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="">Select Tutor</option>
              {tutors.map(tutor => (
                <option key={tutor.id} value={tutor.email}>
                  {tutor.full_name} ({tutor.email})
                </option>
              ))}
            </select>
            <Button onClick={assignTutor}>Assign</Button>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">
                    Instructor: {course.instructor} • {course.enrolled_count || 0} students
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourse(course)}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Assign Tutor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this course?')) deleteCourseMutation.mutate(course.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Reviews Management Component
function ReviewsManagement({ reviews, courses }) {
  const queryClient = useQueryClient();

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reviews']);
      toast.success('Review deleted');
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Reviews Management</h2>
      <div className="space-y-3">
        {reviews.map((review) => {
          const course = courses.find(c => c.id === review.course_id);
          return (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-gray-900">{review.user_name}</p>
                    <Badge>{review.rating_type}</Badge>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                  <p className="text-xs text-gray-500">Course: {course?.title || 'Unknown'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this review?')) deleteReviewMutation.mutate(review.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

// Messages Monitor Component
function MessagesMonitor({ messages, users }) {
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-messages']);
      toast.success('Message sent');
      setReplyTo(null);
      setReplyMessage('');
    },
  });

  const handleReply = () => {
    if (!replyTo || !replyMessage.trim()) return;
    
    sendMessageMutation.mutate({
      sender_email: 'admin@diverseyouthni.com',
      sender_name: 'Admin',
      recipient_email: replyTo.sender_email,
      content: replyMessage,
      course_id: replyTo.course_id
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Messages Monitor</h2>
      
      {replyTo && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">Replying to: {replyTo.sender_name}</p>
              <p className="text-sm text-gray-600">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
          />
          <Button onClick={handleReply} className="mt-3">
            <Send className="w-4 h-4 mr-2" />
            Send Reply
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card key={msg.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-gray-900">{msg.sender_name}</p>
                  <span className="text-sm text-gray-500">→</span>
                  <p className="text-sm text-gray-600">{msg.recipient_email}</p>
                </div>
                <p className="text-sm text-gray-700 mb-2">{msg.content}</p>
                <p className="text-xs text-gray-500">{new Date(msg.created_date).toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setReplyTo(msg)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Carousel Manager Component
function CarouselManager({ carouselType = 'main', title = 'Carousel Images' }) {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');

  const { data: carouselImages = [] } = useQuery({
    queryKey: ['carousel-images', carouselType],
    queryFn: () => base44.entities.CarouselImage.filter({ carousel_type: carouselType }, 'order', 100),
  });

  const createImageMutation = useMutation({
    mutationFn: (data) => base44.entities.CarouselImage.create({ ...data, carousel_type: carouselType }),
    onSuccess: () => {
      queryClient.invalidateQueries(['carousel-images', carouselType]);
      toast.success('Image added to carousel');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => base44.entities.CarouselImage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['carousel-images', carouselType]);
      toast.success('Image removed from carousel');
    },
  });

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return createImageMutation.mutateAsync({ 
          image_url: file_url,
          order: carouselImages.length + index
        });
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    }
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    createImageMutation.mutate({ 
      image_url: imageUrl,
      order: carouselImages.length
    });
    setImageUrl('');
  };

  const removeImage = (id) => {
    if (confirm('Remove this image from carousel?')) {
      deleteImageMutation.mutate(id);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label>Upload Images (Multiple)</Label>
          <Input type="file" accept="image/*" multiple onChange={handleUpload} />
        </div>
        
        <div className="flex gap-3">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or paste image URL..."
          />
          <Button onClick={addImageUrl}>
            <Upload className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {carouselImages.map((img) => (
          <div key={img.id} className="relative group">
            <img src={img.image_url} alt={`Carousel`} className="w-full h-48 object-cover rounded-lg" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeImage(img.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Certificates Management Component
function CertificatesManagement({ enrollments, courses, users }) {
  const queryClient = useQueryClient();

  const createCertificateMutation = useMutation({
    mutationFn: (data) => base44.entities.Certificate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates']);
      toast.success('Certificate issued successfully');
    },
  });

  const completedEnrollments = enrollments.filter(e => e.is_completed);

  const issueCertificate = (enrollment) => {
    const course = courses.find(c => c.id === enrollment.course_id);
    const student = users.find(u => u.email === enrollment.created_by);
    
    if (!course || !student) return;

    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    createCertificateMutation.mutate({
      course_id: course.id,
      enrollment_id: enrollment.id,
      certificate_number: certNumber,
      issue_date: new Date().toISOString().split('T')[0],
      student_name: student.full_name,
      course_title: course.title,
      instructor_name: course.instructor,
      final_score: enrollment.progress_percent || 100
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Certificate Management</h2>
      <p className="text-gray-500 mb-6">Issue certificates for completed courses</p>
      
      <div className="space-y-3">
        {completedEnrollments.map((enrollment) => {
          const course = courses.find(c => c.id === enrollment.course_id);
          const student = users.find(u => u.email === enrollment.created_by);
          
          return (
            <Card key={enrollment.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{student?.full_name || 'Student'}</p>
                  <p className="text-sm text-gray-600">{course?.title || 'Course'}</p>
                  <p className="text-xs text-gray-500">Completed: {enrollment.completed_date}</p>
                </div>
                <Button onClick={() => issueCertificate(enrollment)}>
                  <Award className="w-4 h-4 mr-2" />
                  Issue Certificate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

// Theme Settings Component
function ThemeSettings() {
  const [primaryColor, setPrimaryColor] = useState('#FF8C00');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');

  const applyTheme = () => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    toast.success('Theme updated successfully');
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Theme Settings</h2>
      
      <div className="space-y-6 max-w-md">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-3 mt-2">
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#FF8C00"
            />
          </div>
        </div>

        <div>
          <Label>Secondary Color</Label>
          <div className="flex gap-3 mt-2">
            <Input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#6366f1"
            />
          </div>
        </div>

        <Button onClick={applyTheme} className="w-full">
          <Palette className="w-4 h-4 mr-2" />
          Apply Theme
        </Button>
      </div>
    </Card>
  );
}

// Blog Management Component
function BlogManagement() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'news',
    featured_image: '',
    is_published: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-published_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create({
      ...data,
      author_name: user?.full_name || 'Admin',
      author_avatar: user?.avatar,
      published_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      setShowForm(false);
      setFormData({ title: '', excerpt: '', content: '', category: 'news', featured_image: '', is_published: true });
      toast.success('Blog post published!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      setEditingPost(null);
      setShowForm(false);
      setFormData({ title: '', excerpt: '', content: '', category: 'news', featured_image: '', is_published: true });
      toast.success('Blog post updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Blog post deleted!');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, featured_image: file_url });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Blog Management</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage blog posts</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {(showForm || editingPost) && (
        <Card className="p-4 mb-6 bg-indigo-50 border-indigo-200">
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Blog post title"
              />
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short summary..."
                rows={2}
              />
            </div>

            <div>
              <Label>Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content..."
                rows={8}
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="news">News</option>
                <option value="tutorial">Tutorial</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <Label>Featured Image</Label>
              <div className="space-y-2">
                <Input
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-300 flex-1" />
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="h-px bg-gray-300 flex-1" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="blog-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('blog-image-upload').click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              {formData.featured_image && (
                <img src={formData.featured_image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPost ? 'Update' : 'Publish'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingPost(null);
                setFormData({ title: '', excerpt: '', content: '', category: 'news', featured_image: '', is_published: true });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {blogPosts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex gap-4">
              {post.featured_image && (
                <img src={post.featured_image} alt={post.title} className="w-24 h-24 object-cover rounded" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt || post.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">{post.category}</Badge>
                      <Badge variant={post.is_published ? 'default' : 'outline'}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(post.published_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setFormData({
                          title: post.title,
                          excerpt: post.excerpt || '',
                          content: post.content,
                          category: post.category,
                          featured_image: post.featured_image || '',
                          is_published: post.is_published
                        });
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this post?')) deleteMutation.mutate(post.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {blogPosts.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No blog posts yet</p>
        </div>
      )}
    </Card>
  );
}

// Lessons Management Component
function LessonsManagement({ lessons, courses }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showImporter, setShowImporter] = useState(false);

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      toast.success('Lesson deleted successfully');
    },
  });

  const updateObjectivesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateLearningObjectives', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['all-lessons']);
      toast.success(`Updated ${data.processed} lessons successfully!`);
    },
    onError: () => {
      toast.error('Failed to update learning objectives');
    }
  });

  // Filter and search lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchQuery || 
      lesson.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || lesson.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Group lessons by course
  const lessonsByCourse = courses.map(course => ({
    course,
    lessons: filteredLessons.filter(l => l.course_id === course.id).sort((a, b) => (a.order || 0) - (b.order || 0))
  })).filter(group => group.lessons.length > 0);

  const lessonsWithoutObjectives = lessons.filter(l => 
    !l.learning_objectives || l.learning_objectives.length === 0
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Lessons Management</h2>
          <p className="text-sm text-gray-500 mt-1">{lessons.length} total lessons</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={createPageUrl('AdminLearningObjectives')}>
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Objectives Manager
            </Button>
          </Link>
          <Button
            onClick={() => updateObjectivesMutation.mutate()}
            disabled={updateObjectivesMutation.isPending || lessonsWithoutObjectives.length === 0}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {updateObjectivesMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Update All Objectives ({lessonsWithoutObjectives.length})
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowImporter(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Import Curriculum
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons by title or description..."
            className="pl-10"
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 border rounded-lg min-w-[200px]"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      {/* Lessons Grouped by Course */}
      <div className="space-y-6">
        {lessonsByCourse.map(({ course, lessons }) => (
          <div key={course.id} className="border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{lessons.length} lessons</p>
                  </div>
                </div>
                <Badge variant="outline">{course.category}</Badge>
              </div>
            </div>
            
            <div className="divide-y">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">#{lesson.order || idx + 1}</span>
                        <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                        {(!lesson.learning_objectives || lesson.learning_objectives.length === 0) && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">No Objectives</Badge>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {lesson.section && <Badge variant="outline" className="text-xs">{lesson.section}</Badge>}
                        {lesson.duration_minutes && <Badge variant="outline" className="text-xs">{lesson.duration_minutes} min</Badge>}
                        {lesson.content_type && <Badge variant="outline" className="text-xs capitalize">{lesson.content_type}</Badge>}
                        {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {lesson.learning_objectives.length} objectives
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl('TutorCourseManager') + `?courseId=${lesson.course_id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this lesson?')) deleteLessonMutation.mutate(lesson.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No lessons found</p>
        </div>
      )}

      <CurriculumImporter open={showImporter} onOpenChange={setShowImporter} />
    </Card>
  );
}

// Quizzes Management Component
function QuizzesManagement({ quizzes, courses }) {
  const queryClient = useQueryClient();

  const deleteQuizMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-quizzes']);
      toast.success('Quiz deleted successfully');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }) => base44.entities.Quiz.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-quizzes']);
      toast.success('Quiz updated');
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Quizzes Management</h2>
        <Badge>{quizzes.length} quizzes</Badge>
      </div>

      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const course = courses.find(c => c.id === quiz.course_id);
          return (
            <Card key={quiz.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{course?.title || 'Unknown Course'}</Badge>
                    <Badge variant="outline">{quiz.questions?.length || 0} questions</Badge>
                    <Badge variant="outline" className="capitalize">{quiz.difficulty}</Badge>
                    {quiz.is_published ? (
                      <Badge className="bg-green-100 text-green-700">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublishMutation.mutate({ id: quiz.id, is_published: !quiz.is_published })}
                  >
                    {quiz.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this quiz?')) deleteQuizMutation.mutate(quiz.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

// Sessions Management Component
function SessionsManagement({ sessions, courses }) {
  const queryClient = useQueryClient();

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.VideoSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-sessions']);
      toast.success('Session deleted successfully');
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Live Sessions Management</h2>
        <Badge>{sessions.length} sessions</Badge>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const course = courses.find(c => c.id === session.course_id);
          return (
            <Card key={session.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{session.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{course?.title || 'Unknown Course'}</Badge>
                    <Badge variant="outline">{session.scheduled_date}</Badge>
                    <Badge variant="outline">{session.scheduled_time}</Badge>
                    <Badge className={`capitalize ${
                      session.status === 'live' ? 'bg-red-100 text-red-700' :
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {session.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl('VideoSession') + `?sessionId=${session.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this session?')) deleteSessionMutation.mutate(session.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

// Enrollments Management Component
function EnrollmentsManagement({ enrollments, courses, users }) {
  const queryClient = useQueryClient();

  const deleteEnrollmentMutation = useMutation({
    mutationFn: (id) => base44.entities.Enrollment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Enrollment removed successfully');
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Enrollment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Enrollment updated');
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Enrollments Management</h2>
        <Badge>{enrollments.length} enrollments</Badge>
      </div>

      <div className="space-y-3">
        {enrollments.map((enrollment) => {
          const course = courses.find(c => c.id === enrollment.course_id);
          const student = users.find(u => u.email === enrollment.created_by);
          return (
            <Card key={enrollment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{student?.full_name || 'Unknown Student'}</p>
                  <p className="text-sm text-gray-600">{course?.title || 'Unknown Course'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Progress: {enrollment.progress_percent}%</Badge>
                    <Badge variant="outline">{enrollment.completed_lessons?.length || 0} lessons completed</Badge>
                    {enrollment.is_completed && (
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Reset progress?')) {
                        updateEnrollmentMutation.mutate({
                          id: enrollment.id,
                          data: { progress_percent: 0, completed_lessons: [], is_completed: false }
                        });
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this enrollment?')) deleteEnrollmentMutation.mutate(enrollment.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

// Templates Management Component
function TemplatesManagement({ templates }) {
  const queryClient = useQueryClient();

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-templates']);
      toast.success('Template deleted successfully');
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Templates Management</h2>
        <div className="flex gap-3">
          <Badge>{templates.length} templates</Badge>
          <Link to={createPageUrl('Templates')}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{template.category}</Badge>
                  <Badge variant="outline">By: {template.created_by}</Badge>
                  <Badge variant="outline">{template.usage_count || 0} uses</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this template?')) deleteTemplateMutation.mutate(template.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Password Management Component
function AttendanceManagement({ attendanceRecords, users }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_email: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const student = users.find(u => u.email === data.student_email);
      return base44.entities.Attendance.create({
        ...data,
        student_name: student?.full_name || data.student_email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      setShowForm(false);
      setFormData({ student_email: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
      toast.success('Attendance recorded!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Attendance.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      toast.success('Deleted!');
    },
  });

  const downloadMonthlyReport = (month) => {
    const monthRecords = attendanceRecords.filter(r => r.date?.startsWith(month));
    const csv = [
      ['Date', 'Student Name', 'Email', 'Status', 'Notes'],
      ...monthRecords.map(r => [r.date, r.student_name, r.student_email, r.status, r.notes || ''])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${month}.csv`;
    a.click();
  };

  const downloadStudentStats = () => {
    const studentStats = {};
    attendanceRecords.forEach(record => {
      if (!studentStats[record.student_email]) {
        studentStats[record.student_email] = {
          name: record.student_name,
          email: record.student_email,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0
        };
      }
      studentStats[record.student_email][record.status]++;
      studentStats[record.student_email].total++;
    });

    const csv = [
      ['Student Name', 'Email', 'Total Days', 'Present', 'Absent', 'Late', 'Excused', 'Attendance Rate'],
      ...Object.values(studentStats).map(s => [
        s.name,
        s.email,
        s.total,
        s.present,
        s.absent,
        s.late,
        s.excused,
        `${((s.present / s.total) * 100).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-attendance-stats.csv`;
    a.click();
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const months = [...new Set(attendanceRecords.map(r => r.date?.substring(0, 7)))].filter(Boolean).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadStudentStats} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Stats
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Attendance
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-40"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
      </Card>

      {months.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Download Monthly Reports</h3>
          <div className="flex gap-2 flex-wrap">
            {months.map(month => (
              <Button
                key={month}
                variant="outline"
                size="sm"
                onClick={() => downloadMonthlyReport(month)}
              >
                <Download className="w-3 h-3 mr-2" />
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{record.date}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.student_name}</p>
                      <p className="text-xs text-gray-500">{record.student_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={
                      record.status === 'present' ? 'bg-green-100 text-green-700' :
                      record.status === 'absent' ? 'bg-red-100 text-red-700' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.notes || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this record?')) deleteMutation.mutate(record.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Record Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Student</label>
                <select
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select student</option>
                  {users.map(u => (
                    <option key={u.email} value={u.email}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.student_email}
                  className="flex-1"
                >
                  Record
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SiteContentManagement({ siteContent }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ key: '', value: '', section: 'general', description: '' });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SiteContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['site-content']);
      setShowForm(false);
      setFormData({ key: '', value: '', section: 'general', description: '' });
      toast.success('Content added!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['site-content']);
      setEditingItem(null);
      setFormData({ key: '', value: '', section: 'general', description: '' });
      toast.success('Content updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['site-content']);
      toast.success('Content deleted!');
    },
  });

  const handleSubmit = () => {
    if (!formData.key || !formData.value) {
      toast.error('Key and value are required');
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredContent = siteContent.filter(item => {
    const matchesSearch = !searchQuery || 
      item.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = filterSection === 'all' || item.section === filterSection;
    return matchesSearch && matchesSection;
  });

  const sections = ['all', 'home', 'footer', 'general', 'courses', 'programs', 'contact'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Content Management</h2>
          <p className="text-gray-600">Manage all text content across the website</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {sections.map(section => (
              <option key={section} value={section}>
                {section === 'all' ? 'All Sections' : section.charAt(0).toUpperCase() + section.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {(showForm || editingItem) && (
        <Card className="p-6 bg-indigo-50 border-indigo-200">
          <h3 className="font-semibold mb-4">{editingItem ? 'Edit Content' : 'Add New Content'}</h3>
          <div className="space-y-4">
            <div>
              <Label>Key (Unique Identifier) *</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., hero_title, cta_button_text"
                disabled={!!editingItem}
              />
            </div>
            <div>
              <Label>Section</Label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {sections.filter(s => s !== 'all').map(section => (
                  <option key={section} value={section}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Where does this appear?"
              />
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter the text content..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingItem(null);
                setFormData({ key: '', value: '', section: 'general', description: '' });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">{item.section}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">{item.value}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setShowForm(false);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this content?')) deleteMutation.mutate(item.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No content found</p>
        </div>
      )}
    </div>
  );
}

function ContactInfoManagement({ contactInfo }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: contactInfo?.email || 'info@diverseyouthni.com',
    phone: contactInfo?.phone || '+44 28 9012 3456',
    location: contactInfo?.location || 'Belfast, Northern Ireland',
    office_hours: contactInfo?.office_hours || [
      { day: 'Monday - Friday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 2:00 PM' },
      { day: 'Sunday', hours: 'Closed' }
    ]
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (contactInfo?.id) {
        return base44.entities.ContactInfo.update(contactInfo.id, data);
      } else {
        return base44.entities.ContactInfo.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-info']);
      toast.success('Contact info updated!');
    },
  });

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  const updateOfficeHour = (index, field, value) => {
    const updated = [...formData.office_hours];
    updated[index][field] = value;
    setFormData({ ...formData, office_hours: updated });
  };

  const addOfficeHour = () => {
    setFormData({
      ...formData,
      office_hours: [...formData.office_hours, { day: '', hours: '' }]
    });
  };

  const removeOfficeHour = (index) => {
    const updated = formData.office_hours.filter((_, i) => i !== index);
    setFormData({ ...formData, office_hours: updated });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      <p className="text-gray-500 mb-6">Manage the contact details shown on the Contact Us page</p>
      
      <div className="space-y-6 max-w-2xl">
        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@example.com"
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+44 28 9012 3456"
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Belfast, Northern Ireland"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Office Hours</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOfficeHour}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {formData.office_hours.map((item, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  value={item.day}
                  onChange={(e) => updateOfficeHour(index, 'day', e.target.value)}
                  placeholder="Monday - Friday"
                  className="flex-1"
                />
                <Input
                  value={item.hours}
                  onChange={(e) => updateOfficeHour(index, 'hours', e.target.value)}
                  placeholder="9:00 AM - 5:00 PM"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeOfficeHour(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Contact Info'}
        </Button>
      </div>
    </Card>
  );
}

function PasswordManagement({ users }) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => base44.asServiceRole.entities.User.update(userId, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('Password updated successfully');
      setSelectedUser(null);
      setNewPassword('');
    },
  });

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword.trim()) {
      toast.error('Please select user and enter password');
      return;
    }
    if (confirm(`Change password for ${selectedUser.full_name}?`)) {
      changePasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Password Management</h2>
        <p className="text-gray-500">Reset individual user login passwords</p>
      </div>

      {selectedUser && (
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">Changing password for: {selectedUser.full_name}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-3">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
            />
            <Button onClick={handleChangePassword}>
              <Lock className="w-4 h-4 mr-2" />
              Update
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(user)}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

// Tutor Requests Management Component
function TutorRequestsManagement() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: tutorRequests = [] } = useQuery({
    queryKey: ['tutor-requests'],
    queryFn: () => base44.entities.TutorRequest.list('-created_date', 100),
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, userEmail, userName }) => {
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
      const targetUser = users[0];

      if (!targetUser) {
        throw new Error('User not found');
      }

      await base44.asServiceRole.entities.User.update(targetUser.id, { is_tutor: true });
      
      await base44.entities.TutorRequest.update(requestId, { 
        status: 'approved',
        processed_by: user.email,
        processed_date: new Date().toISOString()
      });

      try {
        await base44.functions.invoke('sendNotification', {
          recipient_email: userEmail,
          title: 'Welcome as a Tutor!',
          message: `Congratulations ${userName}! Your tutor request has been approved. You can now access the Tutor Dashboard and start creating courses.`,
          type: 'general',
          send_email: true,
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-requests']);
      queryClient.invalidateQueries(['all-users']);
      toast.success('Tutor approved and welcome email sent!');
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      await base44.entities.TutorRequest.update(requestId, { 
        status: 'rejected',
        processed_by: user.email,
        processed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-requests']);
      toast.success('Request rejected');
    },
  });

  const pendingRequests = tutorRequests.filter(r => r.status === 'pending');
  const processedRequests = tutorRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-orange-600" />
            Pending Tutor Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <Card key={request.id} className="p-4 bg-white border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900">{request.user_name}</p>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{request.user_email}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Reason:</p>
                        <p className="text-sm text-gray-700 italic">"{request.reason}"</p>
                      </div>
                      
                      {request.qualifications && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Qualifications:</p>
                          <p className="text-sm text-gray-700">{request.qualifications}</p>
                        </div>
                      )}
                      
                      {request.subjects && request.subjects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Subjects:</p>
                          <div className="flex gap-2 flex-wrap">
                            {request.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="outline">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm"
                    onClick={() => approveRequestMutation.mutate({ 
                      requestId: request.id, 
                      userEmail: request.user_email,
                      userName: request.user_name
                    })}
                    disabled={approveRequestMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequestMutation.mutate(request.id)}
                    disabled={rejectRequestMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {processedRequests.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Processed Requests</h2>
          <div className="space-y-3">
            {processedRequests.map(request => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{request.user_name}</p>
                      <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{request.user_email}</p>
                    {request.processed_by && (
                      <p className="text-xs text-gray-500 mt-1">
                        Processed by {request.processed_by} on {new Date(request.processed_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {tutorRequests.length === 0 && (
        <Card className="p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tutor Requests</h3>
          <p className="text-gray-500">All tutor requests will appear here</p>
        </Card>
      )}
    </div>
  );
}

function SitePasswordsManagement({ siteContent }) {
  const queryClient = useQueryClient();
  const [passwords, setPasswords] = useState({
    course_access_password: '',
    admin_panel_password: ''
  });

  useEffect(() => {
    const coursePass = siteContent.find(c => c.key === 'course_access_password');
    const adminPass = siteContent.find(c => c.key === 'admin_panel_password');
    
    setPasswords({
      course_access_password: coursePass?.value || 'LEARNERS26',
      admin_panel_password: adminPass?.value || 'Edu24!'
    });
  }, [siteContent]);

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = siteContent.find(c => c.key === key);
      if (existing) {
        return base44.entities.SiteContent.update(existing.id, { value });
      } else {
        return base44.entities.SiteContent.create({ 
          key, 
          value, 
          section: 'security',
          description: key === 'course_access_password' ? 'Password to access courses' : 'Password to access admin panel'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site-content']);
      toast.success('Password updated successfully');
    },
  });

  const handleUpdate = (key) => {
    if (!passwords[key]?.trim()) {
      toast.error('Password cannot be empty');
      return;
    }
    if (confirm(`Update ${key === 'course_access_password' ? 'course access' : 'admin panel'} password?`)) {
      updatePasswordMutation.mutate({ key, value: passwords[key] });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Site Passwords Management</h2>
        <p className="text-gray-500">Manage access passwords for different sections of the website</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="p-5 bg-indigo-50 border-indigo-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Course Access Password</h3>
              <p className="text-sm text-gray-600 mb-3">Users must enter this password to access courses and course-related pages</p>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={passwords.course_access_password}
                  onChange={(e) => setPasswords({ ...passwords, course_access_password: e.target.value })}
                  placeholder="Enter password"
                  className="flex-1"
                />
                <Button onClick={() => handleUpdate('course_access_password')}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-red-50 border-red-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Admin Panel Password</h3>
              <p className="text-sm text-gray-600 mb-3">Password required to access the admin dashboard (shown in the More menu)</p>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={passwords.admin_panel_password}
                  onChange={(e) => setPasswords({ ...passwords, admin_panel_password: e.target.value })}
                  placeholder="Enter password"
                  className="flex-1"
                />
                <Button onClick={() => handleUpdate('admin_panel_password')}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Admins always bypass the course access password</li>
                <li>Passwords are case-sensitive</li>
                <li>Users will need to re-enter password after changes</li>
                <li>Share passwords securely with authorized users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}