// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.docapp.co.in';

const getCookieToken = () => {
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getCookieToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    }

    if (!response.ok) {
      if (response.status === 401) {
        document.cookie = 'auth_token=; path=/; domain=.docapp.co.in; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.reload();
      }
      const error = new Error(responseData?.message || `HTTP ${response.status}`);
      error.response = { data: responseData, status: response.status };
      throw error;
    }

    return { data: responseData, status: response.status };
  } catch (error) {
    throw error;
  }
};

// 1. ORIGINAL SERVICE ROUTE MAP (doctorService)
export const doctorService = {
  // Existing Profile Actions & Pic Mutations
  updateProfile: (data) => makeRequest('/api/auth/profile/complete/doctor', { method: 'PUT', body: data }),
  uploadPhoto: (formData) => makeRequest('/api/auth/upload-photo', { method: 'POST', body: formData }),
  deletePhoto: () => makeRequest('/api/auth/delete-profile-pic', { method: 'DELETE' }),
  updateExtraInfo: (data) => makeRequest('/api/auth/profile/complete/extra-doc-info', { method: 'POST', body: data }),
  
  // Verification Pipeline (OTP)
  sendEmailOtp: (email) => makeRequest('/api/verify/sendEmailOtp', { method: 'POST', body: { email } }),
  sendMobileOtp: (phoneNumber) => makeRequest('/api/verify/sendMobileOtp', { method: 'POST', body: { phoneNumber } }),
  verifyOtp: (payload) => makeRequest('/api/verify/verifyEmailMobile', { method: 'PUT', body: payload }),

  // Verification Documents Onboarding
  getDocuments: () => makeRequest('/api/documents/get-documents', { method: 'GET' }),
  uploadDocument: (formData) => makeRequest('/api/documents/upload-document', { method: 'POST', body: formData }),

  // Appointments Flow
  listAppointments: () => makeRequest('/api/appointment/list-appointments', { method: 'GET' }),
  getDocumentsByAppointment: (appointmentId) => makeRequest(`/api/appointment/get-document/${appointmentId}`, { method: 'GET' }),
  getPrescription: (appointmentId) => makeRequest(`/api/appointment/get-prescription-for/${appointmentId}`, { method: 'GET' }),
  savePrescription: (payload) => makeRequest('/api/appointment/doctor-update-appointment', { method: 'PUT', body: payload }),

  // Address CRUD Interface Mappings
  addAddress: (data) => makeRequest('/api/address/addAddress', { method: 'POST', body: data }),
  getAllAddresses: () => makeRequest('/api/address/getAllAddress', { method: 'GET' }),
  updateAddress: (data) => makeRequest('/api/address/updateAddress', { method: 'PUT', body: data }),
  deleteAddress: (addressId) => makeRequest('/api/address/deleteAddress', { method: 'DELETE', body: { addressId } }),

  // Bank Allocation Setup
  uploadBankDetails: (data) => makeRequest('/api/auth/upload/bank-details', { method: 'POST', body: data }),
  getBankDetails: () => makeRequest('/api/auth/get/bank-details', { method: 'GET' }),

  // Hospital Discovery Ecosystem
  searchHospitals: (name) => makeRequest('/api/filter/search/hospital-by-name', { method: 'POST', body: { name } }),
  requestAdmission: (organisationId) => makeRequest('/api/hospital/doctor-request-admission', { method: 'POST', body: { organisation_id: organisationId } })
};

// 2. NEW APPOINTMENTS & DOCUMENTS CRUD MAP (doctorEndpoints)
export const doctorEndpoints = {
  // Appointments & Prescriptions
  listAppointments: () => doctorService.listAppointments(),
  getPrescription: (appointmentId) => doctorService.getPrescription(appointmentId),
  updatePrescription: (payload) => doctorService.savePrescription(payload),

  // Appointment Documents CRUD
  getDocumentsByAppointment: (appointmentId) => doctorService.getDocumentsByAppointment(appointmentId),
  getSingleDocument: (documentId) => makeRequest(`/api/appointment/get-document-for/${documentId}`, { method: 'GET' }),
  uploadDocument: (formData) => makeRequest('/api/appointment/upload-appointment-document', { method: 'POST', body: formData }),
  deleteDocument: (documentId) => makeRequest(`/api/appointment/delete-document/${documentId}`, { method: 'DELETE' }),
  replaceDocument: (documentId, formData) => makeRequest(`/api/appointment/replace-document/${documentId}`, { method: 'PUT', body: formData }),
};