import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hashVerified, setHashVerified] = useState(false);
  const [email, setEmail] = useState("");
  const { updatePassword, signIn } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch;

  // Verify the reset hash on load
  useEffect(() => {
    const verifyHash = async () => {
      // The hash is automatically handled by Supabase
      // We just need to check if we're in a valid recovery session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error verifying password reset hash:", error);
        setError(
          "Invalid or expired password reset link. Please request a new one."
        );
        return;
      }

      if (data.session?.user) {
        setHashVerified(true);
        // Store email for auto sign-in after password reset
        if (data.session.user.email) {
          setEmail(data.session.user.email);
        }
      } else {
        setError(
          "You must use the link from your email to reset your password."
        );
      }
    };

    verifyHash();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError(
        "Please ensure your password meets all requirements and that both passwords match."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updatePassword(password);
      setSuccess(true);

      // Auto sign in after 1.5 seconds to allow the user to see the success message
      if (email) {
        setTimeout(async () => {
          try {
            await signIn(email, password);
            navigate("/profile");
          } catch (signInError) {
            console.error(
              "Error signing in after password reset:",
              signInError
            );
            // If auto sign-in fails, still show success but keep the manual sign-in button
          }
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(`Failed to update password: ${errorMessage}`);
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

  // Success view
  if (success) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden w-full">
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
            <div className="mb-6">
              <img
                src="/PUClogo (1).png"
                alt="Pull-Up Club Logo"
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center mb-6">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">
                Password Updated
              </h2>
              <p className="text-gray-300 mt-2">
                Your password has been successfully changed.
              </p>
              <p className="text-gray-300 mt-2">
                {email
                  ? "Signing you in automatically..."
                  : "Please sign in with your new password."}
              </p>
            </div>

            <div className="w-full">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
              >
                {email ? "Continue to Profile" : "Sign In with New Password"}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Reset password form
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden w-full">
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
          <div className="mb-6">
            <img
              src="/PUClogo (1).png"
              alt="Pull-Up Club Logo"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-2xl font-semibold text-[#9b9b6f] mb-6 text-center tracking-wider">
            BATTLE BUNKER
          </h2>
          <div className="text-center mb-6">
            <Lock size={28} className="mx-auto text-[#9b9b6f] mb-2" />
            <h3 className="text-xl text-white">Reset Your Password</h3>
          </div>

          {!hashVerified ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9b9b6f] mx-auto mb-4"></div>
              <p className="text-sm text-white">
                {error || "Verifying your reset link..."}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-full gap-4"
            >
              <div className="w-full flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <PasswordRequirement
                    met={passwordsMatch}
                    text="Passwords match"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-400 text-left">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={!isPasswordValid || isLoading}
                  className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
