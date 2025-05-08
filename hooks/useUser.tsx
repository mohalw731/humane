'use client';
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import auth, { db } from '@/configs/firebase';

interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
}

export default function useUserData() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'usersData', firebaseUser.uid);
      const unsubscribeUserData = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name || null,
            isAdmin: userData.isAdmin || false,
          });
        } else {
          // If user document doesn't exist, create basic user object
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || null,
            isAdmin: false,
          });
        }
        setLoading(false);
      });

      return () => unsubscribeUserData();
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}