import React, { forwardRef } from 'react';
import { Quote, COMPANY_INFO } from '../types.ts';

interface QuotePreviewProps {
  quote: Quote;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({ quote }, ref) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to prevent timezone shifts when parsing YYYY-MM-DD
    const date = new Date(dateString + 'T12:00:00');
    if (isNaN(date.getTime())) return ''; // Return empty if invalid date
    
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date).toUpperCase();
  };

  const formattedDate = formatDate(quote.date);
  
  // Calculate total
  const total = quote.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div ref={ref} className="w-[800px] min-h-[1131px] bg-white relative overflow-hidden text-gray-800 shadow-2xl mx-auto flex flex-col font-sans">
      
      {/* Clean Header with Logo */}
      <div className="bg-white px-12 pt-12 pb-4 flex flex-col items-center border-b border-gray-100">
        <div className="mb-6">
            <img 
                src="https://fileuk.netlify.app/logotipo.png" 
                alt="Impresos Uribe Logo" 
                className="h-32 object-contain"
                crossOrigin="anonymous" // Important for html2canvas
            />
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight uppercase text-[#1e40af]">{COMPANY_INFO.name}</h1>
        <p className="text-gray-500 text-sm tracking-[0.3em] uppercase mt-2 font-medium">Servicios de Impresión Profesional</p>
      </div>

      <div className="flex-grow px-12 py-8">
        
        {/* Quote Title and Date Section */}
        <div className="flex justify-between items-end mb-12 border-b-2 border-blue-600 pb-4">
             <div>
                <h2 className="text-5xl font-black text-gray-800 tracking-tighter">COTIZACIÓN</h2>
                {quote.quoteName && (
                    <p className="text-lg text-blue-600 font-medium italic mt-1">{quote.quoteName}</p>
                )}
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">FECHA DE EMISIÓN</p>
                <p className="text-xl font-bold text-gray-700">{formattedDate || '---'}</p>
             </div>
        </div>

        {/* Client & Contact Info */}
        <div className="flex justify-between items-start mb-10">
            <div className="w-1/2 pr-4">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">DIRIGIDO A</p>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {quote.clientName || 'Nombre del Cliente'}
                    </h3>
                </div>
            </div>
            <div className="w-1/2 pl-8 text-right">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">CONTACTO</p>
                <div className="space-y-1">
                    <p className="text-gray-900 font-bold text-lg uppercase">{COMPANY_INFO.contactName}</p>
                    <p className="text-gray-600 text-sm">{COMPANY_INFO.phone}</p>
                    <p className="text-gray-600 text-sm">{COMPANY_INFO.email}</p>
                </div>
            </div>
        </div>

        {/* Modern Table */}
        <div className="mb-8">
            <div className="w-full">
                {/* Table Header */}
                <div className="flex items-center bg-[#1e40af] text-white rounded-t-lg py-3 px-4">
                    <div className="w-16 font-bold text-xs uppercase tracking-wider text-center">No.</div>
                    <div className="flex-1 font-bold text-xs uppercase tracking-wider pl-4">Descripción del Servicio</div>
                    <div className="w-32 font-bold text-xs uppercase tracking-wider text-right">Precio</div>
                </div>
                
                {/* Table Body */}
                <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                    {quote.items.map((item, index) => (
                        <div key={item.id} className="flex items-start py-5 px-4 border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                            <div className="w-16 text-center font-bold text-gray-400 text-lg">{String(index + 1).padStart(2, '0')}</div>
                            <div className="flex-1 px-4">
                                <p className="text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">{item.description}</p>
                            </div>
                            <div className="w-32 text-right">
                                <p className="font-bold text-gray-700 text-lg">
                                    ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                                {item.isUnitPrice && (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-auto w-fit block mt-1">C/U</span>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {quote.items.length === 0 && (
                         <div className="py-12 text-center">
                            <p className="text-gray-400 italic text-sm">Lista de conceptos vacía</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mt-4">
            <div className="w-64">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">SUBTOTAL</p>
                    <p className="text-xl font-bold text-gray-900">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <p className="text-[10px] text-right text-gray-500 mt-2 italic">
                    * Precios más I.V.A. si requiere factura.
                </p>
            </div>
        </div>
        
        {/* Notes */}
        <div className="mt-16 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-widest mb-2">NOTAS</h4>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                Esta cotización tiene una vigencia de 15 días hábiles. Quedo a sus órdenes para cualquier duda o comentario, gracias por su confianza.
            </p>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-8 text-center mt-auto border-t border-gray-200">
          <p className="text-[#1e40af] font-bold text-sm tracking-widest">{COMPANY_INFO.name}</p>
          <p className="text-gray-400 text-xs mt-1">Calidad y Servicio Profesional</p>
      </div>
    </div>
  );
});

QuotePreview.displayName = 'QuotePreview';
