import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, requestNotificationPermission, onMessageListener } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  fcmToken: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, logout: async () => {}, fcmToken: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      // Simple admin check - in real app, check custom claims or Firestore
      setIsAdmin(user?.email === 'admin@library.com');

      if (user) {
        // Request notification permission and save token (optional)
        try {
          const token = await requestNotificationPermission();
          if (token) {
            setFcmToken(token);
            // Save token to Firestore
            await setDoc(doc(db, 'users', user.uid), {
              fcmToken: token,
              email: user.email,
              displayName: user.displayName,
              isAdmin: user.email === 'admin@library.com',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          console.warn('FCM token setup failed:', error);
          // Still save basic user info without FCM token
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            isAdmin: user.email === 'admin@library.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      setLoading(false);
    });

    // Listen for foreground messages (optional)
    try {
      onMessageListener().then((payload: any) => {
        console.log('Foreground message:', payload);
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icon-192.png'
          });
        }
      }).catch((error) => {
        console.warn('Message listener setup failed:', error);
      });
    } catch (error) {
      console.warn('Message listener initialization failed:', error);
    }

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout, fcmToken }}>
      {children}
    </AuthContext.Provider>
  );
};