import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, ArrowRight, Zap, Target, 
  ShieldCheck, BarChart3, Rocket, ChevronRight,
  Monitor, Layout, Puzzle, MessageSquare,
  Play, CheckCircle2, Globe, Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-[100]">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <img 
                src="https://i.imgur.com/plFiciT.jpeg" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none">Producia</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-purple-500 uppercase">Intelligence</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Ecosistema</a>
            <a href="#lloyd" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Lloyd AI</a>
            <Link 
              to="/dashboard" 
              className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5"
            >
              Acceso Cliente
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[140px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
          <div className="max-w-185xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest mb-8"
            >
              <Sparkles className="w-3 h-3" /> Ecosistema de Escalamiento Digital
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[110px] font-black tracking-tight leading-[0.95] mb-10"
            >
              MODELA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400">PRODUCTOS</span> <br />
              GANADORES.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-4xl font-medium"
            >
              La primera plataforma de Inteligencia Artificial diseñada para que infoproductores y agencias modelen, creen y escalen ofertas de 7 cifras con precisión quirúrgica.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-5"
            >
              <Link 
                to="/dashboard" 
                className="px-12 py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-purple-600/40 flex items-center gap-4"
              >
                Comenzar Ahora <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-12 py-6 bg-zinc-900/50 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-zinc-800 flex items-center gap-4">
                Ver Demo <Play className="w-4 h-4 fill-current" />
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex items-center gap-8 border-t border-white/5 pt-8"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020203] bg-zinc-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">+500 Usuarios</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Escalando con Producia</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative aspect-[9/16] w-full mx-auto bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl group">
              <img 
                src="https://i.imgur.com/plFiciT.jpeg" 
                alt="Producia AI Interface" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-black/20 opacity-90 group-hover:scale-115 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020203]/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 p-5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ROAS Actual</div>
                    <div className="text-xl font-black">4.82x</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10 p-5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI Analysis</div>
                    <div className="text-xs font-bold">Oferta Optimizada</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">Un Ecosistema <span className="text-purple-500">Sin Límites</span></h2>
            <p className="text-zinc-500 font-medium">Todo lo que necesitas para construir un imperio digital, orquestado por Inteligencia Artificial.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "AI Quiz Builder",
                desc: "Funnels de calificación que filtran leads y cierran ventas automáticamente.",
                icon: Puzzle,
                color: "from-emerald-500 to-teal-500"
              },
              {
                title: "Copywriting Elite",
                desc: "Bots entrenados en las estructuras de venta más potentes del mundo.",
                icon: Layout,
                color: "from-purple-500 to-indigo-500"
              },
              {
                title: "Ads Decision",
                desc: "Toma decisiones basadas en datos reales y escala tus campañas de Meta.",
                icon: BarChart3,
                color: "from-orange-500 to-rose-500"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 bg-zinc-900/20 border border-white/5 rounded-[48px] hover:border-purple-500/30 transition-all group relative overflow-hidden"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-xl`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-6 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
                <div className="mt-10 flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar Módulo <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lloyd Section */}
      <section id="lloyd" className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-purple-600/5 blur-[160px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
              <MessageSquare className="w-3 h-3" /> Inteligencia Central
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              CONOCE A <span className="text-purple-500">LLOYD</span>, <br />
              TU COPILOTO.
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium">
              Lloyd no es un chatbot común. Es un estratega de marketing que vive en tu pantalla, capaz de analizar tu oferta, redactar tus anuncios y optimizar tu negocio en tiempo real.
            </p>
            <div className="flex flex-wrap gap-5">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-download'))}
                className="px-10 py-5 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl"
              >
                Descargar Lloyd <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-[100px] border border-white/10 flex items-center justify-center p-16 relative">
              <div className="absolute inset-0 bg-purple-500/10 blur-[120px] animate-pulse" />
              <div 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-download'))}
                className="w-full h-full bg-zinc-950 rounded-[80px] shadow-[0_0_100px_rgba(168,85,247,0.2)] border border-white/5 flex items-center justify-center overflow-hidden relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:bg-purple-500/10 transition-colors" />
                <Cpu className="w-40 h-40 text-purple-500 group-hover:scale-110 transition-transform duration-700" />
                
                {/* Visual indicator of "Active" */}
                <div className="absolute bottom-12 flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Lloyd Engine Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[60px] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-purple-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-10 uppercase leading-none">¿LISTO PARA <br />ESCALAR?</h2>
            <p className="text-purple-100 text-lg mb-12 max-w-xl mx-auto font-medium opacity-80">Únete a la nueva era del marketing digital impulsado por Inteligencia Artificial.</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-4 px-12 py-6 bg-white text-purple-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl"
            >
              Acceso Inmediato <Rocket className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20">
              <img 
                src="https://i.imgur.com/plFiciT.jpeg" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none">Producia</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-purple-500 uppercase">Intelligence</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
          <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
            © 2026 Producia AI
          </div>
        </div>
      </footer>
    </div>
  );
}

function Download({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  );
}
