import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2 } from "lucide-react";

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    from?: string;
    intendedAction?: string;
    plan?: "monthly" | "annual";
  } | null;
  const intendedPlan = routeState?.plan;

  // Password validation
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!isPasswordValid) {
        throw new Error("Please ensure your password meets all requirements");
      }
      await signUp(email, password);

      // Redirect user to subscription flow immediately
      navigate('/subscription', {
        replace: true,
        state: { intendedAction: 'subscribe', plan: intendedPlan || 'monthly' },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (
        errorMessage.includes("User already registered") ||
        errorMessage.includes("already exists")
      ) {
        setError(
          "An account with this email already exists. Try signing in or reset your password."
        );
      } else if (errorMessage.includes("email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(errorMessage);
      }
    } finally {
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

        <div className="space-y-2 bg-white/5 p-4 rounded-xl">
          <p className="text-sm font-medium text-gray-300 mb-2">
            Password Requirements:
          </p>
          <PasswordRequirement
            met={hasMinLength}
            text="At least 6 characters"
          />
          <PasswordRequirement met={hasUpperCase} text="One uppercase letter" />
          <PasswordRequirement met={hasLowerCase} text="One lowercase letter" />
          <PasswordRequirement met={hasNumber} text="One number" />
        </div>

        {error && <div className="text-sm text-red-400 text-left">{error}</div>}
      </div>
      <hr className="opacity-10" />
      <div>
        <button
          type="submit"
          disabled={!isPasswordValid || isLoading}
          className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
        >
          {isLoading
            ? "Processing..."
            : intendedPlan
            ? "Sign Up & Proceed to Payment"
            : "Sign up"}
        </button>

        <div className="w-full text-center mt-2">
          <span className="text-xs text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="underline text-white/80 hover:text-white"
            >
              Sign in
            </button>
          </span>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
