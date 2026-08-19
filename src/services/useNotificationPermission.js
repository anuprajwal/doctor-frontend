// src/utils/useNotificationPermission.js

import { useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const getAuthToken = () => {
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  return match ? match[2] : null;
};

export const useNotificationPermission = () => {
  const isSyncing = useRef(false);

  const saveTokenToBackend = async (token) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.docapp.co.in';
      const response = await fetch(`${baseUrl}/api/notifications/save-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          platform: 'web',
        }),
      });

      if (!response.ok) {
        console.warn('Failed to register FCM token with server:', response.status);
      }
    } catch (err) {
      console.error('Error saving notification token:', err);
    }
  };

  const requestAndSaveToken = async () => {
    if (isSyncing.current || !('Notification' in window)) return;
    isSyncing.current = true;

    try {
      let permission = Notification.permission;

      // Always prompt if not yet granted
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMessaging(app);

        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
          await saveTokenToBackend(currentToken);
        }
      }
    } catch (error) {
      console.warn('Notification permission or token retrieval failed:', error);
    } finally {
      isSyncing.current = false;
    }
  };

  useEffect(() => {
    // Check and prompt on component mount
    requestAndSaveToken();

    // Re-prompt whenever the user focuses back onto the window if permission is not granted
    const handleFocus = () => {
      if (Notification.permission !== 'granted') {
        requestAndSaveToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
};