import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CategoriesPage from "./pages/CategoriesPage";
import { AINewsDashboard } from "./pages/Dashboard";
import { LoadingSpinner } from "./components/LoadingSpinner";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/dashboard" element={ <AINewsDashboard />} />
      <Route path="/loading" element={ <LoadingSpinner size="lg" />} />
    </Routes>
  );
}

export default App;
