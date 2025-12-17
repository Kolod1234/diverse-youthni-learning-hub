import Home from './pages/Home';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import LessonPlayer from './pages/LessonPlayer';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import CourseDiscussion from './pages/CourseDiscussion';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorCourseManager from './pages/TutorCourseManager';
import CreateAssignment from './pages/CreateAssignment';
import GradeAssignments from './pages/GradeAssignments';
import StudentAnalytics from './pages/StudentAnalytics';
import Tutors from './pages/Tutors';
import TutorSetup from './pages/TutorSetup';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Explore": Explore,
    "Dashboard": Dashboard,
    "CourseDetails": CourseDetails,
    "LessonPlayer": LessonPlayer,
    "Quiz": Quiz,
    "Profile": Profile,
    "CourseDiscussion": CourseDiscussion,
    "AdminDashboard": AdminDashboard,
    "TutorDashboard": TutorDashboard,
    "TutorCourseManager": TutorCourseManager,
    "CreateAssignment": CreateAssignment,
    "GradeAssignments": GradeAssignments,
    "StudentAnalytics": StudentAnalytics,
    "Tutors": Tutors,
    "TutorSetup": TutorSetup,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};