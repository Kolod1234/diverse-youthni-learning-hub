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
import { 
  Plus, BookOpen, Users, DollarSign, TrendingUp, 
  Edit, Trash2, Save, X, CheckCircle, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Redirect if not admin
      if (userData.role !== 'admin') {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 200),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      setShowCreateForm(false);
      setFormData({});
      toast.success('Course created successfully!');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      setEditingCourse(null);
      toast.success('Course updated successfully!');
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      toast.success('Course deleted successfully!');
    },
  });

  const handleCreate = () => {
    createCourseMutation.mutate({
      ...formData,
      rating: parseFloat(formData.rating) || 4.5,
      price: parseFloat(formData.price) || 0,
      duration_hours: parseFloat(formData.duration_hours) || 0,
      total_lessons: parseFloat(formData.total_lessons) || 0,
      enrolled_count: 0,
      is_featured: formData.is_featured || false,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    });
  };

  const handleUpdate = () => {
    if (!editingCourse) return;
    updateCourseMutation.mutate({
      id: editingCourse.id,
      data: {
        ...formData,
        rating: parseFloat(formData.rating),
        price: parseFloat(formData.price),
        duration_hours: parseFloat(formData.duration_hours),
        total_lessons: parseFloat(formData.total_lessons),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      },
    });
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      ...course,
      tags: course.tags?.join(', ') || '',
    });
  };

  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0) * (c.enrolled_count || 0), 0);
  const totalStudents = new Set(enrollments.map(e => e.created_by)).size;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage courses, users, and platform analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
            { label: 'Enrollments', value: enrollments.length, icon: TrendingUp, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-5 border-0 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Manage Courses</h2>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Course
                </Button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <Card className="p-6 mb-6 bg-indigo-50 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Create New Course</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CourseForm formData={formData} setFormData={setFormData} />
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={handleCreate}
                      disabled={createCourseMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Courses List */}
              <div className="space-y-3">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4 border-gray-200">
                    {editingCourse?.id === course.id ? (
                      <div>
                        <CourseForm formData={formData} setFormData={setFormData} />
                        <div className="flex gap-3 mt-4">
                          <Button 
                            onClick={handleUpdate}
                            disabled={updateCourseMutation.isPending}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <img 
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} 
                          alt={course.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                                <span>•</span>
                                <span>{course.enrolled_count || 0} students</span>
                                <span>•</span>
                                <span>${course.price || 0}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => startEdit(course)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  if (confirm('Delete this course?')) {
                                    deleteCourseMutation.mutate(course.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Users</h2>
              <div className="space-y-3">
                {allUsers.map((u) => (
                  <Card key={u.id} className="p-4 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{u.full_name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {enrollments.filter(e => e.created_by === u.email).length} courses
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Top Courses</h3>
                <div className="space-y-3">
                  {courses
                    .sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0))
                    .slice(0, 5)
                    .map((course, idx) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                            <p className="text-xs text-gray-500">{course.enrolled_count || 0} students</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Course Categories</h3>
                <div className="space-y-3">
                  {Object.entries(
                    courses.reduce((acc, c) => {
                      acc[c.category] = (acc[c.category] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{category?.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CourseForm({ formData, setFormData }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>Title *</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Course title"
        />
      </div>
      <div>
        <Label>Instructor *</Label>
        <Input
          value={formData.instructor || ''}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          placeholder="Instructor name"
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Description *</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Course description"
          rows={3}
        />
      </div>
      <div>
        <Label>Category *</Label>
        <select
          value={formData.category || ''}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-gray-300"
        >
          <option value="">Select category</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="marketing">Marketing</option>
          <option value="data_science">Data Science</option>
          <option value="photography">Photography</option>
          <option value="music">Music</option>
          <option value="health">Health</option>
        </select>
      </div>
      <div>
        <Label>Level *</Label>
        <select
          value={formData.level || ''}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-gray-300"
        >
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <Label>Price</Label>
        <Input
          type="number"
          value={formData.price || ''}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="0"
        />
      </div>
      <div>
        <Label>Duration (hours)</Label>
        <Input
          type="number"
          value={formData.duration_hours || ''}
          onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
          placeholder="0"
        />
      </div>
      <div>
        <Label>Total Lessons</Label>
        <Input
          type="number"
          value={formData.total_lessons || ''}
          onChange={(e) => setFormData({ ...formData, total_lessons: e.target.value })}
          placeholder="0"
        />
      </div>
      <div>
        <Label>Rating</Label>
        <Input
          type="number"
          step="0.1"
          max="5"
          value={formData.rating || ''}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          placeholder="4.5"
        />
      </div>
      <div>
        <Label>Thumbnail URL</Label>
        <Input
          value={formData.thumbnail || ''}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Instructor Avatar URL</Label>
        <Input
          value={formData.instructor_avatar || ''}
          onChange={(e) => setFormData({ ...formData, instructor_avatar: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Tags (comma-separated)</Label>
        <Input
          value={formData.tags || ''}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="React, JavaScript, Web Development"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          checked={formData.is_featured || false}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
        />
        <Label htmlFor="is_featured">Featured Course</Label>
      </div>
    </div>
  );
}