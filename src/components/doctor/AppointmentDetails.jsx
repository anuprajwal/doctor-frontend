import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function AppointmentDetails({ appointment, onBack, onNavigatePrescription }) {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAssociatedDocuments();
  }, [appointment.id]);

  const fetchAssociatedDocuments = async () => {
    setStatus({ loading: true, error: null });
    try {
      const res = await doctorService.getDocumentsByAppointment(appointment.id);
      setDocuments(res.data || []);
      setStatus({ loading: false });
    } catch (err) {
      setStatus({ loading: false, error: 'Could not fetch associated patient files from secure cloud bucket.' });
    }
  };

  const openSecureDocument = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <button onClick={onBack} class="text-slate-400 hover:text-slate-600 font-bold">← Back</button>
          <h2 class="text-lg font-bold text-slate-800">Appointment Details</h2>
          <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-full tracking-wide">{appointment.status}</span>
        </div>
        <div class="flex gap-2">
          <button onClick={() => onNavigatePrescription(appointment)} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition">
            Close Appointment & Add Prescription
          </button>
          <button onClick={onBack} class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition">Cancel</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Core Demographics */}
        <div class="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm self-start">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">👤</div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">{appointment.patientName}</h3>
              <p class="text-[10px] text-slate-400">ID: {appointment.patientId}</p>
            </div>
          </div>
          <hr class="border-slate-100" />
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-slate-400 block font-medium">Age / Gender</span>
              <span class="text-slate-700 font-semibold">{appointment.age || '45y'} / {appointment.gender || 'Male'}</span>
            </div>
            <div>
              <span class="text-slate-400 block font-medium">Last Clinical Visit</span>
              <span class="text-slate-700 font-semibold">{appointment.lastVisit || 'Sep 12, 2023'}</span>
            </div>
          </div>
          <div class="bg-rose-50 border border-rose-100 rounded-lg p-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">⚠️ Allergies Identified</span>
            <p class="text-xs text-rose-800 font-semibold">{appointment.allergies || 'Penicillin, Peanuts specified parameters.'}</p>
          </div>
        </div>

        {/* Right Card: Dynamic Schedule & Reported Manifestations */}
        <div class="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 space-y-6 shadow-sm">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">📋 Appointment Diagnostics Information</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span class="text-slate-400 block font-medium">Target Window Date & Time</span>
                <span class="text-slate-700 font-bold text-sm block mt-0.5">{appointment.date} @ {appointment.time}</span>
              </div>
              <div>
                <span class="text-slate-400 block font-medium">Consultation Modality</span>
                <span class="text-slate-700 font-bold block mt-0.5 text-blue-600">📍 {appointment.type} Visit</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reported Symptoms Matrix</h4>
            <blockquote class="border-l-2 border-slate-300 pl-3 text-xs italic text-slate-600 leading-relaxed bg-slate-50/50 py-2 pr-2 rounded-r">
              "{appointment.symptoms || 'Persistent dry cough, mild fever for 3 days. Occasional chest tightness when breathing deeply.'}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Prescription Entry Interface Overlay */}
      <div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Prescription & Clinical Observation Input</h4>
        <textarea 
          class="w-full h-28 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter clinical observations, physical exam findings, and physical assessment notes directly..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Embedded Document Pipeline Component */}
      <div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">📂 Medical History & Associated Cloud Documents</h4>
        <Alert type="error" message={status.error} />
        {status.loading ? <Loader /> : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length === 0 ? (
              <p class="text-xs text-slate-400 italic py-2">No secondary health documents explicitly uploaded to this event record.</p>
            ) : documents.map(doc => (
              <div key={doc.id} class="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition">
                <div class="flex items-center gap-2 overflow-hidden">
                  <span class="text-xl">📄</span>
                  <div class="truncate">
                    <span class="text-xs font-semibold text-slate-700 block truncate">{doc.fileName}</span>
                    <span class="text-[10px] text-slate-400 block">Uploaded {doc.uploadedAt || 'Recently'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => openSecureDocument(doc.url)}
                  class="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-400 hover:text-blue-600 shadow-sm transition"
                  title="View Embedded File Stream"
                >
                  👁️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}