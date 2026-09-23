import React, { useState, useEffect } from 'react';
import { Quote, LineItem } from '../types.ts';
import { Plus, Trash2, Save, ArrowLeft, Download, FileType, Calendar, User, Mail, Share2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QuotePreview } from './QuotePreview.tsx';

interface EditorProps {
  initialQuote?: Quote | null;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialQuote, onSave, onCancel }) => {
  const [quoteName, setQuoteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(''); 
  const [items, setItems] = useState<LineItem[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const printRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuote) {
      setQuoteName(initialQuote.quoteName || '');
      setClientName(initialQuote.clientName);
      setDate(initialQuote.date);
      const normalizedItems = (initialQuote.items || []).map(item => {
        const isUnit = Boolean(item.isUnitPrice);
        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
        const unitPrice = item.unitPrice !== undefined 
          ? item.unitPrice 
          : (isUnit ? (item.price > 0 ? Number((item.price / quantity).toFixed(2)) : 0) : item.price);
        const price = isUnit 
          ? Number((quantity * unitPrice).toFixed(2)) 
          : (item.price || 0);
        return {
          ...item,
          isUnitPrice: isUnit,
          quantity,
          unitPrice,
          price
        };
      });
      setItems(normalizedItems);
    } else {
      setItems([{ id: uuidv4(), description: '', price: 0, isUnitPrice: false, quantity: 1, unitPrice: 0 }]);
      setClientName('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [initialQuote]);

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), description: '', price: 0, isUnitPrice: false, quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleToggleUnitPrice = (id: string, isUnitPrice: boolean) => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitP = item.unitPrice !== undefined && item.unitPrice > 0 
        ? item.unitPrice 
        : (item.price > 0 ? Number((item.price / qty).toFixed(2)) : 0);
      const price = isUnitPrice 
        ? Number((qty * unitP).toFixed(2)) 
        : item.price;

      return {
        ...item,
        isUnitPrice,
        quantity: qty,
        unitPrice: unitP,
        price
      };
    }));
  };

  const handleQuantityChange = (id: string, rawVal: string) => {
    const qty = rawVal === '' ? 0 : parseFloat(rawVal);
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      const unitP = item.unitPrice !== undefined ? item.unitPrice : 0;
      const computedTotal = item.isUnitPrice ? Number((qty * unitP).toFixed(2)) : item.price;
      return {
        ...item,
        quantity: qty,
        price: computedTotal
      };
    }));
  };

  const handleUnitPriceChange = (id: string, rawVal: string) => {
    const unitP = rawVal === '' ? 0 : parseFloat(rawVal);
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const computedTotal = Number((qty * unitP).toFixed(2));
      return {
        ...item,
        unitPrice: unitP,
        price: computedTotal
      };
    }));
  };

  const handleDirectPriceChange = (id: string, rawVal: string) => {
    const numericValue = rawVal === '' ? 0 : parseFloat(rawVal);
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        price: numericValue,
        unitPrice: numericValue
      };
    }));
  };

  const handleSave = async () => {
    if (!clientName) {
        alert("Por favor ingresa el nombre del cliente.");
        return;
    }
    setIsSaving(true);
    try {
        const quoteToSave: Quote = {
            id: initialQuote ? initialQuote.id : uuidv4(),
            quoteName: quoteName || 'Cotización General',
            clientName,
            date,
            items,
            createdAt: initialQuote ? initialQuote.createdAt : Date.now(),
            updatedAt: Date.now(),
        };
        await onSave(quoteToSave);
    } catch (e) {
        console.error("Save error", e);
    } finally {
        setIsSaving(false);
    }
  };

  // Generación de PDF (Alta Calidad)
  const getPdfFile = async () => {
    if (!printRef.current) return null;
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(printRef.current, {
        scale: 2, // Mejor calidad para impresión
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    const blob = pdf.output('blob');
    const fileName = quoteName ? `Cotizacion-${quoteName.replace(/\s+/g, '-')}.pdf` : `Cotizacion-${clientName.replace(/\s+/g, '-')}.pdf`;
    
    return new File([blob], fileName, { type: 'application/pdf' });
  };

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
        const file = await getPdfFile();
        if (file) {
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        alert("Error generando PDF.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  // NUEVA FUNCIÓN: COMPARTIR NATIVO (Abre Mail/Outlook/WhatsApp con el PDF adjunto)
  const handleNativeShare = async () => {
    if (!clientName) {
        alert("Primero ingresa el nombre del cliente.");
        return;
    }

    setIsSharing(true);
    try {
        const file = await getPdfFile();
        if (!file) return;

        // Verificar si el navegador soporta compartir archivos (iOS, Mac Safari, Android)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Cotización: ${quoteName || clientName}`,
                text: `Hola, adjunto envío la cotización para ${quoteName || clientName}.`,
            });
        } else {
            // Fallback para navegadores de escritorio que no soportan compartir archivos (Chrome Windows)
            const confirmDownload = confirm("Tu navegador no soporta el envío directo. ¿Deseas descargar el PDF para adjuntarlo manualmente?");
            if (confirmDownload) {
                handleDownload();
            }
        }
    } catch (error: any) {
        // Ignorar si el usuario canceló el menú de compartir
        if (error.name !== 'AbortError') {
            console.error("Error sharing:", error);
            alert("No se pudo abrir el menú de compartir.");
        }
    } finally {
        setIsSharing(false);
    }
  };

  const currentQuoteData: Quote = {
    id: initialQuote?.id || 'temp',
    quoteName: quoteName || 'Nombre del Proyecto',
    clientName: clientName || '',
    date,
    items,
    createdAt: 0,
    updatedAt: 0,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-100">
      <div className="w-full lg:w-1/3 bg-[#1e293b] border-r border-gray-700 flex flex-col h-full shadow-2xl z-20 text-white">
        <div className="px-6 pb-6 border-b border-gray-700 bg-[#0f172a] flex flex-col safe-top">
            <button 
                onClick={onCancel} 
                className="mt-[50px] mb-6 inline-flex items-center self-start bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-xl active:scale-95 group border-2 border-orange-400/20"
            >
                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
                VOLVER AL INICIO
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">
                {initialQuote ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>
            <p className="text-sm text-gray-400">Completa la información a continuación.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="space-y-5">
                <div>
                    <label className="flex items-center text-sm font-semibold text-blue-300 mb-2">
                        <FileType size={14} className="mr-2"/> NOMBRE DEL PROYECTO
                    </label>
                    <input
                        type="text"
                        value={quoteName}
                        onChange={(e) => setQuoteName(e.target.value)}
                        placeholder="Ej. Impresión de Volantes"
                        className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 gap-5">
                     <div>
                        <label className="flex items-center text-sm font-semibold text-blue-300 mb-2">
                            <Calendar size={14} className="mr-2"/> FECHA
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-sm font-semibold text-blue-300 mb-2">
                            <User size={14} className="mr-2"/> CLIENTE
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nombre del cliente" 
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-700/50" />

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">CONCEPTOS</h3>
                    <button
                        onClick={handleAddItem}
                        className="flex items-center text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors font-bold tracking-wider"
                    >
                        <Plus size={14} className="mr-1" /> AGREGAR FILA
                    </button>
                </div>
                
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const isUnit = Boolean(item.isUnitPrice);
                        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
                        const unitP = item.unitPrice !== undefined && item.unitPrice > 0 
                            ? item.unitPrice 
                            : (isUnit && item.price > 0 ? Number((item.price / qty).toFixed(2)) : item.price);
                        const lineTotal = isUnit ? Number((qty * unitP).toFixed(2)) : (item.price || 0);

                        return (
                            <div key={item.id} className="bg-[#334155] p-4 rounded-2xl border border-gray-600 relative group shadow-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider">
                                        CONCEPTO #{String(index + 1).padStart(2, '0')}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Eliminar concepto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1 block">
                                        Descripción del Servicio / Producto
                                    </label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        placeholder="Ej. Tazas personalizadas en cerámica blanca..."
                                        className="w-full px-3 py-2 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Modalidad: Global o Unitario */}
                                <div className="flex items-center justify-between bg-[#1e293b]/70 px-3 py-2 rounded-xl border border-gray-700">
                                    <span className="text-xs font-semibold text-gray-300">
                                        {isUnit ? '¿Cotizar por unidad (C/U)?' : 'Precio Global'}
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <span className={`text-[10px] font-extrabold tracking-tight ${isUnit ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {isUnit ? 'UNITARIO (C/U)' : 'GLOBAL'}
                                        </span>
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={isUnit}
                                                onChange={(e) => handleToggleUnitPrice(item.id, e.target.checked)}
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors ${isUnit ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${isUnit ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {isUnit ? (
                                    <div className="space-y-3 pt-1">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1 block">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="any"
                                                    inputMode="numeric"
                                                    value={item.quantity === undefined || item.quantity === 0 ? '' : item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    placeholder="Ej. 50"
                                                    className="w-full px-3 py-2 bg-[#1e293b] border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1 block">
                                                    P. Unitario ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-blue-400 font-black">$</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        inputMode="decimal"
                                                        value={item.unitPrice === undefined || item.unitPrice === 0 ? '' : item.unitPrice}
                                                        onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                                                        placeholder="20.00"
                                                        className="w-full pl-7 pr-3 py-2 bg-[#1e293b] border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total calculado dinámicamente */}
                                        <div className="bg-blue-950/70 border border-blue-500/40 rounded-xl px-3 py-2.5 flex items-center justify-between">
                                            <span className="text-xs text-blue-200">
                                                {qty} {qty === 1 ? 'unidad' : 'unidades'} × ${unitP.toLocaleString('es-MX', { minimumFractionDigits: 2 })}:
                                            </span>
                                            <div className="text-right">
                                                <span className="text-[10px] text-blue-300 uppercase font-bold mr-1.5">Importe:</span>
                                                <span className="text-base font-black text-white font-mono">
                                                    ${lineTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                                            Precio Total ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-blue-400 font-black">$</span>
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                value={item.price === 0 ? '' : item.price}
                                                onChange={(e) => handleDirectPriceChange(item.id, e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-3 py-2.5 bg-[#1e293b] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-[#0f172a] flex gap-2 safe-bottom">
             <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[1.5] flex justify-center items-center bg-blue-600 text-white px-3 py-4 rounded-xl hover:bg-blue-500 transition-all shadow-xl font-black text-xs tracking-widest disabled:opacity-50 active:scale-95"
            >
                {isSaving ? "..." : "GUARDAR"}
            </button>
            <button
                onClick={handleDownload}
                disabled={isGeneratingPdf}
                className="flex-1 flex justify-center items-center bg-white text-gray-900 px-3 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg font-black text-xs tracking-widest disabled:opacity-50 active:scale-95"
            >
                {isGeneratingPdf ? "..." : "PDF"}
            </button>
            <button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="flex-1 flex justify-center items-center bg-[#f97316] text-white px-3 py-4 rounded-xl hover:bg-[#ea580c] transition-colors shadow-lg font-black text-xs tracking-widest active:scale-95 disabled:opacity-50"
                title="Compartir Cotización"
            >
                {isSharing ? <span className="animate-spin text-lg">◌</span> : <Share2 size={20} />}
            </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gray-200 justify-center items-start overflow-y-auto p-8">
        <div className="transform scale-[0.6] origin-top shadow-2xl">
            <QuotePreview quote={currentQuoteData} />
        </div>
      </div>

      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
         <div className="w-[800px]">
             <QuotePreview ref={printRef} quote={currentQuoteData} />
         </div>
      </div>
    </div>
  );
};