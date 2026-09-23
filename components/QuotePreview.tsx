import React, { forwardRef } from 'react';
import { Quote, COMPANY_INFO } from '../types.ts';
import { LOGO_BASE64 } from './logoData.ts';

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
  
  // Calculate total: accurately sum each item's total
  const total = quote.items.reduce((sum, item) => {
    if (item.isUnitPrice && item.unitPrice !== undefined) {
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      return sum + (qty * item.unitPrice);
    }
    return sum + (item.price || 0);
  }, 0);

  return (
    <div ref={ref} className="w-[800px] min-h-[1131px] bg-white relative overflow-hidden text-gray-800 shadow-2xl mx-auto flex flex-col font-sans">
      
      {/* Clean Header with Logo */}
      <div className="bg-white px-12 pt-10 pb-5 flex flex-col items-center border-b border-gray-100 text-center">
        <div className="mb-4 flex items-center justify-center">
            <img 
                src={LOGO_BASE64} 
                alt="Logotipo Impresos Uribe" 
                className="h-28 object-contain"
                onError={(e) => {
                    e.currentTarget.src = "https://cotizacionuribe.netlify.app/logotipo.png";
                }}
            />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e40af] uppercase">
          IMPRESOS URIBE
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm tracking-[0.3em] uppercase mt-2 font-medium">
          SERVICIOS DE IMPRESIÓN PROFESIONAL
        </p>
      </div>

      <div className="flex-grow px-12 py-8 flex flex-col">
        
        {/* Quote Title and Date Section */}
        <div className="flex justify-between items-end mb-10 border-b-2 border-blue-600 pb-4">
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
        <div className="flex justify-between items-start mb-8">
            <div className="w-1/2 pr-4">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">DIRIGIDO A</p>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {quote.clientName || 'Nombre del Cliente'}
                    </h3>
                </div>
            </div>
            <div className="w-1/2 pl-8 text-right">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">CONTACTO</p>
                <div className="space-y-1">
                    <p className="text-gray-900 font-bold text-lg uppercase">{COMPANY_INFO.contactName}</p>
                    <p className="text-gray-600 text-sm">{COMPANY_INFO.phone}</p>
                    <p className="text-gray-600 text-sm">{COMPANY_INFO.email}</p>
                </div>
            </div>
        </div>

        {/* Modern Table */}
        <div className="mb-6">
            <div className="w-full">
                {/* Table Header */}
                <div className="flex items-center bg-[#1e40af] text-white rounded-t-lg py-3 px-4 text-xs font-bold uppercase tracking-wider">
                    <div className="w-10 text-center">No.</div>
                    <div className="w-20 text-center">Cant.</div>
                    <div className="flex-1 px-4">Descripción del Servicio</div>
                    <div className="w-28 text-right">P. Unitario</div>
                    <div className="w-28 text-right">Importe</div>
                </div>
                
                {/* Table Body */}
                <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                    {quote.items.map((item, index) => {
                        const isUnit = Boolean(item.isUnitPrice);
                        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
                        const unitPrice = item.unitPrice !== undefined 
                            ? item.unitPrice 
                            : (isUnit && qty > 0 ? Number((item.price / qty).toFixed(2)) : item.price);
                        const rowTotal = isUnit 
                            ? Number((qty * unitPrice).toFixed(2)) 
                            : (item.price || 0);

                        return (
                            <div key={item.id} className="flex items-center py-4 px-4 border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
                                {/* No. */}
                                <div className="w-10 text-center font-bold text-gray-400 text-sm">
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                                {/* Cantidad */}
                                <div className="w-20 text-center">
                                    <span className="font-bold text-gray-800 text-sm">{qty}</span>
                                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">
                                        {isUnit ? 'unidades' : 'pza'}
                                    </span>
                                </div>

                                {/* Descripción */}
                                <div className="flex-1 px-4">
                                    <p className="text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                        {item.description || 'Sin descripción'}
                                    </p>
                                    {isUnit && (
                                        <div className="mt-1 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                                            <span>{qty} {qty === 1 ? 'unidad' : 'unidades'} a ${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u =</span>
                                            <span className="font-bold text-blue-900">${rowTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Precio Unitario */}
                                <div className="w-28 text-right">
                                    {isUnit ? (
                                        <>
                                            <p className="font-semibold text-gray-700 text-sm">
                                                ${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </p>
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                                C/U
                                            </span>
                                        </>
                                    ) : (
                                        <p className="font-semibold text-gray-600 text-sm">
                                            ${(item.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>

                                {/* Importe / Total de la Fila */}
                                <div className="w-28 text-right">
                                    <p className="font-bold text-gray-900 text-base">
                                        ${rowTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    
                    {quote.items.length === 0 && (
                         <div className="py-12 text-center">
                            <p className="text-gray-400 italic text-sm">Lista de conceptos vacía</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mt-2 mb-6">
            <div className="w-72 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SUBTOTAL</p>
                    <p className="text-2xl font-black text-gray-900">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <p className="text-[10px] text-right text-gray-500 mt-2 italic">
                    * Precios más I.V.A. en caso de requerir factura fiscal.
                </p>
            </div>
        </div>
        
        {/* Notes and Commercial Terms */}
        <div className="mt-auto pt-4 border-t border-gray-200">
            <h4 className="font-black text-[#1e40af] text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                NOTAS Y CONDICIONES COMERCIALES
            </h4>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <p className="text-gray-700 leading-relaxed font-medium mb-3">
                    Esta cotización tiene una vigencia de 15 días hábiles. Quedo a sus órdenes para cualquier duda o comentario, gracias por su confianza.
                </p>

                <div className="border-t border-slate-200 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                            <span className="text-gray-700">
                                <strong className="font-bold text-gray-900">Forma de pago:</strong> 50% anticipo y 50% contra entrega
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                            <span className="text-gray-700">
                                <strong className="font-bold text-gray-900">Precios:</strong> Más IVA
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                            <span className="text-gray-700">
                                <strong className="font-bold text-gray-900">Entrega:</strong> Incluye entrega dentro de la Cd de México
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-6 text-center mt-auto border-t border-gray-200">
          <p className="text-[#1e40af] font-bold text-sm tracking-widest">{COMPANY_INFO.name}</p>
          <p className="text-gray-400 text-xs mt-1">Calidad y Servicio Profesional • Tel: {COMPANY_INFO.phone}</p>
      </div>
    </div>
  );
});

QuotePreview.displayName = 'QuotePreview';
