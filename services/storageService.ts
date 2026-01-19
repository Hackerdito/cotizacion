import { Quote } from '../types.ts';
import { db } from './firebase.ts';
import { collection, doc, setDoc, deleteDoc, query, getDocs, orderBy } from "firebase/firestore";

const COLLECTION_NAME = 'quotes';

/**
 * Obtiene todas las cotizaciones de la base de datos una sola vez.
 */
export const getQuotes = async (): Promise<Quote[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      quotes.push({
        ...data,
        id: docSnap.id,
        updatedAt: data.updatedAt || 0,
        createdAt: data.createdAt || 0
      } as Quote);
    });
    
    return quotes;
  } catch (error: any) {
    console.error("Error al obtener cotizaciones:", error);
    throw error;
  }
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  try {
    if (!quote.id) throw new Error("ID no válido");
    const docRef = doc(db, COLLECTION_NAME, quote.id);
    await setDoc(docRef, {
      ...quote,
      updatedAt: Date.now(),
      createdAt: quote.createdAt || Date.now()
    }, { merge: true });
    console.log("Guardado exitoso:", quote.id);
  } catch (error: any) {
    console.error("Error al guardar:", error.code);
    if (error.code === 'permission-denied') {
      alert("No tienes permisos para escribir en la base de datos. Revisa las reglas de seguridad en Firebase.");
    } else {
      alert("Error al guardar la cotización.");
    }
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error al eliminar:", error);
    throw error;
  }
};