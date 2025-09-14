import React, { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import AuthContext from '../../../providers/AuthContext';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setLoggedInUser(user);

        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            const newUser = {
              name: user.displayName || "Usuario de Google",
              email: user.email,
              phone: user.phoneNumber || '',
              subscriptionStatus: 'free',
              points: 1,
            };
            await setDoc(userRef, newUser);
          }

          // Establecer un escucha en tiempo real en el documento del usuario
          unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          });
        } catch (error) {
          console.error('Error al manejar el usuario en Firestore:', error);
        }
      } else {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        setUserData(null);

        if (unsubscribeUserDoc) {
          unsubscribeUserDoc();
          unsubscribeUserDoc = null;
        }
      }
    });

    return () => {
      // Limpiar los escuchas cuando el componente se desmonte
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  const handleLogOut = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setLoggedInUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loggedInUser, userData, handleLogOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
