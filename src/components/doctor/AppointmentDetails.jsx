import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function AppointmentDetails({ appointment, onBack, onNavigatePrescription }) {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    if (appointment?.id) {
      fetchAssociatedDocuments();
    }
  }, [appointment?.id]);

  const fetchAssociatedDocuments = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorService.getDocumentsByAppointment(appointment.id);
      setDocuments(Array.isArray(res.data) ? res.data : (res.data?.documents || []));
      setStatus({ loading: false, error: null, success: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Could not fetch associated patient files.', success: null });
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('appointment_id', appointment.id);

    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.uploadAppointmentDocument(formData);
      setStatus({ loading: false, error: null, success: 'Document uploaded successfully.' });
      fetchAssociatedDocuments();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to upload document.', success: null });
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.deleteAppointmentDocument(docId);
      setStatus({ loading: false, error: null, success: 'Document deleted.' });
      fetchAssociatedDocuments();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to delete document.', success: null });
    }
  };

  const markAsCompleted = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.updateAppointment({
        appointment_id: appointment.id,
        appointment_status: 'closed',
        prescription: []
      });
      setStatus({ loading: false, error: null, success: 'Appointment marked as completed/closed.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to update appointment status.', success: null });
    }
  };

  const handleCallPatient = () => {
    alert(`Initiating video call session with ${appointment.patient?.username || 'Patient'} (${appointment.patient?.phone_number || 'N/A'})...`);
  };

  const openDocument = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isOnline = (appointment.appointment_type || appointment.type || '').toLowerCase().includes('online');

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-xs">← Back</button>
          <h2 className="text-base font-bold text-slate-800">Appointment Details #{appointment.id}</h2>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-full tracking-wide uppercase">
            {appointment.appointment_status || appointment.status || 'Confirmed'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOnline && (
            <button 
              onClick={handleCallPatient} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1"
            >
              📞 Call Patient
            </button>
          )}
          <button 
            onClick={markAsCompleted} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Mark Completed
          </button>
          <button 
            onClick={() => onNavigatePrescription(appointment)} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Write Prescription 📝
          </button>
        </div>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
      {status.loading && <Loader />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Demographics */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm self-start">
          <div className="flex items-center gap-3">
            <img 
              src={appointment.patient?.generalUser?.profile_picture || "https://via.placeholder.com/150"} 
              alt="Patient Profile" 
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{appointment.patient?.username || appointment.patientName || 'Patient'}</h3>
              <p className="text-[10px] text-slate-400">{appointment.patient?.email || 'N/A'}</p>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Phone</span>
              <span className="text-slate-700 font-semibold">{appointment.patient?.phone_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Mode</span>
              <span className="text-slate-700 font-semibold uppercase">{appointment.payment_mode || 'Card'}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Consultation Metadata */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 space-y-6 shadow-sm">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">📋 Consultation Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date & Time Slot</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">
                  {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'} @ {appointment.appointment_start_time} - {appointment.appointment_end_time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Type</span>
                <span className="text-slate-700 font-bold block mt-0.5 text-blue-600 uppercase">
                  {appointment.appointment_type || 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Documents Workspace */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">📂 Medical History & Documents</h4>
          <label className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg cursor-pointer transition">
            + Upload Document
            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No documents attached to this appointment record.</p>
          ) : documents.map(doc => (
            <div key={doc.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xl">📄</span>
                <div className="truncate">
                  <span className="text-xs font-semibold text-slate-700 block truncate">{doc.fileName || doc.key || `Document #${doc.id}`}</span>
                  <span className="text-[10px] text-slate-400 block">Uploaded Recently</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => openDocument(doc.url)}
                  className="p-1 hover:bg-white rounded text-slate-400 hover:text-blue-600 transition"
                  title="View File"
                >
                  👁️
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-1 hover:bg-white rounded text-slate-400 hover:text-rose-600 transition"
                  title="Delete File"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}