import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Team from './pages/Team'
import Attendance from './pages/Attendance'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SystemLogs from './pages/SystemLogs'
import Inventory from './pages/Inventory'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginWrapper />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="projects" element={<Projects />} />
                                <Route path="team" element={<Team />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="expenses" element={<Expenses />} />
                                <Route path="inventory" element={<Inventory />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="system-logs" element={<SystemLogs />} />
                                <Route path="profile" element={<Profile />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </NotificationProvider>
        </AuthProvider>
    )
}

// Wrapper to redirect if already logged in
function LoginWrapper() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/" /> : <Login />;
}
