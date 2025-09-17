import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Intentar importar variables de entorno
let envVars = {};
try {
    const envImport = require('@env');
    envVars = envImport;
    console.log('✅ Variables de entorno cargadas desde @env');
} catch (error) {
    console.log('⚠️ No se pudieron cargar variables desde @env, usando configuración directa');
}

// Configuración de Firebase - con fallback a valores directos si las variables no se cargan
const firebaseConfig = {
    apiKey: envVars.API_KEY || "AIzaSyD4hrnX3H7h9yMwoGbj5ABoD3NT2o--QYs",
    authDomain: envVars.AUTH_DOMAIN || "evaluacionfirebase20230620.firebaseapp.com",
    projectId: envVars.PROJECT_ID || "evaluacionfirebase20230620",
    storageBucket: envVars.STORAGE_BUCKET || "evaluacionfirebase20230620.firebasestorage.app",
    messagingSenderId: envVars.MESSAGING_SENDER_ID || "1031936584138",
    appId: envVars.APP_ID || "1:1031936584138:web:8bfaa5e8df0cb5dac20733"
};

// Debug de variables cargadas
console.log('🔍 Debug de variables de entorno:');
console.log('API_KEY:', envVars.API_KEY ? '✅ Cargada' : '❌ No cargada');
console.log('AUTH_DOMAIN:', envVars.AUTH_DOMAIN ? '✅ Cargada' : '❌ No cargada');
console.log('PROJECT_ID:', envVars.PROJECT_ID ? '✅ Cargada' : '❌ No cargada');
console.log('STORAGE_BUCKET:', envVars.STORAGE_BUCKET ? '✅ Cargada' : '❌ No cargada');
console.log('MESSAGING_SENDER_ID:', envVars.MESSAGING_SENDER_ID ? '✅ Cargada' : '❌ No cargada');
console.log('APP_ID:', envVars.APP_ID ? '✅ Cargada' : '❌ No cargada');

console.log("📋 Configuración Firebase final:", {
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'No definida',
    authDomain: firebaseConfig.authDomain || 'No definida',
    projectId: firebaseConfig.projectId || 'No definida',
    storageBucket: firebaseConfig.storageBucket || 'No definida',
    messagingSenderId: firebaseConfig.messagingSenderId || 'No definida',
    appId: firebaseConfig.appId ? firebaseConfig.appId.substring(0, 20) + '...' : 'No definida'
});

// Verificar que todas las propiedades estén definidas
const requiredProps = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingProps = requiredProps.filter(prop => !firebaseConfig[prop]);

if (missingProps.length > 0) {
    console.error('❌ Propiedades faltantes en firebaseConfig:', missingProps);
    throw new Error(`Firebase configuration missing: ${missingProps.join(', ')}`);
}

// Inicializar Firebase
let app, database, auth;

try {
    console.log('🚀 Iniciando Firebase...');
    app = initializeApp(firebaseConfig);
    
    // Inicializar servicios
    database = getFirestore(app);
    auth = getAuth(app);
    
    console.log('✅ Firebase inicializado correctamente');
    console.log('✅ Auth disponible:', !!auth);
    console.log('✅ Database disponible:', !!database);
    console.log('✅ Project ID:', firebaseConfig.projectId);
    
} catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    console.error('🔧 Configuración que causó el error:', firebaseConfig);
    throw error;
}

export { database, auth };