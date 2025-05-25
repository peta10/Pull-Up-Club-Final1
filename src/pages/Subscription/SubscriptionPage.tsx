import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getActiveSubscription } from "../../lib/stripe";
import { CheckCircle2, Loader2 } from "lucide-react";
import SubscriptionDetails from "./SubscriptionDetails";
import PlanComparison from "../../components/Stripe/PlanComparison";
import PaymentHistory from "../../components/Stripe/PaymentHistory";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import CheckoutSuccess from "../../components/Stripe/CheckoutSuccess";
import StripePaymentForm from "./StripePaymentForm";

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
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

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setHasSubscription(false);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getActiveSubscription();
        setHasSubscription(!!data.subscription);
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

  // Show success page if redirected from successful checkout
  if (successParam === "true") {
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

  // If user explicitly came to subscribe and we don't yet have an active subscription
  if (showPaymentForm && !hasSubscription) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
          <div className="w-full max-w-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Complete Your Subscription
            </h1>
            <StripePaymentForm
              onPaymentComplete={() => {
                // When payment succeeds show the success component
                navigate("/subscribe?success=true&plan=" + (routeState.plan || "monthly"), { replace: true, state: {} });
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
            <h1 className="text-3xl font-bold text-white mb-3">
              Pull-Up Club Membership
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our exclusive pull-up challenge community. Get daily
              workouts, track your progress, and compete on the leaderboard.
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
              
              <SubscriptionDetails userName={user?.email?.split('@')[0]} />
              
              <PaymentHistory />
            </div>
          ) : (
            <>
              {!user && (
                <div className="max-w-2xl mx-auto mb-8 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-300">
                    You're not logged in. You'll be prompted to create an
                    account after selecting a plan.
                  </p>
                </div>
              )}

              <PlanComparison />
              
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