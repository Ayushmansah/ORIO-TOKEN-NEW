import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rewardName: string;
}

export default function PasskeyModal({ isOpen, onClose, onSuccess, rewardName }: PasskeyModalProps) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    setTimeout(() => {
      if (passkey === '453667') {
        onSuccess();
        setPasskey('');
        setError('');
      } else {
        setError('Invalid passkey. Please contact your dealer for the correct passkey.');
      }
      setVerifying(false);
    }, 1000);
  };

  const handleClose = () => {
    setPasskey('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-safe">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Enter Passkey</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-2 text-sm md:text-base">
              To redeem <strong>{rewardName}</strong>, please enter the passkey provided by your dealer.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Contact Raj Sanitation for the passkey if you don't have it.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                Passkey
              </label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError('');
                }}
                placeholder="Enter 6-digit passkey"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg md:text-xl tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifying || passkey.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                {verifying ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Redeem</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}