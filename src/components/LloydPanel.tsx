import { useState, useEffect, useRef } from 'react';
import { 
  X, MessageSquare, Mic, Send, Loader2, 
  FileText, ScrollText, BookOpen, BarChart3, Hammer, 
  Fingerprint, Video, Settings, Camera, Plus, CheckCircle2, 
  Trash2, ChevronRight, Download, Monitor, ListTodo, Bot,
  Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { voiceService } from '../services/voiceService';
import { aiService } from '../services/aiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LloydPanelProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export const LloydPanel = ({ onClose, isStandalone = false }: LloydPanelProps) => {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'chat' | 'bots' | 'notes' | 'todo'>('chat');
  const [selectedModel, setSelectedModel] = useState("Gemini 3.1 Pro");
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Persistence
  const [notes, setNotes] = useState<string>(() => localStorage.getItem('producia_notes') || "");
  const [todos, setTodos] = useState<{ id: string, text: string, completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('producia_todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeBots, setActiveBots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('producia_active_bots');
      return saved ? JSON.parse(saved) : ["Sales Letter Weapon"];
    } catch (e) {
      return ["Sales Letter Weapon"];
    }
  });
  const [currentBot, setCurrentBot] = useState<string>("General Assistant");

  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<{ role: 'user' | 'model', text: string, isImage?: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('producia_chat');
      return saved ? JSON.parse(saved) : [
        { role: 'model', text: "¡Hola! Soy Lloyd, tu copiloto de IA. ¿Qué vamos a construir hoy?" }
      ];
    } catch (e) {
      return [{ role: 'model', text: "¡Hola! Soy Lloyd, tu copiloto de IA. ¿Qué vamos a construir hoy?" }];
    }
  });

  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    localStorage.setItem('producia_chat', JSON.stringify(chat));
  }, [chat]);

  useEffect(() => {
    localStorage.setItem('producia_notes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('producia_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('producia_active_bots', JSON.stringify(activeBots));
  }, [activeBots]);

  const triggerDownload = () => {
    window.dispatchEvent(new CustomEvent('trigger-download'));
  };

  const handleSend = async (text?: string, isScreenshot = false) => {
    const msgToSend = text || message;
    if (!msgToSend.trim() && !isScreenshot || isLoading) return;

    if (isScreenshot) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
    }

    const userMsg = isScreenshot ? "Lloyd, analiza mi pantalla actual y dime cómo puedo mejorar mi oferta." : msgToSend;
    const newChat = [...chat, { role: 'user' as const, text: userMsg }];
    setChat(newChat);
    setMessage("");
    setIsLoading(true);

    try {
      console.log('Lloyd: Generando respuesta...', { userMsg, historyLength: chat.length });
      
      const history = chat.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      let systemPrompt = `Eres Lloyd, el asistente central de PRODUCIA. Tu objetivo es ayudar al usuario a navegar por la plataforma y ser su estratega de marketing.
      
      IMPORTANTE: Si el usuario te pide crear un Quiz, una encuesta o un funnel de calificación, menciónale que tienes un módulo especializado llamado "Quiz Builder" y sugiérele que lo abra. 
      Dile exactamente: "He detectado que quieres crear un Quiz. Puedes abrir mi herramienta especializada 'Quiz Builder' para diseñarlo con IA."`;
      
      if (currentBot !== "General Assistant") {
        systemPrompt += ` Actualmente estás actuando bajo el módulo de "${currentBot}". Responde con la experiencia específica de ese bot.`;
      }

      const response = await aiService.generateCustomBotResponse(userMsg, systemPrompt, history);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servicio de IA.');
      }

      const aiResponse = response;
      
      setChat(prev => [...prev, { role: 'model', text: aiResponse }]);
      
      if (isListening || text) {
        voiceService.speak(aiResponse);
      }
    } catch (error: any) {
      console.error("Assistant Error:", error);
      const errorMessage = error?.message || String(error);
      
      let errorDisplay = "Error de conexión. Reintentando...";
      if (errorMessage.includes("API_KEY") || errorMessage.includes("403") || errorMessage.includes("401") || errorMessage.includes("not found")) {
        errorDisplay = "Error: Configuración de API incompleta o inválida. Por favor, revisa el panel de 'Secrets' en AI Studio y asegúrate de que GEMINI_API_KEY esté configurada.";
      } else if (errorMessage.includes("quota")) {
        errorDisplay = "Error: Cuota de API excedida. Por favor, intenta más tarde.";
      } else {
        errorDisplay = `Error: ${errorMessage}`;
      }
      
      setChat(prev => [...prev, { role: 'model', text: errorDisplay }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (text) => handleSend(text),
        () => setIsListening(false)
      );
    }
  };

  const addTodo = () => {
    if (!message.trim()) return;
    const newTodo = { id: Date.now().toString(), text: message, completed: false };
    setTodos([...todos, newTodo]);
    setMessage("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const availableBots = [
    { name: "Sales Letter Weapon", icon: ScrollText },
    { name: "Ebook Writer", icon: BookOpen },
    { name: "Meta Ads Decision", icon: BarChart3 },
    { name: "AI Product Builder", icon: Hammer },
    { name: "Identity Persuasion", icon: Fingerprint },
    { name: "Master Script Ads", icon: Video },
    { name: "Quiz Builder", icon: Puzzle }
  ];

  const models = ["Gemini 3.1 Pro", "GPT-4o (Simulated)", "Claude 3.5 (Simulated)", "Llama 3 (Simulated)"];

  return (
    <div className={cn(
      "backdrop-blur-3xl saturate-[180%] border border-white/30 flex flex-col overflow-hidden rounded-[32px] transition-all duration-500",
      isStandalone 
        ? "w-full h-full bg-white/[0.02] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]" 
        : "w-[400px] h-[600px] bg-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
    )}>
      {/* Screenshot Flash Effect */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[10000] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 pointer-events-none" />
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0 relative z-10">
        <div className="relative">
          <button 
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{selectedModel}</span>
            <ChevronRight className={cn("w-3 h-3 text-zinc-500 transition-transform", showModelSelector && "rotate-90")} />
          </button>
          
          {showModelSelector && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {models.map(m => (
                <button 
                  key={m}
                  onClick={() => { 
                    setSelectedModel(m); 
                    setShowModelSelector(false); 
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={triggerDownload}
            title="Descargar Lloyd para Escritorio"
            className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-2 py-1 bg-black/20 shrink-0 relative z-10">
        {[
          { id: 'chat', icon: MessageSquare, label: 'Chat' },
          { id: 'bots', icon: Bot, label: 'Bots' },
          { id: 'notes', icon: FileText, label: 'Notas' },
          { id: 'todo', icon: ListTodo, label: 'Tareas' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all",
              activeTab === tab.id ? "bg-white/10 text-purple-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide relative z-10">
        {activeTab === 'chat' && (
          <div className="space-y-5">
            {/* Download Banner */}
            {!isStandalone && (
              <div className="bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Monitor className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-xs font-bold">Lloyd para Escritorio</h4>
                    <p className="text-zinc-400 text-[10px] leading-tight mt-0.5">Versión Beta en desarrollo. Descarga las instrucciones.</p>
                  </div>
                  <button 
                    onClick={triggerDownload}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black rounded-lg transition-all"
                  >
                    DESCARGAR
                  </button>
                </div>
              </div>
            )}

            {chat.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-md",
                  msg.role === 'user' 
                    ? "bg-purple-600/60 text-white rounded-tr-none border border-white/10" 
                    : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/10"
                )}>
                  {msg.text}
                  {msg.role === 'model' && (msg.text.toLowerCase().includes('quiz builder') || msg.text.toLowerCase().includes('crear un quiz')) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => window.location.href = '/bot/quizzes-funis'}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Puzzle className="w-4 h-4" /> Abrir Quiz Builder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bots' && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Bots Instalados</h3>
            <div className="grid grid-cols-1 gap-3">
              {availableBots.map(bot => (
                <button 
                  key={bot.name}
                  onClick={() => setCurrentBot(bot.name)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    currentBot === bot.name 
                      ? "bg-purple-600/20 border-purple-500/50 text-white" 
                      : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentBot === bot.name ? "bg-purple-500" : "bg-zinc-800")}>
                      <bot.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-bold">{bot.name}</span>
                  </div>
                  {currentBot === bot.name && <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Bloc de Notas</h3>
              <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><Plus className="w-4 h-4 text-white" /></button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus ideas aquí... Se guardan automáticamente."
              className="flex-1 w-full bg-transparent text-zinc-300 text-sm resize-none focus:outline-none placeholder:text-zinc-700 leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Lista de Tareas</h3>
            </div>
            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group">
                  <button onClick={() => toggleTodo(todo.id)} className={cn("transition-colors", todo.completed ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400")}>
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <span className={cn("flex-1 text-sm transition-all", todo.completed ? "text-zinc-600 line-through" : "text-zinc-300")}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-10">
                  <ListTodo className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                  <p className="text-zinc-600 text-xs">No tienes tareas pendientes.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-5 bg-white/5 backdrop-blur-xl border-t border-white/5 shrink-0 relative z-10">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  activeTab === 'todo' ? addTodo() : handleSend();
                }
              }}
              placeholder={activeTab === 'todo' ? "Nueva tarea..." : "Pregunta a Lloyd..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                onClick={() => handleSend(undefined, true)}
                title="Analizar pantalla"
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleVoice}
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                isListening ? "bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => activeTab === 'todo' ? addTodo() : handleSend()}
              className="w-11 h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-purple-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em]">Lloyd Engine Active</span>
          </div>
          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.2em]">V1.2.0-BETA</span>
        </div>
      </div>
    </div>
  );
};
