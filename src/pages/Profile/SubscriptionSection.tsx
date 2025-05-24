import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import SubscriptionManager from "../Subscription/SubscriptionManager";

interface SubscriptionSectionProps {
  className?: string;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  className = "",
}) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Subscription</h2>
        <a
          href="/subscription"
          className="text-sm text-[#9b9b6f] hover:text-[#7a7a58] transition-colors"
        >
          View all plans
        </a>
      </div>

      <SubscriptionManager onError={(errorMessage) => setError(errorMessage)} />

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;
