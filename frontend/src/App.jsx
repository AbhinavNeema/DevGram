import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectsPage from './pages/ProjectsPage';
import UserProfile from './pages/UserProfile';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import EditProfile from './pages/EditProfile';
import SearchPage from './pages/SearchPage';
import MainLayout from './layouts/MainLayout';
import Trending from './pages/Trending';
import ProjectPage from './pages/ProjectPage';
import BlogPage from './pages/BlogPage';
import DM from './pages/DM';
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';
import WorkspaceInvite from './pages/workspace/WorkspaceInvite';
import Workspaces from './pages/workspace/Workspaces';
import CreateWorkspace from './pages/workspace/CreateWorkspace';
import Invite from './pages/invite/Invite';

const ProfileRedirect = () => {
  const { user } = useAuth();
  if (user?.id) {
    return <Navigate to={`/user/${user.id}`} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#E2E8F0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workspace/invite/:workspaceId" element={<WorkspaceInvite />} />
          <Route path="/invite/:token" element={<Invite />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SearchPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BlogPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspaces"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Workspaces />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspaces/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WorkspaceDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspaces/create"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateWorkspace />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dm"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DM />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dm/:conversationId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DM />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/username/:username"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateProject />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProject />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Trending />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;