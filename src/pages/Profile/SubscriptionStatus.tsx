import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { products } from '../../lib/stripe-config';
import { Button } from '../../components/ui/Button';

interface SubscriptionStatusProps {
  isPaid: boolean;
  onManageClick: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ isPaid, onManageClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>
      
      {isPaid ? (
        <>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <p className="text-lg">Active Subscription</p>
          </div>
          <p className="text-gray-600 mb-4">
            You're subscribed to Pull-Up Club at {products.pullUpClub.name} ({(products.pullUpClub.price).toFixed(2)} USD/month)
          </p>
          <Button onClick={onManageClick} variant="outline">
            Manage Subscription
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <p className="text-lg">No Active Subscription</p>
          </div>
          <p className="text-gray-600 mb-4">
            Subscribe to access all features and submit your pull-up videos
          </p>
          <Button onClick={() => navigate('/subscription')}>
            Subscribe Now
          </Button>
        </>
      )}
    </div>
  );
};

export default SubscriptionStatus;