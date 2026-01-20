import React from 'react';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

export default function Header({ user, onSignOut }: HeaderProps) {
  return (
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
              <div className="text-white font-bold text-lg">RAJ SANITATION</div>
              <div className="text-blue-200 text-sm">Digital Token Rewards</div>
            </div>
          </div>
          
          {user && (
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
          )}
        </div>
      </div>
    </header>
  );
}