import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import CreationHub from './pages/CreationHub';
import ProjectGallery from './pages/ProjectGallery';
import ProjectDetail from './pages/ProjectDetail';
import AdminProjectSubmissions from './pages/AdminProjectSubmissions';
import KahootHost from './pages/KahootHost';
import KahootPlay from './pages/KahootPlay';
import KahootAnalytics from './pages/KahootAnalytics';
import AssetLibrary from './pages/AssetLibrary';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      <Route path="/project-gallery" element={<LayoutWrapper currentPageName="ProjectGallery"><ProjectGallery /></LayoutWrapper>} />
      <Route path="/project/:id" element={<LayoutWrapper currentPageName="ProjectDetail"><ProjectDetail /></LayoutWrapper>} />
      <Route path="/admin-project-submissions" element={<LayoutWrapper currentPageName="AdminProjectSubmissions"><AdminProjectSubmissions /></LayoutWrapper>} />
      <Route path="/kahoot-host" element={<LayoutWrapper currentPageName="KahootHost"><KahootHost /></LayoutWrapper>} />
      <Route path="/kahoot-play" element={<LayoutWrapper currentPageName="KahootPlay"><KahootPlay /></LayoutWrapper>} />
      <Route path="/kahoot-analytics" element={<LayoutWrapper currentPageName="KahootAnalytics"><KahootAnalytics /></LayoutWrapper>} />
      <Route path="/asset-library" element={<LayoutWrapper currentPageName="AssetLibrary"><AssetLibrary /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App