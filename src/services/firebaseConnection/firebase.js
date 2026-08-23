// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwHNCA_hP8PA1SIFYNyvpyC8F-3sbTiL8",
  authDomain: "galinheiro-app-e1dfe.firebaseapp.com",
  projectId: "galinheiro-app-e1dfe",
  storageBucket: "galinheiro-app-e1dfe.firebasestorage.app",
  messagingSenderId: "783209694901",
  appId: "1:783209694901:web:23ddc71b0b96393b52a0fc"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export { db }