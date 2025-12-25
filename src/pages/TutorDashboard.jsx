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
  Plus, BookOpen, Users, MessageSquare, ClipboardList, 
  Edit, Trash2, Save, X, TrendingUp, Ban, BarChart, Award, Video, Calendar, Clock, PlayCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AICourseAssistant from '@/components/tutor/AICourseAssistant';
import AwardPointsDialog from '@/components/tutor/AwardPointsDialog';
import MessageStudentsDialog from '@/components/tutor/MessageStudentsDialog';
import TutorOnboardingFlow from '@/components/onboarding/TutorOnboardingFlow';

export default function TutorDashboard() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({});
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('tutorsUnlocked') === 'true');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [showAwardPoints, setShowAwardPoints] = useState(false);
  const [selectedCourseForPoints, setSelectedCourseForPoints] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedCourseForMessage, setSelectedCourseForMessage] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();

  const { data: videoSessions = [] } = useQuery({
    queryKey: ['video-sessions', user?.email],
    queryFn: () => base44.entities.VideoSession.filter({ tutor_email: user?.email }, '-scheduled_date', 50),
    enabled: !!user?.email,
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ['tutor-onboarding', user?.email],
    queryFn: async () => {
      const status = await base44.entities.TutorOnboarding.filter({ tutor_email: user?.email });
      return status[0];
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (user?.email && onboardingStatus === undefined) return;
    if (!onboardingStatus && user?.is_tutor) {
      setShowOnboarding(true);
    }
  }, [onboardingStatus, user]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (!userData.is_tutor && userData.role !== 'admin') {
          window.location.href = createPageUrl('Home');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['tutor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email, is_deleted: { $ne: true } }, '-created_date', 100),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['tutor-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['tutor-assignments'],
    queryFn: () => base44.entities.Assignment.list('-created_date', 200),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['tutor-submissions'],
    queryFn: () => base44.entities.Submission.list('-created_date', 500),
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
      instructor_avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Instructor')}&background=6366f1&color=fff`,
      rating: 4.5,
      enrolled_count: 0,
      price: parseFloat(courseForm.price) || 0,
      duration_hours: parseFloat(courseForm.duration_hours) || 0,
      total_lessons: 0,
    });
  };

  const courseEnrollments = selectedCourse 
    ? allEnrollments.filter(e => e.course_id === selectedCourse.id)
    : [];

  const totalStudents = new Set(
    allEnrollments.filter(e => courses.some(c => c.id === e.course_id)).map(e => e.created_by)
  ).size;

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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Tutor Dashboard Access</h2>
            <p className="text-gray-500 text-center mb-6">Enter the access code to continue</p>
            
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter access code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg"
                  autoFocus
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Unlock
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || (!user.is_tutor && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your name"
                  className="text-3xl font-bold h-12"
                  autoFocus
                />
                <Button
                  onClick={async () => {
                    if (newName.trim()) {
                      await base44.auth.updateMe({ full_name: newName.trim() });
                      setUser({ ...user, full_name: newName.trim() });
                      setEditingName(false);
                      toast.success('Name updated!');
                    }
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setEditingName(false);
                    setNewName('');
                  }}
                  size="sm"
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
                <Button
                  onClick={() => {
                    setNewName(user?.full_name || '');
                    setEditingName(true);
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <p className="text-gray-500">Manage your courses and students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-purple-50', iconColor: 'text-purple-600' },
            { label: 'Assignments', value: assignments.length, icon: ClipboardList, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Pending Grades', value: submissions.filter(s => !s.is_graded).length, icon: TrendingUp, color: 'bg-orange-50', iconColor: 'text-orange-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-5">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6 overflow-x-auto flex-nowrap">
            <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Courses</span>
              <span className="sm:hidden">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <Video className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Live Sessions</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Students</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <ClipboardList className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Assignments</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap">
              <BarChart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CoursesTab
              courses={courses}
              showCreateCourse={showCreateCourse}
              setShowCreateCourse={setShowCreateCourse}
              courseForm={courseForm}
              setCourseForm={setCourseForm}
              handleCreateCourse={handleCreateCourse}
              updateCourseMutation={updateCourseMutation}
              deleteCourseMutation={deleteCourseMutation}
              createCourseMutation={createCourseMutation}
              setSelectedCourse={setSelectedCourse}
              setShowAwardPoints={setShowAwardPoints}
              setSelectedCourseForPoints={setSelectedCourseForPoints}
              setShowMessageDialog={setShowMessageDialog}
              setSelectedCourseForMessage={setSelectedCourseForMessage}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <LiveSessionsTab videoSessions={videoSessions} courses={courses} />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab 
              courses={courses} 
              enrollments={allEnrollments}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab 
              courses={courses}
              assignments={assignments}
              submissions={submissions}
            />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab 
              courses={courses}
              enrollments={allEnrollments}
            />
          </TabsContent>
        </Tabs>
        
        <AwardPointsDialog
          open={showAwardPoints}
          onOpenChange={setShowAwardPoints}
          courseId={selectedCourseForPoints}
        />

        <MessageStudentsDialog
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
          courseId={selectedCourseForMessage}
          courseName={courses.find(c => c.id === selectedCourseForMessage)?.title}
        />

        {showOnboarding && (
          <TutorOnboardingFlow
            user={user}
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </div>
  );
}

function CoursesTab({ courses, showCreateCourse, setShowCreateCourse, courseForm, setCourseForm, handleCreateCourse, updateCourseMutation, deleteCourseMutation, createCourseMutation, setSelectedCourse, setShowAwardPoints, setSelectedCourseForPoints, setShowMessageDialog, setSelectedCourseForMessage }) {
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

function StudentsTab({ courses, enrollments, selectedCourse, setSelectedCourse }) {
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
      return base44.entities.User.update(student.id, { 
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

function AssignmentsTab({ courses, assignments, submissions }) {
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

function MessagesTab({ userEmail }) {
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

function AnalyticsTab({ courses, enrollments }) {
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

function LiveSessionsTab({ videoSessions, courses }) {
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

function CourseFormFields({ formData, setFormData }) {
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