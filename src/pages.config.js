import AdminDashboard from './pages/AdminDashboard';
import CourseDetails from './pages/CourseDetails';
import CourseDiscussion from './pages/CourseDiscussion';
import CreateAssignment from './pages/CreateAssignment';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import GradeAssignments from './pages/GradeAssignments';
import Home from './pages/Home';
import LessonPlayer from './pages/LessonPlayer';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import Quiz from './pages/Quiz';
import StudentAnalytics from './pages/StudentAnalytics';
import TutorCourseManager from './pages/TutorCourseManager';
import TutorDashboard from './pages/TutorDashboard';
import TutorSetup from './pages/TutorSetup';
import Tutors from './pages/Tutors';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "CourseDetails": CourseDetails,
    "CourseDiscussion": CourseDiscussion,
    "CreateAssignment": CreateAssignment,
    "Dashboard": Dashboard,
    "Explore": Explore,
    "GradeAssignments": GradeAssignments,
    "Home": Home,
    "LessonPlayer": LessonPlayer,
    "Profile": Profile,
    "Programs": Programs,
    "Quiz": Quiz,
    "StudentAnalytics": StudentAnalytics,
    "TutorCourseManager": TutorCourseManager,
    "TutorDashboard": TutorDashboard,
    "TutorSetup": TutorSetup,
    "Tutors": Tutors,
}

export const pagesConfig = {
    mainPage: "Programs",
    Pages: PAGES,
    Layout: __Layout,
};