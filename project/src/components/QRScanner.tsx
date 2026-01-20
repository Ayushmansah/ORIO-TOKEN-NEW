import React, { useState } from 'react';
import { QrCode, Plus, Check } from 'lucide-react';

interface QRScannerProps {
  onTokensAdded: (tokens: number) => void;
}

export default function QRScanner({ onTokensAdded }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<number | null>(null);

  const handleQRScan = (tokens: number) => {
    setIsScanning(true);
    setTimeout(() => {
      onTokensAdded(tokens);
      setLastScanned(tokens);
      setIsScanning(false);
    }, 1500);
  };

  const qrOptions = [
    { pieces: 1, tokens: 1, color: 'bg-green-500' },
    { pieces: 2, tokens: 2, color: 'bg-blue-500' },
    { pieces: 3, tokens: 3, color: 'bg-purple-500' },
    { pieces: 4, tokens: 4, color: 'bg-orange-500' },
    { pieces: 5, tokens: 5, color: 'bg-red-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <QrCode className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">Scan QR Code for Tokens</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {qrOptions.map((option) => (
          <button
            key={option.pieces}
            onClick={() => handleQRScan(option.tokens)}
            disabled={isScanning}
            className={`${option.color} text-white rounded-lg p-4 hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mx-auto mb-2 w-fit">
                <QrCode className="w-6 h-6" />
              </div>
              <p className="font-bold text-lg">{option.pieces} PCS</p>
              <p className="text-sm opacity-90">{option.tokens} Token{option.tokens > 1 ? 's' : ''}</p>
            </div>
          </button>
        ))}
      </div>

      {isScanning && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Processing QR scan...</span>
          </div>
        </div>
      )}

      {lastScanned && !isScanning && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span>Added {lastScanned} token{lastScanned > 1 ? 's' : ''} to your balance!</span>
          </div>
        </div>
      )}
    </div>
  );
}