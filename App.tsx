import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Editor } from './components/Editor.tsx';
import { Quote } from './types.ts';
import * as storageService from './services/storageService.ts';
import { auth, signInAnonymously } from './services/firebase.ts';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Función para cargar datos (se puede llamar varias veces)
  const loadQuotes = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await storageService.getQuotes();
      setQuotes(data);
      setHasPermissionError(false);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setHasPermissionError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await signInAnonymously(auth);
      } catch (authError) {
        console.warn("Autenticación no disponible.");
      }
      await loadQuotes();
    };
    init();
  }, [loadQuotes]);

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
      await loadQuotes(); // Refrescar lista después de guardar
      setView('dashboard');
    } catch (e) {
      // Error manejado en el servicio
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      try {
        await storageService.deleteQuote(id);
        await loadQuotes(); // Refrescar lista después de eliminar
      } catch (e) {
        alert("No se pudo eliminar la cotización.");
      }
    }
  };

  if (hasPermissionError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <ShieldAlert className="text-red-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Acceso Denegado</h2>
        <div className="max-w-md bg-slate-800 border border-slate-700 p-6 rounded-3xl text-slate-300 text-sm mb-8 shadow-2xl">
          <p className="mb-4 font-bold text-red-400">Error de permisos en Firebase Firestore.</p>
          <p>Para solucionarlo, ve a las reglas de tu base de datos y asegúrate de permitir lectura/escritura.</p>
          <div className="bg-black/30 p-3 rounded-lg mt-4 font-mono text-xs text-left">
            allow read, write: if true;
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
        >
          <RefreshCw size={18} />
          REINTENTAR
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mb-8"></div>
        <h2 className="text-xl font-black tracking-[0.2em]">IMPRESOS URIBE</h2>
        <p className="text-[10px] text-blue-400 mt-2 uppercase tracking-[0.3em] animate-pulse">Cargando datos...</p>
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
          onRefresh={() => loadQuotes(true)}
          isRefreshing={isRefreshing}
        />
      ) : (
        <Editor
          initialQuote={currentQuote}
          onSave={handleSaveQuote}
          onCancel={() => setView('dashboard')}
        />
      )}
    </div>
  );
};

export default App;