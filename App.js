import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import SplashScreen from './src/screens/SplashScreen';
import Navigation from './src/navigation/Navigation';

// Importamos configuración de Firebase
import './src/config/firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // Listener para cambios de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!isLoading) {
        // Solo log después del splash
        console.log(user ? 'Usuario logueado' : 'Usuario no logueado');
      }
    });

    // Timer para splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <Navigation user={user} />;
}