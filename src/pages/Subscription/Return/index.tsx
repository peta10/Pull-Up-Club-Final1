import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSessionStatus } from '../../../lib/api';

// Status types from Stripe
type CheckoutStatus = 'open' | 'complete' | 'expired';
type PaymentStatus = 'paid' | 'unpaid' | 'no_payment_required';

export default function SubscriptionReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | CheckoutStatus>('loading');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found. Please try subscribing again.');
      return;
    }

    const verifySession = async () => {
      try {
        const result = await getSessionStatus(sessionId);
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        setStatus(result.status);
        setPaymentStatus(result.payment_status);

        // If payment was successful, redirect to success page after a short delay
        if (result.status === 'complete' && result.payment_status === 'paid') {
          setTimeout(() => {
            navigate('/success?type=subscription');
          }, 2000);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment status. Please contact support.');
      }
    };

    verifySession();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Payment Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/subscription')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Verifying your payment...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'complete' && paymentStatus === 'paid') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-gray-700 mb-4">Your subscription is now active. Redirecting you to the success page...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-yellow-600 mb-4">Checkout Session Expired</h2>
        <p className="text-gray-700 mb-4">Your checkout session has expired. Please try again.</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/subscription')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Default case for open or other statuses
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-yellow-600 mb-4">Payment In Progress</h2>
      <p className="text-gray-700 mb-4">
        Your payment is still being processed. Please do not close this page.
      </p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    </div>
  );
} 