
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Use a MESMA config que você já tem no projeto
const firebaseConfig = {
  apiKey: "AIzaSyCwHNCA_hP8PA1SIFYNyvpyC8F-3sbTiL8",
  authDomain: "galinheiro-app-e1dfe.firebaseapp.com",
  projectId: "galinheiro-app-e1dfe",
  storageBucket: "galinheiro-app-e1dfe.firebasestorage.app",
  messagingSenderId: "783209694901",
  appId: "1:783209694901:web:23ddc71b0b96393b52a0fc"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  // Se o Auth já foi criado (hot reload), reutiliza
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;