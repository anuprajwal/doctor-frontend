import React from 'react';

export default function NotFound() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div class="max-w-md w-full text-center space-y-6">
        <div class="relative flex justify-center">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl shadow-inner font-bold">
            💙
          </div>
          <h1 class="absolute top-10 text-9xl font-black text-slate-200/60 select-none z-0">404</h1>
        </div>
        
        <div class="relative z-10 pt-6">
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Page Not Found</h2>
          <p class="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            The page you're trying to access does not exist or has been removed. Please return to the dashboard to continue managing patient records safely.
          </p>
        </div>

        <div>
          <button 
            onClick={() => window.location.href = '/'} 
            class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition transform active:scale-95"
          >
            <span>🏠</span> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}