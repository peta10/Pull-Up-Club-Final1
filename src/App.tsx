import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.tsx";
import AdminRoute from "./components/Layout/AdminRoute.tsx";
import { supabase } from "./lib/supabase.ts";
import Lenis from "lenis";
import StripeProvider from "./lib/StripeProvider.tsx";
import DebugConnection from './lib/DebugConnection';
import { Toaster } from 'react-hot-toast';

// Lazy-loaded components
const Home = lazy(() => import("./pages/Home/Home.tsx"));
const LeaderboardPage = lazy(() => import("./pages/Leaderboard/LeaderboardPage.tsx"));
const AdminDashboardPage = lazy(() => import("./pages/Admin/AdminDashboardPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage.tsx"));
const SuccessPage = lazy(() => import("./pages/Success/SuccessPage.tsx"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage.tsx"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage.tsx"));
const RulesPage = lazy(() => import("./pages/Rules/RulesPage.tsx"));
const FAQPage = lazy(() => import("./pages/FAQ/FAQPage.tsx"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicyPage.tsx"));
const CookiesPolicyPage = lazy(() => import("./pages/CookiesPolicy/CookiesPolicyPage.tsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword/ResetPasswordPage.tsx"));
const SubscriptionPage = lazy(() => import("./pages/Subscription/SubscriptionPage.tsx"));
const SubscribeRedirect = lazy(() => import("./pages/Subscription/SubscribeRedirect.tsx"));
const SignupAccessPage = lazy(() => import("./pages/Subscription/SignupAccessPage.tsx"));
const VideoSubmissionPage = lazy(() => import("./pages/VideoSubmission/VideoSubmissionPage.tsx"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement.tsx"));
const EthosPage = lazy(() => import("./pages/EthosPage.tsx"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f]"></div>
  </div>
);

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

    // Create a simple raf loop that works with Deno/TypeScript
    let rafId: number;
    const rafLoop = (time: number) => {
      lenis.raf(time);
      // Cast to any to bypass TypeScript error
      rafId = (globalThis as any).requestAnimationFrame(rafLoop);
    };
    
    // Cast to any to bypass TypeScript error
    rafId = (globalThis as any).requestAnimationFrame(rafLoop);

    // Scroll to top on route change
    lenis.scrollTo(0, { immediate: true });

    return () => {
      // Cancel animation frame on cleanup
      (globalThis as any).cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        // We're not using these variables but keeping the listener for state changes
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check database connection
  const checkConnection = async () => {
    try {
      // Use a simpler query that just selects the id of one row
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
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid #9b9b6f',
          },
          success: {
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #9b9b6f',
            },
            iconTheme: {
              primary: '#9b9b6f',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      <AuthProvider>
        <StripeProvider>
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
          
          {/* Debug connection component for better diagnostics */}
          <DebugConnection />
          
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes that don't require authentication */}
              <Route path="/" element={<Home />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/cookies" element={<CookiesPolicyPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/ethos" element={<EthosPage />} />

              {/* Authentication routes - redirect if already logged in */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo="/profile">
                    <LoginPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect from /create-account to /login */}
              <Route
                path="/create-account"
                element={<Navigate to="/login" replace />}
              />

              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Public route with conditional display based on auth state */}
              <Route path="/subscription" element={<SubscriptionPage />} />

              {/* Alias route for backwards compatibility */}
              <Route path="/subscribe" element={<SubscriptionPage />} />

              {/* New pay-first signup route */}
              <Route path="/signup" element={<SubscribeRedirect />} />

              {/* Secure signup access page */}
              <Route path="/signup-access" element={<SignupAccessPage />} />

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
                path="/submit"
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
          </Suspense>
        </StripeProvider>
      </AuthProvider>
    </>
  );
}

// Wrap App with Router for useLocation to work
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;