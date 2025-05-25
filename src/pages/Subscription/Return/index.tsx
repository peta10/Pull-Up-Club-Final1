import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, CheckCircle } from 'lucide-react';

const CheckoutReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'complete' | 'open' | 'error'>('loading');
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const fetchSessionStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-session-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get session status');
        }

        setStatus(data.status);
        setCustomerEmail(data.customer_email);

        // If the session is still open, redirect back to checkout
        if (data.status === 'open') {
          navigate('/subscription');
        }
      } catch (error) {
        console.error('Error checking session status:', error);
        setStatus('error');
      }
    };

    fetchSessionStatus();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f]"></div>
          <p className="mt-4 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-xl font-bold text-red-700">Payment Error</h1>
          </div>
          <p className="text-red-600 mb-4">
            We couldn't verify your payment status. Please contact customer support if you believe this is an error.
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Return to Subscription Page
          </button>
        </div>
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <h1 className="text-xl font-bold text-green-700">Payment Successful!</h1>
          </div>
          <p className="text-green-700 mb-2">
            Thank you for your subscription to Pull-Up Club!
          </p>
          {customerEmail && (
            <p className="text-green-600 mb-4">
              We've sent a confirmation email to <span className="font-medium">{customerEmail}</span>.
            </p>
          )}
          <p className="text-green-600 mb-6">
            Your account has been activated and you now have full access to all features.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-[#9b9b6f] hover:bg-[#7a7a58] text-black font-medium py-2 px-4 rounded transition-colors"
          >
            Go to My Profile
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CheckoutReturn; 