import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Editor } from './components/Editor.tsx';
import { Quote } from './types.ts';
import * as storageService from './services/storageService.ts';
import { auth, signInAnonymously } from './services/firebase.ts';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Intentar autenticación anónima
        await signInAnonymously(auth);
        console.log("Autenticado en Firebase");
      } catch (error: any) {
        // Si falla por restricción (admin-restricted-operation), no bloqueamos la app
        console.warn("Firebase Auth restringido o deshabilitado. Se intentará continuar sin auth.", error.code);
      } finally {
        // En cualquier caso, intentamos cargar los datos
        await loadQuotes();
      }
    };
    init();
  }, []);

  const loadQuotes = async () => {
    try {
        const data = await storageService.getQuotes();
        setQuotes(data);
    } catch (e) {
        console.error("No se pudieron cargar las cotizaciones:", e);
    } finally {
        setIsLoading(false);
    }
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
    try {
        await storageService.saveQuote(quote);
        await loadQuotes();
        setView('dashboard');
    } catch (e) {
        alert("Error al guardar. Verifica que el inicio de sesión anónimo esté activo en tu consola Firebase.");
    }
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-sm font-bold tracking-widest animate-pulse">CARGANDO...</p>
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