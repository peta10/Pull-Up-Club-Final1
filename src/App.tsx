import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import AdminRoute from "./components/Layout/AdminRoute";
import Home from "./pages/Home/Home";
import LeaderboardPage from "./pages/Leaderboard/LeaderboardPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import SuccessPage from "./pages/Success/SuccessPage";
import LoginPage from "./pages/Login/LoginPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import RulesPage from "./pages/Rules/RulesPage";
import FAQPage from "./pages/FAQ/FAQPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import CookiesPolicyPage from "./pages/CookiesPolicy/CookiesPolicyPage";
import CreateAccountPage from "./pages/CreateAccount/CreateAccountPage";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import SubscriptionPage from "./pages/Subscription/SubscriptionPage";
import VideoSubmissionPage from "./pages/VideoSubmission/VideoSubmissionPage";
import AdminUserManagement from "./pages/AdminUserManagement";
import { supabase } from "./lib/supabase";
import Lenis from "lenis";

function App() {
  const [connectionStatus, setConnectionStatus] = useState<
    "initializing" | "connecting" | "connected" | "error"
  >("initializing");
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Give the app time to initialize before checking connection
    const initTimeout = setTimeout(() => {
      setConnectionStatus("connecting");
      checkConnection();
    }, 2000);

    return () => clearTimeout(initTimeout);
  }, []);

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Scroll to top on route change
    lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis.destroy();
    };
  }, [location]);

  // Check database connection
  const checkConnection = async () => {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error) throw error;
      setConnectionStatus("connected");
      setRetryCount(0);
    } catch (error) {
      console.error("Database connection error:", error);
      // Only show error after multiple failed attempts
      if (retryCount >= 2) {
        setConnectionStatus("error");
      } else {
        setRetryCount((prev) => prev + 1);
        // Try again after a delay
        setTimeout(checkConnection, 3000);
      }
    }
  };

  return (
    <AuthProvider>
      {connectionStatus === "error" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
          <span>
            <strong>Connection Error:</strong> Unable to connect to the
            database. Some features may not work correctly.
          </span>
          <button
            onClick={() => {
              setConnectionStatus("connecting");
              checkConnection();
            }}
            className="bg-red-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      )}
      <Routes>
        {/* Public routes that don't require authentication */}
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies" element={<CookiesPolicyPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Authentication routes - redirect if already logged in */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false} redirectTo="/profile">
              <LoginPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-account"
          element={
            <ProtectedRoute requireAuth={false} redirectTo="/profile">
              <CreateAccountPage />
            </ProtectedRoute>
          }
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Public route with conditional display based on auth state */}
        <Route path="/subscription" element={<SubscriptionPage />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/success" element={<SuccessPage />} />

        <Route
          path="/submit-video"
          element={
            <ProtectedRoute>
              <VideoSubmissionPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes with role check */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
