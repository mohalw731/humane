'use client'
import { db } from '@/configs/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth';

export default function getName() {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth() || {};

    useEffect(() => {
        const fetchUserName = async () => {
          if (!user?.uid) {
            setLoading(false);
            return;
          }
          
          try {
            console.log("Fetching user data for UID:", user.uid);
            const userDocRef = doc(db, "usersData", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            console.log("Document exists?", userDoc.exists());
            if (userDoc.exists()) {
              const data = userDoc.data();
              console.log("Document data:", data);
              setUserName(data.name || null);
            }
          } catch (error) {
            console.error("Error fetching user name:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserName();
    }, [user?.uid]);

    return { userName, loading };
}