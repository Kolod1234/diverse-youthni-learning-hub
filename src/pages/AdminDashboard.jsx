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
  TrendingUp, Key, Database, Lock, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
              Carousel
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
              Passwords
            </TabsTrigger>
            <TabsTrigger value="partners" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement users={allUsers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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

          <TabsContent value="partners">
            <PartnersManagement />
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
    mutationFn: (data) => base44.entities.PartnerLogo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      setShowForm(false);
      setFormData({ name: '', logo_url: '', website_url: '', type: 'partner' });
      toast.success('Logo added!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PartnerLogo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      setEditingLogo(null);
      setFormData({ name: '', logo_url: '', website_url: '', type: 'partner' });
      toast.success('Logo updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PartnerLogo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-logos']);
      toast.success('Logo deleted!');
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
          <Card key={logo.id} className="p-4">
            <div className="aspect-video flex items-center justify-center mb-3 bg-gray-50 rounded">
              <img src={logo.logo_url} alt={logo.name} className="max-h-full max-w-full object-contain" />
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">{logo.name}</h3>
            <Badge variant="secondary" className="text-xs mb-3">{logo.type}</Badge>
            <div className="flex gap-2">
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
function CarouselManager() {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');

  const { data: carouselImages = [] } = useQuery({
    queryKey: ['carousel-images'],
    queryFn: () => base44.entities.CarouselImage.list('order', 100),
  });

  const createImageMutation = useMutation({
    mutationFn: (data) => base44.entities.CarouselImage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['carousel-images']);
      toast.success('Image added to carousel');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => base44.entities.CarouselImage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['carousel-images']);
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
      <h2 className="text-xl font-semibold mb-6">Carousel Image Management</h2>
      
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
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogs, setBlogs] = useState([]);

  const publishBlog = () => {
    if (!blogTitle.trim() || !blogContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newBlog = {
      id: Date.now(),
      title: blogTitle,
      content: blogContent,
      date: new Date().toISOString(),
      author: 'Admin'
    };

    setBlogs([newBlog, ...blogs]);
    setBlogTitle('');
    setBlogContent('');
    toast.success('Blog published successfully');
  };

  const deleteBlog = (id) => {
    setBlogs(blogs.filter(b => b.id !== id));
    toast.success('Blog deleted');
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Blog Management</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label>Blog Title</Label>
          <Input
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Enter blog title..."
          />
        </div>
        
        <div>
          <Label>Blog Content</Label>
          <Textarea
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
            placeholder="Write your blog content..."
            rows={8}
          />
        </div>

        <Button onClick={publishBlog} className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          Publish Blog
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Published Blogs</h3>
        {blogs.map((blog) => (
          <Card key={blog.id} className="p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{blog.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{blog.content}</p>
                <p className="text-xs text-gray-500">{new Date(blog.date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteBlog(blog.id)}>
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

// Lessons Management Component
function LessonsManagement({ lessons, courses }) {
  const queryClient = useQueryClient();

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      toast.success('Lesson deleted successfully');
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Lessons Management</h2>
        <Badge>{lessons.length} lessons</Badge>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => {
          const course = courses.find(c => c.id === lesson.course_id);
          return (
            <Card key={lesson.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{course?.title || 'Unknown Course'}</Badge>
                    <Badge variant="outline">{lesson.section}</Badge>
                    <Badge variant="outline">{lesson.duration_minutes} min</Badge>
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
            </Card>
          );
        })}
      </div>
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
        <h2 className="text-xl font-semibold mb-2">Password Management</h2>
        <p className="text-gray-500">Reset user passwords as admin</p>
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