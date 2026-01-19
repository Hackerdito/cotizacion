import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Quote } from './types';
import * as storageService from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load quotes on mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setIsLoading(true);
    const data = await storageService.getQuotes();
    setQuotes(data);
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    setCurrentQuote(null);
    setView('editor');
  };

  const handleEdit = (quote: Quote) => {
    setCurrentQuote(quote);
    setView('editor');
  };

  const handleSaveQuote = async (quote: Quote) => {
    await storageService.saveQuote(quote);
    await loadQuotes();
    setView('dashboard');
  };

  const handleDeleteQuote = async (id: string) => {
    await storageService.deleteQuote(id);
    await loadQuotes();
  };

  const handleCancelEdit = () => {
    setView('dashboard');
    setCurrentQuote(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900">
      {view === 'dashboard' ? (
        <Dashboard
          quotes={quotes}
          onCreate={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDeleteQuote}
        />
      ) : (
        <Editor
          initialQuote={currentQuote}
          onSave={handleSaveQuote}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default App;
