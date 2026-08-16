// src/App.jsx

import React, { useState } from 'react';
import Navbar from './components/ui/Navbar';
import ProfileCompletion from './components/doctor/ProfileCompletion';
import DocumentUpload from './components/doctor/DocumentUpload';
import ScheduleConfiguration from './components/doctor/ScheduleConfiguration';
import AppointmentList from './components/doctor/AppointmentList';
import AppointmentDetails from './components/doctor/AppointmentDetails';
import HospitalSearch from './components/doctor/HospitalSearch';
import HospitalDetailPage from './components/doctor/HospitalDetailPage';
import DoctorKycSection from './components/doctor/DoctorKycSection';
import NotFound from './pages/NotFound';

export default function App() {
  const [currentTab, setCurrentTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const handleTransitionToAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setCurrentTab('appointment-detail');
  };

  const handleTransitionToHospitalDetails = (hospital) => {
    setSelectedHospital(hospital);
    setCurrentTab('hospital-detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0">
        {currentTab === 'appointments' && (
          <AppointmentList 
            onViewDetails={handleTransitionToAppointmentDetails} 
          />
        )}
        {currentTab === 'appointment-detail' && selectedAppointment && (
          <AppointmentDetails 
            appointment={selectedAppointment} 
            onBack={() => setCurrentTab('appointments')} 
          />
        )}
        {currentTab === 'hospitals' && (
          <HospitalSearch 
            onViewHospital={handleTransitionToHospitalDetails} 
          />
        )}
        {currentTab === 'hospital-detail' && selectedHospital && (
          <HospitalDetailPage 
            hospital={selectedHospital} 
            onBack={() => setCurrentTab('hospitals')} 
          />
        )}
        {currentTab === 'profile' && <ProfileCompletion />}
        {currentTab === 'documents' && <DocumentUpload />}
        {currentTab === 'schedule' && <ScheduleConfiguration />}
        {currentTab === 'KYC Details' && <DoctorKycSection />}
        {currentTab === '404' && <NotFound />}
      </main>

      <footer className="bg-white border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 font-semibold print:hidden">
        © 2026 MedPlatform Health Systems. HIPAA Compliant Interface Base Integration Layer.
      </footer>
    </div>
  );
}