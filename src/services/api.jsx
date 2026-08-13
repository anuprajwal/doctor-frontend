// src/services/api.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.docapp.co.in';

const api = axios.create({ baseURL: BASE_URL });
const authApi = axios.create({ baseURL: BASE_URL });
const verifyApi = axios.create({ baseURL: BASE_URL });

const injectToken = (config) => {
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  if (match) {
    config.headers['Authorization'] = `Bearer ${match[2]}`;
  }
  return config;
};

[api, authApi, verifyApi].forEach(instance => instance.interceptors.request.use(injectToken));

export const doctorService = {
  // Existing Profile Actions & Pic Mutations
  updateProfile: (data) => authApi.post('/api/auth/profile/complete/doctor', data),
  uploadPhoto: (formData) => authApi.post('/api/auth/upload-photo', formData),
  deletePhoto: () => authApi.delete('/api/auth/delete-profile-pic'),
  updateExtraInfo: (data) => authApi.post('/api/auth/profile/complete/extra-doc-info', data),
  sendEmailOtp: (email) => verifyApi.post('/api/verify/sendEmailOtp', { email }),
  sendMobileOtp: (phoneNumber) => verifyApi.post('/api/verify/sendMobileOtp', { phoneNumber }),
  verifyOtp: (payload) => verifyApi.post('/api/verify/verifyEmailMobile', payload),

  // Verification Documents Onboarding
  getDocuments: () => api.get('/api/documents/get-documents'),
  uploadDocument: (formData) => api.post('/api/documents/upload-document', formData),

  // Appointments Flow & Prescription Management
  listAppointments: () => api.get('/api/appointment/list-appointments'),
  getPrescription: (appointmentId) => api.get(`/api/appointment/get-prescription-for/${appointmentId}`),
  
  // PUT /api/appointment/doctor-update-appointment
  // Payload: { appointment_id, appointment_status, prescription: [{ drug, qty, timing, notes }] }
  updateAppointment: (payload) => api.put('/api/appointment/doctor-update-appointment', payload),

  // Appointment Document Management
  getDocumentsByAppointment: (appointmentId) => api.get(`/api/appointment/get-document/${appointmentId}`),
  getSingleDocument: (docId) => api.get(`/api/appointment/get-document-for/${docId}`),
  uploadAppointmentDocument: (formData) => api.post('/api/appointment/upload-appointment-document', formData),
  deleteAppointmentDocument: (docId) => api.delete(`/api/appointment/delete-document/${docId}`),
  replaceAppointmentDocument: (docId, formData) => api.put(`/api/appointment/replace-document/${docId}`, formData),

  // Address CRUD Interface Mappings
  addAddress: (data) => authApi.post('/api/address/addAddress', data),
  getAllAddresses: () => verifyApi.get('/api/address/getAllAddress'),
  updateAddress: (data) => verifyApi.put('/api/address/updateAddress', data),
  deleteAddress: (addressId) => verifyApi.delete('/api/address/deleteAddress', { data: { addressId } }),

  // Bank Allocation Setup
  uploadBankDetails: (data) => verifyApi.post('/api/auth/upload/bank-details', data),

  // Hospital Discovery Ecosystem
  searchHospitals: (name) => api.post('/api/filter/search/hospital-by-name', { name }),
  requestAdmission: (organisationId) => api.post('/api/hospital/doctor-request-admission', { organisation_id: organisationId })
};