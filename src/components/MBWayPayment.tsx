import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, CreditCard, CheckCircle2, RefreshCcw, Loader2, Play } from 'lucide-react';
import { io } from 'socket.io-client';
import { cn } from '../lib/utils';

interface MBWayPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  compact?: boolean;
}

export const MBWayPayment = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  title = "MB WAY", 
  description = "Envia o teu apoio para a Helga!",
  compact = false
}: MBWayPaymentProps) => {
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [phone, setPhone] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const SOUNDS = {
    CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
  };

  useEffect(() => {
    if (paymentId) {
      const socket = io();
      socket.on(`payment_status_${paymentId}`, (data) => {
        if (data.status === 'SUCCESS') {
          playSound(SOUNDS.SUCCESS);
          setStep('SUCCESS');
        }
      });
      return () => { socket.disconnect(); };
    }
  }, [paymentId]);

  const handleCopy = () => {
    navigator.clipboard.writeText('964367978');
    playSound(SOUNDS.CLICK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    playSound(SOUNDS.CLICK);
    if (phone.length < 9) return;
    setStep('PROCESSING');
    try {
      const response = await fetch('/api/mbway/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount })
      });
      const data = await response.json();
      if (data.paymentId) setPaymentId(data.paymentId);
      else throw new Error('Falha ao iniciar pagamento');
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Zim zim! Houve um erro ao processar o teu MB WAY.');
      setStep('INPUT');
    }
  };

  const handleVerify = async () => {
    if (!paymentId) return;
    playSound(SOUNDS.CLICK);
    try {
      const response = await fetch(`/api/mbway/status/${paymentId}`);
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        playSound(SOUNDS.SUCCESS);
        setStep('SUCCESS');
      } else {
        alert('Zim zim! O pagamento ainda está pendente na tua app MB WAY.');
      }
    } catch (error) {
      console.error('Erro ao verificar:', error);
    }
  };

  return (
    <div className={cn("w-full", compact ? "p-0" : "p-4")}>
      <AnimatePresence mode="wait">
        {step === 'INPUT' && (
          <motion.div key="input" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center">
            {!compact && (
              <div className="bg-[#ED1C24] p-5 rounded-3xl shadow-[0_8px_0_0_#A31318] mb-6">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
            )}
            <h2 className={cn("font-black text-gray-800 uppercase mb-2", compact ? "text-xl" : "text-3xl")}>{title}</h2>
            <p className="text-gray-500 font-bold text-sm mb-6 uppercase tracking-tight">{description}</p>
            
            <div className="bg-red-50 p-6 rounded-[32px] border-4 border-red-100 mb-6 shadow-inner w-full">
              <p className="text-gray-500 font-bold text-xs mb-2 uppercase tracking-tight">
                Envia <span className="text-[#ED1C24] font-black">{amount}€</span> para o número:
              </p>
              <div className="bg-white p-4 rounded-2xl border-4 border-[#ED1C24] shadow-[0_6px_0_0_#A31318] flex items-center justify-center gap-3 relative">
                <span className="text-2xl text-[#111] font-black tracking-widest">964 367 978</span>
                <button onClick={handleCopy} className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded font-black uppercase">Copiado!</span>}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 mb-6 w-full">
              <p className="text-[10px] text-gray-400 font-black uppercase mb-2">O teu número para confirmação</p>
              <input type="tel" placeholder="O teu telemóvel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} className="w-full bg-white border-4 border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-center focus:border-[#00A2FF] outline-none shadow-inner" />
            </div>

            <button disabled={phone.length < 9} onClick={handlePay} className="w-full bg-[#ED1C24] disabled:bg-gray-300 disabled:shadow-[0_10px_0_0_#999] hover:bg-[#D11920] text-white font-black text-xl py-5 rounded-3xl shadow-[0_10px_0_0_#A31318] transition-all active:translate-y-1 active:shadow-[0_6px_0_0_#A31318] uppercase">
              Confirmar Envio
            </button>
            {onCancel && (
              <button onClick={onCancel} className="mt-4 text-gray-400 font-black text-xs uppercase hover:text-gray-600 tracking-widest">Cancelar</button>
            )}
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-8 border-gray-100 rounded-full" />
              <motion.div className="absolute inset-0 border-8 border-[#ED1C24] rounded-full border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
              <div className="absolute inset-0 flex items-center justify-center"><Smartphone className="w-8 h-8 text-[#ED1C24]" /></div>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">A aguardar aprovação...</h2>
            <p className="text-gray-500 font-bold mb-8">Aceita o pedido de <span className="text-[#ED1C24]">{amount}€</span> na tua app MB WAY no telemóvel <span className="text-gray-800">{phone}</span>.</p>
            <div className="space-y-4">
              <button onClick={handleVerify} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-widest">
                <RefreshCcw className="w-4 h-4" /> Verificar Pagamento
              </button>
              <button onClick={() => setStep('INPUT')} className="text-gray-400 font-bold text-xs uppercase hover:text-gray-600">Alterar número</button>
            </div>
          </motion.div>
        )}

        {step === 'SUCCESS' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="flex justify-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#00E676] p-6 rounded-full shadow-[0_10px_0_0_#00A344]">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-black text-[#00E676] mb-4 uppercase">PAGO COM SUCESSO!</h2>
            <p className="text-gray-500 font-bold mb-8">Zim zim! O teu apoio foi recebido com sucesso. Obrigado por ajudares a Helga!</p>
            <button onClick={onSuccess} className="w-full bg-[#00A2FF] hover:bg-[#0084D1] text-white font-black text-2xl py-6 rounded-3xl shadow-[0_10px_0_0_#006BA8] transition-all active:translate-y-1 active:shadow-[0_6px_0_0_#006BA8] flex items-center justify-center gap-3 uppercase">
              Continuar <Play className="w-8 h-8 fill-current" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
