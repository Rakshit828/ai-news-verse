// src/router/index.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/router/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import DashboardPage from "@/pages/DashboardPage";
import PersonalizationPage from "@/pages/PersonalizationPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="personalization" element={<PersonalizationPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
