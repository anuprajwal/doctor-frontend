import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
const authApi = axios.create({ baseURL: import.meta.env.VITE_AUTH_BASE_URL });
const verifyApi = axios.create({ baseURL: import.meta.env.VITE_VERIFY_BASE_URL });

const injectToken = (config) => {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  if (match) {
    config.headers['Authorization'] = `Bearer ${match[2]}`;
  }
  return config;
};

[api, authApi, verifyApi].forEach(instance => instance.interceptors.request.use(injectToken));

export const doctorService = {
  // Existing Profile Actions & Pic Mutations
  updateProfile: (data) => authApi.post('/profile/complete/doctor', data),
  uploadPhoto: (formData) => authApi.post('/upload-photo', formData),
  deletePhoto: () => authApi.delete('/delete-profile-pic'),
  updateExtraInfo: (data) => authApi.post('/profile/complete/extra-doc-info', data),
  sendEmailOtp: (email) => verifyApi.post('/sendEmailOtp', { email }),
  sendMobileOtp: (phoneNumber) => verifyApi.post('/sendMobileOtp', { phoneNumber }),
  verifyOtp: (payload) => verifyApi.post('/verifyEmailMobile', payload),

  // Verification Documents Onboarding
  getDocuments: () => api.get('/documents/get-documents'),
  uploadDocument: (formData) => api.post('/documents/upload-document', formData),

  // Appointments Flow
  listAppointments: () => api.get('/appointment/list-appointments'),
  getDocumentsByAppointment: (appointmentId) => api.get(`/appointment/get-document-for/${appointmentId}`),
  getPrescription: (appointmentId) => api.get(`/appointment/get-prescription-for/${appointmentId}`),
  savePrescription: (appointmentId, payload) => api.post(`/appointment/save-prescription/${appointmentId}`, payload),

  // Address CRUD Interface Mappings
  addAddress: (data) => authApi.post('/address/addAddress', data),
  getAllAddresses: () => verifyApi.get('/address/getAllAddress'),
  updateAddress: (data) => verifyApi.post('/address/updateAddress', data),
  deleteAddress: (addressId) => verifyApi.post('/address/deleteAddress', { addressId }),

  // Bank Allocation Setup
  uploadBankDetails: (data) => verifyApi.post('/auth/upload/bank-details', data),

  // Hospital Discovery Ecosystem
  searchHospitals: (name) => api.post('/filter/search/hospital-by-name', { name }),
  requestAdmission: (organisationId) => api.post('/hospital/doctor-request-admission', { organisation_id: organisationId })
};