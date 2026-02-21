// src/router/index.tsx
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// ─── Placeholder pages (replace with real page components as you build them) ──
const NewsPage = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Today's AI News</h1>
        <p>News feed will appear here.</p>
    </div>
)

const LoginPage = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Login</h1>
        <p>Login form will appear here.</p>
    </div>
)

const SignupPage = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Sign Up</h1>
        <p>Signup form will appear here.</p>
    </div>
)

const OnboardingPage = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Choose Your Categories</h1>
        <p>Category picker will appear here.</p>
    </div>
)

const NotFoundPage = () => (
    <div style={{ padding: '2rem' }}>
        <h1>404 — Page Not Found</h1>
    </div>
)

// ─── Route Tree ───────────────────────────────────────────────────────────────
export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<NewsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
