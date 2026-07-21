import React, { useState } from 'react';
import ProfileCompletion from './components/doctor/ProfileCompletion';
import DocumentUpload from './components/doctor/DocumentUpload';
import ScheduleConfiguration from './components/doctor/ScheduleConfiguration';
import NotFound from './pages/NotFound';

export default function App() {
  const [currentTab, setCurrentTab] = useState('profile');

  // Simple Router Simulation Engine mapping explicit client state conditions
  return (
    <div class="min-h-screen flex flex-col">
      {/* Top Application Header Space */}
      <header class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div class="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <span class="text-blue-600">🏥</span> Medical Appointment Platform
          </div>
          <nav class="flex gap-4 text-sm font-semibold text-slate-600">
            <button onClick={() => setCurrentTab('profile')} className={`pb-1 border-b-2 ${currentTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>Profile</button>
            <button onClick={() => setCurrentTab('documents')} className={`pb-1 border-b-2 ${currentTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>Documents</button>
            <button onClick={() => setCurrentTab('schedule')} className={`pb-1 border-b-2 ${currentTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>Schedule</button>
            <button onClick={() => setCurrentTab('404')} className={`pb-1 border-b-2 ${currentTab === '404' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>404 Test</button>
          </nav>
        </div>
      </header>

      {/* Primary Dynamic Main Body View */}
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'profile' && <ProfileCompletion />}
        {currentTab === 'documents' && <DocumentUpload />}
        {currentTab === 'schedule' && <ScheduleConfiguration />}
        {currentTab === '404' && <NotFound />}
      </main>
    </div>
  );
}