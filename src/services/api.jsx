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

[api, authApi, verifyApi].forEach((instance) => instance.interceptors.request.use(injectToken));

export const doctorService = {
  // Profile & Verification Actions
  getUserData: () => authApi.get('/api/auth/get-user-data'),
  updateProfile: (data) => authApi.put('/api/auth/profile/complete/doctor', data),
  uploadPhoto: (formData) => authApi.post('/api/auth/upload-photo', formData),
  deletePhoto: () => authApi.delete('/api/auth/delete-profile-pic'),
  updateExtraInfo: (data) => authApi.put('/api/auth/profile/complete/extra-doc-info', data),
  sendEmailOtp: (email) => verifyApi.post('/api/verify/sendEmailOtp', { email }),
  sendMobileOtp: (phoneNumber) => verifyApi.post('/api/verify/sendMobileOtp', { phoneNumber }),
  verifyOtp: (payload) => verifyApi.put('/api/verify/verifyEmailMobile', payload),

  // Verification Documents
  getDocuments: () => api.get('/api/documents/get-documents'),
  uploadDocument: (formData) => api.post('/api/documents/upload-document', formData),

  // Appointments & Prescriptions Workflow
  listAppointments: () => api.get('/api/appointment/list-appointments'),
  getPrescription: (appointmentId) => api.get(`/api/appointment/get-prescription-for/${appointmentId}`),
  updateAppointment: (payload) => api.put('/api/appointment/doctor-update-appointment', payload),

  // Appointment Documents Management
  getDocumentsByAppointment: (appointmentId) => api.get(`/api/appointment/get-document-for/${appointmentId}`),
  uploadAppointmentDocument: (formData) => api.post('/api/appointment/upload-appointment-document', formData),
  deleteAppointmentDocument: (docId) => api.delete(`/api/appointment/delete-document/${docId}`),
  replaceAppointmentDocument: (docId, formData) => api.put(`/api/appointment/replace-document/${docId}`, formData),

  // Addresses & Banking Setup
  addAddress: (data) => authApi.post('/api/address/addAddress', data),
  getAllAddresses: () => verifyApi.get('/api/address/getAllAddress'),
  updateAddress: (data) => verifyApi.put('/api/address/updateAddress', data),
  deleteAddress: (addressId) => verifyApi.delete('/api/address/deleteAddress', { data: { addressId } }),
  uploadBankDetails: (data) => verifyApi.post('/api/auth/upload/bank-details', data),

  // Hospital Discovery & Affiliation
  filterHospitals: (type = 'hospital', limit = 10, offset = 0, pincode = '') =>
    api.get(`/api/filter/filter-hospitals?type=${encodeURIComponent(type)}&limit=${limit}&offset=${offset}${pincode ? `&pincode=${encodeURIComponent(pincode)}` : ''}`),
  
  getHospitalDoctors: (organisationId, limit = 10, offset = 0) =>
    api.get(`/api/filter/get-hospital-doctors/${organisationId}?limit=${limit}&offset=${offset}`),

  searchHospitalsByName: (name) => api.post('/api/filter/search/hospital-by-name', { name }),
  requestAdmission: (organisationId) => api.post('/api/hospital/doctor-request-admission', { organisation_id: organisationId })
};