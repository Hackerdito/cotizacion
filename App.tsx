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
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Autenticado en Firebase");
        
        // SUSCRIPCIÓN EN TIEMPO REAL
        // Esto reemplaza la carga manual. Cada vez que Firebase cambie, 
        // el estado 'quotes' se actualizará solo.
        unsubscribe = storageService.subscribeToQuotes((data) => {
          setQuotes(data);
          setIsLoading(false);
        });

      } catch (error: any) {
        console.warn("Firebase Auth error", error.code);
        setIsLoading(false);
      }
    };

    init();

    // Limpieza: Cerramos la conexión cuando el componente se destruye
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
        // Al guardar, el listener de useEffect detectará el cambio automáticamente
        // y actualizará la lista en el Dashboard sin que hagamos nada más.
        await storageService.saveQuote(quote);
        setView('dashboard');
    } catch (e) {
        alert("Error al guardar.");
    }
  };

  const handleDeleteQuote = async (id: string) => {
    // Al borrar, desaparecerá de todas las pantallas conectadas al instante
    await storageService.deleteQuote(id);
  };

  const handleCancelEdit = () => {
    setView('dashboard');
    setCurrentQuote(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-sm font-bold tracking-widest animate-pulse">SINCRONIZANDO NUBE...</p>
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