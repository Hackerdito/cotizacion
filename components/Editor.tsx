import React, { useState, useEffect } from 'react';
import { Quote, LineItem } from '../types.ts';
import { Plus, Trash2, Save, ArrowLeft, Download, FileType, Calendar, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuotePreview } from './QuotePreview.tsx';

interface EditorProps {
  initialQuote?: Quote | null;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialQuote, onSave, onCancel }) => {
  const [quoteName, setQuoteName] = useState('');
  const [clientName, setClientName] = useState('');
  // Changed default state to empty string as requested
  const [date, setDate] = useState(''); 
  const [items, setItems] = useState<LineItem[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Ref for the hidden preview used for PDF generation
  const printRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuote) {
      setQuoteName(initialQuote.quoteName || '');
      setClientName(initialQuote.clientName);
      setDate(initialQuote.date);
      setItems(initialQuote.items);
    } else {
      // Default state for new quote
      setItems([{ id: uuidv4(), description: '', price: 0 }]);
      setClientName('');
      setDate('');
    }
  }, [initialQuote]);

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), description: '', price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handlePriceChange = (id: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    setItems(items.map((item) => (item.id === id ? { ...item, price: numericValue } : item)));
  };

  const handleSave = () => {
    if (!clientName) {
        alert("Por favor ingresa el nombre del cliente.");
        return;
    }
    if (!date) {
        alert("Por favor selecciona una fecha.");
        return;
    }

    const quoteToSave: Quote = {
      id: initialQuote ? initialQuote.id : uuidv4(),
      quoteName: quoteName || 'Cotización General',
      clientName,
      date,
      items,
      createdAt: initialQuote ? initialQuote.createdAt : Date.now(),
      updatedAt: Date.now(),
    };
    onSave(quoteToSave);
  };

  const generatePDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
        await document.fonts.ready;
        
        // Wait a moment for images to load (specifically the logo)
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true, // Essential for loading external images like the logo
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = quoteName 
            ? `Cotizacion-${quoteName.replace(/\s+/g, '-')}.pdf` 
            : `Cotizacion-${clientName.replace(/\s+/g, '-')}.pdf`;
            
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF", error);
        alert("Hubo un error generando el PDF.");
    } finally {
        setIsGeneratingPdf(false);
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
      {/* Left Side: Form Controls - Dark Theme for Contrast */}
      <div className="w-full lg:w-1/3 bg-[#1e293b] border-r border-gray-700 flex flex-col h-full shadow-2xl z-20 text-white">
        <div className="p-6 border-b border-gray-700 bg-[#0f172a]">
            <button onClick={onCancel} className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Volver al Tablero
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">
                {initialQuote ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>
            <p className="text-sm text-gray-400">Completa la información a continuación.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* General Info */}
            <div className="space-y-5">
                <div>
                    <label className="flex items-center text-sm font-medium text-blue-300 mb-2">
                        <FileType size={14} className="mr-2"/> Nombre del Proyecto / Cotización
                    </label>
                    <input
                        type="text"
                        value={quoteName}
                        onChange={(e) => setQuoteName(e.target.value)}
                        placeholder="Ej. Impresión de Volantes"
                        className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="flex items-center text-sm font-medium text-blue-300 mb-2">
                            <Calendar size={14} className="mr-2"/> Fecha
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-sm font-medium text-blue-300 mb-2">
                            <User size={14} className="mr-2"/> Cliente
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="" 
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* Line Items */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Conceptos</h3>
                    <button
                        onClick={handleAddItem}
                        className="flex items-center text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Plus size={16} className="mr-1" /> Agregar Fila
                    </button>
                </div>
                
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-[#334155] p-4 rounded-xl border border-gray-600 relative group shadow-sm">
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                                    title="Eliminar fila"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mb-3 pr-8">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Descripción</label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Descripción del producto..."
                                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Precio Unitario</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                    {/* Changed to type="number" but controlled string value to allow empty state */}
                                    <input
                                        type="number"
                                        value={item.price === 0 ? '' : item.price}
                                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-2 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-700 bg-[#0f172a] flex gap-3">
             <button
                onClick={handleSave}
                className="flex-1 flex justify-center items-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 font-bold tracking-wide"
            >
                <Save size={18} className="mr-2" />
                GUARDAR
            </button>
            <button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                className="flex-1 flex justify-center items-center bg-white text-gray-900 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm font-bold disabled:opacity-50"
            >
                {isGeneratingPdf ? 'GENERANDO...' : (
                    <>
                        <Download size={18} className="mr-2" />
                        PDF
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Right Side: Live Preview */}
      <div className="hidden lg:flex flex-1 bg-gray-200 justify-center items-start overflow-y-auto p-8">
        <div className="transform scale-[0.6] origin-top shadow-2xl">
            <QuotePreview quote={currentQuoteData} />
        </div>
      </div>

      {/* Hidden container for PDF generation */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
         <div className="w-[800px]">
             <QuotePreview ref={printRef} quote={currentQuoteData} />
         </div>
      </div>
    </div>
  );
};
