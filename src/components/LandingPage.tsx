import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';
import { HelgaAvatar } from './HelgaAvatar';
import { MBWayPayment } from './MBWayPayment';

interface LandingPageProps {
  onPaymentSuccess: () => void;
}

export const LandingPage = ({ onPaymentSuccess }: LandingPageProps) => {
  const [step, setStep] = useState<'INFO' | 'PAYMENT'>('INFO');

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const SOUNDS = {
    CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
  };

  return (
    <div className="min-h-screen bg-[#00A2FF] flex flex-col items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Roblox Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Roblox-style Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-xl rotate-12" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-3xl -rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-45" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'INFO' && (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-[0_12px_0_0_#0084D1] max-w-4xl w-full overflow-hidden relative z-10 flex flex-col md:flex-row"
          >
            {/* Game Thumbnail / Left Side */}
            <div className="w-full md:w-1/2 bg-gray-100 p-4 flex flex-col items-center justify-center border-r-4 border-gray-200">
              <div className="w-full aspect-video bg-[#00A2FF] rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="scale-75 md:scale-100 transform group-hover:scale-110 transition-transform duration-500">
                  <HelgaAvatar isTalking={true} imageUrl={null} level={10} />
                </div>
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-black uppercase">
                  v1.0.4 Helga Edition
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                <div className="text-center">
                  <div className="text-gray-400 text-[10px] font-black uppercase">Ativos</div>
                  <div className="text-gray-800 font-black">1.2K+</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-[10px] font-black uppercase">Favoritos</div>
                  <div className="text-gray-800 font-black">45K</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-[10px] font-black uppercase">Visitas</div>
                  <div className="text-gray-800 font-black">2.4M</div>
                </div>
              </div>
            </div>

            {/* Game Info / Right Side */}
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-[#FFD700] text-[#111] text-[10px] font-black px-2 py-0.5 rounded uppercase">Recomendado</span>
                <span className="text-gray-400 text-[10px] font-black uppercase">Criado por: Helga Melga</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 uppercase leading-tight">
                A AVENTURA DA LEITURA <br/>
                <span className="text-[#00A2FF]">E ESCRITA DA HELGA</span>
              </h1>

              <div className="flex-1 space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  <p className="text-sm text-gray-600 font-bold leading-relaxed">
                    Zim zim! Entra no mundo da Helga e aprende a ler e escrever enquanto te divertes! Desafios épicos, anagramas e escrita criativa esperam por ti.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Aventura</span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Educativo</span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Multiplayer</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { playSound(SOUNDS.CLICK); setStep('PAYMENT'); }}
                  onMouseEnter={() => playSound(SOUNDS.HOVER)}
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-white font-black text-2xl py-5 rounded-2xl shadow-[0_8px_0_0_#00A344] transition-all active:translate-y-1 active:shadow-[0_4px_0_0_#00A344] flex items-center justify-center gap-3 group"
                >
                  <Play className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
                  JOGAR (3€)
                </button>
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                  Acesso Vitalício • MB WAY Seguro
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'PAYMENT' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="bg-white rounded-[40px] shadow-[0_20px_0_0_#0084D1] p-8 md:p-12 max-w-md w-full text-center relative z-10 border-4 border-gray-100"
          >
            <MBWayPayment 
              amount={3} 
              onSuccess={onPaymentSuccess} 
              onCancel={() => setStep('INFO')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="mt-12 text-white/60 font-black text-sm tracking-widest uppercase">
        © 2024 A aventura da leitura e escrita da Helga • Helga Melga Games
      </div>
    </div>
  );
};
