import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
const authApi = axios.create({ baseURL: import.meta.env.VITE_AUTH_BASE_URL });
const verifyApi = axios.create({ baseURL: import.meta.env.VITE_VERIFY_BASE_URL });

// Inject root wildcard token if available
const injectToken = (config) => {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  if (match) {
    config.headers['Authorization'] = `Bearer ${match[2]}`;
  }
  return config;
};

[api, authApi, verifyApi].forEach(instance => instance.interceptors.request.use(injectToken));

export const doctorService = {
  // Profile Data
  getProfile: () => authApi.get('/profile/me'), // Fallback payload retrieval
  updateProfile: (data) => authApi.post('/profile/complete/doctor', data),
  uploadPhoto: (formData) => authApi.post('/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Documents
  getDocuments: () => api.get('/documents/get-documents'),
  uploadDocument: (formData) => api.post('/documents/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Availability
  updateExtraInfo: (data) => authApi.post('/profile/complete/extra-doc-info', data),

  // Verification
  sendEmailOtp: (email) => verifyApi.post('/sendEmailOtp', { email }),
  sendMobileOtp: (phoneNumber) => verifyApi.post('/sendMobileOtp', { phoneNumber }),
  verifyOtp: (payload) => verifyApi.post('/verifyEmailMobile', payload) 
};