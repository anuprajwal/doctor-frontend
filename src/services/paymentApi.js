// src/services/paymentApi.js

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://apis.docapp.co.in';

const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    let responseData = null;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    }

    if (!response.ok) {
      if (
        response.status === 401 ||
        response.status === 403 ||
        responseData?.error === 'jwt expired'
      ) {
        window.location.href = 'https://auth.docapp.co.in';
        return;
      }

      const error = new Error(
        responseData?.message || `HTTP Exception: ${response.status}`
      );

      error.response = {
        data: responseData,
        status: response.status,
      };

      throw error;
    }

    return {
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    if (!error.response) {
      error.message = `Network connectivity layer failure: ${error.message}`;
    }

    throw error;
  }
};

export const paymentService = {
  // Doctor KYC & Onboarding Endpoints

  startOnboarding: (doctorId, payload) =>
    makeRequest(`/api/kyc/doctor/${doctorId}/start-onboarding`, {
      method: 'POST',
      body: payload,
    }),

  getOnboardingStatus: (doctorId) =>
    makeRequest(`/api/kyc/doctor/${doctorId}/onboarding-status`, {
      method: 'GET',
    }),

  // Patient Payment Order Endpoints

  createOrder: (payload) =>
    makeRequest('/api/payment/order', {
      method: 'POST',
      body: payload,
    }),

  verifyPayment: (payload) =>
    makeRequest('/api/payment/verify', {
      method: 'POST',
      body: payload,
    }),
};