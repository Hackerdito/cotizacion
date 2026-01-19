import React, { useState } from 'react';
import { Mail, Send, X, Type, MessageSquare } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; message: string }) => void;
  defaultSubject: string;
  isSending: boolean;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSend, defaultSubject, isSending }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('Adjunto envío la cotización solicitada. Quedo a sus órdenes.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({ to, subject, message });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#0f172a] p-6 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2 rounded-xl">
                <Mail className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">ENVIAR COTIZACIÓN</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center text-xs font-bold text-blue-300 mb-2 uppercase tracking-widest">
              Correo del Destinatario
            </label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-blue-300 mb-2 uppercase tracking-widest">
              Asunto
            </label>
            <div className="relative">
                <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-blue-300 mb-2 uppercase tracking-widest">
              Mensaje Personalizado
            </label>
            <div className="relative">
                <MessageSquare size={16} className="absolute left-4 top-4 text-gray-400" />
                <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#334155] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex justify-center items-center bg-[#f97316] text-white py-4 rounded-2xl hover:bg-[#ea580c] transition-all shadow-xl shadow-orange-900/20 font-black tracking-widest disabled:opacity-50 active:scale-95"
            >
              {isSending ? (
                <span className="animate-pulse">ENVIANDO...</span>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  ENVIAR AHORA
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-tighter">
                El PDF se generará y adjuntará automáticamente al envío.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};