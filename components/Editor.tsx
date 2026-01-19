import React, { useState, useEffect } from 'react';
import { Quote, LineItem } from '../types.ts';
import { Plus, Trash2, Save, ArrowLeft, Download, FileType, Calendar, User, Mail } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';
import { QuotePreview } from './QuotePreview.tsx';
import { EmailModal } from './EmailModal.tsx';

// CONFIGURACIÓN DE EMAILJS
const EMAILJS_SERVICE_ID = 'service_xxtiyrk'; 
const EMAILJS_TEMPLATE_ID = 'template_5p63up8'; 
// Public Key de EmailJS
const EMAILJS_PUBLIC_KEY = '4OfEthgeWXqbw40be'; 

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
  
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const printRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuote) {
      setQuoteName(initialQuote.quoteName || '');
      setClientName(initialQuote.clientName);
      setDate(initialQuote.date);
      setItems(initialQuote.items);
    } else {
      setItems([{ id: uuidv4(), description: '', price: 0, isUnitPrice: false }]);
      setClientName('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [initialQuote]);

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), description: '', price: 0, isUnitPrice: false }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handlePriceChange = (id: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    setItems(items.map((item) => (item.id === id ? { ...item, price: numericValue } : item)));
  };

  const handleSave = async () => {
    if (!clientName) {
        alert("Por favor ingresa el nombre del cliente.");
        return;
    }
    if (!date) {
        alert("Por favor selecciona una fecha.");
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

  // Función optimizada para generar PDF ligero
  const getPdfData = async (isForEmail = false) => {
    if (!printRef.current) return null;
    
    // Esperar a que las fuentes y recursos carguen
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Si es para email, bajamos drásticamente la resolución
    const captureScale = isForEmail ? 1.0 : 1.5; 
    
    const canvas = await html2canvas(printRef.current, {
        scale: captureScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
    });
    
    // Si es para email usamos JPEG con calidad media para entrar en los 50KB
    const imgData = isForEmail 
        ? canvas.toDataURL('image/jpeg', 0.5) 
        : canvas.toDataURL('image/png');
        
    const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true // Activar compresión interna
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Usar formato compatible con compresión
    const format = isForEmail ? 'JPEG' : 'PNG';
    pdf.addImage(imgData, format, 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    const outputBase64 = pdf.output('datauristring').split(',')[1];
    
    // Debug de tamaño en consola
    const sizeInKb = (outputBase64.length * 0.75) / 1024;
    console.log(`Tamaño estimado del PDF: ${sizeInKb.toFixed(2)} KB`);

    return {
        blob: pdf.output('blob'),
        base64: outputBase64,
        fileName: quoteName ? `Cotizacion-${quoteName.replace(/\s+/g, '-')}.pdf` : `Cotizacion-${clientName.replace(/\s+/g, '-')}.pdf`,
        sizeInKb
    };
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
        const pdfData = await getPdfData(false); // Alta calidad para descarga
        if (pdfData) {
            const url = URL.createObjectURL(pdfData.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = pdfData.fileName;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        alert("Hubo un error generando el PDF.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const handleSendEmail = async (emailData: { to: string; subject: string; message: string }) => {
    setIsSendingEmail(true);
    try {
        const pdfData = await getPdfData(true); // Calidad ultra-ligera para EmailJS
        if (!pdfData) throw new Error("No se pudo generar el PDF");

        if (pdfData.sizeInKb > 48) {
             console.warn("El PDF sigue siendo algo grande para EmailJS gratuito.");
        }

        const templateParams = {
            to_email: emailData.to,
            subject: emailData.subject,
            message: emailData.message,
            name: clientName,
            title: quoteName,
            content: pdfData.base64 // Esta variable no debe pesar más de 50KB total con las otras
        };

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        alert(`¡Cotización enviada con éxito a ${emailData.to}!`);
        setIsEmailModalOpen(false);
    } catch (error: any) {
        console.error("EmailJS Error:", error);
        if (error?.status === 413) {
            alert("Error: El archivo es demasiado grande para el plan gratuito de EmailJS. Intenta descargar el PDF y enviarlo manualmente o reduce el texto de la cotización.");
        } else {
            alert(`Error al enviar: ${error?.text || 'Error de conexión o configuración'}`);
        }
    } finally {
        setIsSendingEmail(false);
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
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark] appearance-none"
                            style={{ WebkitAppearance: 'none' }}
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
                            placeholder="Ejemplo: Diana" 
                            className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
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
                    {items.map((item) => (
                        <div key={item.id} className="bg-[#334155] p-4 rounded-2xl border border-gray-600 relative group shadow-lg">
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mb-3 pr-8">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Descripción</label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Producto o servicio..."
                                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Precio</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-blue-400 font-black">$</span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={item.price === 0 ? '' : item.price}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-2 bg-[#1e293b] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="mb-1">
                                     <label className="flex items-center space-x-2 cursor-pointer select-none group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={item.isUnitPrice || false}
                                                onChange={(e) => handleItemChange(item.id, 'isUnitPrice', e.target.checked)}
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors ${item.isUnitPrice ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${item.isUnitPrice ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className={`text-[10px] font-black tracking-tighter ${item.isUnitPrice ? 'text-blue-400' : 'text-gray-400'}`}>
                                            C/U
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-[#0f172a] flex gap-2 safe-bottom">
             <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[1.5] flex justify-center items-center bg-blue-600 text-white px-3 py-4 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 font-black text-xs tracking-widest disabled:opacity-50 active:scale-95"
            >
                {isSaving ? "..." : "GUARDAR"}
            </button>
            <button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                className="flex-1 flex justify-center items-center bg-white text-gray-900 px-3 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg font-black text-xs tracking-widest disabled:opacity-50 active:scale-95"
            >
                {isGeneratingPdf ? "..." : "PDF"}
            </button>
            <button
                onClick={() => setIsEmailModalOpen(true)}
                className="flex-1 flex justify-center items-center bg-[#f97316] text-white px-3 py-4 rounded-xl hover:bg-[#ea580c] transition-colors shadow-lg font-black text-xs tracking-widest active:scale-95"
            >
                <Mail size={18} />
            </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gray-200 justify-center items-start overflow-y-auto p-8">
        <div className="transform scale-[0.6] origin-top shadow-2xl">
            <QuotePreview quote={currentQuoteData} />
        </div>
      </div>

      <EmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        defaultSubject={`Cotización - ${quoteName || clientName}`}
        isSending={isSendingEmail}
      />

      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
         <div className="w-[800px]">
             <QuotePreview ref={printRef} quote={currentQuoteData} />
         </div>
      </div>
    </div>
  );
};