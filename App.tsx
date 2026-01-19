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
        // 1. Autenticación
        await signInAnonymously(auth);
        console.log("Sesión anónima iniciada.");
        
        // 2. Suscripción en tiempo real
        unsubscribe = storageService.subscribeToQuotes((data) => {
          setQuotes(data);
          setIsLoading(false); // Deja de cargar en cuanto recibe el primer paquete (aunque esté vacío)
        });

      } catch (error: any) {
        console.error("Error de inicialización de App:", error);
        setIsLoading(false);
      }
    };

    init();

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
        // Al usar await aquí, nos aseguramos de que se guarde antes de volver
        await storageService.saveQuote(quote);
        // Volvemos al dashboard. El listener de subscribeToQuotes se encargará
        // de pintar la nueva cotización automáticamente.
        setView('dashboard');
    } catch (e) {
        // El error ya lo maneja el service con un alert
    }
  };

  const handleDeleteQuote = async (id: string) => {
    await storageService.deleteQuote(id);
  };

  const handleCancelEdit = () => {
    setView('dashboard');
    setCurrentQuote(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 mb-6"></div>
        <h2 className="text-xl font-black tracking-widest">IMPRESOS URIBE</h2>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest animate-pulse">Sincronizando base de datos...</p>
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