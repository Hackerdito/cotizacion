import { Quote } from '../types.ts';
import { db } from './firebase.ts';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";

const COLLECTION_NAME = 'quotes';

export const getQuotes = async (): Promise<Quote[]> => {
  try {
    // Fetch quotes ordered by updated time
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    
    const quotes: Quote[] = [];
    querySnapshot.forEach((doc) => {
      quotes.push(doc.data() as Quote);
    });
    
    return quotes;
  } catch (error) {
    console.error("Error getting quotes from Firebase:", error);
    return [];
  }
};

export const getQuoteById = async (id: string): Promise<Quote | undefined> => {
  const quotes = await getQuotes();
  return quotes.find((q) => q.id === id);
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  try {
    // We use setDoc with merge: true to handle both create and update
    // using the quote.id as the document ID in Firestore
    await setDoc(doc(db, COLLECTION_NAME, quote.id), {
      ...quote,
      updatedAt: Date.now(),
      createdAt: quote.createdAt || Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving quote to Firebase:", error);
    alert("Hubo un error guardando en la nube. Revisa tu conexión.");
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting quote:", error);
    alert("Error al eliminar.");
  }
};
