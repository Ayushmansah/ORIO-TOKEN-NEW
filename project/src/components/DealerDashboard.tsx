import React, { useState, useEffect } from 'react';
import { Gift, History, LogOut, User } from 'lucide-react';
import TokenTransfer from './TokenTransfer';
import { supabase } from '../lib/supabase';

interface DealerDashboardProps {
  user: any;
  onSignOut: () => void;
}

export default function DealerDashboard({ user, onSignOut }: DealerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [plumbers, setPlumbers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlumbers: 0,
    totalTokensIssued: 0,
    totalRedemptions: 0,
    pendingRedemptions: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch plumbers
      const { data: plumbersData, error: plumbersError } = await supabase
        .from('plumbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (plumbersError) throw plumbersError;

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select(`
          *,
          plumbers (name, pid)
        `)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch redemptions
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('redemptions')
        .select(`
          *,
          plumbers (name, pid)
        `)
        .order('created_at', { ascending: false });

      if (redemptionsError) throw redemptionsError;

      setPlumbers(plumbersData || []);
      setTransactions(transactionsData || []);
      setRedemptions(redemptionsData || []);

      // Calculate stats
      const totalTokensIssued = plumbersData?.reduce((sum, plumber) => sum + (plumber.total_earned || 0), 0) || 0;
      const totalRedemptions = redemptionsData?.filter(r => r.status === 'delivered').length || 0;
      const pendingRedemptions = redemptionsData?.filter(r => r.status === 'pending').length || 0;

      setStats({
        totalPlumbers: plumbersData?.length || 0,
        totalTokensIssued,
        totalRedemptions,
        pendingRedemptions
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenTransfer = async (plumberId: string, tokens: number, description: string) => {
    try {
      // Get current plumber data
      const { data: plumberData, error: fetchError } = await supabase
        .from('plumbers')
        .select('tokens, total_earned')
        .eq('id', plumberId)
        .single();

      if (fetchError) throw fetchError;

      // Add tokens to plumber
      const { error: updateError } = await supabase
        .from('plumbers')
        .update({
          tokens: (plumberData.tokens || 0) + tokens,
          total_earned: (plumberData.total_earned || 0) + tokens
        })
        .eq('id', plumberId);

      if (updateError) throw updateError;

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          plumber_id: plumberId,
          type: 'earned',
          tokens: tokens,
          description: description
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchDashboardData();
      alert(`Successfully sent ${tokens} token${tokens > 1 ? 's' : ''} to plumber!`);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      alert('Error transferring tokens. Please try again.');
    }
  };

  const handleRedemptionStatusUpdate = async (redemptionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('redemptions')
        .update({ status: newStatus })
        .eq('id', redemptionId);

      if (error) throw error;

      await fetchDashboardData();
      alert(`Redemption status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating redemption status:', error);
      alert('Error updating redemption status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dealer dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'transfer', name: 'Send Tokens', icon: Gift },
    { id: 'transactions', name: 'Transactions', icon: History },
    { id: 'redemptions', name: 'Redemptions', icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/SW-1706.jpg"
                alt="ORIO Bath Fitting & Accessories"
                className="h-12 md:h-16 w-auto bg-white rounded-lg p-2"
              />
              <div className="hidden md:block">
                <div className="text-white font-bold text-lg">RAJ SANITATION - DEALER</div>
                <div className="text-blue-200 text-sm">Token Management Dashboard</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="hidden md:inline">{user.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto space-x-4 md:space-x-8 px-4 md:px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'transfer' && (
              <TokenTransfer plumbers={plumbers} onTokenTransfer={handleTokenTransfer} />
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">All Transactions</h3>
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plumber
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.plumbers?.name}</div>
                              <div className="text-sm text-gray-500">PID: {transaction.plumbers?.pid}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'earned' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.tokens}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'redemptions' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Redemption Requests</h3>
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plumber
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reward
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tokens Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {redemptions.map((redemption) => (
                        <tr key={redemption.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{redemption.plumbers?.name}</div>
                              <div className="text-sm text-gray-500">PID: {redemption.plumbers?.pid}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {redemption.reward_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {redemption.tokens_used}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              redemption.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : redemption.status === 'approved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {redemption.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(redemption.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {redemption.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleRedemptionStatusUpdate(redemption.id, 'approved')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRedemptionStatusUpdate(redemption.id, 'delivered')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Mark Delivered
                                </button>
                              </div>
                            )}
                            {redemption.status === 'approved' && (
                              <button
                                onClick={() => handleRedemptionStatusUpdate(redemption.id, 'delivered')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}