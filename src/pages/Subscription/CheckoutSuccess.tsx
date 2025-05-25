import React from "react";
import { useNavigate } from "react-router-dom";

interface CheckoutSuccessProps {
  subscriptionType?: 'monthly' | 'annual';
  customerName?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  customerName,
  redirectTo,
  redirectLabel
}) => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate("/profile");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
      <p className="text-gray-200 mb-6">
        {customerName 
          ? `Welcome to Pull-Up Club, ${customerName}!` 
          : 'Your subscription is now active. Welcome to Pull-Up Club!'}
      </p>
      <button
        className="bg-[#9b9b6f] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#7a7a58] transition"
        onClick={handleNavigate}
      >
        {redirectLabel || 'Go to Dashboard'}
      </button>
    </div>
  );
};

export default CheckoutSuccess; 