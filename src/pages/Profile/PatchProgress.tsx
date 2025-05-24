import React from 'react';
import { Shield } from 'lucide-react';

const PatchProgress: React.FC = () => {
  // Calculate days until next patch
  const today = new Date();
  const nextPatchDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  const daysLeft = Math.ceil((nextPatchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const totalDays = 90; // 3 months
  const daysPassed = totalDays - daysLeft;
  const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  return (
    <div className="bg-gray-950 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <Shield className="w-6 h-6 text-[#9b9b6f] mr-2" />
        <h3 className="text-lg font-medium text-white">Next Patch Progress</h3>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-[#9b9b6f] h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-white mb-1">{daysLeft} days</p>
        <p className="text-gray-400 text-sm">until your next patch ships</p>
      </div>
      
      <div className="mt-4 bg-gray-900 rounded p-4">
        <h4 className="text-white font-medium mb-2">Patch Collection Status</h4>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Patches Earned:</span>
          <span className="text-white">1</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Next Patch:</span>
          <span className="text-[#9b9b6f]">{nextPatchDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

export default PatchProgress;