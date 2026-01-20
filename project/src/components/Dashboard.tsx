import React, { useState, useEffect } from 'react';
import { Coins, Gift, History, User, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TokenBalance from './TokenBalance';
import RewardsCatalog from './RewardsCatalog';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [plumber, setPlumber] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlumberData();
  }, [user]);

  const fetchPlumberData = async () => {
    try {
      setLoading(true);

      const { data: plumberData, error: plumberError } = await supabase
        .from('plumbers')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (plumberError && plumberError.code !== 'PGRST116') {
        throw plumberError;
      }

      if (!plumberData) {
        setLoading(false);
        return;
      }

      setPlumber(plumberData);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('plumber_id', plumberData.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('redemptions')
        .select('*')
        .eq('plumber_id', plumberData.id)
        .order('created_at', { ascending: false });

      if (redemptionsError) throw redemptionsError;

      setTransactions(transactionsData || []);
      setRedemptions(redemptionsData || []);

    } catch (error) {
      console.error('Error fetching plumber data:', error);
      alert('Error loading dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async (reward: any) => {
    if (!plumber || plumber.tokens < reward.tokens) {
      alert('Insufficient tokens for this reward');
      return;
    }

    try {
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          plumber_id: plumber.id,
          reward_name: reward.name,
          tokens_used: reward.tokens,
          status: 'pending'
        });

      if (redemptionError) throw redemptionError;

      const { error: updateError } = await supabase
        .from('plumbers')
        .update({
          tokens: plumber.tokens - reward.tokens,
          total_redeemed: plumber.total_redeemed + reward.tokens
        })
        .eq('id', plumber.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          plumber_id: plumber.id,
          type: 'redeemed',
          tokens: reward.tokens,
          description: `Redeemed ${reward.name}`
        });

      if (transactionError) throw transactionError;

      alert(`Successfully redeemed ${reward.name}! Your request is being processed.`);
      await fetchPlumberData();

    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Error processing redemption. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!plumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Coins className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Setting Up Your Profile</h2>
            <p className="text-gray-600 mb-4">
              Your plumber profile is being created. Please refresh the page in a moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <TokenBalance balance={plumber.tokens} />

        {/* Plumber Profile Info */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Welcome back,</p>
                <h2 className="text-2xl font-bold">{plumber.name}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/20 rounded-lg px-4 py-3">
              <CreditCard className="w-6 h-6" />
              <div>
                <p className="text-blue-100 text-xs">Your PID</p>
                <p className="text-xl font-bold tracking-wider">{plumber.pid}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-xl font-bold text-gray-800">{plumber.total_earned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Gift className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Redeemed</p>
                <p className="text-xl font-bold text-gray-800">{plumber.total_redeemed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-bold text-gray-800">{transactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        <RewardsCatalog userTokens={plumber.tokens} onRedeem={handleRedemption} />

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <History className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.tokens}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start earning tokens by purchasing ORIO products!</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Gift className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Redemption History</h3>
          </div>

          {redemptions.length > 0 ? (
            <div className="space-y-3">
              {redemptions.map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{redemption.reward_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(redemption.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-{redemption.tokens_used}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      redemption.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : redemption.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {redemption.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No redemptions yet</p>
              <p className="text-sm text-gray-400 mt-1">Redeem your tokens for amazing rewards!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
