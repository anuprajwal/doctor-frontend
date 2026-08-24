// src/App.jsx

import React, { useState, useEffect } from 'react';
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

import { CallProvider } from './context/CallContext';
import IncomingCallModal from './components/calling/IncomingCallModal';
import VideoCallModal from './components/calling/VideoCallModal';
import { useNotificationPermission } from './services/useNotificationPermission';

export default function App() {
  useNotificationPermission();

  // 1. Read initial view and selection parameters from the URL
  const getUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      currentTab: params.get('tab') || 'appointments',
      selectedAppointment: params.get('appointmentId') ? { id: params.get('appointmentId') } : null,
      selectedHospital: params.get('hospitalId') ? { id: params.get('hospitalId') } : null,
    };
  };

  const initialUrlState = getUrlState();
  const [currentTab, setCurrentTab] = useState(initialUrlState.currentTab);
  const [selectedAppointment, setSelectedAppointment] = useState(initialUrlState.selectedAppointment);
  const [selectedHospital, setSelectedHospital] = useState(initialUrlState.selectedHospital);

  // 2. Helper to synchronize state changes directly with URL query parameters
  const navigateTo = (newTab, data = {}) => {
    const params = new URLSearchParams();
    params.set('tab', newTab);

    if (data.appointment) {
      params.set('appointmentId', data.appointment.id || data.appointment);
      setSelectedAppointment(data.appointment);
    } else if (newTab === 'appointments') {
      setSelectedAppointment(null);
    }

    if (data.hospital) {
      params.set('hospitalId', data.hospital.id || data.hospital);
      setSelectedHospital(data.hospital);
    } else if (newTab === 'hospitals') {
      setSelectedHospital(null);
    }

    setCurrentTab(newTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // 3. Listen to browser Back/Forward navigation buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const state = getUrlState();
      setCurrentTab(state.currentTab);
      setSelectedAppointment(state.selectedAppointment);
      setSelectedHospital(state.selectedHospital);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTransitionToAppointmentDetails = (appointment) => {
    navigateTo('appointment-detail', { appointment });
  };

  const handleTransitionToHospitalDetails = (hospital) => {
    navigateTo('hospital-detail', { hospital });
  };

  return (
    <CallProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
        <Navbar currentTab={currentTab} setCurrentTab={(tab) => navigateTo(tab)} />

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
              onBack={() => navigateTo('appointments')} 
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
              onBack={() => navigateTo('hospitals')} 
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

        <IncomingCallModal />
        <VideoCallModal />
      </div>
    </CallProvider>
  );
}