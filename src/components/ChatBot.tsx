import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Bot, User, Loader2, Image as ImageIcon, Download, Copy, Check, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatBotProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  systemInstruction: string;
  placeholder: string;
  suggestions: string[];
  canGenerateImage?: boolean;
}

export default function ChatBot({ 
  title, subtitle, icon: Icon, color, systemInstruction, 
  placeholder, suggestions, canGenerateImage = false 
}: ChatBotProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text?: string, image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isGeneratingImage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.text)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text! }]
        }));

      const response = await aiService.generateCustomBotResponse(userMessage, systemInstruction, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "Lo siento, no pude procesar tu solicitud." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error conectando con el cerebro de PRODUCIA. Revisa tu conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await aiService.generateImage(prompt);
      if (imageUrl) {
        setMessages(prev => [...prev, { role: 'model', image: imageUrl }]);
      }
    } catch (error) {
      console.error("Image Gen Error:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase">{subtitle}</span>
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
              <h2 className="text-xl font-bold text-white">¿En qué puedo ayudarte hoy?</h2>
              <p className="text-zinc-500 text-sm mt-2">
                {placeholder}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {suggestions.map((suggestion) => (
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
              "flex gap-4 max-w-4xl group",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-zinc-800" : "bg-purple-600"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className="flex flex-col gap-2 relative">
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'user'
                  ? "bg-zinc-800 text-zinc-200 rounded-tr-none"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
              )}>
                {msg.text && msg.text}
                {msg.image && (
                  <div className="space-y-3">
                    <img src={msg.image} alt="Generated Creative" className="rounded-xl w-full max-w-sm border border-zinc-800 shadow-2xl" referrerPolicy="no-referrer" />
                    <a
                      href={msg.image}
                      download="creative.png"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar Imagen
                    </a>
                  </div>
                )}
              </div>
              {/* Copy button */}
              {msg.text && (
                <button
                  onClick={() => handleCopyMessage(msg.text!, i)}
                  className={cn(
                    "absolute -bottom-2 right-2 p-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all",
                    copiedIndex === i
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-800/80 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100"
                  )}
                  title="Copiar texto"
                >
                  {copiedIndex === i ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              )}
              
              {/* Image Generation Trigger for Model Responses */}
              {msg.role === 'model' && msg.text && canGenerateImage && i === messages.length - 1 && !isLoading && (
                <button 
                  onClick={() => handleGenerateImage(msg.text!)}
                  disabled={isGeneratingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-600/30 transition-all w-fit"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando Visual...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" /> Generar este concepto visualmente
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm italic">
              PRODUCIA está procesando tu solicitud...
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
            placeholder="Escribe tu mensaje aquí..."
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
