import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import UserProfile from "./pages/UserProfile";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import SearchPage from "./pages/SearchPage";
import MainLayout from "./layouts/MainLayout";
import Trending from "./pages/Trending";
import ProjectPage from "./pages/ProjectPage";
import BlogPage from "./pages/BlogPage";
import DM from "./pages/DM";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/blog/:id" element={
            <ProtectedRoute>
                <MainLayout>
                  <BlogPage />
                </MainLayout>
              </ProtectedRoute>
          }/>
          
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
          <Route path="/project/:id" element={
            <ProtectedRoute>
                <MainLayout>
                  <ProjectPage />
                </MainLayout>
              </ProtectedRoute>
          }/>
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