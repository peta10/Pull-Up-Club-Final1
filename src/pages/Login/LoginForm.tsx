import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface LoginFormProps {
  onToggleForm: () => void;
  onShowResetForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onToggleForm,
  onShowResetForm,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    from?: string;
    intendedAction?: string;
    plan?: "monthly" | "annual";
  } | null;
  const intendedPlan = routeState?.plan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (intendedPlan) {
        localStorage.setItem("pendingSubscriptionPlan", intendedPlan);
        console.log(
          "[LoginForm] pendingSubscriptionPlan set in localStorage (sign-in):",
          intendedPlan
        );
      }
      await signIn(email, password);
    } catch (err) {
      localStorage.removeItem("pendingSubscriptionPlan");
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (errorMessage.includes("invalid_credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (errorMessage.includes("email_not_confirmed")) {
        setError("Your email has not been confirmed. Please check your inbox.");
      } else if (errorMessage.includes("email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="w-full flex flex-col gap-3">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          required
        />

        <div className="text-right">
          <button
            type="button"
            onClick={onShowResetForm}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Forgot your password?
          </button>
        </div>

        {error && <div className="text-sm text-red-400 text-left">{error}</div>}
      </div>
      <hr className="opacity-10" />
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
        >
          {isLoading
            ? "Processing..."
            : intendedPlan
            ? "Sign In & Proceed to Payment"
            : "Sign in"}
        </button>

        <div className="w-full text-center mt-2">
          <span className="text-xs text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="underline text-white/80 hover:text-white"
            >
              {intendedPlan
                ? "Sign up to Proceed to Payment"
                : "Sign up, it's free!"}
            </button>
          </span>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
