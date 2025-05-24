import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";
import { Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SuccessPage: React.FC = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authIsLoading } = useAuth();

  const isResubmission = searchParams.get("resubmit") === "true";

  useEffect(() => {
    if (authIsLoading) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          if (user) {
            console.log(
              "[SuccessPage] User logged in, redirecting to /profile"
            );
            navigate("/profile");
          } else {
            console.warn(
              "[SuccessPage] User not logged in after payment, redirecting to /create-account as a fallback."
            );
            navigate("/create-account");
          }
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user, authIsLoading, isResubmission]);

  if (authIsLoading) {
    return (
      <Layout>
        <div className="bg-gray-900 py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Verifying payment...
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  const redirectPath = user ? "/profile" : "/create-account";
  const buttonText = user ? "Go to Profile" : "Create Account";
  const redirectMessage = user
    ? "to your profile page"
    : "to create your account";

  return (
    <Layout>
      <div className="bg-gray-900 py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-[#9b9b6f] p-4">
              <Check size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
            Thank you for joining the Pull-Up Club! Your payment has been
            processed successfully. You will be redirected {redirectMessage} in{" "}
            {countdown} seconds.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(redirectPath)}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SuccessPage;
