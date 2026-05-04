import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import MatchPage from './pages/MatchPage';
import ReportPage from './pages/ReportPage';
import InterviewPage from './pages/InterviewPage';
import OAuthCallback from './pages/OAuthCallback';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/analyse/:resumeId" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
