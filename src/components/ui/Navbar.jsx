// src/components/ui/Navbar.jsx

import React, { useState } from 'react';
import { LogOut, Menu, X } from './Icons'; // Ensure Menu and X (or Lucide icons) are available

export default function Navbar({ currentTab, setCurrentTab }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleTabClick = (id) => {
    setCurrentTab(id);
    setIsMobileMenuOpen(false); // Close menu on tab select
  };

  return (
    <header className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand Header */}
        <div 
          className="flex items-center gap-2 font-bold text-slate-800 text-base cursor-pointer" 
          onClick={() => handleTabClick('appointments')}
        >
          <span>DocApp</span> 
          <span className="text-xs font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">
            Doctor Portal
          </span>
        </div>
        
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex gap-6 text-xs font-bold text-slate-500">
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'appointments' && currentTab.startsWith('appointment'));
            return (
              <button 
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)} 
                className={`pb-1 transition-all ${
                  isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Right (Desktop Logout + Mobile Toggle) */}
        <div className="flex items-center gap-3">
          {/* Desktop Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm"
            title="Sign out of Doctor Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          {/* Mobile Hamburger Toggle (3 lines / X) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 shadow-lg space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'appointments' && currentTab.startsWith('appointment'));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}