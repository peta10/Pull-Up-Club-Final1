import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { products } from "../../stripe-config";
import { createCheckoutSession } from "../../lib/stripe";
import { useAuth } from "../../context/AuthContext";

const SubscriptionPlans: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly"
  );
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubscribe = async () => {
    setError(null);

    if (!user) {
      navigate("/create-account", {
        state: {
          from: location.pathname,
          intendedAction: "subscribe",
          plan: selectedPlan,
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession(
        selectedPlan,
        user.email,
        { userId: user.id }
      );

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start checkout process"
      );
      setIsLoading(false);
    }
  };

  const annualSavings = (
    products.pullUpClub.price * 12 -
    products.pullUpClubAnnual.price
  ).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto">
      {!user && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center">
          <p className="text-white">
            You're not logged in. You'll be prompted to create an account after
            selecting a plan.
          </p>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 p-1 rounded-full">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPlan === "monthly"
                ? "bg-[#9b9b6f] text-black"
                : "text-white hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan("annual")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPlan === "annual"
                ? "bg-[#9b9b6f] text-black"
                : "text-white hover:bg-gray-700"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div
          className={`relative rounded-xl overflow-hidden ${
            selectedPlan === "monthly"
              ? "border-2 border-[#9b9b6f] shadow-lg shadow-[#9b9b6f]/20"
              : "border border-gray-700"
          }`}
        >
          <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Monthly Membership
            </h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-white">
                ${products.pullUpClub.price}
              </span>
              <span className="text-gray-400 ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">Leaderboard access</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">Achievement badges</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">Cancel anytime</span>
              </li>
            </ul>

            {selectedPlan === "monthly" && (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-[#9b9b6f] text-black font-medium py-3 rounded-md hover:bg-[#7a7a58] transition flex items-center justify-center"
              >
                {isLoading && user ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Start Now <ChevronRight size={18} className="ml-1" />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div
          className={`relative rounded-xl overflow-hidden ${
            selectedPlan === "annual"
              ? "border-2 border-[#9b9b6f] shadow-lg shadow-[#9b9b6f]/20"
              : "border border-gray-700"
          }`}
        >
          <div className="absolute top-0 right-0 bg-[#9b9b6f] text-black px-3 py-1 text-xs font-semibold">
            BEST VALUE
          </div>

          <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Annual Membership
            </h3>
            <div className="flex items-baseline mb-1">
              <span className="text-3xl font-bold text-white">
                ${products.pullUpClubAnnual.price}
              </span>
              <span className="text-gray-400 ml-1">/year</span>
            </div>
            <p className="text-green-400 text-sm mb-4">
              Save ${annualSavings} per year
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">
                  Everything in monthly plan
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">
                  Better value for long-term commitment
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
                <span className="text-gray-300">
                  Set-it-and-forget-it — no monthly billing interruptions
                </span>
              </li>
            </ul>

            {selectedPlan === "annual" && (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-[#9b9b6f] text-black font-medium py-3 rounded-md hover:bg-[#7a7a58] transition flex items-center justify-center"
              >
                {isLoading && user ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Get Annual Plan <ChevronRight size={18} className="ml-1" />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center">
        <div className="flex items-center space-x-4 mb-2">
          <ShieldCheck className="h-5 w-5 text-[#9b9b6f]" />
          <CreditCard className="h-5 w-5 text-[#9b9b6f]" />
        </div>
        <p className="text-sm text-gray-400 text-center">
          Secure payment processing by Stripe. Cancel your subscription anytime.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
