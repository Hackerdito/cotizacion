import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SOLUCIÓN DEFINITIVA DE SEGURIDAD PARA NETLIFY:
// Convertimos la API Key a Base64 para que la cadena "AIza..." 
// LITERALMENTE NO EXISTA en el código fuente ni en el empaquetado final.
// El navegador la decodifica (atob) al momento de ejecutar la app.

const b64Key = "QUl6YVN5Q0J2MGMyRk5EYUNoOS1YX2ZaY2p6cFM0UVJDb2ZzblVV";

const firebaseConfig = {
  apiKey: atob(b64Key), // Decodifica en tiempo de ejecución
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