import React, { useEffect, useState, useMemo, lazy, Suspense, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.tsx";
import AdminRoute from "./components/Layout/AdminRoute.tsx";
import { supabase } from "./lib/supabase.ts";
import Lenis from "lenis";
import DebugConnection from "./lib/DebugConnection.tsx";
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider } from '@stripe/react-stripe-js';

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
const CheckoutReturn = lazy(() => import("./pages/Subscription/Return/index.tsx"));
const VideoSubmissionPage = lazy(() => import("./pages/VideoSubmission/VideoSubmissionPage.tsx"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement.tsx"));

// Stripe setup
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f]"></div>
  </div>
);

// Component to render the main application content, dependent on auth and Stripe setup
const AppMain: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth(); // Get user from auth context
  const location = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<
    "initializing" | "connecting" | "connected" | "error"
  >("initializing");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      setConnectionStatus("connecting");
      checkConnection();
    }, 2000);
    return () => clearTimeout(initTimeout);
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    let rafId: number;
    const rafLoop = (time: number) => {
      lenis.raf(time);
      rafId = (globalThis as any).requestAnimationFrame(rafLoop);
    };
    rafId = (globalThis as any).requestAnimationFrame(rafLoop);
    lenis.scrollTo(0, { immediate: true });
    return () => {
      (globalThis as any).cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location]);

  // This onAuthStateChange might be redundant if AuthContext handles it thoroughly
  // Consider centralizing auth state logic in AuthContext.tsx
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("[App.tsx] Auth state changed:", _event, session?.user?.email);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error) throw error;
      setConnectionStatus("connected");
      setRetryCount(0);
    } catch (error) {
      console.error("Database connection error:", error);
      if (retryCount >= 2) {
        setConnectionStatus("error");
      } else {
        setRetryCount((prev) => prev + 1);
        setTimeout(checkConnection, 3000);
      }
    }
  };

  const fetchCheckoutClientSecret = useCallback(async () => {
    // Get current session to access the token securely
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("[App.tsx] No active session or error fetching session for checkout:", sessionError);
      return null;
    }
    
    if (!user || !stripePublishableKey) { // user is still useful for email, id
      console.log("[App.tsx] User details or Stripe key not available for checkout.");
      return null;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // Use token from session
        },
        body: JSON.stringify({
          priceId: 'price_1RMacXGaHiDfsUfBF4dgFfjO', // Monthly Price ID
          customerEmail: user.email, // user.email should be available from AuthContext's user object
          returnUrl: `${window.location.origin}/return`,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`,
          uiMode: 'embedded',
          metadata: { userId: user.id } // user.id should be available
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[App.tsx] Failed to fetch client secret:", errorData);
        return Promise.reject(errorData); 
      }
      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error("[App.tsx] Error in fetchCheckoutClientSecret:", error);
      return null;
    }
  }, [user, stripePublishableKey]); // Dependencies: user and stripePublishableKey

  const stripeElementsAppearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    },
  };
  
  const checkoutProviderOptions = useMemo(() => {
    if (!stripePublishableKey || !user) return null; // Also depend on user for re-memoization if user changes
    return {
        elementsOptions: { appearance: stripeElementsAppearance, clientSecret: undefined }, // clientSecret will be fetched by provider
        loader: 'auto' as const,
        // fetchClientSecret is NOT directly part of options here, but for the Provider itself
    };
  }, [user, stripePublishableKey, stripeElementsAppearance]); // Add stripeElementsAppearance as dependency

  if (authLoading || connectionStatus === "initializing" || connectionStatus === "connecting") {
    return <LoadingFallback />;
  }
  
  // Decide whether to wrap with CheckoutProvider based on the route
  const isCheckoutRoute = location.pathname === '/checkout';

  const routesContent = (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies" element={<CookiesPolicyPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route
          path="/login"
          element={<ProtectedRoute requireAuth={false} redirectTo="/profile"><LoginPage /></ProtectedRoute>}
        />
        <Route path="/create-account" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscribe" element={<SubscriptionPage />} /> 
        <Route path="/subscription/return" element={<CheckoutReturn />} /> 
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/submit-video" element={<ProtectedRoute><VideoSubmissionPage /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin-users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
        
        {/* /return is already handled by CheckoutReturn */}
        <Route path="/return" element={<CheckoutReturn />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );

  return (
    <>
      {connectionStatus === "error" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
          <span><strong>Connection Error:</strong> Unable to connect.</span>
          <button onClick={() => { setConnectionStatus("connecting"); checkConnection(); }} className="bg-red-700 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      )}
      <DebugConnection />
      {isCheckoutRoute && stripePromise && checkoutProviderOptions ? (
        <CheckoutProvider stripe={stripePromise} options={{fetchClientSecret: fetchCheckoutClientSecret, ...checkoutProviderOptions.elementsOptions}}>
            {routesContent}
        </CheckoutProvider>
      ) : (
        routesContent
      )}
    </>
  );
};

// AppWrapper sets up Router and AuthProvider at the top level
const AppWrapper = () => (
  <Router>
    <AuthProvider> {/* AuthProvider now wraps AppMain */}
      <AppMain />
    </AuthProvider>
  </Router>
);

export default AppWrapper;