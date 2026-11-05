import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BarChartIcon from '@mui/icons-material/BarChart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideocamIcon from '@mui/icons-material/Videocam';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Home = _w(HomeIcon), Bell = _w(NotificationsIcon), ClipboardList = _w(AssignmentIcon), MessageSquare = _w(ChatIcon);
const Award = _w(EmojiEventsIcon), Users = _w(PeopleIcon), FileText = _w(DescriptionIcon), BookOpen = _w(MenuBookIcon);
const Target = _w(GpsFixedIcon), BarChart = _w(BarChartIcon), FileCheck = _w(FactCheckIcon), HelpCircle = _w(HelpOutlineIcon);
const Calendar = _w(CalendarTodayIcon), Video = _w(VideocamIcon), Menu = _w(MenuIcon), Plus = _w(AddIcon);
const Search = _w(SearchIcon), ChevronRight = _w(ChevronRightIcon);
import { Button } from '@mui/material';

export default function TutorDashboardCanvas() {
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
    queryKey: ['tutor-assigned-courses-canvas-v2', user?.email, user?.role],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Course.list('-created_date', 200);
      }
      return base44.entities.Course.filter({ assigned_tutors: user.email }, '-created_date', 200);
    },
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
    { icon: BookOpen, label: 'Modules', view: 'modules', active: true },
    { icon: Video, label: 'BigBlueButton', view: 'video' },
    { icon: Users, label: 'Collaborations', view: 'collaborations' },
    { icon: Calendar, label: 'Attendance', view: 'attendance' },
    { icon: BarChart, label: 'Course Analytics', view: 'analytics' },
    { icon: FileText, label: 'Lucid (Whiteboard)', view: 'whiteboard' },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-card">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-card border-r border-border flex flex-col overflow-hidden`}>
        {/* Course Selector */}
        <div className="p-4 border-b border-border">
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
                className="w-full text-sm font-medium text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">› Modules</div>
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-500/15 border-l-4 border-blue-600 text-blue-700 dark:text-blue-300 font-medium' : 'text-foreground'
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
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main Section */}
            <div className="flex-1 p-8">
              {currentView === 'modules' && <ModulesView course={selectedCourse} lessons={lessons} />}
              {currentView === 'home' && <HomeView course={selectedCourse} />}
              {currentView === 'assignments' && <AssignmentsView course={selectedCourse} />}
              {currentView === 'people' && <PeopleView course={selectedCourse} />}
              {currentView === 'grades' && <GradesView course={selectedCourse} />}
              {currentView === 'analytics' && <AnalyticsView course={selectedCourse} />}
              {!['modules', 'home', 'assignments', 'people', 'grades', 'analytics'].includes(currentView) && (
                <ComingSoonView viewName={navItems.find(n => n.view === currentView)?.label || currentView} />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-border p-6 bg-muted">
              <h3 className="text-xl font-bold text-foreground mb-4">Modules</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Organize course content</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use modules to organize your content and create a linear flow for what students should do in the course. 
                    Modules can be used to organize content by weeks, units, or a different organizational structure. 
                    Add files, discussions, assignments, quizzes, and other learning materials. 
                    Require prerequisites to be completed before moving to a module or next module item, or lock an entire 
                    module until a specific date.
                  </p>
                </div>

                <div className="space-y-2">
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                    How do I add a module?
                  </button>
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                    How do I publish or unpublish a module as an instructor?
                  </button>
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                    How do I add assignment types, pages, and files as module items?
                  </button>
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                    How do I move or reorder a module?
                  </button>
                </div>

                <div className="pt-4">
                  <Link to="#" className="text-sm text-blue-600 hover:text-blue-700">
                    See more in Canvas Guides
                  </Link>
                </div>

                <div className="pt-6">
                  <img 
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400" 
                    alt="Panda mascot"
                    className="w-32 mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulesView({ course, lessons }) {
  // Group lessons by section
  const sections = {};
  lessons.forEach(lesson => {
    const section = lesson.section || 'General';
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(lesson);
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Button variant="contained" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create a new Module
        </Button>
      </div>

      {Object.keys(sections).length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No modules yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your first module to organize course content and create a learning pathway for students
          </p>
          <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course?.id}`}>
            <Button variant="contained" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(sections).map(([sectionName, sectionLessons]) => (
            <div key={sectionName} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{sectionName}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {sectionLessons.map(lesson => (
                  <div key={lesson.id} className="px-6 py-4 hover:bg-muted flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-foreground">{lesson.title}</div>
                        {lesson.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</div>
                        )}
                      </div>
                    </div>
                    <Link to={createPageUrl('LessonEditor') + `?id=${lesson.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeView({ course }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Course Home</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{course?.title}</h2>
        <p className="text-muted-foreground">{course?.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/15 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{course?.total_lessons || 0}</div>
            <div className="text-sm text-muted-foreground">Total Lessons</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-500/15 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{course?.enrolled_count || 0}</div>
            <div className="text-sm text-muted-foreground">Enrolled Students</div>
          </div>
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
        <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
        <Link to={createPageUrl('CreateAssignment') + `?courseId=${course?.id}`}>
          <Button variant="contained" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-foreground">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
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
      <h1 className="text-3xl font-bold text-foreground mb-6">People</h1>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-muted border-b border-border">
          <h3 className="font-semibold">Students ({enrollments.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {enrollment.created_by?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="font-medium text-foreground">{enrollment.created_by}</div>
                  <div className="text-sm text-muted-foreground">{enrollment.progress_percent || 0}% complete</div>
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
      <h1 className="text-3xl font-bold text-foreground mb-6">Grades</h1>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Grade Book</h3>
        <p className="text-muted-foreground">View and manage student grades</p>
      </div>
    </div>
  );
}

function AnalyticsView({ course }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Course Analytics</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Engagement</h3>
          <div className="text-3xl font-bold text-blue-600">85%</div>
          <div className="text-sm text-muted-foreground">Average engagement rate</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Completion</h3>
          <div className="text-3xl font-bold text-green-600">72%</div>
          <div className="text-sm text-muted-foreground">Course completion rate</div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonView({ viewName }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">{viewName}</h1>
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <ChevronRight className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">This feature is under development</p>
      </div>
    </div>
  );
}