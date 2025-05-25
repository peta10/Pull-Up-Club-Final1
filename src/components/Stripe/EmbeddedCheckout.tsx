import React, { useState } from "react";
import {
  PaymentElement,
  AddressElement,
  useCheckout,
} from '@stripe/react-stripe-js';

const validateEmail = async (email: string | null, checkout: any) => {
  if (!checkout || !email) {
    return { isValid: false, message: "Checkout or email not available" };
  }
  const updateResult = await checkout.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
}

const EmailInput = ({ email, setEmail, error, setError }: { email: string, setEmail: (email: string) => void, error: string | null, setError: (error: string | null) => void }) => {
  const checkout = useCheckout();

  const handleBlur = async () => {
    if (!email) {
      return;
    }

    if (!checkout) {
      setError("Checkout is not available to validate email.");
      return;
    }

    const { isValid, message } = await validateEmail(email, checkout);
    if (!isValid) {
      setError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setEmail(e.target.value);
  };

  return (
    <div className="mb-4">
      <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
        Email
      </label>
      <input
        id="email"
        type="text"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="you@example.com"
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {error && <div id="email-errors" className="mt-1 text-sm text-red-400">{error}</div>}
    </div>
  );
};

// Add props interface for EmbeddedCheckout
interface EmbeddedCheckoutProps {
  priceId: string;
  returnUrl: string;
  metadata?: Record<string, any>;
}

// Update component signature to accept props
const EmbeddedCheckout: React.FC<EmbeddedCheckoutProps> = ({ priceId, returnUrl, metadata }) => {
  // Log embedded checkout configuration for debugging and to use props
  console.log("[EmbeddedCheckout] Config:", { priceId, returnUrl, metadata });
  const checkout = useCheckout();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkout) {
      setMessage("Checkout is not available. Please try again later.");
      return;
    }

    setIsLoading(true);

    const { isValid, message: validationMessage } = await validateEmail(email, checkout);
    if (!isValid) {
      setEmailError(validationMessage);
      setMessage(validationMessage);
      setIsLoading(false);
      return;
    }

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === 'error') {
      setMessage(confirmResult.error.message ?? "An unknown error occurred.");
    }

    setIsLoading(false);
  };

  const totalAmount = checkout?.total?.total?.amount;
  const currencyCode = checkout?.total?.total?.currencyCode;
  
  const formattedAmount = totalAmount && currencyCode
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(totalAmount / 100)
    : '';


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto my-10">
      <EmailInput
        email={email}
        setEmail={setEmail}
        error={emailError}
        setError={setEmailError}
      />
      <div>
        <h4 className="text-lg font-semibold text-gray-100 mb-2">Billing Address</h4>
        <AddressElement 
          options={{
            mode: 'billing',
          }} 
        />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-100 mb-2">Payment</h4>
        <PaymentElement 
          id="payment-element" 
        />
      </div>
      <button 
        disabled={isLoading || !checkout} 
        id="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="spinner w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
        ) : (
          `Pay ${formattedAmount || 'now'}`
        )}
      </button>
      {message && <div id="payment-message" className="mt-2 text-center text-sm text-red-400">{message}</div>}
    </form>
  );
}

export default EmbeddedCheckout; 