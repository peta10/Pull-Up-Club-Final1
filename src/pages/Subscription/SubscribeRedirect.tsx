import { useEffect } from 'react';
import { startCheckout } from '../../lib/stripe';

const SubscribeRedirect: React.FC = () => {
  useEffect(() => {
    // Start monthly checkout by default
    startCheckout('monthly');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <p className="text-xl animate-pulse">Redirecting to secure checkout…</p>
    </div>
  );
};

export default SubscribeRedirect; 