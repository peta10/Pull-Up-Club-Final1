import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getPaymentHistory } from '../../lib/stripe';

interface Payment {
  id: string;
  amount: number;
  created: number;
  status: string;
  receipt_url?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const data = await getPaymentHistory();
        setPayments(data || []);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
        setError('Could not load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/5 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-[#9b9b6f] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Payment History</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white/5 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Payment History</h3>
        <p className="text-gray-400">No payment records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-6 rounded-xl text-white">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div 
            key={payment.id} 
            className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <div>
              <p className="font-medium">
                ${(payment.amount / 100).toFixed(2)} - {payment.status}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(payment.created * 1000).toLocaleDateString()}
              </p>
            </div>
            {payment.receipt_url && (
              <a 
                href={payment.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-[#9b9b6f] hover:underline"
              >
                Receipt
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory; 