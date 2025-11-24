import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import './globals.css';
import './App.css';
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import FormPage from "./pages/valuationform";
import EditValuationPage from "./pages/valuationeditform.jsx";
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import { setNotificationHandler, resetUnauthorizedErrorFlag } from "./services/axios";
import store from "./redux/store";
import GlobalLoader from "./components/GlobalLoader";

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { hideUnauthorizedError, showUnauthorizedError } = useNotification();

    useEffect(() => {
        // Initialize notification handler in axios interceptor
        setNotificationHandler({ showUnauthorizedError, hideUnauthorizedError });
    }, [showUnauthorizedError, hideUnauthorizedError]);

    useEffect(() => {
        // Check if user is logged in on app start
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Handle login
    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        // Hide unauthorized error notification after successful login
        hideUnauthorizedError();
        // Reset flag so error can show again if needed
        resetUnauthorizedErrorFlag();
    };

    // Handle logout
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    // Loading component - uses GlobalLoader styling
    const LoadingSpinner = () => (
        <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <style>
                {`
                  @keyframes pulse {
                    0%, 100% { stroke-dasharray: 125 220; }
                    50% { stroke-dasharray: 220 220; }
                  }
                  @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}
            </style>
            <div className="flex flex-col items-center gap-8 max-w-md">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#F36E21]/30 via-[#EC5E25]/20 to-[#FFC547]/30 rounded-3xl blur-2xl opacity-60"></div>
                    <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl">
                        <div className="flex justify-center items-center mb-8">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F36E21] to-[#FFC547] opacity-20 blur-lg"></div>
                                <svg className="w-20 h-20" viewBox="0 0 100 100" style={{ animation: 'rotate 3s linear infinite' }}>
                                    <defs>
                                        <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F36E21" stopOpacity="1" />
                                            <stop offset="50%" stopColor="#EC5E25" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#FFC547" stopOpacity="0.6" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#premiumGradient)" strokeWidth="3" strokeDasharray="125 220" strokeLinecap="round" style={{ animation: 'pulse 2s ease-in-out infinite', filter: 'drop-shadow(0 0 8px rgba(243, 110, 33, 0.5))' }} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#F36E21] to-[#FFC547] rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-white font-semibold text-lg tracking-wide">Loading</h3>
                            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">Please wait</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Protected Route component - allows access with or without login, but marks as read-only if not logged in
    const ProtectedRoute = ({ children }) => {
        if (loading) return <LoadingSpinner />;
        return children;
    };

    // Public Route component (redirect to dashboard if already logged in)
    const PublicRoute = ({ children }) => {
        if (loading) return <LoadingSpinner />;
        return !user ? children : <Navigate to="/dashboard" replace />;
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Routes>
            {/* Redirect root to dashboard (accessible to both logged in and not logged in users) */}
            <Route
                path="/"
                element={
                    <Navigate to="/dashboard" replace />
                }
            />

            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage onLogin={handleLogin} />
                    </PublicRoute>
                }
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage user={user} onLogout={handleLogout} onLogin={handleLogin} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/valuationform"
                element={
                    <ProtectedRoute>
                        <FormPage user={user} onLogin={handleLogin} />
                    </ProtectedRoute>
                }
            />

            {/* Edit Valuation Page with ID parameter */}
            <Route
                path="/valuationeditform/:id"
                element={
                    <ProtectedRoute>
                        <EditValuationPage user={user} onLogin={handleLogin} />
                    </ProtectedRoute>
                }
            />

            

            {/*

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Provider store={store}>
            <NotificationProvider>
                <ChatProvider>
                    <BrowserRouter>
                        <GlobalLoader />
                        <AppContent />
                    </BrowserRouter>
                </ChatProvider>
            </NotificationProvider>
        </Provider>
    );
}

export default App;