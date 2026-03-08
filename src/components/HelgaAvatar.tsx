import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export type HelgaMood = 'IDLE' | 'HAPPY' | 'SAD' | 'THINKING' | 'TALKING';

export const HelgaAvatar = ({ 
  isTalking, 
  mood = 'IDLE',
  imageUrl, 
  level = 1,
  size = 'md'
}: { 
  isTalking: boolean, 
  mood?: HelgaMood,
  imageUrl: string | null, 
  level?: number,
  size?: 'sm' | 'md' | 'lg'
}) => {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1;
  
  // Determine effective mood
  const effectiveMood = isTalking ? 'TALKING' : mood;

  const headVariants = {
    IDLE: { y: [0, -2, 0], rotate: [0, 1, 0, -1, 0] },
    HAPPY: { y: [0, -15, 0], scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
    SAD: { y: [0, 5, 0], rotate: [0, -5, 5, 0], opacity: 0.9 },
    THINKING: { rotate: [0, 10, -10, 0], x: [0, 2, -2, 0] },
    TALKING: { y: [0, -8, 0], scale: [1, 1.05, 1] }
  };

  const wingVariants = {
    IDLE: { rotate: [-5, 5, -5], transition: { duration: 0.5, repeat: Infinity } },
    HAPPY: { rotate: [-20, 20, -20], transition: { duration: 0.1, repeat: Infinity } },
    SAD: { rotate: [-2, 2, -2], transition: { duration: 1, repeat: Infinity } },
    THINKING: { rotate: [-10, 10, -10], transition: { duration: 0.3, repeat: Infinity } },
    TALKING: { rotate: [-15, 15, -15], transition: { duration: 0.15, repeat: Infinity } }
  };

  return (
    <div className="relative flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
      {/* Level Badge - Roblox Style */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-12 bg-[#FFD700] border-4 border-[#CCAC00] px-4 py-1 rounded-xl shadow-[0_4px_0_0_#CCAC00] z-30"
      >
        <span className="text-xs font-black text-[#111] uppercase italic">Nível {level}</span>
      </motion.div>

      <div className="relative w-48 h-64 flex flex-col items-center justify-center">
        {/* Roblox Character Structure */}
        
        {/* Head */}
        <motion.div 
          animate={headVariants[effectiveMood]}
          transition={effectiveMood === 'HAPPY' ? { duration: 0.5, repeat: Infinity } : { duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-[#FFD700] rounded-2xl border-8 border-[#CCAC00] shadow-[0_8px_0_0_#CCAC00] z-20 relative flex items-center justify-center overflow-hidden"
        >
          {imageUrl ? (
            <motion.img 
              animate={effectiveMood === 'SAD' ? { filter: 'grayscale(0.5) contrast(0.8)' } : { filter: 'grayscale(0) contrast(1)' }}
              src={imageUrl} 
              alt="Helga" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-4">
                {/* Eyes */}
                <motion.div 
                  animate={
                    effectiveMood === 'HAPPY' ? { scaleY: [1, 0.2, 1], scaleX: 1.2 } :
                    effectiveMood === 'SAD' ? { scaleY: 0.5, y: 2 } :
                    effectiveMood === 'THINKING' ? { x: [-2, 2, -2] } :
                    { scaleY: [1, 1, 0.1, 1, 1] }
                  }
                  transition={{ repeat: Infinity, duration: effectiveMood === 'IDLE' ? 3 : 0.5 }}
                  className="w-3 h-3 bg-[#111] rounded-full" 
                />
                <motion.div 
                  animate={
                    effectiveMood === 'HAPPY' ? { scaleY: [1, 0.2, 1], scaleX: 1.2 } :
                    effectiveMood === 'SAD' ? { scaleY: 0.5, y: 2 } :
                    effectiveMood === 'THINKING' ? { x: [-2, 2, -2] } :
                    { scaleY: [1, 1, 0.1, 1, 1] }
                  }
                  transition={{ repeat: Infinity, duration: effectiveMood === 'IDLE' ? 3 : 0.5 }}
                  className="w-3 h-3 bg-[#111] rounded-full" 
                />
              </div>
              {/* Mouth */}
              <motion.div 
                animate={
                  effectiveMood === 'TALKING' ? { height: [4, 12, 4], width: [24, 32, 24] } :
                  effectiveMood === 'HAPPY' ? { height: 16, width: 40, borderRadius: '0 0 20px 20px' } :
                  effectiveMood === 'SAD' ? { height: 4, width: 20, y: 2 } :
                  { height: 4, width: 32 }
                }
                className="bg-[#111] rounded-full"
              />
            </div>
          )}
        </motion.div>

        {/* Torso */}
        <motion.div 
          animate={effectiveMood === 'HAPPY' ? { y: [0, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
          className="w-32 h-32 bg-[#00A2FF] border-8 border-[#0084D1] rounded-2xl shadow-[0_10px_0_0_#0084D1] -mt-2 z-10 relative overflow-hidden"
        >
          {/* Bee Stripes on Torso */}
          <div className="absolute w-full h-4 bg-[#111]/20 top-1/4" />
          <div className="absolute w-full h-4 bg-[#111]/20 top-2/4" />
          <div className="absolute w-full h-4 bg-[#111]/20 top-3/4" />
          
          {/* Logo/Icon on Torso */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Arms */}
        <motion.div 
          animate={effectiveMood === 'HAPPY' ? { rotate: [-45, -15, -45] } : effectiveMood === 'TALKING' ? { rotate: [-20, 0, -20] } : { rotate: -12 }}
          className="absolute top-28 -left-4 w-10 h-24 bg-[#FFD700] border-8 border-[#CCAC00] rounded-xl shadow-[0_6px_0_0_#CCAC00] origin-top" 
        />
        <motion.div 
          animate={effectiveMood === 'HAPPY' ? { rotate: [45, 15, 45] } : effectiveMood === 'TALKING' ? { rotate: [20, 0, 20] } : { rotate: 12 }}
          className="absolute top-28 -right-4 w-10 h-24 bg-[#FFD700] border-8 border-[#CCAC00] rounded-xl shadow-[0_6px_0_0_#CCAC00] origin-top" 
        />

        {/* Wings (Bee feature) */}
        <motion.div 
          animate={wingVariants[effectiveMood]}
          className="absolute -top-4 -left-16 w-24 h-16 bg-white/40 border-4 border-white/60 rounded-full blur-[1px] -z-10 origin-right"
        />
        <motion.div 
          animate={wingVariants[effectiveMood]}
          className="absolute -top-4 -right-16 w-24 h-16 bg-white/40 border-4 border-white/60 rounded-full blur-[1px] -z-10 origin-left"
        />

        {/* Mood Particles */}
        <AnimatePresence>
          {effectiveMood === 'HAPPY' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-20 flex gap-2"
            >
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [-10, -30], opacity: [1, 0], x: [0, (i - 2) * 20] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="text-2xl"
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          )}
          {effectiveMood === 'SAD' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-10 text-2xl"
            >
              💧
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Zim Zim" particles - Roblox Style */}
        {effectiveMood === 'TALKING' && (
          <motion.div 
            className="absolute -top-12 -right-12 bg-[#FFD700] border-4 border-[#CCAC00] px-4 py-2 rounded-xl shadow-[0_6px_0_0_#CCAC00] z-40"
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: -50, x: 30, scale: 1.2 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-xl font-black text-[#111] uppercase italic">ZIM ZIM!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
