import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Search, PenTool, Rocket, Zap,
  Sparkles, CheckCircle2, BarChart3, Puzzle
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: '¡Bienvenido a Producia!',
    subtitle: 'Tu ecosistema de IA para escalar productos digitales',
    desc: 'En menos de 5 minutos vas a entender cómo usar toda la plataforma para crear, modelar y vender ofertas ganadoras.',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
    image: null,
  },
  {
    title: 'Paso 1: Encuentra Ofertas Ganadoras',
    subtitle: 'Usa la Librería de Anuncios de Facebook',
    desc: 'Ve a la Ad Library de Facebook, busca en tu nicho y encuentra anuncios que llevan más de 30 días activos. Esos son los ganadores. Luego usa nuestro bot "Ad Library Analyzer" para analizarlos.',
    icon: Search,
    color: 'from-rose-500 to-pink-600',
    tip: 'Busca anunciantes con muchas variaciones del mismo anuncio = están escalando.',
  },
  {
    title: 'Paso 2: Modela y Mejora',
    subtitle: 'Crea tu versión diferenciada',
    desc: 'Usa el "Bot Modelador" para analizar qué hace exitosa la oferta. Luego crea tu versión mejorada: un ebook, curso o mentoría empaquetado en Gamma o Canva.',
    icon: PenTool,
    color: 'from-purple-500 to-indigo-600',
    tip: 'No copies, modela. Mejora el ángulo, la promesa y el empaquetado.',
  },
  {
    title: 'Paso 3: Crea tu Funnel',
    subtitle: 'Quiz → Landing → Checkout',
    desc: 'Crea un Quiz Funnel para calificar leads. Configura la redirección a tu checkout de Hotmart, tu tienda Shopify o tu WhatsApp. Genera la carta de ventas con nuestros bots de Copy.',
    icon: Puzzle,
    color: 'from-emerald-500 to-teal-600',
    tip: 'El quiz va después del creativo de Facebook Ads, antes del checkout.',
  },
  {
    title: 'Paso 4: Escala con Ads',
    subtitle: 'Facebook Ads + Creativos AI',
    desc: 'Usa los bots de tráfico para crear guiones de video, imágenes DTC y estrategias de escalamiento. Analiza tus métricas con el "Meta Ads Decision Engine".',
    icon: BarChart3,
    color: 'from-orange-500 to-amber-600',
    tip: 'Creativo → Quiz → Landing Page → Checkout = Venta.',
  },
  {
    title: '¡Estás Listo!',
    subtitle: 'Tu imperio digital te espera',
    desc: 'Ya tienes todas las herramientas. 13+ bots especializados, Lloyd como copiloto, Quiz Funnels con redirección, y análisis de ofertas ganadoras. Comienza ahora.',
    icon: Rocket,
    color: 'from-emerald-500 to-blue-600',
    image: null,
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('producia_onboarded', 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('producia_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden"
      >
        {/* Progress */}
        <div className="px-8 pt-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 md:p-10 space-y-6"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl`}>
              <step.icon className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{step.subtitle}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{step.title}</h2>
            </div>

            <p className="text-zinc-400 leading-relaxed">{step.desc}</p>

            {'tip' in step && step.tip && (
              <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-400/80">{step.tip}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Saltar Tour
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isLast ? 'Comenzar' : 'Siguiente'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
