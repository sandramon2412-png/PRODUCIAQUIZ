import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, FileText, Megaphone, PenTool, Search, 
  Eye, Puzzle, Zap, Palette, Package, CreditCard,
  Sparkles, ChevronRight, BookOpen, Fingerprint,
  Activity, FileDown, ShieldCheck, Box, Dumbbell,
  Hammer, Database, Video, Image, ScrollText,
  BarChart3, Layout, Download, Monitor, Plus, X,
  Settings, Users, Layers, Rocket, ExternalLink,
  Clock, CheckCircle2, AlertCircle, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import OnboardingModal from './OnboardingModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Bot {
  name: string;
  desc: string;
  icon: any;
  color: string;
  path: string;
  category: string;
}

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads'>('dashboard');
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('producia_onboarded'));
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Not logged in → send to login
        navigate('/login', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Load from localStorage as immediate fallback
    const localQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    setSavedQuizzes(localQuizzes);
    const localLeads = JSON.parse(localStorage.getItem('producia_leads') || '[]');
    setLeads(localLeads);

    // Then sync with Firestore
    let unsubscribe: () => void = () => {};
    let unsubscribeLeads: () => void = () => {};

    try {
      const q = query(
        collection(db, 'quizzes'),
        where('authorUid', '==', user.uid),
        orderBy('publishedAt', 'desc')
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const quizzes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedQuizzes(quizzes);
      }, (error) => {
        console.warn('Firestore quizzes sync failed, using local data:', error.message);
      });

      const leadsQuery = query(
        collection(db, 'leads'),
        where('authorUid', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );

      unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeads(leadsData);
      }, (error) => {
        console.warn('Firestore leads sync failed, using local data:', error.message);
      });
    } catch (error) {
      console.warn('Firestore connection failed, using local data');
    }

    return () => {
      unsubscribe();
      unsubscribeLeads();
    };
  }, [user]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm font-bold">Cargando Producia OS...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render dashboard (redirect happens in useEffect)
  if (!user) return null;

  const handleLogout = async () => {
    try {
      if (isGuest) {
        localStorage.removeItem('producia_guest');
        localStorage.removeItem('producia_guest_name');
        setIsGuest(false);
        navigate('/');
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const displayName = user?.displayName || (isGuest ? 'Invitado' : null);
  const displayInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || (isGuest ? 'IN' : 'U');

  const categories = [
    { id: 'Todos', name: 'Todos los Bots', icon: Layers },
    { id: 'Copy', name: 'Copy & Funnels', icon: ScrollText },
    { id: 'Contenido', name: 'Contenido & Productos', icon: BookOpen },
    { id: 'Trafico', name: 'Tráfico & Ads', icon: Megaphone },
    { id: 'Sistemas', name: 'Sistemas de Negocio', icon: ShieldCheck },
  ];

  const allBots: Bot[] = [
    { name: "Sales Letter Weapon", desc: "Cartas de venta persuasivas listas para convertir.", icon: ScrollText, color: "text-blue-400", path: "/bot/sales-letter", category: 'Copy' },
    { name: "Identity Persuasion", desc: "Mensajes que conectan con la identidad profunda.", icon: Fingerprint, color: "text-blue-400", path: "/bot/identity-persuasion", category: 'Copy' },
    { name: "Página de Ventas", desc: "Genera copys de alta conversión para tu landing.", icon: FileText, color: "text-blue-400", path: "/bot/pagina-ventas", category: 'Copy' },
    { name: "Ebook Writer", desc: "Contenido completo de tu ebook, capítulo a capítulo.", icon: BookOpen, color: "text-emerald-400", path: "/bot/ebook-writer", category: 'Contenido' },
    { name: "AI Product Builder", desc: "Estructura productos digitales completos con AI.", icon: Hammer, color: "text-emerald-400", path: "/bot/product-builder", category: 'Contenido' },
    { name: "The Viral PDF Lab", desc: "Diseña PDFs virales para captar leads orgánicos.", icon: FileDown, color: "text-emerald-400", path: "/bot/viral-pdf", category: 'Contenido' },
    { name: "Meta Ads Decision", desc: "Toma decisiones sobre tus campañas con datos.", icon: BarChart3, color: "text-orange-400", path: "/bot/meta-decision", category: 'Trafico' },
    { name: "Andromda Meta Ads", desc: "Optimiza y escala tus campañas paso a paso.", icon: Activity, color: "text-orange-400", path: "/bot/andromda-ads", category: 'Trafico' },
    { name: "Master Script Ads", desc: "Guiones, ganchos y storyboards para Meta DTC.", icon: Video, color: "text-orange-400", path: "/bot/master-script", category: 'Trafico' },
    { name: "9 Figure DTC Images", desc: "Anuncios de imagen de alta conversión para Meta.", icon: Image, color: "text-orange-400", path: "/bot/dtc-images", category: 'Trafico' },
    { name: "AI Brand Operation", desc: "Sistema completo para operar y comunicar tu marca.", icon: ShieldCheck, color: "text-purple-400", path: "/bot/brand-system", category: 'Sistemas' },
    { name: "AI Business Box", desc: "Monta un negocio digital completo con procesos AI.", icon: Box, color: "text-purple-400", path: "/bot/business-box", category: 'Sistemas' },
    { name: "AI Backend Builder", desc: "Ingeniero de ofertas, onboarding y automatización.", icon: Database, color: "text-purple-400", path: "/bot/backend-builder", category: 'Sistemas' },
    { name: "Ad Library Analyzer", desc: "Detecta ofertas ganadoras en Facebook Ad Library.", icon: Search, color: "text-rose-400", path: "/bot/ad-library", category: 'Trafico' },
  ];

  const filteredBots = allBots
    .filter(bot => activeCategory === 'Todos' || bot.category === activeCategory)
    .filter(bot => !searchQuery || bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || bot.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-400 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[90] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={cn(
        "w-72 border-r border-zinc-800/50 bg-[#080808] flex flex-col shrink-0 transition-transform duration-300 z-[95]",
        "fixed inset-y-0 left-0 lg:relative",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="w-6 h-6 text-black fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter leading-none">PRODUCIA <span className="text-emerald-500">OS</span></span>
              <Link to="/" className="text-[8px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors mt-1">Volver a la Landing</Link>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Navegación</p>
            <button
              onClick={() => { setActiveTab('dashboard'); setActiveCategory('Todos'); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                activeTab === 'dashboard' 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              )}
            >
              <Layers className={cn("w-4 h-4 transition-colors", activeTab === 'dashboard' ? "text-emerald-400" : "text-zinc-600 group-hover:text-zinc-400")} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                activeTab === 'leads' 
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              )}
            >
              <Users className={cn("w-4 h-4 transition-colors", activeTab === 'leads' ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400")} />
              Leads Capturados
            </button>
          </nav>

          <div className="mt-12">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Categorías</p>
            {categories.filter(c => c.id !== 'Todos').map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveTab('dashboard'); setActiveCategory(cat.id); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                  activeTab === 'dashboard' && activeCategory === cat.id 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <cat.icon className={cn("w-4 h-4 transition-colors", activeTab === 'dashboard' && activeCategory === cat.id ? "text-emerald-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Herramientas</p>
            <Link to="/bot/quizzes-funis" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group">
              <Puzzle className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
              AI Quiz Funnel
            </Link>
            <Link to="/bot/ad-library" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group">
              <Search className="w-4 h-4 text-zinc-600 group-hover:text-rose-400" />
              Ad Library Analyzer
            </Link>
            <button onClick={() => { window.dispatchEvent(new CustomEvent('trigger-download')); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group">
              <Sparkles className="w-4 h-4 text-zinc-600 group-hover:text-purple-400" />
              Asistente Lloyd
            </button>
          </div>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isGuest ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{isGuest ? 'Modo Invitado' : user ? 'Plan Starter' : 'Sin Sesión'}</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
              {isGuest
                ? 'Tus datos se guardan localmente. Vincula tu cuenta para sincronizar.'
                : 'Accede a todos los bots y herramientas de IA.'}
            </p>
            {isGuest ? (
              <Link to="/login" className="block w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center">Vincular Cuenta</Link>
            ) : (
              <Link to="/pricing" className="block w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center">Mejorar Plan</Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-4 md:px-12 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-white font-black text-lg tracking-tight uppercase">{activeCategory}</h2>
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline">
              {filteredBots.length} Bots
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Buscar bot o herramienta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-400 focus:outline-none focus:border-emerald-500/50 w-64 transition-all"
              />
            </div>
            {(user || isGuest) ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  {isGuest && (
                    <Link to="/login" className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-500/20 transition-all hidden sm:block">
                      Vincular Cuenta
                    </Link>
                  )}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-[1px]">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white">
                      {displayInitials}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 md:p-12 space-y-12">
          {activeTab === 'dashboard' ? (
            <>
              {/* Welcome Section */}
              <section>
                <div className="bg-gradient-to-br from-emerald-600 to-blue-700 rounded-[40px] p-10 md:p-16 relative overflow-hidden group shadow-2xl shadow-emerald-900/10">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        Centro de Comando
                      </span>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Actualizado hace 2 min
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter mb-8">
                      BIENVENIDO AL <br />
                      <span className="text-emerald-200">FUTURO DEL MARKETING</span>
                    </h1>
                    <p className="text-lg text-emerald-50/70 font-medium mb-10 leading-relaxed max-w-lg">
                      Tu ecosistema de IA para modelar, crear y escalar ofertas de 7 cifras. Selecciona un bot para comenzar tu próxima gran campaña.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        to="/bot/quizzes-funis" 
                        className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-black/20 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Crear Nuevo Quiz
                      </Link>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('trigger-download'))}
                        className="px-8 py-4 bg-emerald-500/30 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-emerald-500/40 flex items-center gap-2"
                      >
                        <Monitor className="w-4 h-4" /> Acceso Beta Desktop
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Overview */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Leads Totales', value: leads.length, change: '+12%', icon: Users, color: 'text-emerald-400' },
                  { label: 'Conversión Media', value: '24.8%', change: '+3.2%', icon: Activity, color: 'text-blue-400' },
                  { label: 'Quizzes Activos', value: savedQuizzes.length, change: '0', icon: Puzzle, color: 'text-purple-400' },
                  { label: 'Bots Utilizados', value: '8/13', change: 'Escalando', icon: Zap, color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{stat.change}</span>
                    </div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                  </div>
                ))}
              </section>

              {/* My Quizzes Section (Real Data) */}
              {savedQuizzes.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 rounded-full bg-purple-500" />
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Mis Quizzes Generados</h2>
                    </div>
                    <Link to="/bot/quizzes-funis" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedQuizzes.slice(0, 3).map((quiz) => (
                      <div key={quiz.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 group hover:border-purple-500/50 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                            <Puzzle className="w-6 h-6" />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => window.open(`${window.location.origin}/quiz/${quiz.id}`, '_blank')}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all"
                              title="Abrir Link Público"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => navigate('/bot/quizzes-funis')}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all"
                              title="Editar"
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{quiz.title}</h3>
                        <p className="text-xs text-zinc-500 mb-6 line-clamp-2 leading-relaxed">{quiz.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{quiz.questions.length} Preguntas</span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Bots Grid */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full bg-emerald-500" />
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Biblioteca de Bots</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBots.map((bot) => (
                    <Link key={bot.name} to={bot.path} className="group">
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 h-full flex flex-col transition-all duration-500 hover:bg-zinc-800/80 hover:shadow-2xl hover:-translate-y-1 group-hover:border-emerald-500/30">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-800/50 group-hover:scale-110 transition-transform duration-500 mb-6", bot.color)}>
                          <bot.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-white text-lg font-bold group-hover:text-emerald-400 transition-colors leading-tight mb-2">{bot.name}</h3>
                        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-6">{bot.desc}</p>
                        <div className="mt-auto pt-4 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                          Ejecutar Bot <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 rounded-full bg-blue-500" />
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">Todos los Leads Capturados</h2>
                </div>
                <button
                  onClick={() => {
                    if (leads.length === 0) return;
                    const headers = ['Nombre', 'Email', 'Quiz', 'Score', 'Fecha'];
                    const rows = leads.map(l => [
                      l.name || '',
                      l.email || '',
                      savedQuizzes.find(q => q.id === l.quizId)?.title || l.quizId,
                      l.score,
                      l.submittedAt?.toDate?.()?.toLocaleDateString() || ''
                    ]);
                    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `leads-producia-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
                >
                  Exportar CSV <Download className="w-4 h-4" />
                </button>
              </div>
              
              {leads.length > 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/50">
                          <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Lead</th>
                          <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quiz</th>
                          <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Score</th>
                          <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Fecha</th>
                          <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-all group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                  {lead.name?.[0] || lead.email?.[0] || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{lead.name || 'Sin nombre'}</p>
                                  <p className="text-[10px] text-zinc-500">{lead.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs text-zinc-400 font-medium">
                                {savedQuizzes.find(q => q.id === lead.quizId)?.title || 'Quiz Eliminado'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black">
                                {lead.score} pts
                              </span>
                            </td>
                            <td className="px-8 py-6 text-xs text-zinc-500">
                              {lead.submittedAt?.toDate ? lead.submittedAt.toDate().toLocaleDateString() : new Date(lead.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6">
                              <button 
                                onClick={() => setSelectedLead(lead)}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[32px] p-20 text-center">
                  <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-600">
                    <Users className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No hay leads aún</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">Comparte tus quizzes para empezar a capturar información de tus clientes.</p>
                </div>
              )}
            </section>
          )}

          {/* Deployment Info / Footer */}
          <section className="pt-20 pb-10">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[40px] p-10 md:p-12 border-dashed">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Rocket className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">¿Listo para Lanzar?</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    Esta es una vista previa funcional de Producia OS. Para llevar esta aplicación a tu propio dominio o presentarla a clientes reales, puedes exportar el código completo o desplegarlo en la nube con un solo clic.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Código Exportable
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cloud Ready
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> White Label
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 rounded-3xl p-8 border border-white/5">
                  <h4 className="text-white font-bold text-sm mb-4">Próximos Pasos para Creadores:</h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                      <p className="text-xs text-zinc-500"><span className="text-zinc-300 font-bold">Exportar a GitHub:</span> Sincroniza tu proyecto para control de versiones total.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                      <p className="text-xs text-zinc-500"><span className="text-zinc-300 font-bold">Configurar Dominio:</span> Conecta tu propio .com para una marca profesional.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                      <p className="text-xs text-zinc-500"><span className="text-zinc-300 font-bold">Vincular Base de Datos:</span> Activa Firebase para guardar leads de forma permanente.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Lead Details Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Detalles del Lead</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Capturado el {selectedLead.submittedAt?.toDate ? selectedLead.submittedAt.toDate().toLocaleString() : new Date(selectedLead.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/30 rounded-3xl p-6 border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Nombre Completo</p>
                    <p className="text-white font-bold">{selectedLead.name || 'No proporcionado'}</p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-3xl p-6 border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Correo Electrónico</p>
                    <p className="text-white font-bold">{selectedLead.email}</p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-3xl p-6 border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Quiz de Origen</p>
                    <p className="text-white font-bold">
                      {savedQuizzes.find(q => q.id === selectedLead.quizId)?.title || 'Quiz Eliminado'}
                    </p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-3xl p-6 border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Puntuación Obtenida</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-400">{selectedLead.score}</span>
                      <span className="text-xs font-bold text-zinc-500 uppercase">Puntos</span>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 px-2">Respuestas del Cuestionario</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedLead.answers || {}).map(([questionId, answer]: [string, any]) => {
                      const quiz = savedQuizzes.find(q => q.id === selectedLead.quizId);
                      const question = quiz?.questions.find((q: any) => q.id === questionId);
                      return (
                        <div key={questionId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
                          <p className="text-xs font-bold text-zinc-400 mb-2">{question?.text || questionId}</p>
                          <p className="text-sm font-black text-white">{answer}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cerrar Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
