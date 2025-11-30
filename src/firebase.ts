import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA5AX4ofkp0E5O-A70c3W8qA5tSO5CguXo",
  authDomain: "grok-project-57.firebaseapp.com",
  projectId: "grok-project-57",
  storageBucket: "grok-project-57.firebasestorage.app",
  messagingSenderId: "1016928327488",
  appId: "1:1016928327488:web:c97256e798b2ceb526cca5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const messaging = getMessaging(app);

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // VAPID key will be set later if push notifications are needed
      const token = await getToken(messaging, { vapidKey: 'your-vapid-key-here' });
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });