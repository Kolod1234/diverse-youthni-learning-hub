import Achievements from './pages/Achievements';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import CourseAnalytics from './pages/CourseAnalytics';
import CourseDetails from './pages/CourseDetails';
import CourseDiscussion from './pages/CourseDiscussion';
import CreateAssignment from './pages/CreateAssignment';
import Dashboard from './pages/Dashboard';
import DataPresentation from './pages/DataPresentation';
import Explore from './pages/Explore';
import GradeAssignments from './pages/GradeAssignments';
import Home from './pages/Home';
import LearningPaths from './pages/LearningPaths';
import LessonPlayer from './pages/LessonPlayer';
import MessageCenter from './pages/MessageCenter';
import PathManager from './pages/PathManager';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import Quiz from './pages/Quiz';
import QuizGenerator from './pages/QuizGenerator';
import ScheduleSession from './pages/ScheduleSession';
import StudentAnalytics from './pages/StudentAnalytics';
import Templates from './pages/Templates';
import TutorCourseManager from './pages/TutorCourseManager';
import TutorDashboard from './pages/TutorDashboard';
import TutorSetup from './pages/TutorSetup';
import Tutors from './pages/Tutors';
import VideoSession from './pages/VideoSession';
import TutorSessionsDashboard from './pages/TutorSessionsDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "AdminDashboard": AdminDashboard,
    "Analytics": Analytics,
    "CourseAnalytics": CourseAnalytics,
    "CourseDetails": CourseDetails,
    "CourseDiscussion": CourseDiscussion,
    "CreateAssignment": CreateAssignment,
    "Dashboard": Dashboard,
    "DataPresentation": DataPresentation,
    "Explore": Explore,
    "GradeAssignments": GradeAssignments,
    "Home": Home,
    "LearningPaths": LearningPaths,
    "LessonPlayer": LessonPlayer,
    "MessageCenter": MessageCenter,
    "PathManager": PathManager,
    "Profile": Profile,
    "Programs": Programs,
    "Quiz": Quiz,
    "QuizGenerator": QuizGenerator,
    "ScheduleSession": ScheduleSession,
    "StudentAnalytics": StudentAnalytics,
    "Templates": Templates,
    "TutorCourseManager": TutorCourseManager,
    "TutorDashboard": TutorDashboard,
    "TutorSetup": TutorSetup,
    "Tutors": Tutors,
    "VideoSession": VideoSession,
    "TutorSessionsDashboard": TutorSessionsDashboard,
}

export const pagesConfig = {
    mainPage: "Programs",
    Pages: PAGES,
    Layout: __Layout,
};