import React from 'react';
import { Coins } from 'lucide-react';

interface TokenBalanceProps {
  balance: number;
}

export default function TokenBalance({ balance }: TokenBalanceProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs md:text-sm uppercase tracking-wide">Your Token Balance</p>
          <p className="text-3xl md:text-4xl font-bold mt-2">{balance}</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full p-3 md:p-4">
          <Coins className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </div>
      
      {/* Digital Token Visual */}
      <div className="mt-3 md:mt-4 flex items-center space-x-2">
        <div className="bg-white bg-opacity-90 rounded-lg p-1 flex items-center">
          <img 
            src="/SW-1706.jpg" 
            alt="ORIO" 
            className="h-4 md:h-5 w-auto"
          />
        </div>
        <span className="text-blue-200 text-xs md:text-sm">Digital Reward Token</span>
      </div>
    </div>
  );
}