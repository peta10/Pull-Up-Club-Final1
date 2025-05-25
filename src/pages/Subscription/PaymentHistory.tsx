import React, { useState, useEffect } from "react";
import { getPaymentHistory } from "../../lib/stripe";
import { CalendarIcon } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  date: string;
  receipt?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPaymentHistory();
        setPayments(data);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError("Could not load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl text-white">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9b9b6f]"></div>
        </div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : payments.length === 0 ? (
        <div className="text-gray-400 py-4">No payment history available yet.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <CalendarIcon size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-300">{formatDate(payment.date)}</span>
                </div>
                <div className="font-semibold mt-1">{formatCurrency(payment.amount)}</div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded-full ${
                    payment.status === 'succeeded' ? 'bg-green-900/30 text-green-400' : 
                    payment.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {payment.receipt && (
                <a 
                  href={payment.receipt} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#9b9b6f] text-sm hover:underline"
                >
                  View Receipt
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 