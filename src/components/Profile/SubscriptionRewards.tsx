import React from 'react';
import { CreditCard, Package, Shield } from 'lucide-react';

const PATCH_SHOPIFY_LINK = "https://shop.thebattlebunker.com/checkouts/..."; // TODO: Replace with actual link if needed
const STRIPE_MANAGE_LINK = "https://billing.stripe.com/p/login/test_dRmdR9dos2kmaQcdHGejK00";

const SubscriptionRewards: React.FC = () => {
  // Patch progress logic (copied from PatchProgress, but with live countdown)
  const today = new Date();
  const nextPatchDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  const daysLeft = Math.ceil((nextPatchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 90; // 3 months
  const daysPassed = totalDays - daysLeft;
  const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  return (
    <div className="space-y-6">
      {/* US Shipping Notice - Brand colors only */}
      <div className="bg-[#918f6f]/10 border border-[#918f6f] rounded-lg p-4">
        <p className="text-[#918f6f] text-sm">
          US shipping only. International users are not eligible for the patch or physical rewards at this time.
        </p>
      </div>

      {/* Subscription & Rewards */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="w-5 h-5 text-[#918f6f] mr-2" />
          <h3 className="text-lg font-medium text-white">Subscription & Rewards</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={PATCH_SHOPIFY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#918f6f] hover:bg-[#a19f7f] text-black font-semibold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Claim Your Patch
          </a>
          <a
            href={STRIPE_MANAGE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg text-center border border-gray-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </a>
        </div>
      </div>

      {/* Patch Progress */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-[#918f6f] mr-2" />
          <h3 className="text-lg font-medium text-white">Next Patch Progress</h3>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-[#918f6f] h-2 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-1">{daysLeft} days</p>
          <p className="text-gray-400 text-sm">until your next patch ships</p>
        </div>
        <div className="mt-4 bg-gray-950 rounded p-4">
          <h4 className="text-white font-medium mb-2">Patch Collection Status</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Patches Earned:</span>
            <span className="text-white">1</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Next Patch:</span>
            <span className="text-[#918f6f]">{nextPatchDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRewards; 