import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
  onResetSent: (email: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onBackToLogin,
  onResetSent,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email);
      onResetSent(email);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordReset} className="w-full flex flex-col gap-4">
      <div className="w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          required
        />
      </div>

      {error && <div className="text-sm text-red-400 text-left">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </button>

      <div className="text-center mt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs text-gray-400 hover:text-white underline"
        >
          Back to login
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
