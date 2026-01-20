import React, { useState } from 'react';
import { Mail, ArrowRight, Shield, Users, QrCode } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
}

export default function AuthPage({ onSignIn, onSignUp, loading }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowEmailConfirmation(false);
    try {
      if (isSignUp) {
        await onSignUp(email, password, name);
        setShowEmailConfirmation(true);
      } else {
        await onSignIn(email, password);
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('For security purposes')) {
          errorMessage = error.message;
        } else if (error.message.includes('over_email_send_rate_limit')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      console.error('Auth error:', error);
    }
  };

  // Clear error when user modifies inputs or switches modes
  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setShowEmailConfirmation(false);
    setter(e.target.value);
  };

  const handleModeSwitch = () => {
    setError('');
    setShowEmailConfirmation(false);
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pb-safe">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center space-x-4">
            <img
              src="/SW-1706.jpg"
              alt="ORIO Bath Fitting & Accessories"
              className="h-10 md:h-14 w-auto bg-white rounded-lg p-1 md:p-2"
            />
            <div>
              <div className="text-white font-bold text-base md:text-xl">RAJ SANITATION</div>
              <div className="text-blue-200 text-xs md:text-sm">Digital Token Rewards</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Information */}
          <div className="text-white space-y-6 md:space-y-8 order-2 lg:order-1">
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Welcome to ORIO Token Rewards
              </h1>
              <p className="text-base md:text-xl text-blue-100 leading-relaxed">
                Earn digital tokens for every 4-Way Concealed Divertor purchase and redeem them for amazing rewards!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-3 bg-white bg-opacity-10 rounded-lg p-4 md:p-6 text-center">
                <div className="mb-4">
                  <img 
                    src="/Screenshot 2025-09-14 113101 copy.png" 
                    alt="ORIO Concealed Divertor" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
                <h3 className="font-semibold mb-2 text-base md:text-lg text-white">ORIO Concealed Divertor</h3>
                <p className="text-sm md:text-base text-blue-100">
                  Purchase ORIO 4-Way Concealed Divertor and earn digital tokens for amazing rewards!
                </p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Rewards Available:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Smart Watch</span>
                  <span className="font-semibold">5 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Washing Machine</span>
                  <span className="font-semibold">10 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>5G Smartphone</span>
                  <span className="font-semibold">15 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Single Door Fridge</span>
                  <span className="font-semibold">20 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>40" LED TV</span>
                  <span className="font-semibold">25 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Double Door Fridge</span>
                  <span className="font-semibold">30 Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 order-1 lg:order-2">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                {isSignUp ? 'Join the ORIO rewards program' : 'Sign in to access your tokens'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleInputChange(setName)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {showEmailConfirmation && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mx-1">
                  <p className="text-sm font-medium mb-1">Check your email!</p>
                  <p className="text-sm">We've sent you a confirmation link. Please check your email (including spam folder) and click the link to verify your account before signing in.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-1">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base"
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 md:mt-6 text-center">
              <button
                onClick={handleModeSwitch}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}