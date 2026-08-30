import React, { useState, useEffect } from 'react';
import Navbar from '../components/ui/Navbar';
import ProfileCompletion from '../components/doctor/ProfileCompletion';
import DocumentUpload from '../components/doctor/DocumentUpload';
import ScheduleConfiguration from '../components/doctor/ScheduleConfiguration';
import AppointmentList from '../components/doctor/AppointmentList';
import AppointmentDetails from '../components/doctor/AppointmentDetails';
import HospitalSearch from '../components/doctor/HospitalSearch';
import HospitalDetailPage from '../components/doctor/HospitalDetailPage';
import DoctorKycSection from '../components/doctor/DoctorKycSection';
import NotFound from '../pages/NotFound';

import { CallProvider } from './context/CallContext';
import IncomingCallModal from './components/calling/IncomingCallModal';
import VideoCallModal from './components/calling/VideoCallModal';
import { useNotificationPermission } from './services/useNotificationPermission';
import { setSelectedItem, getSelectedItem, clearSelectedItem } from './utils/navigationStorage';

export default function App() {
  useNotificationPermission();

  // 1. Read URL and retrieve the active object on browser reload
  const getUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'appointments';

    return {
      currentTab: tab,
      selectedAppointment: tab === 'appointment-detail' ? getSelectedItem('doctor_appointment') : null,
      selectedHospital: tab === 'hospital-detail' ? getSelectedItem('doctor_hospital') : null,
    };
  };

  const initialUrlState = getUrlState();
  const [currentTab, setCurrentTab] = useState(initialUrlState.currentTab);
  const [selectedAppointment, setSelectedAppointment] = useState(initialUrlState.selectedAppointment);
  const [selectedHospital, setSelectedHospital] = useState(initialUrlState.selectedHospital);

  // 2. Synchronize navigation parameters with URL and single-item storage
  const navigateTo = (newTab, data = {}) => {
    const params = new URLSearchParams();
    params.set('tab', newTab);

    // Handle Appointment selection
    if (data.appointment) {
      params.set('appointmentId', data.appointment.id);
      setSelectedAppointment(data.appointment);
      setSelectedItem('doctor_appointment', data.appointment);
    } else if (newTab === 'appointments') {
      setSelectedAppointment(null);
      clearSelectedItem('doctor_appointment');
    }

    // Handle Hospital selection
    if (data.hospital) {
      const hospId = data.hospital.user_id || data.hospital.id;
      params.set('hospitalId', hospId);
      setSelectedHospital(data.hospital);
      setSelectedItem('doctor_hospital', data.hospital);
    } else if (newTab === 'hospitals') {
      setSelectedHospital(null);
      clearSelectedItem('doctor_hospital');
    }

    setCurrentTab(newTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // 3. Listen to browser Back/Forward navigation buttons
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
          {currentTab === 'appointment-detail' && (
            <AppointmentDetails 
              appointment={selectedAppointment} 
              onBack={() => {
                clearSelectedItem('doctor_appointment');
                navigateTo('appointments');
              }} 
            />
          )}
          {currentTab === 'hospitals' && (
            <HospitalSearch 
              onViewHospital={handleTransitionToHospitalDetails} 
            />
          )}
          {currentTab === 'hospital-detail' && (
            <HospitalDetailPage 
              hospital={selectedHospital} 
              onBack={() => {
                clearSelectedItem('doctor_hospital');
                navigateTo('hospitals');
              }} 
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