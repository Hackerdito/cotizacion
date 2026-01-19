import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NOTA: Estas claves son públicas por diseño de Firebase.
// Son necesarias para que el navegador se conecte a tu proyecto.
// La seguridad real se maneja en las "Reglas de Firestore" en la consola de Firebase,
// no ocultando estas claves.
const firebaseConfig = {
  apiKey: "AIzaSyCBv0c2FNDaCh9-X_fZcjzpS4QRCofsnUU",
  authDomain: "cotizacion-45836.firebaseapp.com",
  projectId: "cotizacion-45836",
  storageBucket: "cotizacion-45836.firebasestorage.app",
  messagingSenderId: "274641719173",
  appId: "1:274641719173:web:347e9c8c664cb785f4beec",
  measurementId: "G-F1J44FQFGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
export const db = getFirestore(app);
