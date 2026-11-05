import './App.css'
import { lazy, Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
const CreationHub = lazy(() => import('./pages/CreationHub'));
const Laboratory = lazy(() => import('./pages/Laboratory'));
const ProjectGallery = lazy(() => import('./pages/ProjectGallery'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const AdminProjectSubmissions = lazy(() => import('./pages/AdminProjectSubmissions'));
const AdminTeachingRequests = lazy(() => import('./pages/AdminTeachingRequests'));
const KahootHost = lazy(() => import('./pages/KahootHost'));
const KahootPlay = lazy(() => import('./pages/KahootPlay'));
const KahootAnalytics = lazy(() => import('./pages/KahootAnalytics'));
import OAuthConsent from './pages/OAuthConsent';
const AssetLibrary = lazy(() => import('./pages/AssetLibrary'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const AdminParentLinks = lazy(() => import('./pages/AdminParentLinks'));
const TutorLeaderboard = lazy(() => import('./pages/TutorLeaderboard'));
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import UsernameSetupGate from '@/components/account/UsernameSetupGate';
import AgeVerificationGate from '@/components/account/AgeVerificationGate';
import AccountAccessGate from '@/components/account/AccountAccessGate';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Shown inside the page area while a page's file loads for the first time: the header and menu stay put.
const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
  </div>
);

const LayoutWrapper = ({ children, currentPageName }) => {
  const page = <Suspense fallback={<PageFallback />}>{children}</Suspense>;
  return Layout ? <Layout currentPageName={currentPageName}>{page}</Layout> : page;
};

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, checkAppState } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AccountAccessGate user={user} refreshUser={checkAppState}>
    <AgeVerificationGate user={user}>
    <UsernameSetupGate user={user} refreshUser={checkAppState}>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/creation-hub" element={<LayoutWrapper currentPageName="CreationHub"><CreationHub /></LayoutWrapper>} />
      <Route path="/laboratory" element={<LayoutWrapper currentPageName="Laboratory"><Laboratory /></LayoutWrapper>} />
      <Route path="/project-gallery" element={<LayoutWrapper currentPageName="ProjectGallery"><ProjectGallery /></LayoutWrapper>} />
      <Route path="/project/:id" element={<LayoutWrapper currentPageName="ProjectDetail"><ProjectDetail /></LayoutWrapper>} />
      <Route path="/admin-project-submissions" element={<LayoutWrapper currentPageName="AdminProjectSubmissions"><AdminProjectSubmissions /></LayoutWrapper>} />
      <Route path="/AdminTeachingRequests" element={<LayoutWrapper currentPageName="AdminTeachingRequests"><AdminTeachingRequests /></LayoutWrapper>} />
      <Route path="/kahoot-host" element={<LayoutWrapper currentPageName="KahootHost"><KahootHost /></LayoutWrapper>} />
      <Route path="/kahoot-play" element={<LayoutWrapper currentPageName="KahootPlay"><KahootPlay /></LayoutWrapper>} />
      <Route path="/kahoot-analytics" element={<LayoutWrapper currentPageName="KahootAnalytics"><KahootAnalytics /></LayoutWrapper>} />
      <Route path="/asset-library" element={<LayoutWrapper currentPageName="AssetLibrary"><AssetLibrary /></LayoutWrapper>} />
      <Route path="/parent-dashboard" element={<LayoutWrapper currentPageName="ParentDashboard"><ParentDashboard /></LayoutWrapper>} />
      <Route path="/admin-parent-links" element={<LayoutWrapper currentPageName="AdminParentLinks"><AdminParentLinks /></LayoutWrapper>} />
      <Route path="/tutor-leaderboard" element={<LayoutWrapper currentPageName="TutorLeaderboard"><TutorLeaderboard /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </UsernameSetupGate>
    </AgeVerificationGate>
    </AccountAccessGate>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <Routes>
            <Route path="/oauth/consent" element={<OAuthConsent />} />
          </Routes>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App