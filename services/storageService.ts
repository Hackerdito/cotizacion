import { Quote } from '../types.ts';
import { db } from './firebase.ts';
import { collection, doc, setDoc, deleteDoc, query, onSnapshot } from "firebase/firestore";

const COLLECTION_NAME = 'quotes';

/**
 * Suscribe a los cambios en la colección de cotizaciones en tiempo real.
 */
export const subscribeToQuotes = (callback: (quotes: Quote[]) => void) => {
  // Quitamos orderBy de la consulta de Firestore para evitar que se oculten 
  // cotizaciones que no tengan el campo 'updatedAt' o problemas de índices.
  const q = query(collection(db, COLLECTION_NAME));
  
  return onSnapshot(q, (querySnapshot) => {
    const quotes: Quote[] = [];
    
    if (querySnapshot.empty) {
      console.log("No hay documentos en la colección 'quotes'");
      callback([]);
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Nos aseguramos de que el ID del documento sea el correcto
      quotes.push({
        ...data,
        id: docSnap.id,
        updatedAt: data.updatedAt || 0,
        createdAt: data.createdAt || 0
      } as Quote);
    });
    
    // Ordenamos en memoria: las más recientes primero
    const sortedQuotes = quotes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    console.log(`Sincronizadas ${sortedQuotes.length} cotizaciones.`);
    callback(sortedQuotes);
  }, (error) => {
    console.error("ERROR CRÍTICO FIREBASE:", error.code, error.message);
    // Si hay un error de permisos o de red, lo avisamos
    if (error.code === 'permission-denied') {
      console.error("Revisa las reglas de seguridad de tu base de datos Firebase.");
    }
  });
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  try {
    const quoteId = quote.id;
    if (!quoteId) throw new Error("ID de cotización no válido");

    const docRef = doc(db, COLLECTION_NAME, quoteId);
    
    // Forzamos los timestamps para que siempre existan
    const dataToSave = {
      ...quote,
      updatedAt: Date.now(),
      createdAt: quote.createdAt || Date.now()
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log("Cotización guardada exitosamente:", quoteId);
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    alert("Error al guardar: verifica tu conexión a internet.");
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log("Cotización eliminada:", id);
  } catch (error) {
    console.error("Error al eliminar de Firebase:", error);
  }
};