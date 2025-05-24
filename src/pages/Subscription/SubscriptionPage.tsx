import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import SubscriptionPlans from "./SubscriptionPlans";
import SubscriptionManager from "./SubscriptionManager";
import { getActiveSubscription } from "../../lib/stripe";
import { CheckCircle2, Loader2 } from "lucide-react";

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <div className="max-w-lg mx-auto">
              <div className="bg-[#9b9b6f]/20 border border-[#9b9b6f] rounded-lg p-4 mb-8 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <p className="text-gray-200">
                  You have an active membership. Manage your subscription below.
                </p>
              </div>
              <SubscriptionManager onError={setError} />
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

              <SubscriptionPlans />
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
