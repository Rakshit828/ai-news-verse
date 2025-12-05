import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import AuthPage from './pages/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
