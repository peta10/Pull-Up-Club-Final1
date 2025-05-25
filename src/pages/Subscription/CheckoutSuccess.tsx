import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
      <p className="text-gray-200 mb-6">Your subscription is now active. Welcome to Pull-Up Club!</p>
      <button
        className="bg-[#9b9b6f] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#7a7a58] transition"
        onClick={() => navigate("/profile")}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default CheckoutSuccess; 