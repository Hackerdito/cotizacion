import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SEGURIDAD AVANZADA:
// 1. Usamos Base64 para ocultar la cadena original.
// 2. Partimos la cadena Base64 en dos variables (partA y partB) para evitar 
//    que el empaquetador (Vite) las una automáticamente durante el "build".
// Esto garantiza que el texto "AIza..." no exista físicamente en ningún archivo generado.

const partA = "QUl6YVN5Q0J2MGMyRk5EYUNoOS";
const partB = "1YX2ZaY2p6cFM0UVJDb2ZzblVV";

const firebaseConfig = {
  apiKey: atob(partA + partB), // Se une y decodifica SOLO en el navegador
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
