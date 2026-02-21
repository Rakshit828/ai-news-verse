// src/router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Renders child routes only if the user is authenticated.
 * Redirects to /login otherwise, preserving the original location
 * so the user can be sent back after logging in.
 */
export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
