import React from 'react';
import { CreditCard, Package, Shield } from 'lucide-react';

const SubscriptionRewards: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* US Shipping Notice */}
      <div className="bg-[#9b9b6f]/10 border border-[#9b9b6f] rounded-lg p-4 text-center">
        <p className="text-[#9b9b6f] text-sm">
          US shipping only. International users are not eligible for the patch or physical rewards at this time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Subscription & Rewards */}
        <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <CreditCard size={48} className="text-[#9b9b6f]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Subscription</h3>
          <p className="text-gray-400 mb-4">Manage your monthly subscription</p>
          <a
            href="https://billing.stripe.com/p/login/dRmdR9dos2kmaQcdHGejK00"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-block"
          >
            Manage Subscription
          </a>
        </div>

        {/* Claim Patch */}
        <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <Package size={48} className="text-[#9b9b6f]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Claim Your Patch</h3>
          <p className="text-gray-400 mb-4">Get your earned patch delivered</p>
          <a
            href="https://shop.thebattlebunker.com/checkouts/cn/Z2NwLXVzLWNlbnRyYWwxOjAxSlhCMDJBTkVaOENFOFpTQlM2N1RTM0tR?auto_redirect=false&cart_link_id=MbgRQA7E&discount=PULLUPCLUB100&edge_redirect=true&locale=en-US&skip_shop_pay=true"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#9b9b6f] hover:bg-[#a5a575] text-black font-semibold py-2 px-4 rounded-lg transition-colors inline-block"
          >
            Claim Your Patch
          </a>
        </div>

        {/* Patch Progress */}
        <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <Shield size={48} className="text-[#9b9b6f]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Next Patch Progress</h3>
          <div className="mb-4">
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <div className="bg-[#9b9b6f] h-2 rounded-full" style={{ width: '14%' }} />
            </div>
            <p className="text-sm text-gray-400">14% Progress</p>
          </div>
          <p className="text-2xl font-bold text-white mb-1">77 days</p>
          <p className="text-gray-400">until next patch ships</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRewards; 