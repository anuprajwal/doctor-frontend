const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.docapp.co.in';

const getCookieToken = () => {
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const token = getCookieToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
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
      // Graceful redirect to login instead of an infinite reload loop
      if (response.status === 401 || response.status === 403 || (responseData && responseData.error === 'jwt expired')) {
        document.cookie = 'auth_token=; path=/; domain=.docapp.co.in; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = 'https://auth.docapp.co.in'; // Redirect to login
        return;
      }

      const error = new Error(responseData?.message || `HTTP Exception: ${response.status}`);
      error.response = { data: responseData, status: response.status };
      throw error;
    }

    return { data: responseData, status: response.status };
  } catch (error) {
    if (!error.response) {
      error.message = `Network connectivity layer failure: ${error.message}`;
    }
    throw error;
  }
};

export const doctorService = {
  // Profile & Verification Actions
  getUserData: () => makeRequest('/api/auth/get-user-data', { method: 'GET' }),
  updateProfile: (data) => makeRequest('/api/auth/profile/complete/doctor', { method: 'PUT', body: data }),
  uploadPhoto: (formData) => makeRequest('/api/auth/upload-photo', { method: 'POST', body: formData }),
  deletePhoto: () => makeRequest('/api/auth/delete-profile-pic', { method: 'DELETE' }),
  updateExtraInfo: (data) => makeRequest('/api/auth/profile/complete/extra-doc-info', { method: 'PUT', body: data }),
  sendEmailOtp: (email) => makeRequest('/api/verify/sendEmailOtp', { method: 'POST', body: { email } }),
  sendMobileOtp: (phoneNumber) => makeRequest('/api/verify/sendMobileOtp', { method: 'POST', body: { phoneNumber } }),
  verifyOtp: (payload) => makeRequest('/api/verify/verifyEmailMobile', { method: 'PUT', body: payload }),

  // Verification Documents
  getDocuments: () => makeRequest('/api/documents/get-documents', { method: 'GET' }),
  uploadDocument: (formData) => makeRequest('/api/documents/upload-document', { method: 'POST', body: formData }),

  // Appointments & Prescriptions Workflow
  listAppointments: () => makeRequest('/api/appointment/list-appointments', { method: 'GET' }),
  getPrescription: (appointmentId) => makeRequest(`/api/appointment/get-prescription-for/${appointmentId}`, { method: 'GET' }),
  updateAppointment: (payload) => makeRequest('/api/appointment/doctor-update-appointment', { method: 'PUT', body: payload }),

  // Appointment Documents Management
  getDocumentsByAppointment: (appointmentId) => makeRequest(`/api/appointment/get-document-for/${appointmentId}`, { method: 'GET' }),
  uploadAppointmentDocument: (formData) => makeRequest('/api/appointment/upload-appointment-document', { method: 'POST', body: formData }),
  deleteAppointmentDocument: (docId) => makeRequest(`/api/appointment/delete-document/${docId}`, { method: 'DELETE' }),
  replaceAppointmentDocument: (docId, formData) => makeRequest(`/api/appointment/replace-document/${docId}`, { method: 'PUT', body: formData }),

  // Addresses & Banking Setup
  addAddress: (data) => makeRequest('/api/address/addAddress', { method: 'POST', body: data }),
  getAllAddresses: () => makeRequest('/api/address/getAllAddress', { method: 'GET' }),
  updateAddress: (data) => makeRequest('/api/address/updateAddress', { method: 'PUT', body: data }),
  deleteAddress: (addressId) => makeRequest('/api/address/deleteAddress', { method: 'DELETE', body: { addressId } }),
  uploadBankDetails: (data) => makeRequest('/api/auth/upload/bank-details', { method: 'POST', body: data }),

  // Hospital Discovery & Affiliation
  filterHospitals: (type = 'hospital', limit = 10, offset = 0, pincode = '') => {
    const query = new URLSearchParams();
    if (type) query.append('type', type);
    if (limit) query.append('limit', limit);
    if (offset) query.append('offset', offset);
    if (pincode) query.append('pincode', pincode);

    return makeRequest(`/api/filter/filter-hospitals?${query.toString()}`, { method: 'GET' });
  },

  getHospitalDoctors: (organisationId, limit = 10, offset = 0) =>
    makeRequest(`/api/filter/get-hospital-doctors/${organisationId}?limit=${limit}&offset=${offset}`, { method: 'GET' }),

  searchHospitalsByName: (name) => makeRequest('/api/filter/search/hospital-by-name', { method: 'POST', body: { name } }),
  requestAdmission: (organisationId) => makeRequest('/api/hospital/doctor-request-admission', { method: 'POST', body: { organisation_id: organisationId } }),
};