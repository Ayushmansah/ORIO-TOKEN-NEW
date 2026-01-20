import React, { useState } from 'react';
import { Gift, Check, AlertCircle } from 'lucide-react';
import PasskeyModal from './PasskeyModal';

interface Reward {
  id: string;
  name: string;
  tokens: number;
  icon: string;
  available: boolean;
}

interface RewardsCatalogProps {
  userTokens: number;
  onRedeem: (reward: Reward) => void;
}

export default function RewardsCatalog({ userTokens, onRedeem }: RewardsCatalogProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [passkeyModal, setPasskeyModal] = useState<{ isOpen: boolean; reward: Reward | null }>({
    isOpen: false,
    reward: null
  });

  const rewards: Reward[] = [
    { id: '1', name: 'Smart Watch', tokens: 5, icon: '⌚', available: userTokens >= 5 },
    { id: '2', name: 'Washing Machine', tokens: 10, icon: '🔄', available: userTokens >= 10 },
    { id: '3', name: '5G Smartphone', tokens: 15, icon: '📱', available: userTokens >= 15 },
    { id: '4', name: 'Single Door Fridge', tokens: 20, icon: '🧊', available: userTokens >= 20 },
    { id: '5', name: '40" LED TV', tokens: 25, icon: '📺', available: userTokens >= 25 },
    { id: '6', name: 'Double Door Fridge', tokens: 30, icon: '❄️', available: userTokens >= 30 }
  ];

  const handleRedeemClick = (reward: Reward) => {
    setPasskeyModal({ isOpen: true, reward });
  };

  const handlePasskeySuccess = async () => {
    if (!passkeyModal.reward) return;
    
    setPasskeyModal({ isOpen: false, reward: null });
    setRedeeming(passkeyModal.reward.id);
    
    setTimeout(() => {
      onRedeem(passkeyModal.reward!);
      setRedeeming(null);
    }, 1500);
  };

  const handlePasskeyClose = () => {
    setPasskeyModal({ isOpen: false, reward: null });
  };

  const handleRedeem = async (reward: Reward) => {
    setRedeeming(reward.id);
    setTimeout(() => {
      onRedeem(reward);
      setRedeeming(null);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Gift className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Rewards Catalog</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`border rounded-lg p-4 transition-all ${
              reward.available 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl mb-3">{reward.icon}</div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">{reward.name}</h4>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs md:text-sm font-medium">
                  {reward.tokens} Tokens
                </span>
              </div>

              {reward.available ? (
                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={redeeming === reward.id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  {redeeming === reward.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Redeeming...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Redeem</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs md:text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Need {reward.tokens - userTokens} more tokens</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <PasskeyModal
        isOpen={passkeyModal.isOpen}
        onClose={handlePasskeyClose}
        onSuccess={handlePasskeySuccess}
        rewardName={passkeyModal.reward?.name || ''}
      />
    </div>
  );
}