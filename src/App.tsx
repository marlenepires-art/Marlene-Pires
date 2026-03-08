import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  PenTool, 
  MessageCircle, 
  Music, 
  Sparkles, 
  Send, 
  ChevronRight, 
  Trophy,
  Home,
  RefreshCcw,
  Type,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
  X,
  Smartphone,
  ArrowLeftRight,
  ListTodo,
  Plus,
  Trash2,
  CheckCircle2,
  Circle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { helgaChat, generateHelgaImage, helgaSpeak } from './services/helgaService';
import { cn } from './lib/utils';
import { HelgaAvatar, HelgaMood } from './components/HelgaAvatar';
import { LandingPage } from './components/LandingPage';

import { MBWayPayment } from './components/MBWayPayment';

// --- Types ---
type GameState = 'LOBBY' | 'READING' | 'WRITING' | 'CHAT' | 'ANAGRAMS' | 'VOCABULARY';
type AnagramCategory = 'HELGA' | 'ANIMAIS' | 'CORES' | 'NUMEROS';

interface VocabularyChallenge {
  word: string;
  type: 'SYNONYM' | 'ANTONYM';
  options: string[];
  correctAnswer: string;
}

interface TutorialStep {
  title: string;
  text: string;
  targetId?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Zim zim! Bem-vindo!",
    text: "Olá! Eu sou a Helga, a tua nova melhor amiga! Vou ensinar-te como navegar no nosso mundo divertido. Estás pronto?",
    position: 'center'
  },
  {
    title: "O Teu Progresso",
    text: "Aqui em cima podes ver o teu Nível e os teus Pontos! Quanto mais jogares, mais XP ganhas para subir de nível!",
    targetId: "header-stats",
    position: 'bottom'
  },
  {
    title: "Escolhe um Jogo",
    text: "Podes escolher entre Ler histórias, Escrever as tuas próprias aventuras, brincar com os Anagramas ou aprender novas Palavras!",
    targetId: "game-selection",
    position: 'top'
  },
  {
    title: "Fala Comigo!",
    text: "Neste painel podes conversar comigo! Eu respondo a tudo e adoro contar piadas e histórias triquiteiras!",
    targetId: "chat-panel",
    position: 'left'
  },
  {
    title: "Música e clica no som para ouvires",
    text: "Não te esqueças de ligar a música para ouvires a minha canção especial! Clica no som para ouvires! Zim zim zim!",
    targetId: "music-control",
    position: 'bottom'
  },
  {
    title: "Tudo Pronto!",
    text: "Agora que já sabes tudo, vamos começar a brincar? Escolhe um jogo ou fala comigo no chat!",
    position: 'center'
  }
];

interface Challenge {
  id: string;
  type: 'READING' | 'WRITING';
  title: string;
  content: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
}

// --- Constants ---
const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  HOVER: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  LEVEL_UP: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'
};

let globalSfxVolume = 0.5;

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = globalSfxVolume;
  audio.play().catch(e => console.log('Audio play blocked', e));
};

const ANAGRAM_CATEGORIES: Record<AnagramCategory, string[]> = {
  HELGA: ['HELGA', 'MELGA', 'GIRA', 'AMIGA', 'CANTAR', 'FALAR', 'OUVIDO', 'INTELIGENTE', 'TRIQUITEIRA'],
  ANIMAIS: ['ELEFANTE', 'GIRAFA', 'MACACO', 'TARTARUGA', 'BORBOLETA', 'ESQUILO', 'PANDA', 'BALEIA'],
  CORES: ['AMARELO', 'VERMELHO', 'AZUL', 'VERDE', 'LARANJA', 'VIOLETA', 'BRANCO', 'PRETO'],
  NUMEROS: ['UM', 'DOIS', 'TRES', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE', 'DEZ']
};

const shuffleWord = (word: string) => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const shuffled = arr.join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
};
const READING_CHALLENGES: Challenge[] = [
  {
    id: 'r1',
    type: 'READING',
    title: 'A Helga Melga',
    content: 'A Helga é muito gira, mas é uma melga. Ela fala ao ouvido logo de manhã.',
    question: 'O que é que a Helga faz logo de manhã?',
    options: ['Dorme muito', 'Fala ao ouvido', 'Vai para a escola'],
    correctAnswer: 'Fala ao ouvido'
  },
  {
    id: 'r2',
    type: 'READING',
    title: 'Inteligente e Triquiteira',
    content: 'A Helga é inteligente, mas também é triquiteira. Ela é muito faladeira!',
    question: 'Como é a personalidade da Helga?',
    options: ['Calada e triste', 'Inteligente e triquiteira', 'Preguiçosa'],
    correctAnswer: 'Inteligente e triquiteira'
  },
  {
    id: 'r3',
    type: 'READING',
    title: 'A Canção da Helga',
    content: 'Logo de manhã, logo ao acordar, a Helga põe-se a cantar: Zim zim zim zim zim!',
    question: 'O que faz a Helga logo ao acordar?',
    options: ['Põe-se a cantar', 'Põe-se a dormir', 'Põe-se a comer'],
    correctAnswer: 'Põe-se a cantar'
  },
  {
    id: 'r4',
    type: 'READING',
    title: 'Amizade e Compreensão',
    content: 'Quando eu não gosto, não reclamo, compreendo. Eu entendo o jeito da Helga.',
    question: 'O que faz o amigo quando não gosta de algo?',
    options: ['Zanga-se muito', 'Não reclama e compreende', 'Foge da Helga'],
    correctAnswer: 'Não reclama e compreende'
  },
  {
    id: 'r5',
    type: 'READING',
    title: 'A Amiga Helga',
    content: 'Eu tenho uma amiga que se chama Helga. Ela é muito gira, mas é uma melga!',
    question: 'Qual é o nome da amiga?',
    options: ['Maria', 'Helga', 'Ana'],
    correctAnswer: 'Helga'
  },
  {
    id: 'r6',
    type: 'READING',
    title: 'O Jardim da Helga',
    content: 'A Helga adora voar pelo jardim. Ela pousa nas flores coloridas e faz "zim zim zim" enquanto procura néctar.',
    question: 'Onde é que a Helga adora voar?',
    options: ['No jardim', 'Dentro de casa', 'Na escola'],
    correctAnswer: 'No jardim'
  },
  {
    id: 'r7',
    type: 'READING',
    title: 'O Pequeno Almoço',
    content: 'De manhã, a Helga gosta de comer uma gota de mel bem docinha. O mel dá-lhe energia para brincar o dia todo.',
    question: 'O que é que a Helga come de manhã?',
    options: ['Uma maçã', 'Uma gota de mel', 'Um bocado de pão'],
    correctAnswer: 'Uma gota de mel'
  },
  {
    id: 'r8',
    type: 'READING',
    title: 'As Asas da Helga',
    content: 'As asas da Helga são transparentes e brilham ao sol. Quando ela bate as asas depressa, parece um pequeno relâmpago azul.',
    question: 'Como são as asas da Helga?',
    options: ['Grandes e pesadas', 'Transparentes e brilhantes', 'Pretas e baças'],
    correctAnswer: 'Transparentes e brilhantes'
  },
  {
    id: 'r9',
    type: 'READING',
    title: 'A Sesta da Helga',
    content: 'Depois de tanto voar, a Helga fica cansada. Ela gosta de dormir uma sesta em cima de uma folha verde e macia.',
    question: 'Onde é que a Helga dorme a sesta?',
    options: ['Numa cama', 'Em cima de uma folha', 'No chão'],
    correctAnswer: 'Em cima de uma folha'
  },
  {
    id: 'r10',
    type: 'READING',
    title: 'Brincar com as Letras',
    content: 'A Helga é uma abelha muito sábia. Ela ensina os meninos a ler e a escrever palavras divertidas todos os dias.',
    question: 'O que é que a Helga ensina aos meninos?',
    options: ['A ler e a escrever', 'A correr e a saltar', 'A cozinhar'],
    correctAnswer: 'A ler e a escrever'
  },
  {
    id: 'r11',
    type: 'READING',
    title: 'A Helga e o Arco-Íris',
    content: 'Depois da chuva, a Helga viu um arco-íris no céu. Ela tentou voar até às cores para ver se eram feitas de açúcar.',
    question: 'O que é que a Helga viu no céu?',
    options: ['Um avião', 'Um arco-íris', 'Uma nuvem preta'],
    correctAnswer: 'Um arco-íris'
  },
  {
    id: 'r12',
    type: 'READING',
    title: 'O Voo da Helga',
    content: 'A Helga voa muito alto, lá em cima, perto das nuvens. Ela gosta de ver as casas pequeninas lá em baixo.',
    question: 'Como é que a Helga vê as casas lá de cima?',
    options: ['Enormes', 'Pequeninas', 'Coloridas'],
    correctAnswer: 'Pequeninas'
  },
  {
    id: 'r13',
    type: 'READING',
    title: 'A Helga e a Escola',
    content: 'A Helga entrou pela janela da escola e pousou no quadro. Ela escreveu "BOM DIA" com pó de fada.',
    question: 'O que é que a Helga escreveu no quadro?',
    options: ['OLÁ', 'BOM DIA', 'ADEUS'],
    correctAnswer: 'BOM DIA'
  },
  {
    id: 'r14',
    type: 'READING',
    title: 'O Segredo da Helga',
    content: 'A Helga tem um segredo: ela guarda as suas histórias favoritas dentro de uma caixa de fósforos dourada.',
    question: 'Onde é que a Helga guarda as suas histórias?',
    options: ['Num livro', 'Numa caixa de fósforos', 'Debaixo da cama'],
    correctAnswer: 'Numa caixa de fósforos'
  },
  {
    id: 'r15',
    type: 'READING',
    title: 'A Helga e a Lua',
    content: 'À noite, a Helga olha para a lua e pensa que é um queijo gigante. Ela gostava de provar um bocadinho.',
    question: 'O que é que a Helga pensa que a lua é?',
    options: ['Um queijo gigante', 'Uma bola de luz', 'Um espelho'],
    correctAnswer: 'Um queijo gigante'
  }
];

const VOCABULARY_CHALLENGES: VocabularyChallenge[] = [
  { word: 'FELIZ', type: 'SYNONYM', options: ['TRISTE', 'ALEGRE', 'CANSADO'], correctAnswer: 'ALEGRE' },
  { word: 'GRANDE', type: 'ANTONYM', options: ['ENORME', 'PEQUENO', 'ALTO'], correctAnswer: 'PEQUENO' },
  { word: 'RÁPIDO', type: 'SYNONYM', options: ['VELOZ', 'LENTO', 'PARADO'], correctAnswer: 'VELOZ' },
  { word: 'QUENTE', type: 'ANTONYM', options: ['MORNO', 'FRIO', 'ARDENTE'], correctAnswer: 'FRIO' },
  { word: 'BONITO', type: 'SYNONYM', options: ['FEIO', 'LINDO', 'SUJO'], correctAnswer: 'LINDO' },
  { word: 'FORTE', type: 'ANTONYM', options: ['FRÁGIL', 'ROBUSTO', 'DURO'], correctAnswer: 'FRÁGIL' },
  { word: 'SÁBIO', type: 'SYNONYM', options: ['TOLO', 'INTELIGENTE', 'DISTRAÍDO'], correctAnswer: 'INTELIGENTE' },
  { word: 'DIA', type: 'ANTONYM', options: ['TARDE', 'MANHÃ', 'NOITE'], correctAnswer: 'NOITE' },
  { word: 'AMIGO', type: 'SYNONYM', options: ['INIMIGO', 'COMPANHEIRO', 'ESTRANHO'], correctAnswer: 'COMPANHEIRO' },
  { word: 'ALTO', type: 'ANTONYM', options: ['BAIXO', 'COMPRIDO', 'LARGO'], correctAnswer: 'BAIXO' }
];

// --- Components ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [helgaImageUrl, setHelgaImageUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'helga' | 'user', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [helgaMood, setHelgaMood] = useState<'IDLE' | 'HAPPY' | 'SAD' | 'THINKING' | 'TALKING'>('IDLE');
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(() => {
    const saved = localStorage.getItem('helga_challenge_idx');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('helga_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('helga_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  
  const [currentAnagramIdx, setCurrentAnagramIdx] = useState(() => {
    const saved = localStorage.getItem('helga_anagram_idx');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [currentAnagramCategory, setCurrentAnagramCategory] = useState<AnagramCategory>(() => {
    const saved = localStorage.getItem('helga_anagram_category');
    return (saved as AnagramCategory) || 'HELGA';
  });
  const [currentVocabIdx, setCurrentVocabIdx] = useState(() => {
    const saved = localStorage.getItem('helga_vocab_idx');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [shuffledWord, setShuffledWord] = useState('');
  const [anagramGuess, setAnagramGuess] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedPaid = localStorage.getItem('helga_is_paid');
    return savedPaid === 'true';
  });
  const [showTutorial, setShowTutorial] = useState(() => {
    const saved = localStorage.getItem('helga_tutorial_done');
    return saved !== 'true';
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPaid, setIsPaid] = useState(() => {
    const saved = localStorage.getItem('helga_is_paid');
    return saved === 'true';
  });
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('helga_music_volume');
    return saved ? parseFloat(saved) : 0.2;
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    const saved = localStorage.getItem('helga_sfx_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);
  const [tasks, setTasks] = useState<{ id: string, text: string, completed: boolean }[]>(() => {
    const saved = localStorage.getItem('helga_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskInput, setTaskInput] = useState('');
  const [activeTab, setActiveTab] = useState<'CHAT' | 'TASKS'>('CHAT');
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playHelgaAudio = async (text: string) => {
    if (sfxVolume === 0) return;
    
    setHelgaMood('THINKING');
    try {
      // Stop previous audio if playing
      if (audioContextRef.current) {
        try {
          await audioContextRef.current.close();
        } catch (e) {
          console.warn("Error closing previous audio context", e);
        }
      }

      const base64 = await helgaSpeak(text);
      if (!base64) return;

      const audioData = atob(base64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Ensure context is resumed (browsers often start it in suspended state)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const numSamples = Math.floor(arrayBuffer.byteLength / 2);
      const audioBuffer = audioContext.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const int16View = new Int16Array(arrayBuffer);
      
      for (let i = 0; i < numSamples; i++) {
        channelData[i] = int16View[i] / 32768;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = sfxVolume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start();
      
      setIsTalking(true);
      setHelgaMood('TALKING');
      
      source.onended = () => {
        setIsTalking(false);
        setHelgaMood('IDLE');
        audioContext.close().catch(() => {});
        if (audioContextRef.current === audioContext) {
          audioContextRef.current = null;
        }
      };
    } catch (e) {
      console.error("Error playing Helga audio", e);
      setIsTalking(false);
      setHelgaMood('IDLE');
    }
  };

  useEffect(() => {
    const handleInteraction = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (isMusicPlaying && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [isMusicPlaying]);

  useEffect(() => {
    localStorage.setItem('helga_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('helga_xp', xp.toString());
    const oldLevel = Math.floor((xp - 20) / 100) + 1; // Check if just leveled up
    if (level > oldLevel && xp > 0) {
      playSound(SOUNDS.LEVEL_UP);
      setShowLevelUpToast(true);
      setTimeout(() => setShowLevelUpToast(false), 4000);
      const msg = `ZIM ZIM ZIM!!! 🎊 Subiste para o **NÍVEL ${level}**! Ganhaste um novo acessório! Estás cada vez mais incrível!`;
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
    }
  }, [xp, level]);

  useEffect(() => {
    localStorage.setItem('helga_challenge_idx', currentChallengeIdx.toString());
  }, [currentChallengeIdx]);

  useEffect(() => {
    localStorage.setItem('helga_anagram_idx', currentAnagramIdx.toString());
    localStorage.setItem('helga_anagram_category', currentAnagramCategory);
  }, [currentAnagramIdx, currentAnagramCategory]);

  useEffect(() => {
    localStorage.setItem('helga_vocab_idx', currentVocabIdx.toString());
  }, [currentVocabIdx]);

  useEffect(() => {
    if (!isPaid) return;

    const loadImage = async () => {
      try {
        const url = await generateHelgaImage();
        if (url) {
          setHelgaImageUrl(url);
          setApiError(null);
        } else {
          setApiError("A Helga está a descansar a sua imagem (Limite de API). Usando avatar de reserva!");
        }
      } catch (err) {
        setApiError("Erro ao carregar imagem.");
      }
    };
    loadImage();

    // Initial greeting with short delay
    setIsTyping(true);
    const timer = setTimeout(() => {
      const msg = 'Zim zim zim! 🐝 Olá amiguinho! Eu sou a Helga, a tua nova melhor amiga! Estás pronto para brincar com as letras? Eu sou muito gira e triquiteira, hehehe! Vamos ler ou escrever?';
      setMessages([{ role: 'helga', text: msg }]);
      setIsTyping(false);
      playHelgaAudio(msg);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPaid]);

  useEffect(() => {
    if (gameState === 'ANAGRAMS') {
      const words = ANAGRAM_CATEGORIES[currentAnagramCategory];
      setShuffledWord(shuffleWord(words[currentAnagramIdx]));
      setAnagramGuess('');
    }
  }, [gameState, currentAnagramIdx, currentAnagramCategory]);

  useEffect(() => {
    localStorage.setItem('helga_music_volume', musicVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('helga_sfx_volume', sfxVolume.toString());
    globalSfxVolume = sfxVolume;
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem('helga_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (audioRef.current) {
      const MUSIC_TRACKS = {
        LOBBY: "https://assets.mixkit.co/active_storage/audio/281/281-preview.mp3",
        READING: "https://assets.mixkit.co/active_storage/audio/1769/1769-preview.mp3",
        WRITING: "https://assets.mixkit.co/active_storage/audio/1769/1769-preview.mp3",
        ANAGRAMS: "https://assets.mixkit.co/active_storage/audio/251/251-preview.mp3",
        VOCABULARY: "https://assets.mixkit.co/active_storage/audio/251/251-preview.mp3",
        CHAT: "https://assets.mixkit.co/active_storage/audio/278/278-preview.mp3"
      };
      
      const newSrc = MUSIC_TRACKS[gameState];

      if (audioRef.current.src !== newSrc) {
        audioRef.current.src = newSrc;
        if (isMusicPlaying) {
          audioRef.current.play().catch(e => console.log("Playback error:", e));
        }
      }
    }
  }, [gameState, isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked or error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText;
    playSound(SOUNDS.CLICK);
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await helgaChat(userMsg, `O jogador está no modo ${gameState}.`);
    if (gameState === 'WRITING') {
      playSound(SOUNDS.VICTORY);
    }
    setMessages(prev => [...prev, { role: 'helga', text: response }]);
    setIsTyping(false);
    playHelgaAudio(response);
  };

  const handleAnagramSubmit = () => {
    playSound(SOUNDS.CLICK);
    const words = ANAGRAM_CATEGORIES[currentAnagramCategory];
    const target = words[currentAnagramIdx];
    if (anagramGuess.toUpperCase() === target) {
      playSound(SOUNDS.CORRECT);
      setScore(s => s + 15);
      setXp(x => x + 25);
      const msg = `Zim zim! Acertaste! A palavra era mesmo **${target}**! És um génio das letras! (+25 XP)`;
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
      if (currentAnagramIdx < words.length - 1) {
        setCurrentAnagramIdx(prev => prev + 1);
      } else {
        playSound(SOUNDS.VICTORY);
        const completeMsg = `Zim zim! Completaste todos os anagramas de **${currentAnagramCategory}**! Estás de parabéns!`;
        setMessages(prev => [...prev, { role: 'helga', text: completeMsg }]);
        playHelgaAudio(completeMsg);
        setCurrentAnagramIdx(0);
      }
    } else {
      playSound(SOUNDS.WRONG);
      const failMsg = 'Ohhh... zim zim... essa não é a palavra certa. Tenta baralhar as letras outra vez!';
      setMessages(prev => [...prev, { role: 'helga', text: failMsg }]);
      playHelgaAudio(failMsg);
    }
    setAnagramGuess('');
  };
  const handleAnswer = (answer: string) => {
    playSound(SOUNDS.CLICK);
    const challenge = READING_CHALLENGES[currentChallengeIdx];
    if (answer === challenge.correctAnswer) {
      playSound(SOUNDS.CORRECT);
      setScore(s => s + 10);
      setXp(x => x + 20);
      const msg = 'Zim zim! Acertaste em cheio! És muito inteligente, quase tanto como eu! (+20 XP)';
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
      if (currentChallengeIdx < READING_CHALLENGES.length - 1) {
        setTimeout(() => setCurrentChallengeIdx(prev => prev + 1), 2000);
      } else {
        playSound(SOUNDS.VICTORY);
        setTimeout(() => setGameState('LOBBY'), 3000);
      }
    } else {
      playSound(SOUNDS.WRONG);
      const failMsg = 'Ohhh... zim zim... tenta outra vez! Eu sei que consegues!';
      setMessages(prev => [...prev, { role: 'helga', text: failMsg }]);
      playHelgaAudio(failMsg);
    }
  };

  const handleVocabAnswer = (answer: string) => {
    playSound(SOUNDS.CLICK);
    const challenge = VOCABULARY_CHALLENGES[currentVocabIdx];
    if (answer === challenge.correctAnswer) {
      playSound(SOUNDS.CORRECT);
      setScore(s => s + 15);
      setXp(x => x + 25);
      const msg = `ZIM ZIM! Exatamente! O ${challenge.type === 'SYNONYM' ? 'sinónimo' : 'antónimo'} de **${challenge.word}** é **${challenge.correctAnswer}**! (+25 XP)`;
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
      
      if (currentVocabIdx < VOCABULARY_CHALLENGES.length - 1) {
        setTimeout(() => setCurrentVocabIdx(v => v + 1), 2000);
      } else {
        playSound(SOUNDS.VICTORY);
        const completeMsg = 'Zim zim! Completaste todos os desafios de vocabulário! Estás a ficar um mestre das palavras!';
        setMessages(prev => [...prev, { role: 'helga', text: completeMsg }]);
        playHelgaAudio(completeMsg);
        setTimeout(() => setGameState('LOBBY'), 3000);
      }
    } else {
      playSound(SOUNDS.WRONG);
      const failMsg = 'Ohhh... zim zim... essa não é a palavra certa. Tenta pensar noutra!';
      setMessages(prev => [...prev, { role: 'helga', text: failMsg }]);
      playHelgaAudio(failMsg);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Zim zim! Queres mesmo apagar todo o teu progresso e começar do zero?')) {
      setScore(0);
      setXp(0);
      setCurrentChallengeIdx(0);
      setCurrentAnagramIdx(0);
      setCurrentVocabIdx(0);
      setCurrentAnagramCategory('HELGA');
      setTasks([]);
      localStorage.clear();
      const msg = 'Zim zim! Tudo limpo! Vamos começar uma nova aventura!';
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
    }
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    playSound(SOUNDS.CLICK);
    const newTask = {
      id: Date.now().toString(),
      text: taskInput.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setTaskInput('');
    const msg = `Zim zim! Adicionei a tarefa: **${newTask.text}**! Vamos a isso!`;
    setMessages(prev => [...prev, { role: 'helga', text: msg }]);
    playHelgaAudio(msg);
  };

  const toggleTask = (id: string) => {
    playSound(SOUNDS.CLICK);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState) {
          playSound(SOUNDS.CORRECT);
          setXp(x => x + 5);
          setScore(s => s + 5);
        }
        return { ...t, completed: newState };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    playSound(SOUNDS.CLICK);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleNextTutorial = () => {
    playSound(SOUNDS.CLICK);
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('helga_tutorial_done', 'true');
      const msg = "Zim zim! O guia terminou! Agora diverte-te a explorar a aventura da leitura e escrita da Helga!";
      setMessages(prev => [...prev, { role: 'helga', text: msg }]);
      playHelgaAudio(msg);
    }
  };

  const handleSkipTutorial = () => {
    playSound(SOUNDS.CLICK);
    setShowTutorial(false);
    localStorage.setItem('helga_tutorial_done', 'true');
  };

  if (!isPaid) {
    return (
      <LandingPage 
        onPaymentSuccess={() => {
          setIsPaid(true);
          localStorage.setItem('helga_is_paid', 'true');
          setIsMusicPlaying(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E5E8] font-sans text-slate-900 flex flex-col overflow-hidden relative">
      {/* Roblox Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Header */}
      <header className="bg-white border-b-4 border-gray-200 p-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-xl shadow-inner">
            <Sparkles className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-black tracking-tight text-sky-900 uppercase">A aventura da leitura e escrita da Helga</h1>
            <p className="text-[10px] sm:text-xs text-sky-600 font-bold uppercase tracking-widest">Plataforma Educativa</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* MBWay Payment Button */}
          <button 
            onClick={() => { playSound(SOUNDS.CLICK); setShowPaymentModal(true); }}
            onMouseEnter={() => playSound(SOUNDS.HOVER)}
            className="flex items-center gap-2 bg-[#ED1C24] hover:bg-[#D11920] text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-[0_4px_0_0_#A31318] active:translate-y-1 active:shadow-none transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Apoiar Helga</span>
            <span className="sm:hidden">MBWAY</span>
          </button>

          <div id="music-control" className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm">
            <button 
              onClick={() => { 
                playSound(SOUNDS.CLICK); 
                const nextState = !isMusicPlaying;
                setIsMusicPlaying(nextState);
                if (nextState && messages.length > 0) {
                  const lastHelgaMsg = [...messages].reverse().find(m => m.role === 'helga');
                  if (lastHelgaMsg) playHelgaAudio(lastHelgaMsg.text);
                }
              }}
              onMouseEnter={() => playSound(SOUNDS.HOVER)}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center gap-2",
                isMusicPlaying 
                  ? "bg-yellow-400 text-yellow-900 shadow-[0_4px_0_0_#B8860B]" 
                  : "bg-slate-200 text-slate-500 border-slate-300 border-2"
              )}
              title={isMusicPlaying ? "Pausar Música" : "Tocar Música"}
            >
              {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="text-[10px] font-black uppercase hidden min-[600px]:inline">clica no som para ouvires</span>
            </button>
            
            <div className="flex items-center gap-3 px-2 bg-slate-50 rounded-xl py-1 border border-slate-100">
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setShowSettings(true); }}
                className="text-slate-400 hover:text-sky-600 transition-colors"
                title="Definições de clica no som para ouvires"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={musicVolume} 
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-20 md:w-24 h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-500 border-2 border-white shadow-inner"
                    title="Volume da Música"
                  />
                </div>
                <span className="text-[10px] font-black text-sky-600 w-8 tabular-nums">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div id="header-stats" className="flex items-center gap-2 bg-sky-100 px-3 py-1.5 rounded-full relative group">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="font-bold text-sky-900">{score}</span>
            <button 
              onClick={() => { playSound(SOUNDS.CLICK); handleResetProgress(); }}
              onMouseEnter={() => playSound(SOUNDS.HOVER)}
              className="absolute -bottom-8 right-0 bg-red-100 text-red-600 text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold border border-red-200"
            >
              LIMPAR TUDO
            </button>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-700 uppercase">Nível {level}</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <motion.div 
                  className="h-full bg-linear-to-r from-yellow-400 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-medium">{xpInCurrentLevel}/100 XP</span>
          </div>
          <button 
            onClick={() => { playSound(SOUNDS.CLICK); setGameState('LOBBY'); }}
            onMouseEnter={() => playSound(SOUNDS.HOVER)}
            className="p-2 hover:bg-sky-100 rounded-full transition-colors"
          >
            <Home className="w-6 h-6 text-sky-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* Left Side: Helga & World View */}
        <div className="flex-none md:flex-1 min-h-[300px] md:min-h-0 flex flex-col items-center justify-center p-4 md:p-8 bg-linear-to-b from-sky-300 via-yellow-100 to-emerald-200 relative overflow-hidden border-b md:border-b-0 border-sky-200">
          {/* Background Elements */}
          <div className="absolute top-4 left-4 w-24 h-24 bg-white/40 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 right-4 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl" />
          
          <HelgaAvatar 
            isTalking={isTyping || isTalking} 
            mood={isTyping ? 'THINKING' : helgaMood}
            imageUrl={helgaImageUrl}
            level={level}
          />

          {apiError && !helgaImageUrl && (
            <div className="mt-2 text-[10px] text-sky-600/60 font-medium bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
              {apiError}
            </div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 md:mt-8 bg-white p-6 rounded-[32px] shadow-[0_12px_0_0_#EEE] border-4 border-gray-100 max-w-md w-full relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-l-4 border-t-4 border-gray-100 rotate-45" />
            <div className="max-h-32 md:max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-base md:text-xl font-black leading-tight text-slate-700 uppercase tracking-tight">
                "{messages[messages.length - 1]?.text}"
              </p>
            </div>
          </motion.div>

          {/* Game Selection (Only in Lobby) - More compact on mobile */}
          {gameState === 'LOBBY' && (
            <div id="game-selection" className="mt-6 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 w-full max-w-3xl px-4">
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setGameState('READING'); }}
                onMouseEnter={() => playSound(SOUNDS.HOVER)}
                className="group bg-[#00A2FF] p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_0_0_#0084D1] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0084D1] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <span className="font-black text-xs md:text-xl text-white uppercase tracking-tight">Ler</span>
              </button>
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setGameState('WRITING'); }}
                onMouseEnter={() => playSound(SOUNDS.HOVER)}
                className="group bg-[#00E676] p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_0_0_#00A344] hover:translate-y-1 hover:shadow-[0_4px_0_0_#00A344] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                  <PenTool className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <span className="font-black text-xs md:text-xl text-white uppercase tracking-tight">Escrever</span>
              </button>
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setGameState('ANAGRAMS'); }}
                onMouseEnter={() => playSound(SOUNDS.HOVER)}
                className="group bg-[#FFD700] p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_0_0_#CCAC00] hover:translate-y-1 hover:shadow-[0_4px_0_0_#CCAC00] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                  <Type className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <span className="font-black text-xs md:text-xl text-[#111] uppercase tracking-tight">Letras</span>
              </button>
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setGameState('VOCABULARY'); }}
                onMouseEnter={() => playSound(SOUNDS.HOVER)}
                className="group bg-[#FF6B6B] p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_0_0_#D64545] hover:translate-y-1 hover:shadow-[0_4px_0_0_#D64545] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                  <ArrowLeftRight className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <span className="font-black text-xs md:text-xl text-white uppercase tracking-tight">Palavras</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Panel */}
        <div id="chat-panel" className="w-full md:w-[450px] bg-white border-l-4 border-gray-200 flex flex-col shadow-2xl z-10">
          <AnimatePresence mode="wait">
            {gameState === 'READING' && (
              <motion.div 
                key="reading"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex-1 p-6 flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 text-sky-600 font-bold uppercase text-sm tracking-widest">
                  <BookOpen className="w-4 h-4" />
                  Desafio de Leitura
                </div>
                
                <div className="bg-gray-100 p-6 rounded-3xl border-4 border-gray-200 shadow-inner">
                  <h3 className="text-xl font-black text-gray-800 mb-4 uppercase">{READING_CHALLENGES[currentChallengeIdx].title}</h3>
                  <p className="text-lg leading-relaxed text-slate-700 font-bold">
                    {READING_CHALLENGES[currentChallengeIdx].content}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="font-black text-slate-900 uppercase tracking-tight">{READING_CHALLENGES[currentChallengeIdx].question}</p>
                  {READING_CHALLENGES[currentChallengeIdx].options?.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      onMouseEnter={() => playSound(SOUNDS.HOVER)}
                      className="w-full p-5 text-left bg-white border-4 border-gray-100 rounded-3xl shadow-[0_6px_0_0_#EEE] hover:border-[#00A2FF] hover:bg-sky-50 transition-all flex items-center justify-between group active:translate-y-1 active:shadow-none"
                    >
                      <span className="font-black text-slate-700 uppercase">{option}</span>
                      <ChevronRight className="w-6 h-6 text-sky-300 group-hover:text-[#00A2FF] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {gameState === 'WRITING' && (
              <motion.div 
                key="writing"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex-1 p-6 flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 text-[#00E676] font-black uppercase text-sm tracking-widest">
                  <PenTool className="w-4 h-4" />
                  Laboratório de Escrita
                </div>

                <div className="bg-gray-100 p-6 rounded-3xl border-4 border-gray-200 shadow-inner italic text-gray-700 font-bold">
                  "Zim zim! Escreve uma pequena história sobre o que a Helga faz logo de manhã. Eu vou ler tudo com muita atenção!"
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Era uma vez a Helga..."
                    className="flex-1 p-6 bg-white border-4 border-gray-100 rounded-3xl focus:border-[#00E676] focus:outline-none resize-none text-lg font-bold shadow-inner"
                  />
                  <button 
                    onClick={handleSendMessage}
                    onMouseEnter={() => playSound(SOUNDS.HOVER)}
                    disabled={isTyping || !inputText.trim()}
                    className="bg-[#00E676] text-white p-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:translate-y-1 hover:shadow-[0_4px_0_0_#00A344] active:translate-y-2 active:shadow-none transition-all shadow-[0_8px_0_0_#00A344] uppercase tracking-tight"
                  >
                    {isTyping ? 'A Helga está a ler...' : 'Enviar para a Helga'}
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'VOCABULARY' && (
              <motion.div 
                key="vocabulary"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex-1 p-6 flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 text-[#FF6B6B] font-black uppercase text-sm tracking-widest">
                  <ArrowLeftRight className="w-4 h-4" />
                  Laboratório de Palavras
                </div>

                <div className="bg-gray-100 p-8 rounded-[40px] border-4 border-gray-200 flex flex-col items-center gap-4 shadow-inner">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white",
                    VOCABULARY_CHALLENGES[currentVocabIdx].type === 'SYNONYM' ? "bg-sky-500" : "bg-orange-500"
                  )}>
                    {VOCABULARY_CHALLENGES[currentVocabIdx].type === 'SYNONYM' ? 'Qual é o Sinónimo?' : 'Qual é o Antónimo?'}
                  </span>
                  <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">
                    {VOCABULARY_CHALLENGES[currentVocabIdx].word}
                  </h3>
                </div>

                <div className="space-y-4">
                  {VOCABULARY_CHALLENGES[currentVocabIdx].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleVocabAnswer(option)}
                      onMouseEnter={() => playSound(SOUNDS.HOVER)}
                      className="w-full p-5 text-left bg-white border-4 border-gray-100 rounded-3xl shadow-[0_6px_0_0_#EEE] hover:border-[#FF6B6B] hover:bg-red-50 transition-all flex items-center justify-between group active:translate-y-1 active:shadow-none"
                    >
                      <span className="font-black text-slate-700 uppercase">{option}</span>
                      <ChevronRight className="w-6 h-6 text-red-200 group-hover:text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                <div className="mt-auto bg-red-50 p-4 rounded-2xl border-2 border-red-100">
                  <p className="text-xs text-red-600 font-bold italic text-center">
                    "Zim zim! Sabias que {VOCABULARY_CHALLENGES[currentVocabIdx].type === 'SYNONYM' ? 'sinónimos são palavras com o mesmo significado' : 'antónimos são palavras com significados opostos'}?"
                  </p>
                </div>
              </motion.div>
            )}

            {gameState === 'ANAGRAMS' && (
              <motion.div 
                key="anagrams"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex-1 p-6 flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 text-[#FFD700] font-black uppercase text-sm tracking-widest">
                  <Type className="w-4 h-4" />
                  Laboratório de Anagramas
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {(Object.keys(ANAGRAM_CATEGORIES) as AnagramCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        playSound(SOUNDS.CLICK);
                        setCurrentAnagramCategory(cat);
                        setCurrentAnagramIdx(0);
                      }}
                      onMouseEnter={() => playSound(SOUNDS.HOVER)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-4 uppercase tracking-tighter",
                        currentAnagramCategory === cat 
                          ? "bg-[#FFD700] border-[#CCAC00] text-[#111] shadow-[0_4px_0_0_#CCAC00]" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-100 p-8 rounded-[40px] border-4 border-gray-200 flex flex-col items-center gap-6 shadow-inner">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {shuffledWord.split('').map((letter, i) => (
                      <motion.div 
                        key={`${currentAnagramIdx}-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-12 h-12 bg-white border-4 border-gray-200 rounded-2xl flex items-center justify-center text-2xl font-black text-[#00A2FF] shadow-[0_6px_0_0_#EEE]"
                      >
                        {letter}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 font-bold italic uppercase tracking-tight">"Zim zim! Consegues descobrir que palavra é esta?"</p>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text"
                    value={anagramGuess}
                    onChange={(e) => setAnagramGuess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnagramSubmit()}
                    placeholder="Escreve a palavra..."
                    className="w-full p-5 bg-white border-4 border-gray-100 rounded-3xl focus:border-[#FFD700] focus:outline-none text-center text-xl font-black uppercase tracking-widest shadow-inner"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        playSound(SOUNDS.CLICK);
                        const words = ANAGRAM_CATEGORIES[currentAnagramCategory];
                        setShuffledWord(shuffleWord(words[currentAnagramIdx]));
                      }}
                      onMouseEnter={() => playSound(SOUNDS.HOVER)}
                      className="flex-1 p-5 bg-gray-100 text-gray-500 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all border-4 border-gray-200 shadow-[0_6px_0_0_#DDD]"
                    >
                      <RefreshCcw className="w-5 h-5" />
                      BARALHAR
                    </button>
                    <button 
                      onClick={handleAnagramSubmit}
                      onMouseEnter={() => playSound(SOUNDS.HOVER)}
                      disabled={!anagramGuess.trim()}
                      className="flex-[2] bg-[#FFD700] text-[#111] p-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:translate-y-1 hover:shadow-[0_4px_0_0_#CCAC00] active:translate-y-2 active:shadow-none transition-all shadow-[0_8px_0_0_#CCAC00] uppercase tracking-tight"
                    >
                      VERIFICAR
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(gameState === 'LOBBY' || gameState === 'CHAT') && (
              <motion.div 
                key="chat"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-sky-100 flex items-center gap-4 bg-slate-50">
                  <button 
                    onClick={() => { playSound(SOUNDS.CLICK); setActiveTab('CHAT'); }}
                    className={cn(
                      "flex-1 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                      activeTab === 'CHAT' ? "bg-sky-500 text-white shadow-[0_4px_0_0_#0084D1]" : "text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  <button 
                    onClick={() => { playSound(SOUNDS.CLICK); setActiveTab('TASKS'); }}
                    className={cn(
                      "flex-1 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                      activeTab === 'TASKS' ? "bg-emerald-500 text-white shadow-[0_4px_0_0_#00A344]" : "text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    <ListTodo className="w-4 h-4" />
                    Tarefas
                    {tasks.filter(t => !t.completed).length > 0 && (
                      <span className="bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {tasks.filter(t => !t.completed).length}
                      </span>
                    )}
                  </button>
                </div>

                {activeTab === 'CHAT' ? (
                  <>
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                    >
                      {messages.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={cn(
                            "max-w-[85%] p-5 rounded-3xl text-base font-bold leading-relaxed border-4",
                            msg.role === 'helga' 
                              ? "bg-white border-gray-100 text-gray-800 self-start rounded-tl-none shadow-[0_6px_0_0_#EEE]" 
                              : "bg-[#FFD700] border-[#CCAC00] text-[#111] self-end rounded-tr-none ml-auto shadow-[0_6px_0_0_#CCAC00]"
                          )}
                        >
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-1 p-2">
                          <motion.div className="w-2 h-2 bg-sky-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                          <motion.div className="w-2 h-2 bg-sky-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                          <motion.div className="w-2 h-2 bg-sky-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-white border-t-4 border-gray-200">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Fala com a Helga..."
                          className="flex-1 p-5 bg-gray-100 border-4 border-gray-200 rounded-3xl focus:border-[#00A2FF] outline-none font-bold shadow-inner"
                        />
                        <button 
                          onClick={handleSendMessage}
                          onMouseEnter={() => playSound(SOUNDS.HOVER)}
                          disabled={isTyping || !inputText.trim()}
                          className="bg-[#00A2FF] text-white p-5 rounded-3xl font-black shadow-[0_8px_0_0_#0084D1] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0084D1] active:translate-y-2 active:shadow-none transition-all"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100">
                      <p className="text-xs text-emerald-600 font-bold italic text-center uppercase tracking-tight">
                        "Zim zim! Escreve as tuas missões aqui. Ganhas 5 XP por cada tarefa concluída!"
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Nova missão..."
                        className="flex-1 p-4 bg-gray-100 border-4 border-gray-200 rounded-2xl focus:border-emerald-400 outline-none font-bold shadow-inner"
                      />
                      <button 
                        onClick={handleAddTask}
                        disabled={!taskInput.trim()}
                        className="bg-emerald-500 text-white p-4 rounded-2xl font-black shadow-[0_4px_0_0_#00A344] hover:translate-y-1 hover:shadow-[0_2px_0_0_#00A344] active:translate-y-2 active:shadow-none transition-all"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                      <AnimatePresence initial={false}>
                        {tasks.length === 0 ? (
                          <div className="text-center py-12 text-slate-300 font-black uppercase tracking-widest text-sm">
                            Sem missões ativas
                          </div>
                        ) : (
                          tasks.map((task) => (
                            <motion.div 
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                "p-4 rounded-2xl border-4 flex items-center gap-3 transition-all",
                                task.completed 
                                  ? "bg-slate-50 border-slate-100 opacity-60" 
                                  : "bg-white border-gray-100 shadow-[0_4px_0_0_#EEE]"
                              )}
                            >
                              <button 
                                onClick={() => toggleTask(task.id)}
                                className={cn(
                                  "p-1 rounded-lg transition-colors",
                                  task.completed ? "text-emerald-500" : "text-slate-300 hover:text-emerald-400"
                                )}
                              >
                                {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                              </button>
                              <span className={cn(
                                "flex-1 font-bold text-slate-700",
                                task.completed && "line-through"
                              )}>
                                {task.text}
                              </span>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Song Lyrics */}
      <footer className="bg-slate-900 text-white p-3 flex items-center justify-center gap-6 overflow-hidden">
        <div className="flex items-center gap-2 text-yellow-400">
          <Music className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">A Canção da Helga</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div 
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap text-sm font-medium opacity-80"
          >
            "Eu tenho uma amiga que se chama Helga... Ela é muito gira mas é uma melga... Zim zim zim zim zim... Fala me ao ouvido, põe-se a cantar!"
          </motion.div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .markdown-body p {
          margin-bottom: 0.5rem;
        }
        .markdown-body p:last-child {
          margin-bottom: 0;
        }
      `}</style>
      <audio 
        ref={audioRef}
        loop 
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl border-8 border-sky-400 p-8 max-w-md w-full flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-sky-900 uppercase tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Definições de clica no som para ouvires
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Music Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-xl">
                        <Music className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="font-black text-slate-700 uppercase tracking-tight">Música</span>
                    </div>
                    <span className="font-black text-sky-600">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={musicVolume} 
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-6 bg-slate-100 rounded-full appearance-none cursor-pointer accent-yellow-400 border-4 border-white shadow-inner"
                  />
                </div>

                {/* SFX Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <Volume2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-black text-slate-700 uppercase tracking-tight">Efeitos (SFX)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => playSound(SOUNDS.CORRECT)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Testar clica no som para ouvires"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <span className="font-black text-sky-600 w-10 text-right">{Math.round(sfxVolume * 100)}%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={sfxVolume} 
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className="w-full h-6 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-400 border-4 border-white shadow-inner"
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-4 bg-sky-400 text-white rounded-2xl font-black shadow-[0_6px_0_0_#0084D1] hover:translate-y-1 hover:shadow-[0_3px_0_0_#0084D1] active:translate-y-2 active:shadow-none transition-all uppercase tracking-tight"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-[0_20px_0_0_#0084D1] p-8 max-w-md w-full relative z-10 border-4 border-gray-100 text-center"
            >
              <MBWayPayment 
                amount={1} 
                onSuccess={() => {
                  setShowPaymentModal(false);
                  const msg = "Zim zim! Recebi o teu apoio! Muito obrigada, agora já posso comprar mais mel! És incrível!";
                  setMessages(prev => [...prev, { role: 'helga', text: msg }]);
                  playHelgaAudio(msg);
                }}
                onCancel={() => setShowPaymentModal(false)}
                title="Apoiar a Helga"
                description="Zim zim! Queres ajudar a Helga a comprar mais mel? Podes enviar um apoio por MB WAY!"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleSkipTutorial}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl border-8 border-yellow-400 p-8 max-w-lg w-full flex flex-col items-center text-center gap-6"
            >
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-inner">
                <HelgaAvatar isTalking={true} mood="HAPPY" imageUrl={helgaImageUrl} level={level} size="sm" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-sky-900 uppercase tracking-tight">
                  {TUTORIAL_STEPS[tutorialStep].title}
                </h2>
                <p className="text-lg font-bold text-slate-600 leading-tight">
                  {TUTORIAL_STEPS[tutorialStep].text}
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={handleSkipTutorial}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs"
                >
                  Saltar Guia
                </button>
                <button 
                  onClick={handleNextTutorial}
                  className="flex-[2] py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black shadow-[0_6px_0_0_#CCAC00] hover:translate-y-1 hover:shadow-[0_3px_0_0_#CCAC00] active:translate-y-2 active:shadow-none transition-all uppercase tracking-tight flex items-center justify-center gap-2"
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Vamos Começar!' : 'Seguinte'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === tutorialStep ? "bg-yellow-400 w-6" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </motion.div>

            {/* Pointer for target elements */}
            {TUTORIAL_STEPS[tutorialStep].targetId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none z-[101]"
                style={{
                  // This is a simplified positioning logic
                  // In a real app we'd use getBoundingClientRect
                  // But for this demo we'll use fixed positions based on targetId
                  ...(TUTORIAL_STEPS[tutorialStep].targetId === 'header-stats' && { top: '80px', right: '150px' }),
                  ...(TUTORIAL_STEPS[tutorialStep].targetId === 'game-selection' && { bottom: '150px', left: '30%' }),
                  ...(TUTORIAL_STEPS[tutorialStep].targetId === 'chat-panel' && { top: '50%', right: '460px' }),
                  ...(TUTORIAL_STEPS[tutorialStep].targetId === 'music-control' && { top: '80px', right: '350px' }),
                }}
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-12 h-12 bg-yellow-400 rounded-full blur-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-900" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Toast */}
      <AnimatePresence>
        {showLevelUpToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-400 p-1 rounded-3xl shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)]">
              <div className="bg-white px-8 py-4 rounded-[22px] flex items-center gap-4 border-2 border-white/20">
                <div className="bg-yellow-100 p-3 rounded-2xl">
                  <Trophy className="w-8 h-8 text-yellow-600 animate-bounce" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-sky-900 uppercase tracking-tighter leading-none">NÍVEL ATINGIDO!</span>
                  <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Estás no Nível {level}</span>
                </div>
                <div className="flex gap-1">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse delay-75" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

