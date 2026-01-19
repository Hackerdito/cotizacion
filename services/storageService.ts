import { Quote } from '../types.ts';

const STORAGE_KEY = 'impresos_uribe_quotes';

// Helper to simulate a delay (optional, makes it feel more "app-like")
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getQuotes = async (): Promise<Quote[]> => {
  await delay(300); // Simulate network
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getQuoteById = async (id: string): Promise<Quote | undefined> => {
  const quotes = await getQuotes();
  return quotes.find((q) => q.id === id);
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  await delay(400); // Simulate network
  const quotes = await getQuotes();
  const existingIndex = quotes.findIndex((q) => q.id === quote.id);

  if (existingIndex >= 0) {
    quotes[existingIndex] = { ...quote, updatedAt: Date.now() };
  } else {
    quotes.push({ ...quote, createdAt: Date.now(), updatedAt: Date.now() });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

export const deleteQuote = async (id: string): Promise<void> => {
  await delay(300);
  const quotes = await getQuotes();
  const filtered = quotes.filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
