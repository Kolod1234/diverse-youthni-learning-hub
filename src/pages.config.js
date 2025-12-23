import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import CourseDetails from './pages/CourseDetails';
import CourseDiscussion from './pages/CourseDiscussion';
import CreateAssignment from './pages/CreateAssignment';
import Dashboard from './pages/Dashboard';
import DataPresentation from './pages/DataPresentation';
import Explore from './pages/Explore';
import GradeAssignments from './pages/GradeAssignments';
import Home from './pages/Home';
import LessonPlayer from './pages/LessonPlayer';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import Quiz from './pages/Quiz';
import QuizGenerator from './pages/QuizGenerator';
import StudentAnalytics from './pages/StudentAnalytics';
import Templates from './pages/Templates';
import TutorCourseManager from './pages/TutorCourseManager';
import TutorDashboard from './pages/TutorDashboard';
import TutorSetup from './pages/TutorSetup';
import Tutors from './pages/Tutors';
import LearningPaths from './pages/LearningPaths';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "Analytics": Analytics,
    "CourseDetails": CourseDetails,
    "CourseDiscussion": CourseDiscussion,
    "CreateAssignment": CreateAssignment,
    "Dashboard": Dashboard,
    "DataPresentation": DataPresentation,
    "Explore": Explore,
    "GradeAssignments": GradeAssignments,
    "Home": Home,
    "LessonPlayer": LessonPlayer,
    "Profile": Profile,
    "Programs": Programs,
    "Quiz": Quiz,
    "QuizGenerator": QuizGenerator,
    "StudentAnalytics": StudentAnalytics,
    "Templates": Templates,
    "TutorCourseManager": TutorCourseManager,
    "TutorDashboard": TutorDashboard,
    "TutorSetup": TutorSetup,
    "Tutors": Tutors,
    "LearningPaths": LearningPaths,
}

export const pagesConfig = {
    mainPage: "Programs",
    Pages: PAGES,
    Layout: __Layout,
};