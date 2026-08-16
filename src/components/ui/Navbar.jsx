// src/components/ui/Navbar.jsx

import React from 'react';
import { LogOut } from './Icons';

export default function Navbar({ currentTab, setCurrentTab }) {
  const handleLogout = () => {
    // Delete authentication cookies across subdomains and current domain
    document.cookie = "auth_token=; path=/; domain=.docapp.co.in; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    localStorage.removeItem('auth_token');
    
    // Redirect to authentication gateway
    window.location.href = 'https://auth.docapp.co.in';
  };

  const navItems = [
    { id: 'appointments', label: 'Appointments' },
    { id: 'hospitals', label: 'Search Hospitals' },
    { id: 'profile', label: 'My Profile' },
    { id: 'documents', label: 'Verification Documents' },
    { id: 'KYC Details', label: 'KYC Details' },
    { id: 'schedule', label: 'Schedule Config' },
  ];

  return (
    <header className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand Header */}
        <div 
          className="flex items-center gap-2 font-bold text-slate-800 text-base cursor-pointer" 
          onClick={() => setCurrentTab('appointments')}
        >
          <span>DocApp</span> 
          <span className="text-xs font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">
            Doctor Portal
          </span>
        </div>
        
        {/* Nav Links */}
        <nav className="hidden md:flex gap-6 text-xs font-bold text-slate-500">
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'appointments' && currentTab.startsWith('appointment'));
            return (
              <button 
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)} 
                className={`pb-1 transition-all ${
                  isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Right: Replaced Profile Icon with Logout Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm"
            title="Sign out of Doctor Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}