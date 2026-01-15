import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Bell, ClipboardList, MessageSquare, Award, Users, FileText, 
  BookOpen, Target, BarChart, FileCheck, HelpCircle, Calendar,
  Video, Menu, Plus, Search, ChevronRight, Edit, Trash2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TutorDashboard() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId'));
  const currentView = searchParams.get('view') || 'modules';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      if (!userData.is_tutor && userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  useEffect(() => {
    if (selectedCourse && !selectedCourseId) {
      setSelectedCourseId(selectedCourse.id);
      setSearchParams({ courseId: selectedCourse.id, view: currentView });
    }
  }, [selectedCourse, selectedCourseId]);

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', selectedCourse?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: selectedCourse?.id }, 'order', 200),
    enabled: !!selectedCourse?.id,
  });

  const navItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: BookOpen, label: 'Modules', view: 'modules' },
    { icon: Bell, label: 'Announcements', view: 'announcements' },
    { icon: ClipboardList, label: 'Assignments', view: 'assignments' },
    { icon: MessageSquare, label: 'Discussions', view: 'discussions' },
    { icon: Award, label: 'Grades', view: 'grades' },
    { icon: Users, label: 'People', view: 'people' },
    { icon: FileText, label: 'Pages', view: 'pages' },
    { icon: FileText, label: 'Files', view: 'files' },
    { icon: BookOpen, label: 'Syllabus', view: 'syllabus' },
    { icon: Target, label: 'Outcomes', view: 'outcomes' },
    { icon: FileCheck, label: 'Rubrics', view: 'rubrics' },
    { icon: HelpCircle, label: 'Quizzes', view: 'quizzes' },
    { icon: Video, label: 'BigBlueButton', view: 'video' },
    { icon: Users, label: 'Collaborations', view: 'collaborations' },
    { icon: Calendar, label: 'Attendance', view: 'attendance' },
    { icon: BarChart, label: 'Course Analytics', view: 'analytics' },
    { icon: FileText, label: 'Lucid (Whiteboard)', view: 'whiteboard' },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        {/* Course Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
              {selectedCourse?.category?.substring(0, 2).toUpperCase() || 'CO'}
            </div>
            <div className="flex-1 min-w-0">
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSearchParams({ courseId: e.target.value, view: currentView });
                }}
                className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div className="text-xs text-gray-500">› Modules</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setSearchParams({ courseId: selectedCourseId, view: item.view })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 bg-gray-800 text-white flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-700 p-2 rounded">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <button className="hover:bg-gray-700 p-2 rounded">
                <Home className="w-5 h-5" />
              </button>
            </Link>
            <button className="hover:bg-gray-700 p-2 rounded">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">
            {/* Main Section */}
            <div className="flex-1 p-8 overflow-y-auto">
              {currentView === 'modules' && <ModulesView courses={courses} user={user} />}
              {currentView === 'home' && <HomeView courses={courses} />}
              {currentView === 'assignments' && <AssignmentsView course={selectedCourse} />}
              {currentView === 'people' && <PeopleView course={selectedCourse} />}
              {currentView === 'grades' && <GradesView course={selectedCourse} />}
              {currentView === 'analytics' && <AnalyticsView course={selectedCourse} />}
              {currentView === 'announcements' && <AnnouncementsView course={selectedCourse} />}
              {currentView === 'discussions' && <DiscussionsView course={selectedCourse} />}
              {currentView === 'pages' && <PagesView course={selectedCourse} />}
              {currentView === 'files' && <FilesView course={selectedCourse} />}
              {currentView === 'syllabus' && <SyllabusView course={selectedCourse} />}
              {currentView === 'outcomes' && <OutcomesView course={selectedCourse} />}
              {currentView === 'rubrics' && <RubricsView course={selectedCourse} />}
              {currentView === 'quizzes' && <QuizzesView course={selectedCourse} />}
              {currentView === 'video' && <VideoView course={selectedCourse} />}
              {currentView === 'collaborations' && <CollaborationsView course={selectedCourse} />}
              {currentView === 'attendance' && <AttendanceView course={selectedCourse} />}
              {currentView === 'whiteboard' && <WhiteboardView course={selectedCourse} />}
            </div>

            {/* Right Sidebar - Context Sensitive */}
            <div className="w-80 border-l border-gray-200 p-6 bg-gray-50 overflow-y-auto">
              <RightSidebarContent currentView={currentView} course={selectedCourse} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulesView({ courses, user }) {
  const queryClient = useQueryClient();
  const [expandedCourseId, setExpandedCourseId] = React.useState(null);
  const [expandedLessonId, setExpandedLessonId] = React.useState(null);
  const [showCreateCourse, setShowCreateCourse] = React.useState(false);
  const [courseForm, setCourseForm] = React.useState({});
  const [editingCourse, setEditingCourse] = React.useState(null);
  const [showCreateLesson, setShowCreateLesson] = React.useState(false);
  const [lessonForm, setLessonForm] = React.useState({});
  const [editingLesson, setEditingLesson] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: async () => {
      const allLessons = [];
      for (const course of courses) {
        const lessons = await base44.entities.Lesson.filter({ course_id: course.id }, 'order', 200);
        allLessons.push(...lessons);
      }
      return allLessons;
    },
    enabled: courses.length > 0,
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      setShowCreateCourse(false);
      setCourseForm({});
      toast.success('Course created!');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      setEditingCourse(null);
      toast.success('Course updated!');
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      toast.success('Course deleted!');
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (data) => base44.entities.Lesson.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      queryClient.invalidateQueries(['tutor-courses']);
      setShowCreateLesson(false);
      setLessonForm({});
      toast.success('Lesson created!');
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      setEditingLesson(null);
      toast.success('Lesson updated!');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      queryClient.invalidateQueries(['tutor-courses']);
      toast.success('Lesson deleted!');
    },
  });

  const handleCreateCourse = () => {
    createCourseMutation.mutate({
      ...courseForm,
      instructor: user?.full_name || 'Instructor',
      instructor_avatar: user?.avatar,
      rating: 4.5,
      enrolled_count: 0,
      price: parseFloat(courseForm.price) || 0,
      duration_hours: parseFloat(courseForm.duration_hours) || 0,
      total_lessons: 0,
    });
  };

  const handleCreateLesson = () => {
    const courseLessons = allLessons.filter(l => l.course_id === lessonForm.course_id);
    createLessonMutation.mutate({
      ...lessonForm,
      order: courseLessons.length + 1,
      duration_minutes: parseInt(lessonForm.duration_minutes) || 10,
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({ ...lessonForm, video_url: file_url });
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({ 
        ...lessonForm, 
        file_url,
        file_type: file.name.split('.').pop(),
        content_type: 'document'
      });
      toast.success('Document uploaded!');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modules</h1>
        <Button onClick={() => setShowCreateCourse(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Create Course Form */}
      {showCreateCourse && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Course</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateCourse(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={courseForm.title || ''}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={courseForm.description || ''}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Course description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={courseForm.category || ''}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="english">English</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={courseForm.level || 'beginner'}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateCourse} disabled={!courseForm.title || createCourseMutation.isPending}>
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lesson Form */}
      {showCreateLesson && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Lesson</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateLesson(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select
                value={lessonForm.course_id || ''}
                onChange={(e) => setLessonForm({ ...lessonForm, course_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={lessonForm.title || ''}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Lesson title"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section/Topic *</label>
                <input
                  type="text"
                  value={lessonForm.section || ''}
                  onChange={(e) => setLessonForm({ ...lessonForm, section: e.target.value })}
                  placeholder="e.g., Introduction, Module 1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={lessonForm.description || ''}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="What will students learn?"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video URL or Upload</label>
                <input
                  type="text"
                  value={lessonForm.video_url || ''}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/embed/..."
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  id="video-upload-inline"
                  className="hidden"
                />
                <label htmlFor="video-upload-inline">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} className="w-full" onClick={() => document.getElementById('video-upload-inline').click()}>
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </Button>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Slides (PPT/PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleDocumentUpload}
                  disabled={uploading}
                  id="doc-upload-inline"
                  className="hidden"
                />
                <label htmlFor="doc-upload-inline">
                  <Button type="button" variant="outline" disabled={uploading} className="w-full" onClick={() => document.getElementById('doc-upload-inline').click()}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </label>
                {lessonForm.file_url && (
                  <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Google Slides URL</label>
              <input
                type="text"
                value={lessonForm.google_slides_url || ''}
                onChange={(e) => setLessonForm({ ...lessonForm, google_slides_url: e.target.value, content_type: 'googleslides' })}
                placeholder="https://docs.google.com/presentation/d/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preview-check"
                checked={lessonForm.is_preview || false}
                onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="preview-check" className="text-sm">Allow free preview</label>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateLesson} disabled={!lessonForm.title || !lessonForm.course_id || createLessonMutation.isPending}>
                {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateLesson(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* All Courses with Lessons */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Create your first course to get started</p>
          <Button onClick={() => setShowCreateCourse(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Course
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const courseLessons = allLessons.filter(l => l.course_id === course.id);
            const sections = {};
            courseLessons.forEach(lesson => {
              const section = lesson.section || 'General';
              if (!sections[section]) sections[section] = [];
              sections[section].push(lesson);
            });
            const isExpanded = expandedCourseId === course.id;

            return (
              <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  {editingCourse?.id === course.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={courseForm.title || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        value={courseForm.description || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => {
                          updateCourseMutation.mutate({ id: course.id, data: courseForm });
                        }}>Save</Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="hover:bg-blue-100 p-2 rounded transition-colors"
                        >
                          <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-700">{course.category}</span>
                            <span>•</span>
                            <span>{courseLessons.length} lessons</span>
                            <span>•</span>
                            <span>{course.enrolled_count || 0} students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setLessonForm({ course_id: course.id });
                          setShowCreateLesson(true);
                        }}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lesson
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingCourse(course);
                          setCourseForm(course);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (confirm('Delete this course and all its lessons?')) deleteCourseMutation.mutate(course.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Lessons */}
                {isExpanded && (
                  <div className="p-4">
                    {Object.keys(sections).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No lessons yet. Click "Add Lesson" to create one.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(sections).map(([sectionName, sectionLessons]) => (
                          <div key={sectionName} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 text-sm">{sectionName}</h4>
                              <span className="text-xs text-gray-500">{sectionLessons.length} lessons</span>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {sectionLessons.map(lesson => {
                                const isLessonExpanded = expandedLessonId === lesson.id;
                                return (
                                  <div key={lesson.id}>
                                    <div className="px-4 py-3 hover:bg-gray-50 group">
                                      {editingLesson?.id === lesson.id ? (
                                        <div className="space-y-3">
                                          <input
                                            type="text"
                                            value={lessonForm.title || ''}
                                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                          />
                                          <textarea
                                            value={lessonForm.description || ''}
                                            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                            rows={2}
                                          />
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={() => updateLessonMutation.mutate({ id: lesson.id, data: lessonForm })}>
                                              Save
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setEditingLesson(null)}>Cancel</Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <button
                                              onClick={() => setExpandedLessonId(isLessonExpanded ? null : lesson.id)}
                                              className="hover:bg-gray-200 p-1 rounded"
                                            >
                                              <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isLessonExpanded ? 'rotate-90' : ''}`} />
                                            </button>
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1">
                                              <div className="font-medium text-gray-900 text-sm">{lesson.title}</div>
                                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs text-gray-500">{lesson.duration_minutes || 10} min</span>
                                                {lesson.video_url && (
                                                  <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Video</span>
                                                  </>
                                                )}
                                                {lesson.google_slides_url && (
                                                  <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Google Slides</span>
                                                  </>
                                                )}
                                                {lesson.file_url && (
                                                  <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{lesson.file_type?.toUpperCase() || 'Doc'}</span>
                                                  </>
                                                )}
                                                {lesson.slides && lesson.slides.length > 0 && (
                                                  <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{lesson.slides.length} Slides</span>
                                                  </>
                                                )}
                                                {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                                                  <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{lesson.learning_objectives.length} Objectives</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                            <Link to={createPageUrl('LessonEditor') + `?id=${lesson.id}`}>
                                              <Button variant="outline" size="sm">Full Editor</Button>
                                            </Link>
                                            <Button variant="outline" size="sm" onClick={() => {
                                              if (confirm('Delete this lesson?')) deleteLessonMutation.mutate(lesson.id);
                                            }}>
                                              <Trash2 className="w-3 h-3 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Expanded Lesson Details */}
                                    {isLessonExpanded && (
                                      <div className="px-4 pb-4 pt-2 ml-8 border-l-2 border-blue-300 bg-blue-50/50">
                                        <div className="space-y-3 text-sm">
                                          {lesson.description && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Description:</span>
                                              <p className="text-gray-600 mt-1">{lesson.description}</p>
                                            </div>
                                          )}
                                          
                                          {lesson.video_url && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Video URL:</span>
                                              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mt-1 truncate">
                                                {lesson.video_url}
                                              </a>
                                            </div>
                                          )}
                                          
                                          {lesson.google_slides_url && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Google Slides:</span>
                                              <a href={lesson.google_slides_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mt-1 truncate">
                                                {lesson.google_slides_url}
                                              </a>
                                            </div>
                                          )}
                                          
                                          {lesson.file_url && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Uploaded Document:</span>
                                              <a href={lesson.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mt-1">
                                                {lesson.file_type?.toUpperCase() || 'Document'} File
                                              </a>
                                            </div>
                                          )}
                                          
                                          {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Learning Objectives:</span>
                                              <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                                                {lesson.learning_objectives.map((obj, idx) => (
                                                  <li key={idx}>{obj}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          
                                          {lesson.slides && lesson.slides.length > 0 && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Custom Slides ({lesson.slides.length}):</span>
                                              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                                {lesson.slides.slice(0, 5).map((slide, idx) => (
                                                  <div key={idx} className="bg-white border border-gray-200 rounded p-2">
                                                    <div className="font-medium text-gray-800 text-xs">Slide {slide.order || idx + 1}: {slide.title}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1 mt-1" dangerouslySetInnerHTML={{ __html: slide.content }} />
                                                  </div>
                                                ))}
                                                {lesson.slides.length > 5 && (
                                                  <p className="text-xs text-gray-500 italic">+ {lesson.slides.length - 5} more slides</p>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {lesson.resources && lesson.resources.length > 0 && (
                                            <div>
                                              <span className="font-semibold text-gray-700">Resources:</span>
                                              <ul className="mt-1 space-y-1">
                                                {lesson.resources.map((res, idx) => (
                                                  <li key={idx}>
                                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                                      {res.name}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}

                                          <div className="pt-2 border-t border-gray-200 mt-3">
                                            <Link to={createPageUrl('LessonEditor') + `?id=${lesson.id}`}>
                                              <Button variant="outline" size="sm" className="w-full">
                                                <Edit className="w-3 h-3 mr-2" />
                                                Edit All Lesson Content
                                              </Button>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CoursesView({ courses, user }) {
  const [showCreateCourse, setShowCreateCourse] = React.useState(false);
  const [courseForm, setCourseForm] = React.useState({});
  const [editingCourse, setEditingCourse] = React.useState(null);
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      setShowCreateCourse(false);
      setCourseForm({});
      toast.success('Course created!');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      setEditingCourse(null);
      toast.success('Course updated!');
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-courses']);
      toast.success('Course deleted!');
    },
  });

  const handleCreateCourse = () => {
    createCourseMutation.mutate({
      ...courseForm,
      instructor: user?.full_name || 'Instructor',
      instructor_avatar: user?.avatar,
      rating: 4.5,
      enrolled_count: 0,
      price: parseFloat(courseForm.price) || 0,
      duration_hours: parseFloat(courseForm.duration_hours) || 0,
      total_lessons: 0,
    });
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <Button onClick={() => setShowCreateCourse(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {showCreateCourse && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={courseForm.title || ''}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={courseForm.description || ''}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Course description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={courseForm.category || ''}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="english">English</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={courseForm.level || 'beginner'}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateCourse} disabled={createCourseMutation.isPending}>
                {createCourseMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingCourse?.id === course.id ? (
              <div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={courseForm.title || ''}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    value={courseForm.description || ''}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => {
                    updateCourseMutation.mutate({ id: course.id, data: courseForm });
                  }} size="sm">Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} 
                    alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{course.category}</span>
                      <span>•</span>
                      <span>{course.total_lessons || 0} lessons</span>
                      <span>•</span>
                      <span>{course.enrolled_count || 0} students</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                    <Button variant="outline" size="sm">
                      Manage Content
                    </Button>
                  </Link>
                  <Link to={createPageUrl('LessonEditor') + `?courseId=${course.id}`}>
                    <Button variant="outline" size="sm">
                      Add Lesson
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingCourse(course);
                    setCourseForm(course);
                  }}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (confirm('Delete this course?')) deleteCourseMutation.mutate(course.id);
                  }}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeView({ courses }) {
  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['tutor-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
  });

  const totalStudents = new Set(
    allEnrollments.filter(e => courses.some(c => c.id === e.course_id)).map(e => e.created_by)
  ).size;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Home</h1>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Courses</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{totalStudents}</div>
          <div className="text-sm text-gray-600 mt-1">Total Students</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-600">
            {courses.reduce((sum, c) => sum + (c.total_lessons || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Lessons</div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
        <div className="space-y-3">
          {courses.slice(0, 5).map(course => (
            <div key={course.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{course.title}</div>
                <div className="text-sm text-gray-500">{course.category}</div>
              </div>
              <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssignmentsView({ course }) {
  const { data: assignments = [] } = useQuery({
    queryKey: ['course-assignments', course?.id],
    queryFn: () => base44.entities.Assignment.filter({ course_id: course?.id }, '-created_date', 100),
    enabled: !!course?.id,
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <Link to={createPageUrl('CreateAssignment') + `?courseId=${course?.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
              <span>•</span>
              <span>{assignment.total_points || 100} points</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeopleView({ course }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', course?.id],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: course?.id }, '-created_date', 200),
    enabled: !!course?.id,
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">People</h1>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold">Students ({enrollments.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {enrollment.created_by?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{enrollment.created_by}</div>
                  <div className="text-sm text-gray-500">{enrollment.progress_percent || 0}% complete</div>
                </div>
              </div>
              <Button variant="outline" size="sm">View Profile</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GradesView({ course }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Grades</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Grade Book</h3>
        <p className="text-gray-500">View and manage student grades</p>
      </div>
    </div>
  );
}

function AnalyticsView({ course }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments-analytics', course?.id],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: course?.id }, '-created_date', 500),
    enabled: !!course?.id,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['course-quiz-attempts', course?.id],
    queryFn: () => base44.entities.QuizAttempt.filter({ course_id: course?.id }, '-created_date', 1000),
    enabled: !!course?.id,
  });

  // Calculate completion rate
  const completionRate = enrollments.length > 0
    ? Math.round((enrollments.filter(e => e.is_completed).length / enrollments.length) * 100)
    : 0;

  // Calculate engagement rate (students with >0% progress)
  const engagementRate = enrollments.length > 0
    ? Math.round((enrollments.filter(e => (e.progress_percent || 0) > 0).length / enrollments.length) * 100)
    : 0;

  // Average progress
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  // Quiz performance
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length)
    : 0;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Analytics</h1>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Engagement</h3>
          <div className="text-3xl font-bold text-blue-600">{engagementRate}%</div>
          <div className="text-sm text-gray-500">Students who started the course</div>
          <div className="text-xs text-gray-400 mt-2">{enrollments.filter(e => (e.progress_percent || 0) > 0).length} of {enrollments.length} students</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Completion</h3>
          <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
          <div className="text-sm text-gray-500">Course completion rate</div>
          <div className="text-xs text-gray-400 mt-2">{enrollments.filter(e => e.is_completed).length} of {enrollments.length} completed</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Average Progress</h3>
          <div className="text-3xl font-bold text-purple-600">{avgProgress}%</div>
          <div className="text-sm text-gray-500">Across all students</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Quiz Performance</h3>
          <div className="text-3xl font-bold text-amber-600">{avgQuizScore}%</div>
          <div className="text-sm text-gray-500">Average quiz score</div>
          <div className="text-xs text-gray-400 mt-2">{quizAttempts.length} total attempts</div>
        </div>
      </div>
    </div>
  );
}

function AnnouncementsView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No announcements yet</h3>
        <p className="text-gray-500">Create announcements to communicate with your students</p>
      </div>
    </div>
  );
}

function DiscussionsView({ course }) {
  const { data: discussions = [] } = useQuery({
    queryKey: ['course-discussions', course?.id],
    queryFn: () => base44.entities.Discussion.filter({ course_id: course?.id }, '-created_date', 100),
    enabled: !!course?.id,
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
        <Link to={createPageUrl('CourseDiscussion') + `?courseId=${course?.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {discussions.length > 0 ? discussions.map(discussion => (
          <div key={discussion.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{discussion.content}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>{discussion.replies_count || 0} replies</span>
              <span>•</span>
              <span>{discussion.likes_count || 0} likes</span>
            </div>
          </div>
        )) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No discussions yet</h3>
            <p className="text-gray-500">Start a discussion to engage with students</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PagesView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No pages yet</h3>
        <p className="text-gray-500">Create pages with course content and resources</p>
      </div>
    </div>
  );
}

function FilesView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Files</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No files yet</h3>
        <p className="text-gray-500">Upload course materials and resources</p>
      </div>
    </div>
  );
}

function SyllabusView({ course }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Syllabus</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{course?.title}</h2>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">{course?.description}</p>
          <h3 className="text-lg font-semibold mt-6 mb-2">Course Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Category: {course?.category || 'Not specified'}</li>
            <li>Level: {course?.level || 'Not specified'}</li>
            <li>Duration: {course?.duration_hours || 0} hours</li>
            <li>Total Lessons: {course?.total_lessons || 0}</li>
          </ul>
        </div>
        <div className="mt-6">
          <Button variant="outline">
            Edit Syllabus
          </Button>
        </div>
      </div>
    </div>
  );
}

function OutcomesView({ course }) {
  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons-outcomes', course?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course?.id }, 'order', 200),
    enabled: !!course?.id,
  });

  const lessonsWithObjectives = lessons.filter(l => l.learning_objectives?.length > 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Outcomes</h1>
      <div className="space-y-4">
        {lessonsWithObjectives.length > 0 ? lessonsWithObjectives.map(lesson => (
          <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{lesson.title}</h3>
            <ul className="list-disc list-inside space-y-1">
              {lesson.learning_objectives.map((obj, idx) => (
                <li key={idx} className="text-sm text-gray-600">{obj}</li>
              ))}
            </ul>
          </div>
        )) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No learning outcomes yet</h3>
            <p className="text-gray-500">Add learning objectives to your lessons</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RubricsView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rubrics</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Rubric
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No rubrics yet</h3>
        <p className="text-gray-500">Create rubrics to standardize grading</p>
      </div>
    </div>
  );
}

function QuizzesView({ course }) {
  const { data: quizzes = [] } = useQuery({
    queryKey: ['course-quizzes', course?.id],
    queryFn: () => base44.entities.Quiz.filter({ course_id: course?.id }, '-created_date', 100),
    enabled: !!course?.id,
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        <Link to={createPageUrl('QuizGenerator') + `?courseId=${course?.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {quizzes.length > 0 ? quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>{quiz.questions?.length || 0} questions</span>
              <span>•</span>
              <span>{quiz.total_marks || 0} points</span>
              <span>•</span>
              <span>{quiz.is_published ? 'Published' : 'Draft'}</span>
            </div>
          </div>
        )) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No quizzes yet</h3>
            <p className="text-gray-500">Create quizzes to assess student learning</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoView({ course }) {
  const { data: sessions = [] } = useQuery({
    queryKey: ['course-video-sessions', course?.id],
    queryFn: () => base44.entities.VideoSession.filter({ course_id: course?.id }, '-scheduled_date', 50),
    enabled: !!course?.id,
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Video Sessions</h1>
        <Link to={createPageUrl('ScheduleSession') + `?courseId=${course?.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {sessions.length > 0 ? sessions.map(session => (
          <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">{session.title}</h3>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span>{new Date(session.scheduled_date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{session.scheduled_time}</span>
              <span>•</span>
              <span className="capitalize">{session.status}</span>
            </div>
          </div>
        )) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sessions scheduled</h3>
            <p className="text-gray-500">Schedule live video sessions with students</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CollaborationsView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Collaborations</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Collaboration
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No collaborations yet</h3>
        <p className="text-gray-500">Create collaborative documents and projects</p>
      </div>
    </div>
  );
}

function AttendanceView({ course }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Attendance</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Attendance Tracking</h3>
        <p className="text-gray-500">Track student attendance for sessions and activities</p>
      </div>
    </div>
  );
}

function WhiteboardView({ course }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Whiteboard</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Whiteboard
        </Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No whiteboards yet</h3>
        <p className="text-gray-500">Create collaborative whiteboards for visual learning</p>
      </div>
    </div>
  );
}

function RightSidebarContent({ currentView, course }) {
  const sidebarContent = {
    home: {
      title: 'Dashboard Home',
      description: 'Your central hub for managing all courses, viewing stats, and tracking student progress. Access quick links to all your teaching tools.',
      tips: [
        'View total course and student statistics',
        'Quick access to recent courses',
        'Monitor overall teaching activity'
      ]
    },
    courses: {
      title: 'My Courses',
      description: 'Create and manage all your courses. Set course details, categories, and descriptions. Control course visibility and enrollment.',
      tips: [
        'Click "Create Course" to add a new course',
        'Use "Manage Content" to add lessons and materials',
        'Edit course details anytime',
        'Delete courses you no longer need'
      ]
    },
    modules: {
      title: 'Modules',
      description: 'All your courses, lessons, and content in one place. Create courses, add lessons with slides/videos, and organize everything by sections. No more switching between tabs!',
      tips: [
        'Create courses first, then add lessons',
        'Click course name to expand and see lessons',
        'Upload slides (PPT, PDF), videos, Google Slides',
        'Organize lessons by sections/topics',
        'Edit or delete courses and lessons inline',
        'All changes appear to students immediately'
      ]
    },
    announcements: {
      title: 'Announcements',
      description: 'Communicate important updates and information to all students in your course. Announcements appear on student dashboards.',
      tips: [
        'Create announcements for course updates',
        'Notify students of important deadlines',
        'Share news and reminders'
      ]
    },
    assignments: {
      title: 'Assignments',
      description: 'Create assignments for students to submit work. Set due dates, point values, and grading rubrics.',
      tips: [
        'Click "Add Assignment" to create new tasks',
        'Set due dates and point values',
        'Grade submissions from students',
        'Track assignment completion rates'
      ]
    },
    discussions: {
      title: 'Discussions',
      description: 'Foster student engagement through course discussions. Students can ask questions, share insights, and collaborate.',
      tips: [
        'Start discussion topics for students',
        'Pin important discussions',
        'Monitor student participation',
        'Reply to student questions'
      ]
    },
    grades: {
      title: 'Grades',
      description: 'View and manage all student grades in one place. Track assignment scores, quiz results, and overall performance.',
      tips: [
        'View complete gradebook',
        'Export grades for reporting',
        'Track individual student progress'
      ]
    },
    people: {
      title: 'People',
      description: 'Manage all students enrolled in your course. View their progress, send messages, and track engagement.',
      tips: [
        'See all enrolled students',
        'View individual progress percentages',
        'Access student profiles',
        'Monitor enrollment numbers'
      ]
    },
    quizzes: {
      title: 'Quizzes',
      description: 'Create and manage quizzes to assess student learning. Set time limits, point values, and question types.',
      tips: [
        'Use "Create Quiz" to add assessments',
        'Published quizzes appear to students',
        'Track quiz attempts and scores',
        'Link quizzes to specific lessons'
      ]
    },
    analytics: {
      title: 'Course Analytics',
      description: 'Track detailed course performance metrics. View engagement rates, completion statistics, and student activity.',
      tips: [
        'Monitor real-time enrollment data',
        'Track completion and engagement rates',
        'View average quiz performance',
        'Identify areas for improvement'
      ]
    },
    video: {
      title: 'Live Sessions',
      description: 'Schedule and manage live video sessions with students. Use Google Meet or built-in video calls.',
      tips: [
        'Schedule sessions for specific dates/times',
        'Invite students to join',
        'Start sessions when ready',
        'View past session recordings'
      ]
    },
    syllabus: {
      title: 'Course Syllabus',
      description: 'Display course information, policies, and structure. Help students understand course requirements and expectations.',
      tips: [
        'Shows course overview information',
        'Displays category and level',
        'Shows total lessons and duration'
      ]
    },
    outcomes: {
      title: 'Learning Outcomes',
      description: 'Define and track learning objectives for your course. Align with curriculum standards like CCEA.',
      tips: [
        'Add objectives to individual lessons',
        'View all outcomes in one place',
        'Ensure CCEA alignment'
      ]
    }
  };

  const content = sidebarContent[currentView] || sidebarContent.modules;

  return (
    <>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{content.title}</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">About this section</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {content.description}
          </p>
        </div>

        {content.tips && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Quick Tips</h4>
            {content.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-6">
          <img 
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400" 
            alt="Teaching"
            className="w-32 mx-auto rounded-lg opacity-70"
          />
        </div>
      </div>
    </>
  );
}

function OldCoursesTab({ courses, showCreateCourse, setShowCreateCourse, courseForm, setCourseForm, handleCreateCourse, updateCourseMutation, deleteCourseMutation, createCourseMutation, setSelectedCourse, setShowAwardPoints, setSelectedCourseForPoints, setShowMessageDialog, setSelectedCourseForMessage }) {
  const [editingCourse, setEditingCourse] = useState(null);

  return (
    <div className="space-y-6">
      <AICourseAssistant
        onApplySuggestion={async (suggestion) => {
          if (suggestion.course_title) {
            if (suggestion.createLessons && suggestion.units) {
              // Create course with all lessons
              try {
                const newCourse = await createCourseMutation.mutateAsync({
                  title: suggestion.course_title,
                  description: suggestion.course_description,
                  duration_hours: suggestion.duration_hours,
                  level: suggestion.level,
                  instructor: user?.full_name || 'Instructor',
                  instructor_avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Instructor')}&background=6366f1&color=fff`,
                  rating: 4.5,
                  enrolled_count: 0,
                  price: 0,
                  total_lessons: suggestion.units.reduce((sum, unit) => sum + unit.lessons.length, 0),
                });

                // Create all lessons
                let order = 0;
                for (const unit of suggestion.units) {
                  for (const lesson of unit.lessons) {
                    await base44.entities.Lesson.create({
                      course_id: newCourse.id,
                      title: lesson.title,
                      description: lesson.description,
                      duration_minutes: lesson.duration_minutes || 15,
                      order: order++,
                      section: unit.unit_name,
                      is_preview: order <= 2,
                    });
                  }
                }

                toast.success('Course created with all lessons!');
                queryClient.invalidateQueries(['tutor-courses']);
              } catch (error) {
                toast.error('Failed to create course');
              }
            } else {
              // Just fill the form
              setCourseForm({
                ...courseForm,
                title: suggestion.course_title,
                description: suggestion.course_description,
                duration_hours: suggestion.duration_hours,
                level: suggestion.level,
              });
              setShowCreateCourse(true);
            }
          }
        }}
      />

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">My Courses</h2>
            <p className="text-sm text-gray-500 mt-1">Create and manage your courses</p>
          </div>
          <Button onClick={() => setShowCreateCourse(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11">
            <Plus className="w-5 h-5 mr-2" />
            Create New Course
          </Button>
        </div>

      {showCreateCourse && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Create New Course</h3>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to create your course</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateCourse(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CourseFormFields formData={courseForm} setFormData={setCourseForm} />
          <div className="flex gap-3 mt-6">
            <Button onClick={handleCreateCourse} disabled={createCourseMutation.isPending} className="bg-indigo-600 h-11">
              <Save className="w-4 h-4 mr-2" />
              {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateCourse(false)} className="h-11">Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-4">
            {editingCourse?.id === course.id ? (
              <div>
                <CourseFormFields formData={courseForm} setFormData={setCourseForm} />
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => {
                    updateCourseMutation.mutate({ id: course.id, data: courseForm });
                    setEditingCourse(null);
                  }} size="sm" className="bg-indigo-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} 
                    alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="secondary">{course.category}</Badge>
                      <span>•</span>
                      <span>{course.enrolled_count || 0} students</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                 <Link to={createPageUrl('CourseAnalytics') + `?courseId=${course.id}`}>
                   <Button variant="outline" size="sm" className="hidden sm:flex">
                     <BarChart className="w-4 h-4 mr-1" />
                     Analytics
                   </Button>
                   <Button variant="outline" size="sm" className="sm:hidden">
                     <BarChart className="w-4 h-4" />
                   </Button>
                 </Link>
                 <Button variant="outline" size="sm" onClick={() => {
                   setSelectedCourseForMessage(course.id);
                   setShowMessageDialog(true);
                 }} className="hidden sm:flex">
                   <MessageSquare className="w-4 h-4 mr-1" />
                   Message
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => {
                   setSelectedCourseForMessage(course.id);
                   setShowMessageDialog(true);
                 }} className="sm:hidden">
                   <MessageSquare className="w-4 h-4" />
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => {
                   setSelectedCourseForPoints(course.id);
                   setShowAwardPoints(true);
                 }} className="hidden sm:flex">
                   <Award className="w-4 h-4 mr-1" />
                   Award
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => {
                   setSelectedCourseForPoints(course.id);
                   setShowAwardPoints(true);
                 }} className="sm:hidden">
                   <Award className="w-4 h-4" />
                 </Button>
                 <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                   <Button variant="outline" size="sm" className="hidden sm:flex">
                     <Edit className="w-4 h-4 mr-2" />
                     Manage
                   </Button>
                   <Button variant="outline" size="sm" className="sm:hidden">
                     <Edit className="w-4 h-4" />
                   </Button>
                 </Link>
                 <Button variant="outline" size="sm" onClick={() => {
                   setEditingCourse(course);
                   setCourseForm(course);
                 }} className="sm:hidden">
                   <Edit className="w-4 h-4" />
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => {
                   if (confirm('Delete this course?')) deleteCourseMutation.mutate(course.id);
                 }} className="sm:hidden">
                   <Trash2 className="w-4 h-4 text-red-600" />
                 </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
    </div>
  );
}

function OldStudentsTab({ courses, enrollments, selectedCourse, setSelectedCourse }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: allStudents = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  // Filter to only show students enrolled in this tutor's courses
  const myCourseIds = courses.map(c => c.id);
  const myEnrollments = enrollments.filter(e => myCourseIds.includes(e.course_id));
  const myStudentEmails = [...new Set(myEnrollments.map(e => e.created_by))];
  const students = allStudents.filter(s => myStudentEmails.includes(s.email));

  const suspendMutation = useMutation({
    mutationFn: ({ email, suspend, reason }) => {
      const student = students.find(s => s.email === email);
      return base44.asServiceRole.entities.User.update(student.id, { 
        is_suspended: suspend,
        suspended_reason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student status updated');
    },
  });

  const courseStudents = selectedCourse
    ? enrollments.filter(e => e.course_id === selectedCourse.id)
    : enrollments.filter(e => courses.some(c => c.id === e.course_id));

  const filteredStudents = courseStudents.filter(e => {
    const student = students.find(s => s.email === e.created_by);
    return !searchTerm || student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <div className="flex gap-3">
          <Input 
            id="student-search"
            name="search"
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <select 
            id="course-filter"
            name="course"
            className="px-3 py-2 border rounded-lg"
            value={selectedCourse?.id || ''}
            onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value) || null)}
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredStudents.map((enrollment) => {
          const student = students.find(s => s.email === enrollment.created_by);
          const course = courses.find(c => c.id === enrollment.course_id);
          
          return (
            <Card key={enrollment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {student?.full_name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student?.full_name || 'Student'}</p>
                      <p className="text-sm text-gray-500">{student?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <span>{course?.title || 'Unknown Course'}</span>
                    <span>•</span>
                    <span>{enrollment.progress_percent || 0}% complete</span>
                    {student?.is_suspended && (
                      <>
                        <span>•</span>
                        <Badge variant="destructive">Suspended</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl('StudentAnalytics') + `?studentEmail=${student?.email}&courseId=${enrollment.course_id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  {student && !student.is_suspended ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Reason for suspension:');
                        if (reason) suspendMutation.mutate({ email: student.email, suspend: true, reason });
                      }}
                    >
                      <Ban className="w-4 h-4 text-red-600" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => suspendMutation.mutate({ email: student.email, suspend: false, reason: '' })}
                    >
                      Unsuspend
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

function OldAssignmentsTab({ courses, assignments, submissions }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <Link to={createPageUrl('CreateAssignment')}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => {
          const course = courses.find(c => c.id === assignment.course_id);
          const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
          const gradedCount = assignmentSubmissions.filter(s => s.is_graded).length;
          
          return (
            <Card key={assignment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{course?.title}</span>
                    <span>•</span>
                    <span>{assignmentSubmissions.length} submissions</span>
                    <span>•</span>
                    <span>{gradedCount} graded</span>
                  </div>
                </div>
                <Link to={createPageUrl('GradeAssignments') + `?assignmentId=${assignment.id}`}>
                  <Button variant="outline" size="sm">
                    Grade Submissions
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

function OldMessagesTab({ userEmail }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['tutor-messages', userEmail],
    queryFn: () => base44.entities.Message.filter({ recipient_email: userEmail }, '-created_date', 100),
    enabled: !!userEmail,
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Messages from Students</h2>
      <div className="space-y-3">
        {messages.length > 0 ? messages.map((msg) => (
          <Card key={msg.id} className="p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{msg.sender_name}</p>
                <p className="text-sm text-gray-500">{msg.sender_email}</p>
              </div>
              <Badge variant={msg.is_read ? 'secondary' : 'default'}>
                {msg.is_read ? 'Read' : 'New'}
              </Badge>
            </div>
            <p className="text-gray-700">{msg.content}</p>
          </Card>
        )) : (
          <p className="text-gray-500 text-center py-8">No messages yet</p>
        )}
      </div>
    </Card>
  );
}

function OldAnalyticsTab({ courses, enrollments }) {
  const completionData = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
    const completed = courseEnrollments.filter(e => e.is_completed).length;
    return {
      course: course.title,
      total: courseEnrollments.length,
      completed,
      rate: courseEnrollments.length > 0 ? Math.round((completed / courseEnrollments.length) * 100) : 0
    };
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Course Completion Rates</h3>
        <div className="space-y-3">
          {completionData.map((data, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{data.course}</span>
                <span className="text-sm text-gray-500">{data.rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${data.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Enrollment Stats</h3>
        <div className="space-y-4">
          {courses.map(course => {
            const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
            const avgProgress = courseEnrollments.length > 0
              ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / courseEnrollments.length)
              : 0;
            
            return (
              <div key={course.id} className="border-b pb-3 last:border-0">
                <h4 className="font-medium text-gray-900">{course.title}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{courseEnrollments.length} students</span>
                  <span>•</span>
                  <span>{avgProgress}% avg progress</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function OldLiveSessionsTab({ videoSessions, courses }) {
  const queryClient = useQueryClient();
  const upcomingSessions = videoSessions.filter(s => s.status === 'scheduled');
  const liveSessions = videoSessions.filter(s => s.status === 'live');
  const completedSessions = videoSessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.VideoSession.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-sessions']);
      toast.success('Session deleted');
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.VideoSession.update(sessionId, { status: 'live' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-sessions']);
      toast.success('Session resumed');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Live Video Sessions</h2>
        <Link to={createPageUrl('ScheduleSession')}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </Link>
      </div>

      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Upcoming Sessions</h3>
          <div className="space-y-3">
            {upcomingSessions.map(session => {
              const course = courses.find(c => c.id === session.course_id);
              return (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{course?.title}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.scheduled_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.scheduled_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.invited_students?.length || 0} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={createPageUrl('VideoSession') + `?id=${session.id}`}>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Start Session
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {liveSessions.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Live Sessions</h3>
          <div className="space-y-3">
            {liveSessions.map(session => {
              const course = courses.find(c => c.id === session.course_id);
              return (
                <Card key={session.id} className="p-4 border-2 border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center animate-pulse">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{session.title}</h4>
                          <Badge className="bg-red-500 text-white">🔴 LIVE</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{course?.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                        </p>
                      </div>
                    </div>
                    <Link to={createPageUrl('VideoSession') + `?id=${session.id}`}>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Resume Session
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completedSessions.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Past Sessions</h3>
          <div className="space-y-3">
            {completedSessions.slice(0, 5).map(session => {
              const course = courses.find(c => c.id === session.course_id);
              return (
                <Card key={session.id} className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600">{course?.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{session.status === 'cancelled' ? 'Cancelled' : 'Completed'}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resumeSessionMutation.mutate(session.id);
                        }}
                        disabled={resumeSessionMutation.isPending}
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this session? This cannot be undone.')) {
                            deleteSessionMutation.mutate(session.id);
                          }
                        }}
                        disabled={deleteSessionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {videoSessions.length === 0 && (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions scheduled</h3>
          <p className="text-gray-500 mb-6">Schedule your first live tutoring session</p>
          <Link to={createPageUrl('ScheduleSession')}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

function OldCourseFormFields({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course-title">Course Title *</Label>
            <Input 
              id="course-title"
              name="title"
              value={formData.title || ''} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Complete Web Development Course" 
            />
          </div>

        </div>
        
        <div className="mt-4">
          <Label htmlFor="course-description">Course Description *</Label>
          <Textarea 
            id="course-description"
            name="description"
            value={formData.description || ''} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            rows={4}
            placeholder="Describe what students will learn in this course..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-4">Course Details</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course-category">Category *</Label>
            <select 
              id="course-category"
              name="category"
              value={formData.category || ''} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="">Select Category</option>
              <option value="mathematics">Mathematics</option>
              <option value="english">English</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
              <option value="physics">Physics</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
            </select>
          </div>
          <div>
            <Label htmlFor="course-level">Difficulty Level</Label>
            <select 
              id="course-level"
              name="level"
              value={formData.level || 'beginner'} 
              onChange={(e) => setFormData({ ...formData, level: e.target.value })} 
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <Label htmlFor="course-price">Price (USD)</Label>
            <Input 
              id="course-price"
              name="price"
              type="number" 
              value={formData.price || ''} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0 for free course" 
            />
          </div>
          <div>
            <Label htmlFor="course-duration">Estimated Duration (hours)</Label>
            <Input 
              id="course-duration"
              name="duration_hours"
              type="number" 
              value={formData.duration_hours || ''} 
              onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
              placeholder="10" 
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="course-thumbnail">Course Thumbnail URL (optional)</Label>
          <Input 
            id="course-thumbnail"
            name="thumbnail"
            value={formData.thumbnail || ''} 
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="https://images.unsplash.com/..." 
          />
        </div>
      </div>
    </div>
  );
}