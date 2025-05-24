import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import LoginForm from "./LoginForm.tsx";
import SignUpForm from "./SignUpForm.tsx";
import ResetPasswordForm from "./ResetPasswordForm.tsx";
import ResetSentConfirmation from "./ResetSentConfirmation.tsx";

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const routeState = location.state as {
        from?: string;
        intendedAction?: string;
      } | null;
      if (!routeState?.intendedAction) {
        navigate(routeState?.from || "/profile", { replace: true });
      }
      return;
    }
  }, [navigate, user, location.state]);

  const handleToggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleShowResetForm = () => {
    setShowResetForm(true);
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetSent(false);
    setResetEmail("");
  };

  const handleResetSent = (email: string) => {
    setResetEmail(email);
    setResetSent(true);
  };

  const routeState = location.state as {
    from?: string;
    intendedAction?: string;
    plan?: "monthly" | "annual";
  } | null;
  const intendedPlan = routeState?.plan;

  // Password reset success view
  if (resetSent) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
            <div className="mb-6">
              <img
                src="/PUClogo (1).png"
                alt="Pull-Up Club Logo"
                className="h-16 w-auto"
              />
            </div>
            <ResetSentConfirmation
              email={resetEmail}
              onBackToLogin={handleBackToLogin}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Password reset form
  if (showResetForm) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
            <div className="mb-6">
              <img
                src="/PUClogo (1).png"
                alt="Pull-Up Club Logo"
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-[#9b9b6f] mb-6 text-center tracking-wider">
              Reset Password
            </h2>

            <ResetPasswordForm
              onBackToLogin={handleBackToLogin}
              onResetSent={handleResetSent}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Main login/signup form
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
          <p className="text-gray-400 text-sm mb-4 text-center">
            New here? Sign up below to get started
          </p>

          {isSignUp ? (
            <SignUpForm onToggleForm={handleToggleForm} />
          ) : (
            <LoginForm
              onToggleForm={handleToggleForm}
              onShowResetForm={handleShowResetForm}
            />
          )}
        </div>
        {intendedPlan && (
          <div className="relative z-10 mt-8 flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm mb-2">
              You are about to {isSignUp ? "sign up and" : "sign in to"}{" "}
              subscribe to the{" "}
              {intendedPlan === "monthly" ? "$9.99/month" : "$99.00/year"} plan.
              Payment will be processed after account creation/login.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoginPage;
