import React, { useState, useEffect } from 'react';
import { doctorEndpoints } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function AppointmentDetails({ appointment, onBack, onNavigatePrescription }) {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (appointment?.id) {
      fetchAssociatedDocuments();
    }
  }, [appointment?.id]);

  const fetchAssociatedDocuments = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorEndpoints.getDocumentsByAppointment(appointment.id);
      const docList = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
      setDocuments(docList);
      setStatus({ loading: false, error: null, success: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Could not fetch associated patient files from server.', success: null });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus({ loading: false, error: null, success: null });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointment_id', appointment.id);

    try {
      await doctorEndpoints.uploadDocument(formData);
      setStatus({ loading: false, error: null, success: 'Document uploaded successfully.' });
      fetchAssociatedDocuments();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to upload document.', success: null });
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceDocument = async (documentId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus({ loading: false, error: null, success: null });

    const formData = new FormData();
    formData.append('file', file);

    try {
      await doctorEndpoints.replaceDocument(documentId, formData);
      setStatus({ loading: false, error: null, success: 'Document replaced successfully.' });
      fetchAssociatedDocuments();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to replace document.', success: null });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorEndpoints.deleteDocument(documentId);
      setStatus({ loading: false, error: null, success: 'Document deleted successfully.' });
      fetchAssociatedDocuments();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to delete document.', success: null });
    }
  };

  const openSecureDocument = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold">← Back</button>
          <h2 className="text-lg font-bold text-slate-800">Appointment Details #{appointment?.id}</h2>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-full capitalize">
            {appointment?.appointment_status || appointment?.status || 'Pending'}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigatePrescription(appointment)} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Manage Prescription
          </button>
        </div>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

      {/* Patient demographics & details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">👤</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{appointment?.user?.username || appointment?.patientName || 'Patient'}</h3>
              <p className="text-xs text-slate-400">Phone: {appointment?.user?.phone_number || 'N/A'}</p>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div className="text-xs space-y-2">
            <div>
              <span className="text-slate-400 block font-medium">Appointment Date</span>
              <span className="text-slate-700 font-semibold">{appointment?.appointment_date || appointment?.date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Time Slot</span>
              <span className="text-slate-700 font-semibold">{appointment?.appointment_start_time || appointment?.time || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Consultation Type</span>
              <span className="text-blue-600 font-semibold capitalize">{appointment?.appointment_type || appointment?.type || 'Online'}</span>
            </div>
          </div>
        </div>

        {/* Document management stream */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">📂 Uploaded Appointment Documents</h4>
            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition">
              {uploading ? 'Uploading...' : '+ Upload Document'}
              <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {status.loading ? (
            <Loader />
          ) : (
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No documents uploaded for this appointment.</p>
              ) : (
                documents.map((doc, idx) => {
                  const docId = doc.id || idx;
                  return (
                    <div key={docId} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xl">📄</span>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-700 block truncate">{doc.filename || doc.document_name || `Document #${docId}`}</span>
                          <span className="text-[10px] text-slate-400 block">ID: {docId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openSecureDocument(doc.file_url || doc.url)} 
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-700 rounded-md shadow-sm"
                        >
                          View
                        </button>
                        <label className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-xs text-blue-600 rounded-md shadow-sm cursor-pointer">
                          Replace
                          <input type="file" onChange={(e) => handleReplaceDocument(docId, e)} className="hidden" disabled={uploading} />
                        </label>
                        <button 
                          onClick={() => handleDeleteDocument(docId)} 
                          className="px-2.5 py-1 bg-white border border-red-200 hover:border-red-300 text-xs text-red-600 rounded-md shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}