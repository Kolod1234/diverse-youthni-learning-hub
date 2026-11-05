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
 *   import { lazy } from 'react';
// Redesign (performance): each page is its own file that loads only when opened, so a first visit
// no longer downloads every page and library on the site (was one ~8 MB file). Home stays eager.
import HomePage from './pages/HomePage';
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
const AcademyBuilder = lazy(() => import('./pages/AcademyBuilder'));
const AcademyExplore = lazy(() => import('./pages/AcademyExplore'));
const AcademyManager = lazy(() => import('./pages/AcademyManager'));
const AcademyPlayer = lazy(() => import('./pages/AcademyPlayer'));
const Achievements = lazy(() => import('./pages/Achievements'));
const AdminAppVersion = lazy(() => import('./pages/AdminAppVersion'));
const AdminAttendance = lazy(() => import('./pages/AdminAttendance'));
const AdminCoordinators = lazy(() => import('./pages/AdminCoordinators'));
const AdminCourseBuilder = lazy(() => import('./pages/AdminCourseBuilder'));
const AdminDailyFacts = lazy(() => import('./pages/AdminDailyFacts'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminDiscover = lazy(() => import('./pages/AdminDiscover'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const AdminLearningObjectives = lazy(() => import('./pages/AdminLearningObjectives'));
const AdminLibrary = lazy(() => import('./pages/AdminLibrary'));
const AdminLibraryDashboard = lazy(() => import('./pages/AdminLibraryDashboard'));
const AdminMathSolutionAudit = lazy(() => import('./pages/AdminMathSolutionAudit'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const AdminPageBuilder = lazy(() => import('./pages/AdminPageBuilder'));
const AdminQuotes = lazy(() => import('./pages/AdminQuotes'));
const AdminRSSFeed = lazy(() => import('./pages/AdminRSSFeed'));
const AdminReminders = lazy(() => import('./pages/AdminReminders'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminRolesPermissions = lazy(() => import('./pages/AdminRolesPermissions'));
const AdminStudentMessages = lazy(() => import('./pages/AdminStudentMessages'));
const AdminStudentOfMonth = lazy(() => import('./pages/AdminStudentOfMonth'));
const AdminSupportChats = lazy(() => import('./pages/AdminSupportChats'));
const AdminTeachingRequests = lazy(() => import('./pages/AdminTeachingRequests'));
const AdminTutorMonitor = lazy(() => import('./pages/AdminTutorMonitor'));
const AdminUserProfile = lazy(() => import('./pages/AdminUserProfile'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminYouthWork = lazy(() => import('./pages/AdminYouthWork'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ArtGallery = lazy(() => import('./pages/ArtGallery'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const BookSession = lazy(() => import('./pages/BookSession'));
const CCEAPastPapers = lazy(() => import('./pages/CCEAPastPapers'));
const ChallengeLeaderboard = lazy(() => import('./pages/ChallengeLeaderboard'));
const ChallengePlayer = lazy(() => import('./pages/ChallengePlayer'));
const Challenges = lazy(() => import('./pages/Challenges'));
const CollaborationHub = lazy(() => import('./pages/CollaborationHub'));
const Community = lazy(() => import('./pages/Community'));
const CommunityEventSlides = lazy(() => import('./pages/CommunityEventSlides'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ContentVersionManager = lazy(() => import('./pages/ContentVersionManager'));
const CoordinatorsDashboard = lazy(() => import('./pages/CoordinatorsDashboard'));
const CourseAnalytics = lazy(() => import('./pages/CourseAnalytics'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const CourseDiscussion = lazy(() => import('./pages/CourseDiscussion'));
const CourseIntegrityValidator = lazy(() => import('./pages/CourseIntegrityValidator'));
const CourseParticipants = lazy(() => import('./pages/CourseParticipants'));
const CreateAssignment = lazy(() => import('./pages/CreateAssignment'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DataPresentation = lazy(() => import('./pages/DataPresentation'));
const DetailedCourseAnalytics = lazy(() => import('./pages/DetailedCourseAnalytics'));
const EnhancedContentAuthor = lazy(() => import('./pages/EnhancedContentAuthor'));
const EnterpriseIntegrations = lazy(() => import('./pages/EnterpriseIntegrations'));
const Events = lazy(() => import('./pages/Events'));
const ExpertContentCreator = lazy(() => import('./pages/ExpertContentCreator'));
const Explore = lazy(() => import('./pages/Explore'));
const FileManager = lazy(() => import('./pages/FileManager'));
const GradeAssignments = lazy(() => import('./pages/GradeAssignments'));
const GroupProjectWorkspace = lazy(() => import('./pages/GroupProjectWorkspace'));
import Home from './pages/Home';
const HomeGuest = lazy(() => import('./pages/HomeGuest'));
const HomeLeadership = lazy(() => import('./pages/HomeLeadership'));
const HomeLearning = lazy(() => import('./pages/HomeLearning'));
const HomeYouthWork = lazy(() => import('./pages/HomeYouthWork'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const LMSIntegrationConfig = lazy(() => import('./pages/LMSIntegrationConfig'));
const LeadershipLanding = lazy(() => import('./pages/LeadershipLanding'));
const LearningImpactDashboard = lazy(() => import('./pages/LearningImpactDashboard'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const LessonEditor = lazy(() => import('./pages/LessonEditor'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const LessonPlayerClassic = lazy(() => import('./pages/LessonPlayerClassic'));
const LessonPlayerPowerPoint = lazy(() => import('./pages/LessonPlayerPowerPoint'));
const LessonPlayerRise = lazy(() => import('./pages/LessonPlayerRise'));
const Library = lazy(() => import('./pages/Library'));
const LiveSessionHost = lazy(() => import('./pages/LiveSessionHost'));
const MessageCenter = lazy(() => import('./pages/MessageCenter'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const PartnerSchools = lazy(() => import('./pages/PartnerSchools'));
const PartnerJoinSchool = lazy(() => import('./pages/PartnerJoinSchool'));
const PartnerClasses = lazy(() => import('./pages/PartnerClasses'));
const PartnerInviteStudents = lazy(() => import('./pages/PartnerInviteStudents'));
const PartnerSchoolDashboard = lazy(() => import('./pages/PartnerSchoolDashboard'));
const PartnerSchoolSetup = lazy(() => import('./pages/PartnerSchoolSetup'));
const PartnerSeatRequests = lazy(() => import('./pages/PartnerSeatRequests'));
const PartnerSeatCodes = lazy(() => import('./pages/PartnerSeatCodes'));
const PartnerSchoolSeats = lazy(() => import('./pages/PartnerSchoolSeats'));
const PastPaperSolver = lazy(() => import('./pages/PastPaperSolver.jsx'));
const PathManager = lazy(() => import('./pages/PathManager'));
const PathwayManager = lazy(() => import('./pages/PathwayManager'));
const PersonalDashboard = lazy(() => import('./pages/PersonalDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Programs = lazy(() => import('./pages/Programs'));
const Quiz = lazy(() => import('./pages/Quiz'));
const QuizGenerator = lazy(() => import('./pages/QuizGenerator'));
const SCORMAuthor = lazy(() => import('./pages/SCORMAuthor'));
const ScheduleSession = lazy(() => import('./pages/ScheduleSession'));
const SessionRecordings = lazy(() => import('./pages/SessionRecordings'));
const Sessions = lazy(() => import('./pages/Sessions'));
const Settings = lazy(() => import('./pages/Settings'));
const SimulationAuthor = lazy(() => import('./pages/SimulationAuthor'));
const SocialHub = lazy(() => import('./pages/SocialHub'));
const StudentAnalytics = lazy(() => import('./pages/StudentAnalytics'));
const StudentPathways = lazy(() => import('./pages/StudentPathways'));
const StudyGroupDetail = lazy(() => import('./pages/StudyGroupDetail'));
const Templates = lazy(() => import('./pages/Templates'));
const TutorBookingManager = lazy(() => import('./pages/TutorBookingManager'));
const TutorCourseManager = lazy(() => import('./pages/TutorCourseManager'));
const TutorDashboard = lazy(() => import('./pages/TutorDashboard'));
const TutorDashboardCanvas = lazy(() => import('./pages/TutorDashboardCanvas'));
const TutorDashboardOverview = lazy(() => import('./pages/TutorDashboardOverview'));
const TutorOnboarding = lazy(() => import('./pages/TutorOnboarding'));
const TutorSessionsDashboard = lazy(() => import('./pages/TutorSessionsDashboard'));
const TutorSetup = lazy(() => import('./pages/TutorSetup'));
const Tutors = lazy(() => import('./pages/Tutors'));
const VideoSession = lazy(() => import('./pages/VideoSession'));
const WelcomeCover = lazy(() => import('./pages/WelcomeCover'));
const YouthWork = lazy(() => import('./pages/YouthWork'));
const YouthWorkLanding = lazy(() => import('./pages/YouthWorkLanding'));
const YouthWorkWorkbook = lazy(() => import('./pages/YouthWorkWorkbook'));
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
    "AdminEvents": AdminEvents,
    "AdminLearningObjectives": AdminLearningObjectives,
    "AdminLibrary": AdminLibrary,
    "AdminLibraryDashboard": AdminLibraryDashboard,
    "AdminMathSolutionAudit": AdminMathSolutionAudit,
    "AdminNotifications": AdminNotifications,
    "AdminPageBuilder": AdminPageBuilder,
    "AdminQuotes": AdminQuotes,
    "AdminRSSFeed": AdminRSSFeed,
    "AdminReminders": AdminReminders,
    "AdminReviews": AdminReviews,
    "AdminRolesPermissions": AdminRolesPermissions,
    "AdminStudentMessages": AdminStudentMessages,
    "AdminStudentOfMonth": AdminStudentOfMonth,
    "AdminSupportChats": AdminSupportChats,
    "AdminTeachingRequests": AdminTeachingRequests,
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
    "Events": Events,
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
    "PartnerSchools": PartnerSchools,
    "PartnerJoinSchool": PartnerJoinSchool,
    "PartnerClasses": PartnerClasses,
    "PartnerInviteStudents": PartnerInviteStudents,
    "PartnerSchoolDashboard": PartnerSchoolDashboard,
    "PartnerSchoolSetup": PartnerSchoolSetup,
    "PartnerSeatRequests": PartnerSeatRequests,
    "PartnerSeatCodes": PartnerSeatCodes,
    "PartnerSchoolSeats": PartnerSchoolSeats,
    "PastPaperSolver": PastPaperSolver,
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