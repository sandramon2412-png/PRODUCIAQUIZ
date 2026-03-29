import { useState, useEffect, useRef } from 'react';
import {
  X, MessageSquare, Mic, Send, Loader2,
  FileText, ScrollText, BookOpen, BarChart3, Hammer,
  Fingerprint, Video, Settings, Camera, Plus, CheckCircle2,
  Trash2, ChevronRight, Download, Monitor, ListTodo, Bot,
  Puzzle, Activity, Image, ShieldCheck, Box, Database,
  Palette, Dumbbell, FileDown, Search, Copy, Check
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
  const [selectedModel, setSelectedModel] = useState("Groq + Claude");
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
  const [currentBot, setCurrentBot] = useState<string>(() => {
    return localStorage.getItem('producia_current_bot') || "General Assistant";
  });
  const [newTodoText, setNewTodoText] = useState("");

  const switchBot = (botName: string) => {
    if (botName === currentBot) {
      setActiveTab('chat');
      return;
    }
    setCurrentBot(botName);
    localStorage.setItem('producia_current_bot', botName);
    const botData = availableBots.find(b => b.name === botName);
    const welcomeMessage = botName === "General Assistant"
      ? "¡Hola! Soy Lloyd, tu copiloto de IA. ¿Qué vamos a construir hoy?"
      : `${botName} activado. ${botData ? `Soy tu especialista en ${botData.category.toLowerCase()}.` : ''} ¿En qué te ayudo?`;
    setChat([{ role: 'model', text: welcomeMessage }]);
    setActiveTab('chat');
  };

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  const captureScreen = async () => {
    if (isLoading) return;
    try {
      let base64: string | null = null;

      // Use Electron native capture if available (no permission dialog)
      if ((window as any).electronAPI?.captureScreenshot) {
        base64 = await (window as any).electronAPI.captureScreenshot();
      } else {
        // Fallback: browser getDisplayMedia (asks permission)
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'screen' } as any,
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        stream.getTracks().forEach(track => track.stop());
        base64 = canvas.toDataURL('image/png').split(',')[1];
      }

      if (!base64) {
        setChat(prev => [...prev, { role: 'model' as const, text: 'No se pudo capturar la pantalla.' }]);
        return;
      }

      // Flash effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);

      // Add user message
      setChat(prev => [...prev, { role: 'user' as const, text: 'Captura de pantalla tomada. Analizando...' }]);
      setIsLoading(true);

      // Send to Claude Vision
      const response = await aiService.analyzeScreenshot(base64);
      setChat(prev => [...prev, { role: 'model' as const, text: response }]);
    } catch (error: any) {
      if (error.name !== 'NotAllowedError') {
        setChat(prev => [...prev, { role: 'model' as const, text: 'Error al capturar la pantalla. Asegurate de dar permiso cuando el navegador lo solicite.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text?: string, isScreenshot = false) => {
    const msgToSend = text || message;
    if (!msgToSend.trim() && !isScreenshot || isLoading) return;

    if (!aiService.hasApiKeys()) {
      setChat(prev => [...prev,
        { role: 'user' as const, text: msgToSend },
        { role: 'model' as const, text: 'Las API keys de IA no estan configuradas. El administrador debe agregar VITE_GROQ_API_KEY y/o VITE_CLAUDE_API_KEY en Vercel y redesplegar el proyecto.' }
      ]);
      setMessage("");
      return;
    }

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

      const selectedBotData = availableBots.find(b => b.name === currentBot);
      let systemPrompt: string;

      if (selectedBotData) {
        systemPrompt = `${selectedBotData.systemInstruction}

REGLAS IMPORTANTES:
- Responde siempre en español.
- Sé directo, práctico y conciso.
- NO inventes datos, estadísticas ni URLs. Si no sabes algo, dilo.
- NO ofrezcas hacer cosas que no puedes hacer (como navegar por internet, crear archivos, o acceder a sitios web).
- Cuando analices algo, basa tu respuesta SOLO en la información que el usuario te proporcione.
- Estás operando dentro de Lloyd, el asistente de PRODUCIA. El usuario está usando tu módulo "${currentBot}".`;
      } else {
        systemPrompt = `Eres Lloyd, el asistente central de PRODUCIA - la plataforma de IA para creadores de productos digitales hispanohablantes.

Puedes ayudar con:
1. Analizar ofertas y anuncios (el usuario te pega el texto o toma un screenshot)
2. Crear copy de ventas, cartas de venta, páginas de venta
3. Estructurar productos digitales (ebooks, cursos, mentorías)
4. Estrategias de Facebook Ads y Meta Ads
5. Quiz funnels con redirección a Hotmart/Shopify/WhatsApp

REGLAS IMPORTANTES:
- Responde siempre en español.
- Sé directo, práctico y conciso. No uses relleno.
- NO inventes datos, estadísticas, URLs ni información que no tengas.
- NO ofrezcas hacer cosas que no puedes hacer (navegar internet, crear archivos, acceder a sitios web).
- Si el usuario te pide crear un Quiz, dile que abra el Quiz Builder desde el Dashboard.
- Ayuda directamente con lo que el usuario pida.`;
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
        errorDisplay = "Error: Servicio de IA temporalmente no disponible. Intenta de nuevo en unos momentos.";
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

  const availableBots: { name: string; icon: any; systemInstruction: string; category: string }[] = [
    // Copy & Funnels
    { name: "Sales Letter Weapon", icon: ScrollText, category: "Copy", systemInstruction: "Eres un experto en Cartas de Venta (Sales Letters) de respuesta directa. Tu objetivo es ayudar al usuario a crear cartas de venta persuasivas que conviertan. Usa estructuras probadas como la de 12 pasos de David Frey o la de Gary Halbert. Enfócate en el gancho, la promesa, la prueba social y la oferta irresistible." },
    { name: "Identity Persuasion", icon: Fingerprint, category: "Copy", systemInstruction: "Eres un experto en persuasión basada en identidad. Tu objetivo es crear mensajes que conecten con la identidad profunda del cliente ideal. No vendes características, vendes quién llegará a ser el cliente al usar el producto. Usa conceptos de psicología conductual y sesgos cognitivos." },
    { name: "Página de Ventas", icon: FileText, category: "Copy", systemInstruction: "Eres un Copywriter experto en páginas de ventas de alta conversión. Tu objetivo es ayudar al usuario a escribir el copy de su landing page usando estructuras como AIDA, PAS o la Fórmula de los 5 Pasos de Eugene Schwartz. Sé persuasivo, enfócate en beneficios y usa un lenguaje que conecte con el avatar." },
    // Contenido & Productos
    { name: "Ebook Writer", icon: BookOpen, category: "Contenido", systemInstruction: "Eres un escritor experto de ebooks y productos digitales. Ayudas al usuario a estructurar su conocimiento en capítulos lógicos, escribir introducciones potentes y desarrollar contenido de alto valor que sea fácil de consumir." },
    { name: "AI Product Builder", icon: Hammer, category: "Contenido", systemInstruction: "Eres un arquitecto de productos digitales. Ayudas a los usuarios a estructurar cursos online, programas de mentoría o servicios de alto valor. Te enfocas en la metodología, los entregables y la experiencia del cliente para asegurar resultados." },
    { name: "Viral PDF Lab", icon: FileDown, category: "Contenido", systemInstruction: "Eres un experto en la creación de PDFs virales y Lead Magnets. Tu objetivo es diseñar documentos que la gente quiera compartir y que posicionen al usuario como una autoridad mientras captan leads de calidad." },
    { name: "Ebook Designer", icon: Palette, category: "Contenido", systemInstruction: "Eres un diseñador editorial experto. Ayudas a los usuarios a definir el look & feel de sus ebooks, elegir paletas de colores, tipografías y layouts que se vean profesionales y sean fáciles de leer." },
    // Tráfico & Ads
    { name: "Ad Library Analyzer", icon: Search, category: "Tráfico", systemInstruction: "Eres el Bot Analizador de Facebook Ad Library de PRODUCIA. Tu especialidad es ayudar a los usuarios a encontrar y analizar ofertas ganadoras de productos digitales. Analizas el ángulo de venta, la promesa, el avatar objetivo y la estructura del funnel. Un anuncio activo por más de 30 días con múltiples variaciones = oferta ganadora. Sugieres cómo MODELAR (no copiar) esa oferta para crear algo mejor." },
    { name: "Meta Ads Decision", icon: BarChart3, category: "Tráfico", systemInstruction: "Eres un motor de decisión para Meta Ads. Ayudas a los usuarios a interpretar sus métricas (CTR, CPC, ROAS, CPA) y a tomar decisiones estratégicas sobre qué anuncios apagar, cuáles escalar y qué cambios hacer en la segmentación." },
    { name: "Andromda Meta Ads", icon: Activity, category: "Tráfico", systemInstruction: "Eres el guía estratégico de Andromda para Meta Ads. Te enfocas en el escalamiento horizontal y vertical, la optimización de presupuestos (CBO/ABO) y la creación de estructuras de campaña sólidas para e-commerce e infoproductos." },
    { name: "Master Script Ads", icon: Video, category: "Tráfico", systemInstruction: "Eres un orquestador de guiones maestros para video ads. Ayudas a crear ganchos (hooks) potentes, el cuerpo del anuncio y llamadas a la acción (CTAs) que conviertan para Meta DTC. Te enfocas en el ritmo y la psicología visual." },
    { name: "9 Figure DTC Images", icon: Image, category: "Tráfico", systemInstruction: "Eres un director creativo especializado en anuncios de imagen para Meta DTC. Ayudas a conceptualizar imágenes que detengan el scroll, usando ángulos de venta claros, ganchos visuales y textos persuasivos sobre la imagen." },
    // Sistemas de Negocio
    { name: "AI Brand Operation", icon: ShieldCheck, category: "Sistemas", systemInstruction: "Eres un arquitecto de sistemas de marca con IA. Ayudas a los usuarios a definir su voz de marca, pilares de contenido y procesos de comunicación automatizados para mantener una presencia coherente y escalable." },
    { name: "AI Business Box", icon: Box, category: "Sistemas", systemInstruction: "Eres un consultor de negocios digitales. Ayudas a montar negocios completos apoyados en sistemas y procesos con IA. Te enfocas en la eficiencia, la delegación a la IA y la creación de un 'negocio en una caja'." },
    { name: "AI Backend Builder", icon: Database, category: "Sistemas", systemInstruction: "Eres un ingeniero de backend para negocios digitales. Ayudas a construir la infraestructura invisible: ofertas de backend, sistemas de incorporación (onboarding), automatizaciones de entrega y procesos de escalamiento." },
    { name: "Elite Trainer", icon: Dumbbell, category: "Sistemas", systemInstruction: "Eres un coach de alto rendimiento y productividad. Tu objetivo es ayudar al usuario a ejecutar sus tareas, mantener el foco y optimizar su energía diaria para lograr sus objetivos de negocio." },
  ];

  const models = ["Groq + Claude", "Groq (Llama 3.3)", "Claude (Sonnet 4)"];

  return (
    <div className={cn(
      "backdrop-blur-3xl saturate-[180%] flex flex-col overflow-hidden transition-all duration-500",
      isStandalone
        ? "w-full h-full bg-white/[0.02] border-0 rounded-none"
        : "w-[400px] h-[600px] bg-white/[0.08] border border-white/30 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
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
            {/* Active Bot Indicator */}
            {currentBot !== "General Assistant" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-600/15 border border-purple-500/30 rounded-xl">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{currentBot}</span>
                <button
                  onClick={() => switchBot("General Assistant")}
                  className="ml-auto text-[9px] text-zinc-500 hover:text-white transition-colors"
                >
                  Volver a General
                </button>
              </div>
            )}

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
              <div key={i} className={cn("flex group", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-md relative",
                  msg.role === 'user'
                    ? "bg-purple-600/60 text-white rounded-tr-none border border-white/10"
                    : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/10"
                )}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyMessage(msg.text, i)}
                    className={cn(
                      "absolute -bottom-3 right-2 p-1.5 rounded-lg transition-all",
                      copiedIndex === i
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800/80 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100"
                    )}
                    title="Copiar texto"
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {msg.role === 'model' && (msg.text.toLowerCase().includes('quiz builder') || msg.text.toLowerCase().includes('crear un quiz')) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={() => window.open('/bot/quizzes-funis', '_blank')}
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
            {/* General Assistant */}
            <button
              onClick={() => switchBot("General Assistant")}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                currentBot === "General Assistant"
                  ? "bg-emerald-600/20 border-emerald-500/50 text-white"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentBot === "General Assistant" ? "bg-emerald-500" : "bg-zinc-800")}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold block">Lloyd General</span>
                  <span className="text-[10px] text-zinc-500">Asistente de estrategia general</span>
                </div>
              </div>
              {currentBot === "General Assistant" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>

            {/* Bots by Category */}
            {['Copy', 'Contenido', 'Tráfico', 'Sistemas'].map(category => (
              <div key={category}>
                <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 mt-4 px-1">{
                  category === 'Copy' ? 'Copy & Funnels' :
                  category === 'Contenido' ? 'Contenido & Productos' :
                  category === 'Tráfico' ? 'Tráfico & Ads' : 'Sistemas de Negocio'
                }</h3>
                <div className="space-y-2">
                  {availableBots.filter(b => b.category === category).map(bot => (
                    <button
                      key={bot.name}
                      onClick={() => switchBot(bot.name)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl border transition-all group",
                        currentBot === bot.name
                          ? "bg-purple-600/20 border-purple-500/50 text-white"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", currentBot === bot.name ? "bg-purple-500" : "bg-zinc-800")}>
                          <bot.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold">{bot.name}</span>
                      </div>
                      {currentBot === bot.name && <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Bloc de Notas</h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-600">{notes.length > 0 ? `${notes.length} caracteres` : ''}</span>
                {notes.length > 0 && (
                  <button
                    onClick={() => { if (confirm('¿Borrar todas las notas?')) setNotes(''); }}
                    className="p-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Borrar notas"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
                <button
                  onClick={() => { if (notes.trim()) { navigator.clipboard.writeText(notes); } }}
                  className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  title="Copiar notas"
                >
                  <Copy className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus ideas aquí... Se guardan automáticamente."
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-300 text-sm resize-none focus:outline-none focus:border-purple-500/30 placeholder:text-zinc-700 leading-relaxed transition-colors"
            />
            <p className="text-[9px] text-zinc-700 mt-2 text-center">Guardado automático en tu navegador</p>
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Lista de Tareas</h3>
              {todos.length > 0 && (
                <span className="text-[9px] text-zinc-600">
                  {todos.filter(t => t.completed).length}/{todos.length} completadas
                </span>
              )}
            </div>

            {/* Dedicated add task input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTodoText.trim()) {
                    setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false }]);
                    setNewTodoText("");
                  }
                }}
                placeholder="Escribe una nueva tarea..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/30 placeholder:text-zinc-600 transition-colors"
              />
              <button
                onClick={() => {
                  if (newTodoText.trim()) {
                    setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false }]);
                    setNewTodoText("");
                  }
                }}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group">
                  <button onClick={() => toggleTodo(todo.id)} className={cn("transition-colors shrink-0", todo.completed ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400")}>
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <span className={cn("flex-1 text-sm transition-all", todo.completed ? "text-zinc-600 line-through" : "text-zinc-300")}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-8">
                  <ListTodo className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-zinc-600 text-xs">No tienes tareas pendientes.</p>
                  <p className="text-zinc-700 text-[10px] mt-1">Escribe arriba y presiona Enter o +</p>
                </div>
              )}
            </div>
            {todos.filter(t => t.completed).length > 0 && (
              <button
                onClick={() => setTodos(todos.filter(t => !t.completed))}
                className="w-full py-2 text-[10px] text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
              >
                Limpiar completadas
              </button>
            )}
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
            <button
              onClick={captureScreen}
              title="Capturar pantalla"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
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
