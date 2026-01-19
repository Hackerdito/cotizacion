import { Quote } from '../types.ts';
import { db } from './firebase.ts';
import { collection, doc, setDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";

const COLLECTION_NAME = 'quotes';

/**
 * Suscribe a los cambios en la colección de cotizaciones en tiempo real.
 * @param callback Función que recibe la lista actualizada de cotizaciones.
 * @returns Función para desuscribirse del listener.
 */
export const subscribeToQuotes = (callback: (quotes: Quote[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
  
  // onSnapshot escucha cambios en la base de datos y ejecuta el callback automáticamente
  return onSnapshot(q, (querySnapshot) => {
    const quotes: Quote[] = [];
    querySnapshot.forEach((doc) => {
      quotes.push(doc.data() as Quote);
    });
    callback(quotes);
  }, (error) => {
    console.error("Error en el listener de Firebase:", error);
  });
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTION_NAME, quote.id), {
      ...quote,
      updatedAt: Date.now(),
      createdAt: quote.createdAt || Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving quote to Firebase:", error);
    alert("Hubo un error guardando en la nube.");
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting quote:", error);
  }
};