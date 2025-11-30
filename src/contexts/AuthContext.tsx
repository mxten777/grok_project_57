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
        // Request notification permission and save token
        const token = await requestNotificationPermission();
        if (token) {
          setFcmToken(token);
          // Save token to Firestore
          await setDoc(doc(db, 'users', user.uid), {
            fcmToken: token,
            email: user.email,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      setLoading(false);
    });

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      console.log('Foreground message:', payload);
      // Show notification
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon-192.png'
      });
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout, fcmToken }}>
      {children}
    </AuthContext.Provider>
  );
};