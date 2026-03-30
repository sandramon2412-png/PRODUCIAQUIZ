import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ModeladorBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await aiService.generateModelAnalysis(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "Lo siento, no pude procesar tu solicitud." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error conectando con el cerebro de PRODUCIA. Revisa tu conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">Bot Modelador</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase">IA Especializada Activa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">¿Qué producto vamos a modelar hoy?</h2>
              <p className="text-zinc-500 text-sm mt-2">
                Pégame la descripción de un anuncio ganador o el texto de una página de ventas que quieras mejorar.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {[
                "Analiza este producto de biodescodificación...",
                "Tengo este anuncio de un curso de Excel...",
                "¿Cómo puedo diferenciar este ebook de recetas?"
              ].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:border-purple-500/50 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn(
              "flex gap-4 max-w-4xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-zinc-800" : "bg-purple-600"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
              msg.role === 'user' 
                ? "bg-zinc-800 text-zinc-200 rounded-tr-none" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm italic">
              PRODUCIA está analizando los ángulos de venta...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pega aquí la descripción del producto..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-purple-500 transition-all resize-none min-h-[56px] max-h-32 scrollbar-hide"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-white transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3 uppercase font-bold tracking-widest">
          Potenciado por Gemini 3.1 Pro • PRODUCIA AI Engine
        </p>
      </div>
    </div>
  );
}
