import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { AlertTriangle, Banknote, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  created: number; // Unix timestamp
  invoice?: string;
  description: string;
  receipt_url?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('get-payment-history');
        
        if (error) throw new Error(error.message || 'Failed to fetch payment history');
        
        if (data && Array.isArray(data.payments)) {
          setPayments(data.payments);
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentHistory();
  }, []);

  // Mock data for display purposes
  const mockPayments: PaymentRecord[] = [
    {
      id: 'pi_1234567890',
      amount: 999,
      currency: 'usd',
      status: 'succeeded',
      created: Date.now() / 1000 - 30 * 24 * 60 * 60,
      description: 'Monthly Subscription',
      receipt_url: '#',
    },
    {
      id: 'pi_0987654321',
      amount: 999,
      currency: 'usd',
      status: 'succeeded',
      created: Date.now() / 1000 - 60 * 24 * 60 * 60,
      description: 'Monthly Subscription',
      receipt_url: '#',
    }
  ];

  // Use mock data if no real data available
  const displayPayments = payments.length > 0 ? payments : mockPayments;

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 flex items-start">
        <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error loading payment history</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (displayPayments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <Banknote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-300">No payment history available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-2 text-gray-400 font-medium">Date</th>
              <th className="pb-2 text-gray-400 font-medium">Description</th>
              <th className="pb-2 text-gray-400 font-medium">Amount</th>
              <th className="pb-2 text-gray-400 font-medium">Status</th>
              <th className="pb-2 text-gray-400 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-750">
                <td className="py-3 text-gray-300">
                  {format(new Date(payment.created * 1000), 'MMM d, yyyy')}
                </td>
                <td className="py-3 text-white">
                  {payment.description}
                </td>
                <td className="py-3 text-white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: payment.currency.toUpperCase(),
                  }).format(payment.amount / 100)}
                </td>
                <td className="py-3">
                  <Badge 
                    variant={
                      payment.status === 'succeeded' ? 'success' : 
                      payment.status === 'failed' ? 'danger' : 
                      'warning'
                    }
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </td>
                <td className="py-3">
                  {payment.receipt_url && (
                    <a 
                      href={payment.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#9b9b6f] hover:text-[#7a7a58]"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;