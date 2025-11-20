import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import './globals.css';
import './App.css';
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import FormPage from "./pages/valuationform";
import EditValuationPage from "./pages/valuationeditform";
import { LoadingProvider } from "./context/LoadingContext";
import { NotificationProvider } from "./context/NotificationContext";
import store from "./redux/store";
import GlobalLoader from "./components/GlobalLoader";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <LoadingSpinner />;
    return user ? children : <Navigate to="/login" replace />;
  };

  // Public Route component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    if (loading) return <LoadingSpinner />;
    return !user ? children : <Navigate to="/dashboard" replace />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Provider store={store}>
      <NotificationProvider>
        <LoadingProvider>
          <BrowserRouter>
            <GlobalLoader />
            <Routes>
            {/* Redirect root to appropriate page based on auth status */}
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
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
                  <DashboardPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/valuationform" 
              element={
                <ProtectedRoute>
                  <FormPage user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Edit Valuation Page with ID parameter */}
            <Route 
              path="/valuationeditform/:id" 
              element={
                <ProtectedRoute>
                  <EditValuationPage user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </NotificationProvider>
    </Provider>
  );
}

export default App;