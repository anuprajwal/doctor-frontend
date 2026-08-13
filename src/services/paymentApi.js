// src/services/paymentApi.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.docapp.co.in';

const paymentApi = axios.create({ baseURL: BASE_URL });

const injectToken = (config) => {
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  if (match) {
    config.headers['Authorization'] = `Bearer ${match[2]}`;
  }
  return config;
};

paymentApi.interceptors.request.use(injectToken);

export const paymentService = {
  // Doctor KYC & Onboarding Endpoints
  startOnboarding: (doctorId, payload) =>
    paymentApi.post(`/api/kyc/doctor/${doctorId}/start-onboarding`, payload),

  getOnboardingStatus: (doctorId) =>
    paymentApi.get(`/api/kyc/doctor/${doctorId}/onboarding-status`),

  // Patient Payment Order Endpoints (For cross-component verification)
  createOrder: (payload) => paymentApi.post('/api/payment/order', payload),
  verifyPayment: (payload) => paymentApi.post('/api/payment/verify', payload)
};