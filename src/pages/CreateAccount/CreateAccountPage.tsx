import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2 } from "lucide-react";

const CreateAccountPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [intendedPlan, setIntendedPlan] = useState<
    "monthly" | "annual" | undefined
  >(undefined);

  useEffect(() => {
    if (user) {
      const routeState = location.state as { intendedAction?: string } | null;
      if (!routeState?.intendedAction) {
        navigate("/profile", { replace: true });
      }
      return;
    }
    const routeState = location.state as {
      from?: string;
      intendedAction?: string;
      plan?: "monthly" | "annual";
    } | null;
    if (routeState?.intendedAction === "subscribe" && routeState.plan) {
      setIntendedPlan(routeState.plan);
      const storedEmail = localStorage.getItem("checkoutEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    } else {
      const storedEmail = localStorage.getItem("checkoutEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [navigate, user, location.state]);

  // Password validation
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  // Email validation
  const isEmailValid = (email: string) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!email) {
        setError("Email is required. Please enter your email.");
        setIsLoading(false);
        return;
      }

      if (!isEmailValid(email)) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      if (!isPasswordValid) {
        throw new Error("Please ensure your password meets all requirements");
      }

      await signUp(email, password);
      localStorage.removeItem("checkoutEmail");
    } catch (err: any) {
      // localStorage.removeItem("pendingSubscriptionPlan"); // Ensure this is also removed if it exists here

      // Handle specific Supabase errors
      if (err?.message?.includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (err?.message?.includes("Invalid email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during sign up"
        );
      }

      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({
    met,
    text,
  }: {
    met: boolean;
    text: string;
  }) => (
    <div className="flex items-center space-x-2 text-sm">
      <CheckCircle2
        size={16}
        className={met ? "text-green-500" : "text-gray-500"}
      />
      <span className={met ? "text-green-500" : "text-gray-500"}>{text}</span>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden w-full">
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/PUClogo (1).png"
              alt="Pull-Up Club Logo"
              className="h-16 w-auto"
            />
          </div>

          <h2 className="text-2xl font-semibold text-[#9b9b6f] mb-6 text-center tracking-wider">
            BATTLE BUNKER
          </h2>

          <h3 className="text-xl font-medium text-white mb-4 text-center">
            Create Account{" "}
            {intendedPlan ? `to Subscribe (${intendedPlan})` : ""}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <div className="w-full flex flex-col gap-3">
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error.includes("email")) setError("");
                }}
                className={`w-full px-5 py-3 rounded-xl ${
                  error.includes("email")
                    ? "border-2 border-red-500"
                    : "bg-white/10"
                } text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]`}
                required
              />

              <input
                placeholder="Create Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                required
              />

              <div className="space-y-2 bg-white/5 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Password Requirements:
                </p>
                <PasswordRequirement
                  met={hasMinLength}
                  text="At least 6 characters"
                />
                <PasswordRequirement
                  met={hasUpperCase}
                  text="One uppercase letter"
                />
                <PasswordRequirement
                  met={hasLowerCase}
                  text="One lowercase letter"
                />
                <PasswordRequirement met={hasNumber} text="One number" />
              </div>

              {error && (
                <div className="text-sm text-red-400 text-left p-2 bg-red-400/10 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <hr className="opacity-10 my-2" />

            <div>
              <button
                type="submit"
                disabled={!isPasswordValid || isLoading || !email}
                className={`w-full ${
                  !isPasswordValid || isLoading || !email
                    ? "bg-gray-500/50 cursor-not-allowed"
                    : "bg-white/10 hover:bg-white/20"
                } text-white font-medium px-5 py-3 rounded-full shadow transition mb-3 text-sm`}
              >
                {isLoading
                  ? "Processing..."
                  : intendedPlan
                  ? "Sign Up & Proceed to Payment"
                  : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {intendedPlan && (
          <div className="relative z-10 mt-8 flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm mb-2">
              {intendedPlan === "monthly"
                ? "Monthly Plan: $9.99/month"
                : "Annual Plan: $99.00/year"}
              . You will proceed to payment after creating your account.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateAccountPage;
