import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getActiveSubscription } from "../../lib/stripe";
import { CheckCircle2, Loader2 } from "lucide-react";
import SubscriptionDetails from "./SubscriptionDetails";
import SubscriptionPlans from "./SubscriptionPlans";
import PaymentHistory from "./PaymentHistory";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import CheckoutSuccess from "./CheckoutSuccess";
import StripePaymentForm from "./StripePaymentForm";
import { supabase } from "../../lib/supabase";

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract information from route state and query parameters
  const routeState = (location.state || {}) as {
    intendedAction?: string;
    plan?: "monthly" | "annual";
  };
  
  const [showPaymentForm, setShowPaymentForm] = useState(
    routeState?.intendedAction === "subscribe"
  );
  
  const successParam = searchParams.get("success");
  const cancelledParam = searchParams.get("cancelled");
  const planParam = searchParams.get("plan") as "monthly" | "annual" | null;
  // For checkout success
  const checkoutParam = searchParams.get("checkout");

  // Check if the user has a subscription when the component mounts or when the user changes
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setHasSubscription(false);
        setIsLoading(false);
        return;
      }

      try {
        // Helper to obtain a valid session, retrying briefly if needed
        const obtainSession = async (retries = 3, delayMs = 500) => {
          for (let i = 0; i < retries; i++) {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session && !error) return session;
            // Wait before retrying
            await new Promise((res) => setTimeout(res, delayMs));
          }
          return null;
        };

        // Make sure we have a valid session before checking subscription
        const session = await obtainSession();
        if (!session) {
          console.warn("No authenticated session available for subscription check");
          setHasSubscription(false);
          setIsLoading(false);
          return;
        }

        const data = await getActiveSubscription();
        
        // Safely handle null data
        if (!data) {
          console.warn("No subscription data returned");
          setHasSubscription(false);
        } else {
          setHasSubscription(!!data.subscription);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
        setError("Failed to load subscription status");
        setHasSubscription(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  // Set up the payment form if the user comes with intendedAction=subscribe
  useEffect(() => {
    // If user has returned from login/signup and wants to subscribe
    if (user && routeState?.intendedAction === "subscribe" && routeState?.plan) {
      setShowPaymentForm(true);
    }
  }, [user, routeState]);

  // Show success page if redirected from successful checkout
  if (successParam === "true" || checkoutParam === "completed") {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <CheckoutSuccess 
              subscriptionType={planParam || "monthly"}
              customerName={user?.email?.split('@')[0]}
              redirectTo="/profile"
              redirectLabel="Go to your profile"
            />
          </div>
        </div>
      </Layout>
    );
  }

  // If user explicitly came to subscribe with the standard checkout flow
  if (showPaymentForm && !hasSubscription && user) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
          <div className="w-full max-w-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Complete Your {routeState.plan === "annual" ? "Annual" : "Monthly"} Subscription
            </h1>
            <StripePaymentForm
              onPaymentComplete={() => {
                // When payment succeeds show the success component
                navigate("/subscription?success=true&plan=" + (routeState.plan || "monthly"), { 
                  replace: true, 
                  state: {} 
                });
              }}
              onPaymentError={(msg) => {
                // stay on page, maybe show toast (handled in component)
                console.error("Payment error", msg);
              }}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-3 gap-4">
              <img
                src="/PUClogo (1).webp"
                alt="Pull-Up Club Logo"
                className="h-12 w-12 md:h-16 md:w-16 object-contain inline-block"
                style={{ background: 'transparent' }}
                loading="eager"
                fetchPriority="high"
              />
              <h1 className="text-3xl font-bold text-white m-0 p-0">
                Pull-Up Club Membership
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our exclusive pull-up challenge community, track your progress, and compete on the leaderboard.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 text-[#9b9b6f] animate-spin" />
            </div>
          ) : hasSubscription ? (
            <div className="space-y-8 max-w-3xl mx-auto">
              {cancelledParam === "true" && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-8 flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-yellow-200">
                    Your subscription has been set to cancel at the end of your current billing period.
                    You'll continue to have access until then.
                  </p>
                </div>
              )}

              <div className="bg-[#9b9b6f]/20 border border-[#9b9b6f] rounded-lg p-4 mb-8 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <p className="text-gray-200">
                  You have an active membership. Manage your subscription below.
                </p>
              </div>
              
              <SubscriptionDetails />
              
              <PaymentHistory />
            </div>
          ) : (
            <>
              <SubscriptionPlans />
              
              <div className="mt-12 text-center text-sm text-gray-500">
                <p>
                  By subscribing, you agree to our{' '}
                  <a href="/terms" className="text-[#9b9b6f] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#9b9b6f] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mt-8 bg-red-900/30 border border-red-800 rounded-lg p-4 text-sm text-red-200 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;