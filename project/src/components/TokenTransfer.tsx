import React, { useState } from 'react';
import { Send, User, Plus, Search } from 'lucide-react';
import Fuse from 'fuse.js';

interface TokenTransferProps {
  plumbers: any[];
  onTokenTransfer: (plumberId: string, tokens: number, description: string) => void;
}

export default function TokenTransfer({ plumbers, onTokenTransfer }: TokenTransferProps) {
  const [selectedPlumber, setSelectedPlumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokens, setTokens] = useState('');
  const [description, setDescription] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(plumbers, {
    keys: ['name', 'pid', 'email'],
    threshold: 0.3,
    includeScore: true
  });

  // Filter plumbers based on search term
  const filteredPlumbers = searchTerm.trim() 
    ? fuse.search(searchTerm).map(result => result.item)
    : plumbers;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenAmount = parseInt(tokens);
    if (!selectedPlumber || !tokens || tokenAmount <= 0) return;

    setTransferring(true);
    try {
      onTokenTransfer(selectedPlumber, tokenAmount, description || `${tokenAmount} PCS 4-Way Concealed Divertor`);

      // Reset form
      setSelectedPlumber('');
      setSearchTerm('');
      setTokens('');
      setDescription('');
    } finally {
      setTransferring(false);
    }
  };

  const handlePlumberSelect = (plumber: any) => {
    setSelectedPlumber(plumber.id);
    setSearchTerm(`${plumber.name} (PID: ${plumber.pid})`);
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value.trim()) {
      setSelectedPlumber('');
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Send className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">Send Tokens to Plumber</h3>
      </div>

      <form onSubmit={handleTransfer} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
            Search Plumber (by Name, PID, or Email)
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={(e) => {
                  e.stopPropagation();
                  setShowDropdown(true);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Type name, PID (e.g., 1001), or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                required
              />
            </div>
            
            {showDropdown && searchTerm && filteredPlumbers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPlumbers.map((plumber) => (
                    <button
                      key={plumber.id}
                      type="button"
                      onClick={() => handlePlumberSelect(plumber)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{plumber.name}</div>
                          <div className="text-sm text-gray-600">PID: {plumber.pid} • {plumber.email}</div>
                        </div>
                        <div className="text-sm text-blue-600 mt-1 sm:mt-0">
                          {plumber.tokens} tokens
                        </div>
                      </div>
                    </button>
                ))}
              </div>
            )}
            
            {showDropdown && searchTerm && filteredPlumbers.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-gray-500 text-center">
                  No plumbers found matching "{searchTerm}"
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
            Number of Tokens
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            placeholder="Enter number of tokens"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 3 PCS 4-Way Concealed Divertor purchase"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>

        <button
          type="submit"
          disabled={transferring || !selectedPlumber || !tokens || parseInt(tokens) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base"
        >
          {transferring ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Sending Tokens...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Send {tokens || '0'} Token{parseInt(tokens) > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      </form>
      
      {plumbers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No plumbers registered yet</p>
        </div>
      )}
    </div>
  );
}