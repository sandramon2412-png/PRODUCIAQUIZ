import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, ChevronRight, ChevronDown, 
  Settings, Layout, Palette, Zap, Sparkles,
  Save, Eye, Rocket, CheckCircle2, AlertCircle,
  Copy, ExternalLink, Share2, Mail, User,
  Send, Loader2, Image as ImageIcon, Video,
  Music, ScrollText, BarChart3, Target,
  Puzzle, Fingerprint, Activity, FileDown,
  Box, Dumbbell, Hammer, Database, Monitor,
  PlusCircle, MinusCircle, GripVertical,
  CreditCard, LogIn, LogOut, PenTool, ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";
import { auth, db, googleProvider, signInWithPopup } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'rating' | 'boolean';
  options: { id: string; text: string; value: number }[];
}

interface Result {
  id: string;
  title: string;
  desc: string;
  minScore: number;
  maxScore: number;
}

interface RedirectConfig {
  enabled: boolean;
  type: 'none' | 'hotmart' | 'shopify' | 'whatsapp' | 'landing' | 'custom';
  url: string;
  whatsappNumber: string;
  whatsappMessage: string;
  delaySeconds: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  theme: 'dark' | 'light';
  questions: Question[];
  results: Result[];
  leadConfig: {
    title: string;
    subtitle: string;
    buttonText: string;
    fields: { id: string; label: string; type: string; required: boolean }[];
  };
  redirectConfig: RedirectConfig;
}

export default function QuizBuilder() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [quiz, setQuiz] = useState<Quiz>({
    id: Math.random().toString(36).substring(7),
    title: 'Nuevo Quiz de Alta Conversión',
    description: 'Descubre tu nivel de madurez en [Tu Nicho] y obtén una hoja de ruta personalizada.',
    theme: 'dark',
    questions: [
      {
        id: '1',
        text: '¿Cuál es tu facturación mensual actual?',
        type: 'multiple-choice',
        options: [
          { id: 'o1', text: '0 - $1,000', value: 1 },
          { id: 'o2', text: '$1,000 - $5,000', value: 2 },
          { id: 'o3', text: '$5,000 - $10,000', value: 3 },
          { id: 'o4', text: '+$10,000', value: 4 },
        ]
      }
    ],
    results: [
      {
        id: 'r1',
        title: 'Nivel Principiante',
        desc: 'Estás en las etapas iniciales. Necesitas enfocarte en validación y tráfico orgánico.',
        minScore: 0,
        maxScore: 5
      }
    ],
    leadConfig: {
      title: '¡Tu Resultado está Listo!',
      subtitle: 'Ingresa tus datos para recibir tu análisis personalizado y una oferta exclusiva.',
      buttonText: 'Ver mi Resultado',
      fields: [
        { id: 'name', label: 'Nombre Completo', type: 'text', required: true },
        { id: 'email', label: 'Email Principal', type: 'email', required: true }
      ]
    },
    redirectConfig: {
      enabled: false,
      type: 'none',
      url: '',
      whatsappNumber: '',
      whatsappMessage: 'Hola! Acabo de completar el quiz "{quizTitle}" y me gustaría saber más.',
      delaySeconds: 3,
    }
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      setIsGenerating(true);
      
      // Save to Firestore
      const quizRef = doc(db, 'quizzes', quiz.id);
      await setDoc(quizRef, {
        ...quiz,
        authorUid: user.uid,
        authorEmail: user.email,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update local storage for dashboard
      const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const updatedQuizzes = [quiz, ...savedQuizzes.filter((q: any) => q.id !== quiz.id)];
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
      
      setQuizLink(`${window.location.origin}/quiz/${quiz.id}`);
      setShowPublishModal(true);
    } catch (error) {
      console.error("Error publishing quiz:", error);
      alert("Hubo un error al publicar el quiz. Por favor intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quizLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `quiz-${quiz.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportAsHTML = () => {
    // Basic HTML export logic
    alert("Exportando como HTML estático (Beta)...");
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const apiKey = 
        process.env.GEMINI_API_KEY || 
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        (window as any).GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Genera un quiz de alta conversión para un funnel de ventas sobre ${quiz.title}. 
      Devuelve un objeto JSON con title, description, questions (id, text, type, options[id, text, value]) y results (id, title, desc, minScore, maxScore).
      Usa un tono persuasivo y profesional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      // Clean markdown if present
      if (text.includes('```json')) {
        text = text.split('```json')[1].split('```')[0];
      } else if (text.includes('```')) {
        text = text.split('```')[1].split('```')[0];
      }
      
      const aiQuiz = JSON.parse(text.trim());
      
      setQuiz(prev => ({
        ...prev,
        ...aiQuiz,
        id: prev.id // keep original id
      }));
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-zinc-400">
      {/* Header */}
      <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#080808]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-black fill-current" />
            </div>
            <h1 className="text-white font-black text-sm uppercase tracking-widest">AI Quiz Builder</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{user.displayName || 'Usuario'}</span>
                <span className="text-[9px] text-zinc-500">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-400 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </button>
          )}
          <button 
            onClick={handlePublish}
            disabled={isGenerating}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Publicar Quiz
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="w-20 border-r border-zinc-800/50 bg-[#080808] flex flex-col items-center py-8 gap-6">
          {[
            { id: 'editor', icon: PenTool, label: 'Editor' },
            { id: 'preview', icon: Eye, label: 'Vista Previa' },
            { id: 'settings', icon: Settings, label: 'Ajustes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative",
                activeTab === tab.id 
                  ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {tab.label}
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            {activeTab === 'editor' && (
              <>
                {/* Hero Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase tracking-widest">Configuración Base</h2>
                      <p className="text-zinc-500 text-sm">Define el gancho y la promesa de tu funnel.</p>
                    </div>
                    <button 
                      onClick={generateWithAI}
                      disabled={isGenerating}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Sparkles className="w-4 h-4" /> Generar con AI
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Título del Quiz</label>
                      <input 
                        type="text" 
                        value={quiz.title}
                        onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Descripción / Promesa</label>
                      <textarea 
                        value={quiz.description}
                        onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all h-[52px] resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Questions Section */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 rounded-full bg-emerald-500" />
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Preguntas del Quiz</h2>
                    </div>
                    <button 
                      onClick={() => setQuiz(prev => ({
                        ...prev,
                        questions: [...prev.questions, {
                          id: Math.random().toString(36).substring(7),
                          text: 'Nueva Pregunta',
                          type: 'multiple-choice',
                          options: [{ id: 'o1', text: 'Opción 1', value: 1 }]
                        }]
                      }))}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-emerald-500 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {quiz.questions.map((q, qIndex) => (
                      <div key={q.id} className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] p-8 space-y-6 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-black text-zinc-500">
                              {qIndex + 1}
                            </span>
                            <input 
                              type="text" 
                              value={q.text}
                              onChange={(e) => {
                                const newQs = [...quiz.questions];
                                newQs[qIndex].text = e.target.value;
                                setQuiz(prev => ({ ...prev, questions: newQs }));
                              }}
                              className="bg-transparent border-none text-xl font-bold text-white focus:outline-none w-[400px]"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newQs = quiz.questions.filter((_, i) => i !== qIndex);
                              setQuiz(prev => ({ ...prev, questions: newQs }));
                            }}
                            className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, optIndex) => (
                            <div key={opt.id} className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl">
                              <input 
                                type="text" 
                                value={opt.text}
                                onChange={(e) => {
                                  const newQs = [...quiz.questions];
                                  newQs[qIndex].options[optIndex].text = e.target.value;
                                  setQuiz(prev => ({ ...prev, questions: newQs }));
                                }}
                                className="bg-transparent border-none text-sm text-zinc-400 focus:outline-none flex-1"
                              />
                              <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                                <span className="text-[10px] font-black text-zinc-600 uppercase">Pts</span>
                                <input 
                                  type="number" 
                                  value={opt.value}
                                  onChange={(e) => {
                                    const newQs = [...quiz.questions];
                                    newQs[qIndex].options[optIndex].value = parseInt(e.target.value);
                                    setQuiz(prev => ({ ...prev, questions: newQs }));
                                  }}
                                  className="bg-transparent border-none text-sm text-emerald-500 font-bold w-10 focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newQs = [...quiz.questions];
                              newQs[qIndex].options.push({
                                id: Math.random().toString(36).substring(7),
                                text: 'Nueva Opción',
                                value: 0
                              });
                              setQuiz(prev => ({ ...prev, questions: newQs }));
                            }}
                            className="p-4 border border-dashed border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all"
                          >
                            + Añadir Opción
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Lead Capture Config */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full bg-blue-500" />
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Captura de Leads</h2>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Título del Formulario</label>
                        <input 
                          type="text" 
                          value={quiz.leadConfig.title}
                          onChange={(e) => setQuiz(prev => ({ ...prev, leadConfig: { ...prev.leadConfig, title: e.target.value } }))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Subtítulo Persuasivo</label>
                        <textarea 
                          value={quiz.leadConfig.subtitle}
                          onChange={(e) => setQuiz(prev => ({ ...prev, leadConfig: { ...prev.leadConfig, subtitle: e.target.value } }))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4">Campos Requeridos</p>
                      <div className="space-y-3">
                        {quiz.leadConfig.fields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                            <div className="flex items-center gap-3">
                              {field.type === 'email' ? <Mail className="w-4 h-4 text-zinc-500" /> : <User className="w-4 h-4 text-zinc-500" />}
                              <span className="text-sm font-bold text-zinc-300">{field.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Requerido</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/20 transition-all">
                        + Personalizar Formulario
                      </button>
                    </div>
                  </div>
                </section>

                {/* Redirect Configuration */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full bg-orange-500" />
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Redirección Post-Quiz</h2>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">Activar Redirección Automática</h3>
                        <p className="text-xs text-zinc-500">Envía al lead a tu checkout, WhatsApp o landing después de ver su resultado.</p>
                      </div>
                      <button
                        onClick={() => setQuiz(prev => ({
                          ...prev,
                          redirectConfig: { ...prev.redirectConfig, enabled: !prev.redirectConfig.enabled }
                        }))}
                        className={`w-14 h-8 rounded-full transition-all relative ${quiz.redirectConfig.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${quiz.redirectConfig.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {quiz.redirectConfig.enabled && (
                      <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                        <div>
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-3 block">Destino de Redirección</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'hotmart', name: 'Hotmart', icon: Rocket, desc: 'Checkout' },
                              { id: 'shopify', name: 'Shopify', icon: Layout, desc: 'Tienda' },
                              { id: 'whatsapp', name: 'WhatsApp', icon: Send, desc: 'Chat directo' },
                              { id: 'landing', name: 'Landing Page', icon: Monitor, desc: 'Página de ventas' },
                              { id: 'custom', name: 'URL Custom', icon: ExternalLink, desc: 'Cualquier URL' },
                            ].map((dest) => (
                              <button
                                key={dest.id}
                                onClick={() => setQuiz(prev => ({
                                  ...prev,
                                  redirectConfig: { ...prev.redirectConfig, type: dest.id as any }
                                }))}
                                className={`p-4 border rounded-2xl text-left transition-all ${
                                  quiz.redirectConfig.type === dest.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <dest.icon className="w-5 h-5 mb-2" />
                                <p className="text-xs font-bold text-white">{dest.name}</p>
                                <p className="text-[10px] text-zinc-500">{dest.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {quiz.redirectConfig.type === 'whatsapp' ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Número de WhatsApp (con código de país)</label>
                              <input
                                type="text"
                                value={quiz.redirectConfig.whatsappNumber}
                                onChange={(e) => setQuiz(prev => ({
                                  ...prev,
                                  redirectConfig: { ...prev.redirectConfig, whatsappNumber: e.target.value }
                                }))}
                                placeholder="+1234567890"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Mensaje Predeterminado</label>
                              <textarea
                                value={quiz.redirectConfig.whatsappMessage}
                                onChange={(e) => setQuiz(prev => ({
                                  ...prev,
                                  redirectConfig: { ...prev.redirectConfig, whatsappMessage: e.target.value }
                                }))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all h-24 resize-none"
                              />
                              <p className="text-[10px] text-zinc-600 ml-4">Usa {'{quizTitle}'} y {'{score}'} como variables dinámicas.</p>
                            </div>
                          </div>
                        ) : quiz.redirectConfig.type !== 'none' ? (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">
                              {quiz.redirectConfig.type === 'hotmart' ? 'URL de Checkout de Hotmart' :
                               quiz.redirectConfig.type === 'shopify' ? 'URL de tu Tienda Shopify' :
                               quiz.redirectConfig.type === 'landing' ? 'URL de tu Landing Page' :
                               'URL de Destino'}
                            </label>
                            <input
                              type="url"
                              value={quiz.redirectConfig.url}
                              onChange={(e) => setQuiz(prev => ({
                                ...prev,
                                redirectConfig: { ...prev.redirectConfig, url: e.target.value }
                              }))}
                              placeholder="https://..."
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>
                        ) : null}

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Demora antes de redirigir (segundos)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={quiz.redirectConfig.delaySeconds}
                            onChange={(e) => setQuiz(prev => ({
                              ...prev,
                              redirectConfig: { ...prev.redirectConfig, delaySeconds: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-32 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Integrations Preview */}
                <section className="space-y-8 pb-20">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full bg-purple-500" />
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Integraciones & Webhooks</h2>
                  </div>
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[40px] p-10 border-dashed">
                    <div className="text-center max-w-lg mx-auto space-y-6">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/20">
                        <Zap className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Conecta tu Ecosistema</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Envía tus leads automáticamente a tu CRM, plataforma de email marketing o pasarela de pago favorita.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { name: 'Hotmart', icon: Rocket },
                          { name: 'Shopify', icon: Layout },
                          { name: 'WhatsApp', icon: Send },
                          { name: 'Stripe', icon: CreditCard },
                        ].map((platform) => (
                          <div key={platform.name} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3 group hover:border-emerald-500/30 transition-all">
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                              <platform.icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-white">{platform.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'preview' && (
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-[40px] p-12 min-h-[600px] flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Monitor className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Modo Vista Previa</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    Aquí puedes interactuar con tu quiz tal como lo verán tus clientes. Todos los cambios se guardan automáticamente.
                  </p>
                  <button 
                    onClick={() => window.open(`${window.location.origin}/quiz/${quiz.id}`, '_blank')}
                    className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 mx-auto"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir en Nueva Pestaña
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Inicia Sesión para Publicar</h3>
                <p className="text-zinc-500 text-sm">Necesitas una cuenta para guardar tus quizzes en la nube y capturar leads de forma profesional.</p>
              </div>

              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-white/10"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Continuar con Google
                  </>
                )}
              </button>

              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold text-sm transition-all"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publish Success Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">¡Quiz Publicado con Éxito!</h3>
                <p className="text-zinc-500 text-sm">Tu flujo de ventas ya está activo en la nube.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Link de Compartir
                  </p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Este link es público y puede ser usado por tus clientes desde cualquier dispositivo.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <code className="text-[10px] text-emerald-500 font-mono truncate">{quizLink}</code>
                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shrink-0",
                      isCopied ? "bg-emerald-600 text-white" : "bg-zinc-800 text-white hover:bg-zinc-700"
                    )}
                  >
                    {isCopied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={exportAsJSON}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-3 h-3" /> Exportar JSON
                </button>
                <button 
                  onClick={exportAsHTML}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Layout className="w-3 h-3" /> Exportar HTML
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowPublishModal(false)}
                  className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold text-sm transition-all"
                >
                  Cerrar
                </button>
                <a 
                  href={quizLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all text-center"
                >
                  Ver Quiz
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
