// import React, { useState } from 'react';
// import ProfileCompletion from './components/doctor/ProfileCompletion';
// import DocumentUpload from './components/doctor/DocumentUpload';
// import ScheduleConfiguration from './components/doctor/ScheduleConfiguration';
// import AppointmentList from './components/doctor/AppointmentList';
// import AppointmentDetails from './components/doctor/AppointmentDetails';
// import PrescriptionWorkspace from './components/doctor/PrescriptionWorkspace';
// import NotFound from './pages/NotFound';

// export default function App() {
//   const [currentTab, setCurrentTab] = useState('appointments');
//   const [selectedAppointment, setSelectedAppointment] = useState(null);

//   // Custom view switching coordinator
//   const handleTransitionToDetails = (appointment) => {
//     setSelectedAppointment(appointment);
//     setCurrentTab('appointment-detail');
//   };

//   const handleTransitionToPrescription = (appointment) => {
//     setSelectedAppointment(appointment);
//     setCurrentTab('prescription-workspace');
//   };

//   return (
//     <div class="min-h-screen flex flex-col bg-slate-50 print:bg-white">
//       {/* Dynamic Main App Navigation Bar */}
//       <header class="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50 print:hidden">
//         <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
//           <div class="flex items-center gap-2 font-bold text-slate-800 text-base cursor-pointer" onClick={() => setCurrentTab('appointments')}>
//             <span class="text-blue-600 text-xl">🧬</span> DOCAPP <span class="text-xs font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">Doctor</span>
//           </div>
//           <nav class="flex gap-6 text-xs font-bold text-slate-500">
//             <button 
//               onClick={() => setCurrentTab('appointments')} 
//               className={`pb-1 transition-all ${currentTab.startsWith('appointment') || currentTab === 'prescription-workspace' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
//             >
//               Appointments
//             </button>
//             <button 
//               onClick={() => setCurrentTab('profile')} 
//               className={`pb-1 transition-all ${currentTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
//             >
//               My Profile
//             </button>
//             <button 
//               onClick={() => setCurrentTab('documents')} 
//               className={`pb-1 transition-all ${currentTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
//             >
//               Verification Documents
//             </button>
//             <button 
//               onClick={() => setCurrentTab('schedule')} 
//               className={`pb-1 transition-all ${currentTab === 'schedule' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
//             >
//               Schedule Config
//             </button>
//           </nav>
//           <div class="flex items-center gap-3">
//             <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-inner">👨‍⚕️</div>
//           </div>
//         </div>
//       </header>

//       {/* Main Dynamic Frame Entry Window */}
//       <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0">
//         {currentTab === 'appointments' && (
//           <AppointmentList 
//             onViewDetails={handleTransitionToDetails} 
//             onViewPrescription={handleTransitionToPrescription} 
//           />
//         )}
//         {currentTab === 'appointment-detail' && selectedAppointment && (
//           <AppointmentDetails 
//             appointment={selectedAppointment} 
//             onBack={() => setCurrentTab('appointments')} 
//             onNavigatePrescription={handleTransitionToPrescription}
//           />
//         )}
//         {currentTab === 'prescription-workspace' && selectedAppointment && (
//           <PrescriptionWorkspace 
//             appointment={selectedAppointment} 
//             onBack={() => setCurrentTab('appointments')} 
//           />
//         )}
//         {currentTab === 'profile' && <ProfileCompletion />}
//         {currentTab === 'documents' && <DocumentUpload />}
//         {currentTab === 'schedule' && <ScheduleConfiguration />}
//         {currentTab === '404' && <NotFound />}
//       </main>

//       <footer class="bg-white border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 font-semibold print:hidden">
//         © 2026 MedPlatform Health Systems. HIPAA Compliant Interface Base Integration Layer.
//       </footer>
//     </div>
//   );
// }


import React, { useState } from 'react';
import ProfileCompletion from './components/doctor/ProfileCompletion';
import DocumentUpload from './components/doctor/DocumentUpload';
import ScheduleConfiguration from './components/doctor/ScheduleConfiguration';
import AppointmentList from './components/doctor/AppointmentList';
import AppointmentDetails from './components/doctor/AppointmentDetails';
import PrescriptionWorkspace from './components/doctor/PrescriptionWorkspace';
import HospitalSearch from './components/doctor/HospitalSearch';
import NotFound from './pages/NotFound';

export default function App() {
  const [currentTab, setCurrentTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleTransitionToDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setCurrentTab('appointment-detail');
  };

  const handleTransitionToPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setCurrentTab('prescription-workspace');
  };

  return (
    <div class="min-h-screen flex flex-col bg-slate-50 print:bg-white">
      {/* Dynamic Main App Navigation Bar */}
      <header class="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50 print:hidden">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div class="flex items-center gap-2 font-bold text-slate-800 text-base cursor-pointer" onClick={() => setCurrentTab('appointments')}>
            <span class="text-blue-600 text-xl">🧬</span> MedPortal <span class="text-xs font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">Doctor</span>
          </div>
          
          <nav class="flex gap-6 text-xs font-bold text-slate-500">
            <button 
              onClick={() => setCurrentTab('appointments')} 
              className={`pb-1 transition-all ${currentTab.startsWith('appointment') || currentTab === 'prescription-workspace' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
            >
              Appointments
            </button>
            <button 
              onClick={() => setCurrentTab('hospitals')} 
              className={`pb-1 transition-all ${currentTab === 'hospitals' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
            >
              Search Hospitals
            </button>
            <button 
              onClick={() => setCurrentTab('profile')} 
              className={`pb-1 transition-all ${currentTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
            >
              My Profile
            </button>
            <button 
              onClick={() => setCurrentTab('documents')} 
              className={`pb-1 transition-all ${currentTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
            >
              Verification Documents
            </button>
            <button 
              onClick={() => setCurrentTab('schedule')} 
              className={`pb-1 transition-all ${currentTab === 'schedule' ? 'border-b-2 border-blue-600 text-blue-600' : 'hover:text-slate-800'}`}
            >
              Schedule Config
            </button>
          </nav>

          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-inner">👨‍⚕️</div>
          </div>
        </div>
      </header>

      {/* Main Dynamic Frame Entry Window */}
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0">
        {currentTab === 'appointments' && (
          <AppointmentList 
            onViewDetails={handleTransitionToDetails} 
            onViewPrescription={handleTransitionToPrescription} 
          />
        )}
        {currentTab === 'appointment-detail' && selectedAppointment && (
          <AppointmentDetails 
            appointment={selectedAppointment} 
            onBack={() => setCurrentTab('appointments')} 
            onNavigatePrescription={handleTransitionToPrescription}
          />
        )}
        {currentTab === 'prescription-workspace' && selectedAppointment && (
          <PrescriptionWorkspace 
            appointment={selectedAppointment} 
            onBack={() => setCurrentTab('appointments')} 
          />
        )}
        {currentTab === 'hospitals' && <HospitalSearch />}
        {currentTab === 'profile' && <ProfileCompletion />}
        {currentTab === 'documents' && <DocumentUpload />}
        {currentTab === 'schedule' && <ScheduleConfiguration />}
        {currentTab === '404' && <NotFound />}
      </main>

      <footer class="bg-white border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 font-semibold print:hidden">
        © 2026 MedPlatform Health Systems. HIPAA Compliant Interface Base Integration Layer.
      </footer>
    </div>
  );
}