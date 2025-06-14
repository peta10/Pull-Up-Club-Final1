import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { products } from "../../lib/stripe-config";
import { trackEvent } from "../../utils/analytics";

// Payment links - NOTE: Update these in Stripe Dashboard to point to /signup-access?session_id={CHECKOUT_SESSION_ID}
const STRIPE_PAYMENT_LINKS = {
  monthly: "https://buy.stripe.com/test_dRmdR9dos2kmaQcdHGejK00",
  annual: "https://buy.stripe.com/test_28EcN5dosf784rO0UUejK01"
};

const SubscriptionPlans: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly"
  );


  const handleSubscribe = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Fire analytics for checkout attempt
      trackEvent({
        action: 'subscription_plan_selected',
        category: 'stripe',
        label: selectedPlan,
      });

      console.log(`Redirecting to Stripe payment link for ${selectedPlan} plan`);
      
      // Redirect to the appropriate payment link based on the selected plan
      const paymentLink = selectedPlan === "monthly" 
        ? STRIPE_PAYMENT_LINKS.monthly 
        : STRIPE_PAYMENT_LINKS.annual;
      
      trackEvent({
        action: 'stripe_checkout_redirect',
        category: 'stripe',
        label: selectedPlan,
      });
      
      // Redirect to Stripe Payment Link
      window.location.href = paymentLink;
      
    } catch (err) {
      console.error("Redirect error:", err);
      
      let errorMessage = "Failed to redirect to payment page. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const annualSavings = (
    products.pullUpClub.price * 12 -
    products.pullUpClubAnnual.price
  ).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="max-w-2xl mx-auto mb-8 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-300">
          Choose your plan below. After payment, you'll create your account to access the platform.
          </p>
        </div>

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
          } flex flex-col h-full`}
        >
          <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-2">
              Monthly Membership
            </h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-white">
                ${products.pullUpClub.price}
              </span>
              <span className="text-gray-400 ml-1">/month (USD)</span>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
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

              <button
              onClick={() => {
                setSelectedPlan("monthly");
                setTimeout(handleSubscribe, 100);
              }}
                disabled={isLoading}
              className={`w-full font-medium py-3 rounded-md transition flex items-center justify-center ${
                selectedPlan === "monthly"
                  ? "bg-[#9b9b6f] text-black hover:bg-[#7a7a58]"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              >
              {isLoading && selectedPlan === "monthly" ? (
                  <span className="flex items-center">
                    <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          </div>
        </div>

        <div
          className={`relative rounded-xl overflow-hidden ${
            selectedPlan === "annual"
              ? "border-2 border-[#9b9b6f] shadow-lg shadow-[#9b9b6f]/20"
              : "border border-gray-700"
          } flex flex-col h-full`}
        >
          <div className="absolute top-0 right-0 bg-[#9b9b6f] text-black px-3 py-1 text-xs font-semibold">
            BEST VALUE
          </div>

          <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-2">
              Annual Membership
            </h3>
            <div className="flex items-baseline mb-1">
              <span className="text-3xl font-bold text-white">
                ${products.pullUpClubAnnual.price}
              </span>
              <span className="text-gray-400 ml-1">/year (USD)</span>
            </div>
            <p className="text-green-400 text-sm mb-4">
              Save ${annualSavings} per year
            </p>

            <ul className="space-y-3 mb-6 flex-grow">
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

              <button
              onClick={() => {
                setSelectedPlan("annual");
                setTimeout(handleSubscribe, 100);
              }}
                disabled={isLoading}
              className={`w-full font-medium py-3 rounded-md transition flex items-center justify-center ${
                selectedPlan === "annual"
                  ? "bg-[#9b9b6f] text-black hover:bg-[#7a7a58]"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              >
              {isLoading && selectedPlan === "annual" ? (
                  <span className="flex items-center">
                    <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
