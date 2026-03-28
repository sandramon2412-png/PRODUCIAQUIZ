import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Check, X, Sparkles, Zap, Crown, Rocket,
  ArrowLeft, Star, Shield, Users, Bot,
  MessageSquare, Puzzle, BarChart3, Infinity
} from 'lucide-react';

interface Plan {
  id: 'free' | 'pro' | 'agency';
  name: string;
  price: string;
  period: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: '/mes',
    description: 'Perfecto para explorar el ecosistema y crear tu primer quiz funnel.',
    icon: Zap,
    color: 'text-zinc-400',
    gradient: 'from-zinc-600 to-zinc-800',
    cta: 'Comenzar Gratis',
    features: [
      { text: '3 Quizzes activos', included: true },
      { text: '100 leads/mes', included: true },
      { text: '5 consultas AI/día', included: true },
      { text: '3 Bots básicos (Copy, Ebook, Product)', included: true },
      { text: 'Lloyd Assistant (básico)', included: true },
      { text: 'Exportar quiz como JSON', included: true },
      { text: 'Bots de Tráfico & Ads', included: false },
      { text: 'Bots de Sistemas de Negocio', included: false },
      { text: 'Modelador de Ofertas Ganadoras', included: false },
      { text: 'Redirección a Hotmart/Shopify/WhatsApp', included: false },
      { text: 'Generación de imágenes AI', included: false },
      { text: 'Soporte prioritario', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$47',
    period: '/mes',
    description: 'Para infoproductores serios que quieren escalar sus ventas digitales.',
    icon: Crown,
    color: 'text-purple-400',
    gradient: 'from-purple-600 to-indigo-700',
    cta: 'Escalar Ahora',
    popular: true,
    features: [
      { text: 'Quizzes ilimitados', included: true },
      { text: 'Leads ilimitados', included: true },
      { text: '100 consultas AI/día', included: true },
      { text: 'Todos los 13+ Bots especializados', included: true },
      { text: 'Lloyd Assistant (completo + voz)', included: true },
      { text: 'Modelador de Ofertas Ganadoras', included: true },
      { text: 'Redirección Hotmart/Shopify/WhatsApp', included: true },
      { text: 'Generación de imágenes AI para Ads', included: true },
      { text: 'Exportar HTML/JSON', included: true },
      { text: 'Analizador de Facebook Ad Library', included: true },
      { text: 'Dashboard de analytics', included: true },
      { text: 'Soporte prioritario', included: false },
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$147',
    period: '/mes',
    description: 'Para agencias y equipos que manejan múltiples marcas y clientes.',
    icon: Rocket,
    color: 'text-emerald-400',
    gradient: 'from-emerald-600 to-teal-700',
    cta: 'Dominar Todo',
    features: [
      { text: 'Todo lo del plan Pro', included: true },
      { text: 'Consultas AI ilimitadas', included: true },
      { text: 'Multi-marca (hasta 10 proyectos)', included: true },
      { text: '5 usuarios del equipo', included: true },
      { text: 'White-label (tu logo en quizzes)', included: true },
      { text: 'API access para integraciones', included: true },
      { text: 'Webhook a CRM/Email Marketing', included: true },
      { text: 'Reportes avanzados de leads', included: true },
      { text: 'Onboarding personalizado', included: true },
      { text: 'Lloyd Desktop App', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
      { text: 'Actualizaciones anticipadas', included: true },
    ]
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-[100]">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20">
                <img src="https://i.imgur.com/GWLu6bm.png" alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-none">Producia</span>
                <span className="text-[8px] font-black tracking-[0.3em] text-purple-500 uppercase">Intelligence</span>
              </div>
            </Link>
          </div>
          <Link to="/dashboard" className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5">
            Ir al Dashboard
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-3 h-3" /> Planes & Precios
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            INVIERTE EN TU <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400">IMPERIO DIGITAL</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 font-medium mb-10"
          >
            Elige el plan perfecto para tu nivel. Escala cuando estés listo.
          </motion.p>

          {/* Annual Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-full p-1.5"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!annual ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${annual ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Anual <span className="text-emerald-500 text-[9px]">-20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative rounded-[40px] border p-8 md:p-10 flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-b from-purple-600/10 to-transparent border-purple-500/30 shadow-2xl shadow-purple-500/10'
                  : 'bg-zinc-900/20 border-zinc-800/50 hover:border-zinc-700/50'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-purple-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-3 h-3 fill-current" /> Más Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white">
                    {annual && plan.price !== '$0'
                      ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8)}`
                      : plan.price
                    }
                  </span>
                  <span className="text-zinc-500 font-bold text-sm mb-2">{plan.period}</span>
                </div>
                {annual && plan.price !== '$0' && (
                  <p className="text-emerald-500 text-xs font-bold mt-1">Ahorras ${Math.round(parseInt(plan.price.replace('$', '')) * 12 * 0.2)}/año</p>
                )}
              </div>

              <div className="flex-1 space-y-3 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard"
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all text-center block ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02]'
                    : plan.id === 'agency'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white hover:scale-[1.02]'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 pb-40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tight">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes escalar o bajar de plan cuando quieras. Los cambios se aplican inmediatamente y se ajusta el cobro proporcional.' },
              { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito/débito, PayPal y transferencias bancarias a través de nuestra pasarela de pagos segura.' },
              { q: '¿Los leads se integran con mi CRM?', a: 'En el plan Agency, puedes conectar webhooks a cualquier CRM, Mailchimp, ActiveCampaign, etc. En Pro, puedes exportar leads en CSV.' },
              { q: '¿Puedo usar Producia con Hotmart o Shopify?', a: 'Sí. En los planes Pro y Agency puedes configurar la redirección del quiz directamente al checkout de Hotmart, Shopify o WhatsApp.' },
              { q: '¿Lloyd funciona offline?', a: 'Lloyd requiere conexión a internet para el procesamiento de IA. Sin embargo, las notas y la lista de tareas funcionan offline gracias a nuestra PWA.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-6 -mt-2">
                  <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20">
              <img src="https://i.imgur.com/GWLu6bm.png" alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none">Producia</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-purple-500 uppercase">Intelligence</span>
            </div>
          </Link>
          <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
            &copy; 2026 Producia AI
          </div>
        </div>
      </footer>
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
