import React from 'react';
import { Quote } from '../types.ts';
import { Plus, Edit2, Trash2, FileText, Search, Calendar, User } from 'lucide-react';

interface DashboardProps {
  quotes: Quote[];
  onCreate: () => void;
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ quotes, onCreate, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
        q.clientName.toLowerCase().includes(term) ||
        (q.quoteName && q.quoteName.toLowerCase().includes(term))
    );
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Logo responsivo: más pequeño en móvil (h-9) y normal en escritorio (sm:h-12) */}
                <div className="h-9 sm:h-12 w-auto transition-all">
                    <img 
                        src="/logotipo.png" 
                        alt="Logo" 
                        className="h-full w-auto object-contain"
                    />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">IMPRESOS URIBE</h1>
                    <p className="text-xs text-blue-600 font-semibold tracking-wide mt-0.5">GENERADOR DE COTIZACIONES</p>
                </div>
            </div>
            
            {/* Botón responsivo: padding y texto más pequeño en móvil */}
            <button
                onClick={onCreate}
                className="flex items-center bg-[#1e293b] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl font-medium text-xs sm:text-sm group whitespace-nowrap"
            >
                <Plus size={16} className="mr-1 sm:mr-2 group-hover:rotate-90 transition-transform" />
                Nueva Cotización
            </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats / Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                 <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Mis Cotizaciones</h2>
                 <p className="text-gray-500 mt-1 text-sm sm:text-base">
                    {filteredQuotes.length} {filteredQuotes.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
                 </p>
            </div>
            
            <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar por cliente o proyecto..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Grid */}
        {filteredQuotes.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="text-blue-400 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron cotizaciones</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Comienza creando una nueva cotización o intenta con otra búsqueda.</p>
                <button onClick={onCreate} className="text-blue-600 font-bold hover:underline">Crear nueva cotización</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuotes.map((quote) => (
                    <div 
                        key={quote.id} 
                        onClick={() => onEdit(quote)}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {quote.items.length} Conceptos
                            </div>
                            <span className="text-xs font-medium text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded">
                                <Calendar size={12} className="mr-1" />
                                {new Date(quote.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-gray-900 truncate mb-1">
                                {quote.quoteName || 'Sin Nombre'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <User size={14} className="mr-1.5" />
                                <span className="truncate">{quote.clientName}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Aprox.</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    ${quote.items.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                {/* Botón Editar (Visualmente presente, pero toda la tarjeta funciona) */}
                                <button 
                                    className="p-2 rounded-lg text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                
                                {/* Botón Eliminar: Importante detener la propagación para que no abra el editor */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(confirm('¿Estás seguro de eliminar esta cotización?')) {
                                            onDelete(quote.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};