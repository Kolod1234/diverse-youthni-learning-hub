/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Achievements from './pages/Achievements';
import AdminCoordinators from './pages/AdminCoordinators';
import AdminCourseBuilder from './pages/AdminCourseBuilder';
import AdminDailyFacts from './pages/AdminDailyFacts';
import AdminDashboard from './pages/AdminDashboard';
import AdminDiscover from './pages/AdminDiscover';
import AdminLearningObjectives from './pages/AdminLearningObjectives';
import AdminLibrary from './pages/AdminLibrary';
import AdminPageBuilder from './pages/AdminPageBuilder';
import AdminQuotes from './pages/AdminQuotes';
import AdminRSSFeed from './pages/AdminRSSFeed';
import AdminReminders from './pages/AdminReminders';
import AdminReviews from './pages/AdminReviews';
import AdminStudentMessages from './pages/AdminStudentMessages';
import AdminStudentOfMonth from './pages/AdminStudentOfMonth';
import AdminUserProfile from './pages/AdminUserProfile';
import AdminUsers from './pages/AdminUsers';
import AdminYouthWork from './pages/AdminYouthWork';
import Analytics from './pages/Analytics';
import ArtGallery from './pages/ArtGallery';
import BookSession from './pages/BookSession';
import CCEAPastPapers from './pages/CCEAPastPapers';
import ChallengeLeaderboard from './pages/ChallengeLeaderboard';
import ChallengePlayer from './pages/ChallengePlayer';
import Challenges from './pages/Challenges';
import Community from './pages/Community';
import CommunityEventSlides from './pages/CommunityEventSlides';
import ContactUs from './pages/ContactUs';
import CoordinatorsDashboard from './pages/CoordinatorsDashboard';
import CourseAnalytics from './pages/CourseAnalytics';
import CourseDetails from './pages/CourseDetails';
import CourseDiscussion from './pages/CourseDiscussion';
import CourseParticipants from './pages/CourseParticipants';
import CreateAssignment from './pages/CreateAssignment';
import Dashboard from './pages/Dashboard';
import DataPresentation from './pages/DataPresentation';
import DetailedCourseAnalytics from './pages/DetailedCourseAnalytics';
import Explore from './pages/Explore';
import GradeAssignments from './pages/GradeAssignments';
import Home from './pages/Home';
import KnowledgeBase from './pages/KnowledgeBase';
import LearningPaths from './pages/LearningPaths';
import LessonEditor from './pages/LessonEditor';
import LessonPlayer from './pages/LessonPlayer';
import LessonPlayerClassic from './pages/LessonPlayerClassic';
import LessonPlayerPowerPoint from './pages/LessonPlayerPowerPoint';
import LessonPlayerRise from './pages/LessonPlayerRise';
import Library from './pages/Library';
import MessageCenter from './pages/MessageCenter';
import PathManager from './pages/PathManager';
import PathwayManager from './pages/PathwayManager';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import Quiz from './pages/Quiz';
import QuizGenerator from './pages/QuizGenerator';
import SCORMAuthor from './pages/SCORMAuthor';
import ScheduleSession from './pages/ScheduleSession';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import SocialHub from './pages/SocialHub';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentPathways from './pages/StudentPathways';
import StudyGroupDetail from './pages/StudyGroupDetail';
import Templates from './pages/Templates';
import TutorCourseManager from './pages/TutorCourseManager';
import TutorDashboard from './pages/TutorDashboard';
import TutorDashboardCanvas from './pages/TutorDashboardCanvas';
import TutorDashboardOverview from './pages/TutorDashboardOverview';
import TutorSessionsDashboard from './pages/TutorSessionsDashboard';
import TutorSetup from './pages/TutorSetup';
import Tutors from './pages/Tutors';
import VideoSession from './pages/VideoSession';
import YouthWork from './pages/YouthWork';
import YouthWorkWorkbook from './pages/YouthWorkWorkbook';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "AdminCoordinators": AdminCoordinators,
    "AdminCourseBuilder": AdminCourseBuilder,
    "AdminDailyFacts": AdminDailyFacts,
    "AdminDashboard": AdminDashboard,
    "AdminDiscover": AdminDiscover,
    "AdminLearningObjectives": AdminLearningObjectives,
    "AdminLibrary": AdminLibrary,
    "AdminPageBuilder": AdminPageBuilder,
    "AdminQuotes": AdminQuotes,
    "AdminRSSFeed": AdminRSSFeed,
    "AdminReminders": AdminReminders,
    "AdminReviews": AdminReviews,
    "AdminStudentMessages": AdminStudentMessages,
    "AdminStudentOfMonth": AdminStudentOfMonth,
    "AdminUserProfile": AdminUserProfile,
    "AdminUsers": AdminUsers,
    "AdminYouthWork": AdminYouthWork,
    "Analytics": Analytics,
    "ArtGallery": ArtGallery,
    "BookSession": BookSession,
    "CCEAPastPapers": CCEAPastPapers,
    "ChallengeLeaderboard": ChallengeLeaderboard,
    "ChallengePlayer": ChallengePlayer,
    "Challenges": Challenges,
    "Community": Community,
    "CommunityEventSlides": CommunityEventSlides,
    "ContactUs": ContactUs,
    "CoordinatorsDashboard": CoordinatorsDashboard,
    "CourseAnalytics": CourseAnalytics,
    "CourseDetails": CourseDetails,
    "CourseDiscussion": CourseDiscussion,
    "CourseParticipants": CourseParticipants,
    "CreateAssignment": CreateAssignment,
    "Dashboard": Dashboard,
    "DataPresentation": DataPresentation,
    "DetailedCourseAnalytics": DetailedCourseAnalytics,
    "Explore": Explore,
    "GradeAssignments": GradeAssignments,
    "Home": Home,
    "KnowledgeBase": KnowledgeBase,
    "LearningPaths": LearningPaths,
    "LessonEditor": LessonEditor,
    "LessonPlayer": LessonPlayer,
    "LessonPlayerClassic": LessonPlayerClassic,
    "LessonPlayerPowerPoint": LessonPlayerPowerPoint,
    "LessonPlayerRise": LessonPlayerRise,
    "Library": Library,
    "MessageCenter": MessageCenter,
    "PathManager": PathManager,
    "PathwayManager": PathwayManager,
    "Profile": Profile,
    "Programs": Programs,
    "Quiz": Quiz,
    "QuizGenerator": QuizGenerator,
    "SCORMAuthor": SCORMAuthor,
    "ScheduleSession": ScheduleSession,
    "Sessions": Sessions,
    "Settings": Settings,
    "SocialHub": SocialHub,
    "StudentAnalytics": StudentAnalytics,
    "StudentPathways": StudentPathways,
    "StudyGroupDetail": StudyGroupDetail,
    "Templates": Templates,
    "TutorCourseManager": TutorCourseManager,
    "TutorDashboard": TutorDashboard,
    "TutorDashboardCanvas": TutorDashboardCanvas,
    "TutorDashboardOverview": TutorDashboardOverview,
    "TutorSessionsDashboard": TutorSessionsDashboard,
    "TutorSetup": TutorSetup,
    "Tutors": Tutors,
    "VideoSession": VideoSession,
    "YouthWork": YouthWork,
    "YouthWorkWorkbook": YouthWorkWorkbook,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};