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
import AcademyBuilder from './pages/AcademyBuilder';
import AcademyExplore from './pages/AcademyExplore';
import AcademyManager from './pages/AcademyManager';
import AcademyPlayer from './pages/AcademyPlayer';
import Achievements from './pages/Achievements';
import AdminAppVersion from './pages/AdminAppVersion';
import AdminAttendance from './pages/AdminAttendance';
import AdminCoordinators from './pages/AdminCoordinators';
import AdminCourseBuilder from './pages/AdminCourseBuilder';
import AdminDailyFacts from './pages/AdminDailyFacts';
import AdminDashboard from './pages/AdminDashboard';
import AdminDiscover from './pages/AdminDiscover';
import AdminLearningObjectives from './pages/AdminLearningObjectives';
import AdminLibrary from './pages/AdminLibrary';
import AdminLibraryDashboard from './pages/AdminLibraryDashboard';
import AdminNotifications from './pages/AdminNotifications';
import AdminPageBuilder from './pages/AdminPageBuilder';
import AdminQuotes from './pages/AdminQuotes';
import AdminRSSFeed from './pages/AdminRSSFeed';
import AdminReminders from './pages/AdminReminders';
import AdminReviews from './pages/AdminReviews';
import AdminRolesPermissions from './pages/AdminRolesPermissions';
import AdminStudentMessages from './pages/AdminStudentMessages';
import AdminStudentOfMonth from './pages/AdminStudentOfMonth';
import AdminTutorMonitor from './pages/AdminTutorMonitor';
import AdminUserProfile from './pages/AdminUserProfile';
import AdminUsers from './pages/AdminUsers';
import AdminYouthWork from './pages/AdminYouthWork';
import Analytics from './pages/Analytics';
import ArtGallery from './pages/ArtGallery';
import BookDetails from './pages/BookDetails';
import BookSession from './pages/BookSession';
import CCEAPastPapers from './pages/CCEAPastPapers';
import ChallengeLeaderboard from './pages/ChallengeLeaderboard';
import ChallengePlayer from './pages/ChallengePlayer';
import Challenges from './pages/Challenges';
import CollaborationHub from './pages/CollaborationHub';
import Community from './pages/Community';
import CommunityEventSlides from './pages/CommunityEventSlides';
import ContactUs from './pages/ContactUs';
import ContentVersionManager from './pages/ContentVersionManager';
import CoordinatorsDashboard from './pages/CoordinatorsDashboard';
import CourseAnalytics from './pages/CourseAnalytics';
import CourseDetails from './pages/CourseDetails';
import CourseDiscussion from './pages/CourseDiscussion';
import CourseIntegrityValidator from './pages/CourseIntegrityValidator';
import CourseParticipants from './pages/CourseParticipants';
import CreateAssignment from './pages/CreateAssignment';
import Dashboard from './pages/Dashboard';
import DataPresentation from './pages/DataPresentation';
import DetailedCourseAnalytics from './pages/DetailedCourseAnalytics';
import EnhancedContentAuthor from './pages/EnhancedContentAuthor';
import EnterpriseIntegrations from './pages/EnterpriseIntegrations';
import ExpertContentCreator from './pages/ExpertContentCreator';
import Explore from './pages/Explore';
import FileManager from './pages/FileManager';
import GradeAssignments from './pages/GradeAssignments';
import GroupProjectWorkspace from './pages/GroupProjectWorkspace';
import Home from './pages/Home';
import HomeGuest from './pages/HomeGuest';
import HomeLeadership from './pages/HomeLeadership';
import HomeLearning from './pages/HomeLearning';
import HomeYouthWork from './pages/HomeYouthWork';
import KnowledgeBase from './pages/KnowledgeBase';
import LMSIntegrationConfig from './pages/LMSIntegrationConfig';
import LeadershipLanding from './pages/LeadershipLanding';
import LearningImpactDashboard from './pages/LearningImpactDashboard';
import LearningPaths from './pages/LearningPaths';
import LessonEditor from './pages/LessonEditor';
import LessonPlayer from './pages/LessonPlayer';
import LessonPlayerClassic from './pages/LessonPlayerClassic';
import LessonPlayerPowerPoint from './pages/LessonPlayerPowerPoint';
import LessonPlayerRise from './pages/LessonPlayerRise';
import Library from './pages/Library';
import LiveSessionHost from './pages/LiveSessionHost';
import MessageCenter from './pages/MessageCenter';
import NotificationCenter from './pages/NotificationCenter';
import PathManager from './pages/PathManager';
import PathwayManager from './pages/PathwayManager';
import PersonalDashboard from './pages/PersonalDashboard';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import Quiz from './pages/Quiz';
import QuizGenerator from './pages/QuizGenerator';
import SCORMAuthor from './pages/SCORMAuthor';
import ScheduleSession from './pages/ScheduleSession';
import SessionRecordings from './pages/SessionRecordings';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import SimulationAuthor from './pages/SimulationAuthor';
import SocialHub from './pages/SocialHub';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentPathways from './pages/StudentPathways';
import StudyGroupDetail from './pages/StudyGroupDetail';
import Templates from './pages/Templates';
import TutorBookingManager from './pages/TutorBookingManager';
import TutorCourseManager from './pages/TutorCourseManager';
import TutorDashboard from './pages/TutorDashboard';
import TutorDashboardCanvas from './pages/TutorDashboardCanvas';
import TutorDashboardOverview from './pages/TutorDashboardOverview';
import TutorOnboarding from './pages/TutorOnboarding';
import TutorSessionsDashboard from './pages/TutorSessionsDashboard';
import TutorSetup from './pages/TutorSetup';
import Tutors from './pages/Tutors';
import VideoSession from './pages/VideoSession';
import WelcomeCover from './pages/WelcomeCover';
import YouthWork from './pages/YouthWork';
import YouthWorkLanding from './pages/YouthWorkLanding';
import YouthWorkWorkbook from './pages/YouthWorkWorkbook';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AcademyBuilder": AcademyBuilder,
    "AcademyExplore": AcademyExplore,
    "AcademyManager": AcademyManager,
    "AcademyPlayer": AcademyPlayer,
    "Achievements": Achievements,
    "AdminAppVersion": AdminAppVersion,
    "AdminAttendance": AdminAttendance,
    "AdminCoordinators": AdminCoordinators,
    "AdminCourseBuilder": AdminCourseBuilder,
    "AdminDailyFacts": AdminDailyFacts,
    "AdminDashboard": AdminDashboard,
    "AdminDiscover": AdminDiscover,
    "AdminLearningObjectives": AdminLearningObjectives,
    "AdminLibrary": AdminLibrary,
    "AdminLibraryDashboard": AdminLibraryDashboard,
    "AdminNotifications": AdminNotifications,
    "AdminPageBuilder": AdminPageBuilder,
    "AdminQuotes": AdminQuotes,
    "AdminRSSFeed": AdminRSSFeed,
    "AdminReminders": AdminReminders,
    "AdminReviews": AdminReviews,
    "AdminRolesPermissions": AdminRolesPermissions,
    "AdminStudentMessages": AdminStudentMessages,
    "AdminStudentOfMonth": AdminStudentOfMonth,
    "AdminTutorMonitor": AdminTutorMonitor,
    "AdminUserProfile": AdminUserProfile,
    "AdminUsers": AdminUsers,
    "AdminYouthWork": AdminYouthWork,
    "Analytics": Analytics,
    "ArtGallery": ArtGallery,
    "BookDetails": BookDetails,
    "BookSession": BookSession,
    "CCEAPastPapers": CCEAPastPapers,
    "ChallengeLeaderboard": ChallengeLeaderboard,
    "ChallengePlayer": ChallengePlayer,
    "Challenges": Challenges,
    "CollaborationHub": CollaborationHub,
    "Community": Community,
    "CommunityEventSlides": CommunityEventSlides,
    "ContactUs": ContactUs,
    "ContentVersionManager": ContentVersionManager,
    "CoordinatorsDashboard": CoordinatorsDashboard,
    "CourseAnalytics": CourseAnalytics,
    "CourseDetails": CourseDetails,
    "CourseDiscussion": CourseDiscussion,
    "CourseIntegrityValidator": CourseIntegrityValidator,
    "CourseParticipants": CourseParticipants,
    "CreateAssignment": CreateAssignment,
    "Dashboard": Dashboard,
    "DataPresentation": DataPresentation,
    "DetailedCourseAnalytics": DetailedCourseAnalytics,
    "EnhancedContentAuthor": EnhancedContentAuthor,
    "EnterpriseIntegrations": EnterpriseIntegrations,
    "ExpertContentCreator": ExpertContentCreator,
    "Explore": Explore,
    "FileManager": FileManager,
    "GradeAssignments": GradeAssignments,
    "GroupProjectWorkspace": GroupProjectWorkspace,
    "Home": Home,
    "HomeGuest": HomeGuest,
    "HomeLeadership": HomeLeadership,
    "HomeLearning": HomeLearning,
    "HomeYouthWork": HomeYouthWork,
    "KnowledgeBase": KnowledgeBase,
    "LMSIntegrationConfig": LMSIntegrationConfig,
    "LeadershipLanding": LeadershipLanding,
    "LearningImpactDashboard": LearningImpactDashboard,
    "LearningPaths": LearningPaths,
    "LessonEditor": LessonEditor,
    "LessonPlayer": LessonPlayer,
    "LessonPlayerClassic": LessonPlayerClassic,
    "LessonPlayerPowerPoint": LessonPlayerPowerPoint,
    "LessonPlayerRise": LessonPlayerRise,
    "Library": Library,
    "LiveSessionHost": LiveSessionHost,
    "MessageCenter": MessageCenter,
    "NotificationCenter": NotificationCenter,
    "PathManager": PathManager,
    "PathwayManager": PathwayManager,
    "PersonalDashboard": PersonalDashboard,
    "Profile": Profile,
    "Programs": Programs,
    "Quiz": Quiz,
    "QuizGenerator": QuizGenerator,
    "SCORMAuthor": SCORMAuthor,
    "ScheduleSession": ScheduleSession,
    "SessionRecordings": SessionRecordings,
    "Sessions": Sessions,
    "Settings": Settings,
    "SimulationAuthor": SimulationAuthor,
    "SocialHub": SocialHub,
    "StudentAnalytics": StudentAnalytics,
    "StudentPathways": StudentPathways,
    "StudyGroupDetail": StudyGroupDetail,
    "Templates": Templates,
    "TutorBookingManager": TutorBookingManager,
    "TutorCourseManager": TutorCourseManager,
    "TutorDashboard": TutorDashboard,
    "TutorDashboardCanvas": TutorDashboardCanvas,
    "TutorDashboardOverview": TutorDashboardOverview,
    "TutorOnboarding": TutorOnboarding,
    "TutorSessionsDashboard": TutorSessionsDashboard,
    "TutorSetup": TutorSetup,
    "Tutors": Tutors,
    "VideoSession": VideoSession,
    "WelcomeCover": WelcomeCover,
    "YouthWork": YouthWork,
    "YouthWorkLanding": YouthWorkLanding,
    "YouthWorkWorkbook": YouthWorkWorkbook,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};