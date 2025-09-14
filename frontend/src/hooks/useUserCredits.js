import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../providers/AuthContext';

export const useUserCredits = () => {
  const [credits, setCredits] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setCredits(0);
        setSubscriptionStatus('free');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCredits(userData.points || 0);
          setSubscriptionStatus(userData.subscriptionStatus || 'free');
        } else {
          console.log('No user document found');
          setCredits(0);
          setSubscriptionStatus('free');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setCredits(0);
        setSubscriptionStatus('free');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const refreshUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCredits(userData.points || 0);
        setSubscriptionStatus(userData.subscriptionStatus || 'free');
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const getUserTypeLabel = () => {
    switch(subscriptionStatus) {
      case 'paid':
        return 'Premium';
      case 'free':
        return 'Free';
      default:
        return 'Básica';
    }
  };

  return { 
    credits, 
    subscriptionStatus, 
    userTypeLabel: getUserTypeLabel(),
    loading, 
    error, 
    refreshUserData 
  };
};
