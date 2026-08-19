// // src/components/doctor/AppointmentDetails.jsx

// import React, { useState, useEffect } from 'react';
// import { doctorService } from '../../services/api';
// import Alert from '../ui/Alert';
// import Loader from '../ui/Loader';
// import PrescriptionWorkspace from './PrescriptionWorkspace';
// import { 
//   ArrowLeft, Phone, CheckCircle2, User, Mail, Calendar, 
//   Clock, Video, MapPin, Upload, FileText, Trash2, Eye, GitBranch 
// } from '../ui/Icons';
// import { useCall } from '../../context/CallContext';

// export default function AppointmentDetails({ appointment, onBack }) {
//   const [documents, setDocuments] = useState([]);
//   const [currentStatus, setCurrentStatus] = useState(
//     appointment?.appointment_status || appointment?.status || 'confirmed'
//   );
//   const [status, setStatus] = useState({ loading: false, error: null, success: null });

//   const isOnline = (appointment.appointment_type || appointment.type || '').toLowerCase().includes('online');
//   const checkups = Array.isArray(appointment.checkupAppointment) ? appointment.checkupAppointment : [];

//   const { initiateCall } = useCall();

//   const handleCallDoctor = () => {
//     if (appointment?.id) {
//       initiateCall(appointment.id);
//     }
//   };

//   useEffect(() => {
//     if (appointment?.id) {
//       fetchAssociatedDocuments();
//     }
//   }, [appointment?.id]);

//   const fetchAssociatedDocuments = async () => {
//     setStatus(prev => ({ ...prev, loading: true, error: null }));
//     try {
//       const res = await doctorService.getDocumentsByAppointment(appointment.id);
//       const docsArray = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
//       setDocuments(docsArray);
//       setStatus(prev => ({ ...prev, loading: false }));
//     } catch (err) {
//       setStatus(prev => ({ ...prev, loading: false, error: 'Could not fetch associated patient files.' }));
//     }
//   };

//   const handleFileUpload = async (file) => {
//     if (!file) return;
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('appointment_id', appointment.id);

//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.uploadAppointmentDocument(formData);
//       setStatus({ loading: false, error: null, success: 'Medical document attached successfully.' });
//       fetchAssociatedDocuments();
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to upload document.', success: null });
//     }
//   };

//   const handleDeleteDocument = async (docId) => {
//     if (!window.confirm("Are you sure you want to remove this document?")) return;
//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.deleteAppointmentDocument(docId);
//       setStatus({ loading: false, error: null, success: 'Document removed successfully.' });
//       fetchAssociatedDocuments();
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to delete document.', success: null });
//     }
//   };

//   const markAsCompleted = async () => {
//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.updateAppointment({
//         appointment_id: appointment.id,
//         appointment_status: 'closed',
//         prescription: []
//       });
//       setCurrentStatus('closed');
//       setStatus({ loading: false, error: null, success: 'Appointment status marked as completed/closed.' });
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to update appointment status.', success: null });
//     }
//   };

//   const handleCallPatient = () => {
//     if (appointment.patient?.phone_number) {
//       window.location.href = `tel:${appointment.patient.phone_number}`;
//     } else {
//       alert(`Initiating consultation session with ${appointment.patient?.username || 'Patient'}`);
//     }
//   };

//   const openDocument = (url) => {
//     if (url) window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   const formattedDate = appointment?.appointment_date 
//     ? new Date(appointment.appointment_date).toLocaleDateString('en-US', {
//         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//       })
//     : 'N/A';

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto">
//       {/* Top Header Controls */}
//       <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={onBack} 
//             className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-xs transition"
//           >
//             <ArrowLeft className="w-4 h-4" /> Return to List
//           </button>
//           <h2 className="text-base font-extrabold text-slate-800">
//             Consultation #{appointment.id}
//           </h2>
//           <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wide uppercase border ${
//             currentStatus === 'closed' || currentStatus === 'completed'
//               ? 'bg-purple-50 text-purple-700 border-purple-200'
//               : 'bg-emerald-50 text-emerald-700 border-emerald-200'
//           }`}>
//             {currentStatus}
//           </span>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {isOnline && (
//             <button 
//               onClick={handleCallPatient} 
//               type="button"
//               className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
//             >
//               <Phone className="w-3.5 h-3.5" /> Call Patient
//             </button>
//           )}
//           {currentStatus !== 'closed' && currentStatus !== 'completed' && (
//             <button 
//               onClick={markAsCompleted} 
//               type="button"
//               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
//             >
//               <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
//             </button>
//           )}
//         </div>
//       </div>

//       <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
//       {status.loading && <Loader />}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Patient Demographic Summary */}
//         <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm self-start">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
//               <User className="w-6 h-6" />
//             </div>
//             <div className="overflow-hidden">
//               <h3 className="font-extrabold text-slate-800 text-sm truncate">
//                 {appointment.patient?.username || appointment.patientName || 'Patient Record'}
//               </h3>
//               <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
//                 <Mail className="w-3 h-3 flex-shrink-0" /> {appointment.patient?.email || 'N/A'}
//               </p>
//             </div>
//           </div>
          
//           <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
//             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
//               <span className="text-slate-400 block font-bold text-[10px] uppercase">Phone</span>
//               <span className="text-slate-800 font-bold mt-0.5 block">{appointment.patient?.phone_number || 'N/A'}</span>
//             </div>
//             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
//               <span className="text-slate-400 block font-bold text-[10px] uppercase">Payment</span>
//               <span className="text-slate-800 font-bold uppercase mt-0.5 block">{appointment.payment_mode || 'Card'}</span>
//             </div>
//           </div>
//         </div>

//         {/* Schedule & Mode Information */}
//         <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
//           <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
//             Primary Appointment Parameters
//           </span>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
//             <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
//               <span className="text-slate-400 font-bold uppercase text-[10px]">Date & Schedule</span>
//               <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
//                 <Calendar className="w-4 h-4 text-blue-600" /> {formattedDate}
//               </p>
//               <p className="text-slate-600 font-semibold flex items-center gap-1.5 mt-1">
//                 <Clock className="w-3.5 h-3.5 text-slate-400" /> {appointment.appointment_start_time} - {appointment.appointment_end_time}
//               </p>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
//               <span className="text-slate-400 font-bold uppercase text-[10px]">Consultation Type</span>
//               <p className="font-extrabold text-slate-800 text-sm capitalize flex items-center gap-1.5">
//                 {isOnline ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-rose-500" />}
//                 {appointment.appointment_type?.replace('_', ' ') || 'Online'}
//               </p>
//               <p className="text-slate-600 font-semibold mt-1">
//                 Booking Reference: <strong className="text-slate-800">#{appointment.id}</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Distinct Checkup Timeline Section */}
//       {checkups.length > 0 && (
//         <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
//           <div className="flex items-center gap-2">
//             <GitBranch className="w-4 h-4 text-emerald-700" />
//             <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
//               Linked Follow-Up Checkup Appointments ({checkups.length})
//             </h4>
//           </div>

//           <div className="space-y-2">
//             {checkups.map((checkup, idx) => {
//               const checkupDateFormatted = checkup.checkup_date 
//                 ? new Date(checkup.checkup_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) 
//                 : 'N/A';

//               return (
//                 <div key={checkup.id || idx} className="bg-white border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="space-y-0.5">
//                     <div className="flex items-center gap-2">
//                       <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
//                         Checkup #{checkup.id}
//                       </span>
//                       <span className="text-xs font-bold text-slate-800">Follow-Up Consultation</span>
//                       {checkup.is_payment_required === false && (
//                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
//                           Free
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-slate-600 font-medium">
//                       Date: <strong>{checkupDateFormatted}</strong> ({checkup.checkup_start_time} - {checkup.checkup_end_time})
//                     </p>
//                   </div>

//                   <div>
//                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
//                       {checkup.checkup_status || 'Confirmed'}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Embedded Prescription Workspace */}
//       <PrescriptionWorkspace 
//         appointmentId={appointment.id} 
//         onPrescriptionUpdated={() => setCurrentStatus('closed')}
//       />

//       {/* Supporting Medical Documents */}
//       <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
//         <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//           <div>
//             <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Medical History & Documents</h4>
//             <p className="text-[11px] text-slate-400 mt-0.5">Attached diagnostic records and lab reports</p>
//           </div>
//           <label className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5">
//             <Upload className="w-3.5 h-3.5" /> Attach Document
//             <input type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
//           </label>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//           {documents.length === 0 ? (
//             <p className="text-xs text-slate-400 italic py-4 col-span-full text-center border border-dashed rounded-xl bg-slate-50/50">
//               No medical documents uploaded for this consultation.
//             </p>
//           ) : documents.map(doc => (
//             <div key={doc.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition gap-2">
//               <div className="flex items-center gap-2 truncate">
//                 <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                 <div className="truncate">
//                   <span className="text-xs font-bold text-slate-700 block truncate">{doc.document_name || doc.fileName || `Document #${doc.id}`}</span>
//                   <span className="text-[10px] text-slate-400 block">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1 flex-shrink-0">
//                 <button 
//                   onClick={() => openDocument(doc.document_url || doc.url)}
//                   type="button"
//                   className="p-1 hover:bg-white rounded text-slate-400 hover:text-blue-600 transition"
//                   title="View File"
//                 >
//                   <Eye className="w-4 h-4" />
//                 </button>
//                 <button 
//                   onClick={() => handleDeleteDocument(doc.id)}
//                   type="button"
//                   className="p-1 hover:bg-white rounded text-slate-400 hover:text-rose-600 transition"
//                   title="Delete File"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/doctor/AppointmentDetails.jsx

// import React, { useState, useEffect } from 'react';
// import { doctorService } from '../../services/api';
// import Alert from '../ui/Alert';
// import Loader from '../ui/Loader';
// import PrescriptionWorkspace from './PrescriptionWorkspace';
// import { 
//   ArrowLeft, Phone, CheckCircle2, User, Mail, Calendar, 
//   Clock, Video, MapPin, Upload, FileText, Trash2, Eye, GitBranch 
// } from '../ui/Icons';

// // HERE THERE IS A CHANGE MADE: Imported useCall hook from CallContext
// import { useCall } from '../../context/CallContext';

// export default function AppointmentDetails({ appointment, onBack }) {
//   // HERE THERE IS A CHANGE MADE: Destructured initiateCall and callState from CallContext
//   const { initiateCall, callState } = useCall();

//   const [documents, setDocuments] = useState([]);
//   const [currentStatus, setCurrentStatus] = useState(
//     appointment?.appointment_status || appointment?.status || 'confirmed'
//   );
//   const [status, setStatus] = useState({ loading: false, error: null, success: null });

//   const isOnline = (appointment.appointment_type || appointment.type || '').toLowerCase().includes('online');
//   const checkups = Array.isArray(appointment.checkupAppointment) ? appointment.checkupAppointment : [];

//   useEffect(() => {
//     if (appointment?.id) {
//       fetchAssociatedDocuments();
//     }
//   }, [appointment?.id]);

//   const fetchAssociatedDocuments = async () => {
//     setStatus(prev => ({ ...prev, loading: true, error: null }));
//     try {
//       const res = await doctorService.getDocumentsByAppointment(appointment.id);
//       const docsArray = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
//       setDocuments(docsArray);
//       setStatus(prev => ({ ...prev, loading: false }));
//     } catch (err) {
//       setStatus(prev => ({ ...prev, loading: false, error: 'Could not fetch associated patient files.' }));
//     }
//   };

//   const handleFileUpload = async (file) => {
//     if (!file) return;
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('appointment_id', appointment.id);

//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.uploadAppointmentDocument(formData);
//       setStatus({ loading: false, error: null, success: 'Medical document attached successfully.' });
//       fetchAssociatedDocuments();
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to upload document.', success: null });
//     }
//   };

//   const handleDeleteDocument = async (docId) => {
//     if (!window.confirm("Are you sure you want to remove this document?")) return;
//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.deleteAppointmentDocument(docId);
//       setStatus({ loading: false, error: null, success: 'Document removed successfully.' });
//       fetchAssociatedDocuments();
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to delete document.', success: null });
//     }
//   };

//   const markAsCompleted = async () => {
//     setStatus({ loading: true, error: null, success: null });
//     try {
//       await doctorService.updateAppointment({
//         appointment_id: appointment.id,
//         appointment_status: 'closed',
//         prescription: []
//       });
//       setCurrentStatus('closed');
//       setStatus({ loading: false, error: null, success: 'Appointment status marked as completed/closed.' });
//     } catch (err) {
//       setStatus({ loading: false, error: 'Failed to update appointment status.', success: null });
//     }
//   };

//   // HERE THERE IS A CHANGE MADE: Hooked directly to initiateCall WebRTC session
//   const handleCallPatient = () => {
//     if (appointment?.id) {
//       initiateCall(appointment.id);
//     } else {
//       alert("Invalid appointment ID for initiating call session.");
//     }
//   };

//   const openDocument = (url) => {
//     if (url) window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   const formattedDate = appointment?.appointment_date 
//     ? new Date(appointment.appointment_date).toLocaleDateString('en-US', {
//         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//       })
//     : 'N/A';

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto">
//       {/* Top Header Controls */}
//       <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={onBack} 
//             className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-xs transition"
//           >
//             <ArrowLeft className="w-4 h-4" /> Return to List
//           </button>
//           <h2 className="text-base font-extrabold text-slate-800">
//             Consultation #{appointment.id}
//           </h2>
//           <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wide uppercase border ${
//             currentStatus === 'closed' || currentStatus === 'completed'
//               ? 'bg-purple-50 text-purple-700 border-purple-200'
//               : 'bg-emerald-50 text-emerald-700 border-emerald-200'
//           }`}>
//             {currentStatus}
//           </span>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {/* HERE THERE IS A CHANGE MADE: Button triggers real WebRTC call */}
//           {isOnline && (
//             <button 
//               onClick={handleCallPatient} 
//               disabled={callState !== 'IDLE'}
//               type="button"
//               className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
//             >
//               <Phone className="w-3.5 h-3.5" /> {callState !== 'IDLE' ? 'Calling...' : 'Call Patient'}
//             </button>
//           )}
//           {currentStatus !== 'closed' && currentStatus !== 'completed' && (
//             <button 
//               onClick={markAsCompleted} 
//               type="button"
//               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
//             >
//               <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
//             </button>
//           )}
//         </div>
//       </div>

//       <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
//       {status.loading && <Loader />}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Patient Demographic Summary */}
//         <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm self-start">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
//               <User className="w-6 h-6" />
//             </div>
//             <div className="overflow-hidden">
//               <h3 className="font-extrabold text-slate-800 text-sm truncate">
//                 {appointment.patient?.username || appointment.patientName || 'Patient Record'}
//               </h3>
//               <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
//                 <Mail className="w-3 h-3 flex-shrink-0" /> {appointment.patient?.email || 'N/A'}
//               </p>
//             </div>
//           </div>
          
//           <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
//             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
//               <span className="text-slate-400 block font-bold text-[10px] uppercase">Phone</span>
//               <span className="text-slate-800 font-bold mt-0.5 block">{appointment.patient?.phone_number || 'N/A'}</span>
//             </div>
//             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
//               <span className="text-slate-400 block font-bold text-[10px] uppercase">Payment</span>
//               <span className="text-slate-800 font-bold uppercase mt-0.5 block">{appointment.payment_mode || 'Card'}</span>
//             </div>
//           </div>
//         </div>

//         {/* Schedule & Mode Information */}
//         <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
//           <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
//             Primary Appointment Parameters
//           </span>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
//             <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
//               <span className="text-slate-400 font-bold uppercase text-[10px]">Date & Schedule</span>
//               <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
//                 <Calendar className="w-4 h-4 text-blue-600" /> {formattedDate}
//               </p>
//               <p className="text-slate-600 font-semibold flex items-center gap-1.5 mt-1">
//                 <Clock className="w-3.5 h-3.5 text-slate-400" /> {appointment.appointment_start_time} - {appointment.appointment_end_time}
//               </p>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
//               <span className="text-slate-400 font-bold uppercase text-[10px]">Consultation Type</span>
//               <p className="font-extrabold text-slate-800 text-sm capitalize flex items-center gap-1.5">
//                 {isOnline ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-rose-500" />}
//                 {appointment.appointment_type?.replace('_', ' ') || 'Online'}
//               </p>
//               <p className="text-slate-600 font-semibold mt-1">
//                 Booking Reference: <strong className="text-slate-800">#{appointment.id}</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Distinct Checkup Timeline Section */}
//       {checkups.length > 0 && (
//         <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
//           <div className="flex items-center gap-2">
//             <GitBranch className="w-4 h-4 text-emerald-700" />
//             <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
//               Linked Follow-Up Checkup Appointments ({checkups.length})
//             </h4>
//           </div>

//           <div className="space-y-2">
//             {checkups.map((checkup, idx) => {
//               const checkupDateFormatted = checkup.checkup_date 
//                 ? new Date(checkup.checkup_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) 
//                 : 'N/A';

//               return (
//                 <div key={checkup.id || idx} className="bg-white border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="space-y-0.5">
//                     <div className="flex items-center gap-2">
//                       <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
//                         Checkup #{checkup.id}
//                       </span>
//                       <span className="text-xs font-bold text-slate-800">Follow-Up Consultation</span>
//                       {checkup.is_payment_required === false && (
//                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
//                           Free
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-slate-600 font-medium">
//                       Date: <strong>{checkupDateFormatted}</strong> ({checkup.checkup_start_time} - {checkup.checkup_end_time})
//                     </p>
//                   </div>

//                   <div>
//                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
//                       {checkup.checkup_status || 'Confirmed'}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Embedded Prescription Workspace */}
//       <PrescriptionWorkspace 
//         appointmentId={appointment.id} 
//         onPrescriptionUpdated={() => setCurrentStatus('closed')}
//       />

//       {/* Supporting Medical Documents */}
//       <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
//         <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//           <div>
//             <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Medical History & Documents</h4>
//             <p className="text-[11px] text-slate-400 mt-0.5">Attached diagnostic records and lab reports</p>
//           </div>
//           <label className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5">
//             <Upload className="w-3.5 h-3.5" /> Attach Document
//             <input type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
//           </label>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//           {documents.length === 0 ? (
//             <p className="text-xs text-slate-400 italic py-4 col-span-full text-center border border-dashed rounded-xl bg-slate-50/50">
//               No medical documents uploaded for this consultation.
//             </p>
//           ) : documents.map(doc => (
//             <div key={doc.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition gap-2">
//               <div className="flex items-center gap-2 truncate">
//                 <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                 <div className="truncate">
//                   <span className="text-xs font-bold text-slate-700 block truncate">{doc.document_name || doc.fileName || `Document #${doc.id}`}</span>
//                   <span className="text-[10px] text-slate-400 block">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-1 flex-shrink-0">
//                 <button 
//                   onClick={() => openDocument(doc.document_url || doc.url)}
//                   type="button"
//                   className="p-1 hover:bg-white rounded text-slate-400 hover:text-blue-600 transition"
//                   title="View File"
//                 >
//                   <Eye className="w-4 h-4" />
//                 </button>
//                 <button 
//                   onClick={() => handleDeleteDocument(doc.id)}
//                   type="button"
//                   className="p-1 hover:bg-white rounded text-slate-400 hover:text-rose-600 transition"
//                   title="Delete File"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/doctor/AppointmentDetails.jsx

import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import PrescriptionWorkspace from './PrescriptionWorkspace';
import { 
  ArrowLeft, Phone, CheckCircle2, User, Mail, Calendar, 
  Clock, Video, MapPin, Upload, FileText, Trash2, Eye, GitBranch 
} from '../ui/Icons';
// HERE THERE IS A CHANGE MADE: Import useCall from CallContext
import { useCall } from '../../context/CallContext';

export default function AppointmentDetails({ appointment, onBack }) {
  // HERE THERE IS A CHANGE MADE: Destructured initiateCall and callState
  const { initiateCall, callState } = useCall();

  const [documents, setDocuments] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(
    appointment?.appointment_status || appointment?.status || 'confirmed'
  );
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const isOnline = (appointment?.appointment_type || appointment?.type || '').toLowerCase().includes('online');
  const checkups = Array.isArray(appointment?.checkupAppointment) ? appointment.checkupAppointment : [];

  useEffect(() => {
    if (appointment?.id) {
      fetchAssociatedDocuments();
    }
  }, [appointment?.id]);

  const fetchAssociatedDocuments = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await doctorService.getDocumentsByAppointment(appointment.id);
      const docsArray = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
      setDocuments(docsArray);
      setStatus(prev => ({ ...prev, loading: false }));
    } catch (err) {
      setStatus(prev => ({ ...prev, loading: false, error: 'Could not fetch associated patient files.' }));
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
      setStatus({ loading: false, error: null, success: 'Medical document attached successfully.' });
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
      setStatus({ loading: false, error: null, success: 'Document removed successfully.' });
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
      setCurrentStatus('closed');
      setStatus({ loading: false, error: null, success: 'Appointment status marked as completed/closed.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to update appointment status.', success: null });
    }
  };

  // HERE THERE IS A CHANGE MADE: Calls WebRTC initiateCall
  const handleCallPatient = () => {
    if (appointment?.id) {
      initiateCall(appointment.id);
    } else {
      alert("Invalid appointment ID for initiating call session.");
    }
  };

  const openDocument = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formattedDate = appointment?.appointment_date 
    ? new Date(appointment.appointment_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to List
          </button>
          <h2 className="text-base font-extrabold text-slate-800">
            Consultation #{appointment.id}
          </h2>
          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wide uppercase border ${
            currentStatus === 'closed' || currentStatus === 'completed'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {currentStatus}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Call Trigger */}
          {isOnline && (
            <button 
              onClick={handleCallPatient} 
              disabled={callState !== 'IDLE'}
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> {callState !== 'IDLE' ? 'Calling...' : 'Call Patient'}
            </button>
          )}
          {currentStatus !== 'closed' && currentStatus !== 'completed' && (
            <button 
              onClick={markAsCompleted} 
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
            </button>
          )}
        </div>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
      {status.loading && <Loader />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Demographic Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm self-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-slate-800 text-sm truncate">
                {appointment.patient?.username || appointment.patientName || 'Patient Record'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 flex-shrink-0" /> {appointment.patient?.email || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Phone</span>
              <span className="text-slate-800 font-bold mt-0.5 block">{appointment.patient?.phone_number || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Payment</span>
              <span className="text-slate-800 font-bold uppercase mt-0.5 block">{appointment.payment_mode || 'Card'}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Mode Information */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
            Primary Appointment Parameters
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Date & Schedule</span>
              <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> {formattedDate}
              </p>
              <p className="text-slate-600 font-semibold flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {appointment.appointment_start_time} - {appointment.appointment_end_time}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Consultation Type</span>
              <p className="font-extrabold text-slate-800 text-sm capitalize flex items-center gap-1.5">
                {isOnline ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-rose-500" />}
                {appointment.appointment_type?.replace('_', ' ') || 'Online'}
              </p>
              <p className="text-slate-600 font-semibold mt-1">
                Booking Reference: <strong className="text-slate-800">#{appointment.id}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Follow-Up Checkups */}
      {checkups.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              Linked Follow-Up Checkup Appointments ({checkups.length})
            </h4>
          </div>

          <div className="space-y-2">
            {checkups.map((checkup, idx) => {
              const checkupDateFormatted = checkup.checkup_date 
                ? new Date(checkup.checkup_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) 
                : 'N/A';

              return (
                <div key={checkup.id || idx} className="bg-white border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                        Checkup #{checkup.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Follow-Up Consultation</span>
                      {checkup.is_payment_required === false && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Date: <strong>{checkupDateFormatted}</strong> ({checkup.checkup_start_time} - {checkup.checkup_end_time})
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {checkup.checkup_status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Prescription Workspace */}
      <PrescriptionWorkspace 
        appointmentId={appointment.id} 
        onPrescriptionUpdated={() => setCurrentStatus('closed')}
      />

      {/* Supporting Medical Documents */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Medical History & Documents</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Attached diagnostic records and lab reports</p>
          </div>
          <label className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Attach Document
            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 col-span-full text-center border border-dashed rounded-xl bg-slate-50/50">
              No medical documents uploaded for this consultation.
            </p>
          ) : documents.map(doc => (
            <div key={doc.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition gap-2">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-700 block truncate">{doc.document_name || doc.fileName || `Document #${doc.id}`}</span>
                  <span className="text-[10px] text-slate-400 block">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button 
                  onClick={() => openDocument(doc.document_url || doc.url)}
                  type="button"
                  className="p-1 hover:bg-white rounded text-slate-400 hover:text-blue-600 transition"
                  title="View File"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc.id)}
                  type="button"
                  className="p-1 hover:bg-white rounded text-slate-400 hover:text-rose-600 transition"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}