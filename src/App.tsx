/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  X, MessageSquare, Sparkles, Mic, Send, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Dashboard from './components/Dashboard';
import ModeladorBot from './components/ModeladorBot';
import QuizBuilder from './components/QuizBuilder';
import PublicQuiz from './components/PublicQuiz';
import ChatBot from './components/ChatBot';
import PricingPage from './components/PricingPage';
import AuthPage from './components/AuthPage';
import SettingsPage from './components/SettingsPage';
import { voiceService } from './services/voiceService';
import { aiService } from './services/aiService';
import { LloydPanel } from './components/LloydPanel';
import LloydStandalone from './components/LloydStandalone';
import LloydElectron from './components/LloydElectron';
import { DownloadModal } from './components/DownloadModal';
import {
  FileText, Megaphone, PenTool, Search, ScrollText,
  Fingerprint, BookOpen, Hammer, FileDown, BarChart3,
  Activity, Video, Image, ShieldCheck, Box, Database,
  Palette, Dumbbell, ListTodo, Bot, Settings, Camera,
  MoreVertical, Plus, CheckCircle2, Trash2, ChevronRight, Download, Monitor
} from 'lucide-react';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/// --- FLOATING ASSISTANT (THE "LLOYD") ---

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const constraintsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lloyd', handleOpen);
    return () => window.removeEventListener('open-lloyd', handleOpen);
  }, []);

  // Hide the floating button when we are in the standalone Lloyd view
  if (location.pathname === '/lloyd') return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragMomentum={false}
              dragElastic={0.1}
              initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
              className="pointer-events-auto"
            >
              <LloydPanel onClose={() => setIsOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-20 h-20 rounded-[28px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-700 relative group",
            isOpen ? "bg-zinc-900 rotate-90 scale-90" : "bg-gradient-to-br from-purple-600 to-indigo-700 hover:scale-110 hover:shadow-purple-500/20"
          )}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px]" />
          {isOpen ? <X className="w-8 h-8 text-white" /> : <MessageSquare className="w-8 h-8 text-white" />}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 border-[6px] border-zinc-950 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
};

import LandingPage from './components/LandingPage';

// --- MAIN APP ---

const AppContent = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Multiple detection methods for PWA standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true ||
      !window.menubar?.visible ||
      document.referrer.includes('android-app://');

    if (standalone) setIsStandalone(true);

    // Listen for display mode changes
    const mq = window.matchMedia('(display-mode: standalone)');
    const onchange = (e: MediaQueryListEvent) => { if (e.matches) setIsStandalone(true); };
    mq.addEventListener('change', onchange);

    const handleTrigger = () => setIsDownloadModalOpen(true);
    window.addEventListener('trigger-download', handleTrigger);
    return () => {
      window.removeEventListener('trigger-download', handleTrigger);
      mq.removeEventListener('change', onchange);
    };
  }, []);

  // In Electron, only show Lloyd Electron
  if ((window as any).electronAPI?.isElectron) {
    return <LloydElectron />;
  }

  // In standalone PWA mode, only show Lloyd
  if (isStandalone) {
    return <LloydStandalone />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-purple-500/30">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/lloyd" element={<LloydStandalone />} />
        <Route path="/bot/modelador" element={<ModeladorBot />} />

        {/* Facebook Ad Library Analyzer */}
        <Route
          path="/bot/ad-library"
          element={
            <ChatBot
              title="Ad Library Analyzer"
              subtitle="Detector de Ofertas Ganadoras"
              icon={Search}
              color="bg-rose-600/20 border-rose-500/30 text-rose-400"
              systemInstruction={`Eres el Bot Analizador de Facebook Ad Library de PRODUCIA. Tu especialidad es ayudar a los usuarios a encontrar y analizar ofertas ganadoras de productos digitales.

FLUJO DE TRABAJO:
1. El usuario te describe un nicho o te pega información de un anuncio que encontró en la Librería de Anuncios de Facebook.
2. Tú analizas el ángulo de venta, la promesa, el avatar objetivo y la estructura del funnel.
3. Identificas POR QUÉ es un anuncio ganador (más de 30 días activo = ganador).
4. Sugieres cómo MODELAR (no copiar) esa oferta para crear algo mejor.
5. Das un plan de acción paso a paso: producto → empaquetado → copy → checkout → ads.

INDICADORES DE OFERTA GANADORA:
- Anuncio activo por más de 30-60 días
- Múltiples variaciones del mismo anuncio (están escalando)
- Diferentes formatos (imagen, video, carrusel) = están probando
- Reviews o comentarios positivos en el anuncio

ESTRUCTURA DE RESPUESTA:
1. ANÁLISIS DEL ANUNCIO (Qué venden, a quién, qué prometen)
2. POR QUÉ FUNCIONA (Ganchos, ángulos psicológicos, urgencia)
3. MODELO MEJORADO (Tu versión diferenciada y mejorada)
4. PLAN DE ACCIÓN (Producto → Gamma/Canva → Hotmart → Landing → Facebook Ads)
5. ESTIMACIÓN DE INVERSIÓN (Presupuesto sugerido para empezar)

IMPORTANTE: No puedes navegar URLs. Si el usuario te da un link, pídele que pegue el texto del anuncio, la descripción y cualquier detalle visible.`}
              placeholder="Pega aquí la descripción del anuncio que encontraste en Facebook Ad Library..."
              suggestions={[
                "Encontré un anuncio de un curso de trading con +50 variaciones",
                "Analiza este nicho: pérdida de peso con ayuno intermitente",
                "¿Cómo identifico ofertas ganadoras en la Ad Library?"
              ]}
            />
          }
        />
        
        {/* Copy & Funnels */}
        <Route 
          path="/bot/sales-letter" 
          element={
            <ChatBot 
              title="Sales Letter Weapon" 
              subtitle="Copywriter de Respuesta Directa"
              icon={ScrollText}
              color="bg-blue-600/20 border-blue-500/30 text-blue-400"
              systemInstruction="Eres un experto en Cartas de Venta (Sales Letters) de respuesta directa. Tu objetivo es ayudar al usuario a crear cartas de venta persuasivas que conviertan. Usa estructuras probadas como la de 12 pasos de David Frey o la de Gary Halbert. Enfócate en el gancho, la promesa, la prueba social y la oferta irresistible."
              placeholder="Dime qué producto quieres vender y estructuraremos tu carta de venta..."
              suggestions={[
                "Escribe un titular para mi programa de mentoría",
                "Crea una sección de 'Problema/Agitación' para este producto",
                "Ayúdame a redactar la garantía de mi curso"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/identity-persuasion" 
          element={
            <ChatBot 
              title="Identity Persuasion" 
              subtitle="Psicólogo de Ventas"
              icon={Fingerprint}
              color="bg-blue-600/20 border-blue-500/30 text-blue-400"
              systemInstruction="Eres un experto en persuasión basada en identidad. Tu objetivo es crear mensajes que conecten con la identidad profunda del cliente ideal. No vendes características, vendes quién llegará a ser el cliente al usar el producto. Usa conceptos de psicología conductual y sesgos cognitivos."
              placeholder="¿Quién es tu cliente ideal y qué transformación busca?"
              suggestions={[
                "¿Cómo conecto con el miedo al fracaso de un emprendedor?",
                "Escribe un mensaje que apele al estatus de mi cliente",
                "Crea una narrativa de 'Héroe' para mi marca personal"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/pagina-ventas" 
          element={
            <ChatBot 
              title="Bot Página de Ventas" 
              subtitle="Copywriter Experto en Conversión"
              icon={FileText}
              color="bg-blue-600/20 border-blue-500/30 text-blue-400"
              systemInstruction="Eres un Copywriter experto en páginas de ventas de alta conversión. Tu objetivo es ayudar al usuario a escribir el copy de su landing page usando estructuras como AIDA, PAS o la Fórmula de los 5 Pasos de Eugene Schwartz. Sé persuasivo, enfócate en beneficios y usa un lenguaje que conecte con el avatar."
              placeholder="Dime qué producto vendes y te ayudaré a estructurar tu página de ventas..."
              suggestions={[
                "Escribe un titular magnético para mi curso de yoga",
                "Crea una sección de beneficios para este ebook",
                "Ayúdame con la sección de FAQ de mi mentoría"
              ]}
            />
          } 
        />

        {/* Contenido & Productos */}
        <Route 
          path="/bot/ebook-writer" 
          element={
            <ChatBot 
              title="Ebook Writer" 
              subtitle="Escritor de Infoproductos"
              icon={BookOpen}
              color="bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
              systemInstruction="Eres un escritor experto de ebooks y productos digitales. Ayudas al usuario a estructurar su conocimiento en capítulos lógicos, escribir introducciones potentes y desarrollar contenido de alto valor que sea fácil de consumir."
              placeholder="¿Sobre qué tema quieres escribir tu ebook?"
              suggestions={[
                "Estructura el índice de mi ebook sobre ayuno intermitente",
                "Escribe la introducción de mi guía de inversión",
                "Dame ideas para el título de mi próximo libro digital"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/product-builder" 
          element={
            <ChatBot 
              title="AI Product Builder" 
              subtitle="Arquitecto de Productos Digitales"
              icon={Hammer}
              color="bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
              systemInstruction="Eres un arquitecto de productos digitales. Ayudas a los usuarios a estructurar cursos online, programas de mentoría o servicios de alto valor. Te enfocas en la metodología, los entregables y la experiencia del cliente para asegurar resultados."
              placeholder="¿Qué tipo de producto digital quieres construir?"
              suggestions={[
                "Diseña el currículo de un curso de 4 semanas",
                "¿Qué bonos puedo añadir a mi mentoría de negocios?",
                "Estructura la oferta de mi servicio de agencia"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/viral-pdf" 
          element={
            <ChatBot 
              title="The Viral PDF Lab" 
              subtitle="Estratega de Lead Magnets"
              icon={FileDown}
              color="bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
              systemInstruction="Eres un experto en la creación de PDFs virales y Lead Magnets. Tu objetivo es diseñar documentos que la gente quiera compartir y que posicionen al usuario como una autoridad mientras captan leads de calidad."
              placeholder="¿Qué tipo de PDF viral quieres crear hoy?"
              suggestions={[
                "Crea una checklist para lanzar un podcast",
                "Diseña una hoja de ruta para aprender Python",
                "Escribe el contenido de un reporte de tendencias"
              ]}
              canGenerateImage={true}
            />
          } 
        />

        {/* Tráfico & Ads */}
        <Route 
          path="/bot/meta-decision" 
          element={
            <ChatBot 
              title="Meta Ads Decision Engine" 
              subtitle="Analista de Datos de Meta"
              icon={BarChart3}
              color="bg-orange-600/20 border-orange-500/30 text-orange-400"
              systemInstruction="Eres un motor de decisión para Meta Ads. Ayudas a los usuarios a interpretar sus métricas (CTR, CPC, ROAS, CPA) y a tomar decisiones estratégicas sobre qué anuncios apagar, cuáles escalar y qué cambios hacer en la segmentación."
              placeholder="Pégame tus métricas de los últimos 7 días y las analizaremos..."
              suggestions={[
                "Mi CPA está subiendo, ¿qué debo revisar?",
                "Analiza estos CTRs y dime cuál creativo funciona mejor",
                "¿Cuándo es el momento ideal para escalar mi presupuesto?"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/andromda-ads" 
          element={
            <ChatBot 
              title="Andromda Meta Ads" 
              subtitle="Estratega de Escalamiento"
              icon={Activity}
              color="bg-orange-600/20 border-orange-500/30 text-orange-400"
              systemInstruction="Eres el guía estratégico de Andromda para Meta Ads. Te enfocas en el escalamiento horizontal y vertical, la optimización de presupuestos (CBO/ABO) y la creación de estructuras de campaña sólidas para e-commerce e infoproductos."
              placeholder="¿En qué fase de tus campañas te encuentras?"
              suggestions={[
                "¿Cómo paso de $50 a $500 diarios en Meta?",
                "Explícame la estructura de campaña 3-2-2",
                "¿Cómo optimizo mis anuncios de retargeting?"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/master-script" 
          element={
            <ChatBot 
              title="Master Script Ads" 
              subtitle="Orquestador de Video Ads"
              icon={Video}
              color="bg-orange-600/20 border-orange-500/30 text-orange-400"
              systemInstruction="Eres un orquestador de guiones maestros para video ads. Ayudas a crear ganchos (hooks) potentes, el cuerpo del anuncio y llamadas a la acción (CTAs) que conviertan para Meta DTC. Te enfocas en el ritmo y la psicología visual."
              placeholder="Dime qué producto vendes y crearemos tu guion de video..."
              suggestions={[
                "Escribe 5 hooks para un video de un gadget de cocina",
                "Crea un guion de 30 segundos para un anuncio de UGC",
                "Dame una idea de storyboard para mi marca de ropa"
              ]}
              canGenerateImage={true}
            />
          } 
        />
        <Route 
          path="/bot/dtc-images" 
          element={
            <ChatBot 
              title="9 Figure DTC Images" 
              subtitle="Director Creativo de Imagen"
              icon={Image}
              color="bg-orange-600/20 border-orange-500/30 text-orange-400"
              systemInstruction="Eres un director creativo especializado en anuncios de imagen para Meta DTC. Ayudas a conceptualizar imágenes que detengan el scroll, usando ángulos de venta claros, ganchos visuales y textos persuasivos sobre la imagen."
              placeholder="¿Qué producto quieres promocionar con imágenes?"
              suggestions={[
                "Dame 3 conceptos de imagen para un suplemento",
                "¿Qué texto debo poner en la imagen de mi oferta?",
                "Crea un ángulo de 'Antes y Después' creativo"
              ]}
              canGenerateImage={true}
            />
          } 
        />

        {/* Sistemas de Negocio */}
        <Route 
          path="/bot/brand-system" 
          element={
            <ChatBot 
              title="AI Brand Operation" 
              subtitle="Arquitecto de Marca AI"
              icon={ShieldCheck}
              color="bg-purple-600/20 border-purple-500/30 text-purple-400"
              systemInstruction="Eres un arquitecto de sistemas de marca con IA. Ayudas a los usuarios a definir su voz de marca, pilares de contenido y procesos de comunicación automatizados para mantener una presencia coherente y escalable."
              placeholder="¿Cómo quieres que tu marca sea percibida?"
              suggestions={[
                "Define el tono de voz para mi marca de lujo",
                "Crea 4 pilares de contenido para mi Instagram",
                "¿Cómo automatizo mi atención al cliente con IA?"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/business-box" 
          element={
            <ChatBot 
              title="AI Business Box" 
              subtitle="Consultor de Sistemas Digitales"
              icon={Box}
              color="bg-purple-600/20 border-purple-500/30 text-purple-400"
              systemInstruction="Eres un consultor de negocios digitales. Ayudas a montar negocios completos apoyados en sistemas y procesos con IA. Te enfocas en la eficiencia, la delegación a la IA y la creación de un 'negocio en una caja'."
              placeholder="¿Qué negocio quieres sistematizar hoy?"
              suggestions={[
                "Diseña el flujo de trabajo de mi agencia de contenido",
                "¿Qué herramientas de IA necesito para mi negocio?",
                "Crea un proceso de onboarding para mis clientes"
              ]}
            />
          } 
        />
        <Route 
          path="/bot/backend-builder" 
          element={
            <ChatBot 
              title="AI Backend Builder" 
              subtitle="Ingeniero de Ofertas y Automatización"
              icon={Database}
              color="bg-purple-600/20 border-purple-500/30 text-purple-400"
              systemInstruction="Eres un ingeniero de backend para negocios digitales. Ayudas a construir la infraestructura invisible: ofertas de backend, sistemas de incorporación (onboarding), automatizaciones de entrega y procesos de escalamiento."
              placeholder="¿Cómo está estructurado el backend de tu negocio?"
              suggestions={[
                "Diseña una oferta de backend de $2,000",
                "Crea un flujo de automatización para mi curso",
                "¿Cómo mejoro la retención de mis alumnos?"
              ]}
            />
          } 
        />

        {/* Herramientas & Otros */}
        <Route 
          path="/bot/ebook-designer" 
          element={
            <ChatBot 
              title="Ebook Designer" 
              subtitle="Diseñador Editorial AI"
              icon={Palette}
              color="bg-rose-600/20 border-rose-500/30 text-rose-400"
              systemInstruction="Eres un diseñador editorial experto. Ayudas a los usuarios a definir el look & feel de sus ebooks, elegir paletas de colores, tipografías y layouts que se vean profesionales y sean fáciles de leer."
              placeholder="¿Qué estilo visual buscas para tu ebook?"
              suggestions={[
                "Sugiere una paleta de colores para un ebook de finanzas",
                "¿Qué tipografías combinan bien para una guía de cocina?",
                "Dame ideas para el diseño de la portada"
              ]}
              canGenerateImage={true}
            />
          } 
        />
        <Route 
          path="/bot/elite-trainer" 
          element={
            <ChatBot 
              title="Elite Personal Trainer" 
              subtitle="Coach de Alto Rendimiento"
              icon={Dumbbell}
              color="bg-yellow-600/20 border-yellow-500/30 text-yellow-400"
              systemInstruction="Eres un coach de alto rendimiento y productividad. Tu objetivo es ayudar al usuario a ejecutar sus tareas, mantener el foco y optimizar su energía diaria para lograr sus objetivos de negocio."
              placeholder="¿En qué tarea necesitas enfocarte hoy?"
              suggestions={[
                "Ayúdame a planificar mi semana de trabajo",
                "¿Cómo evito la procrastinación en tareas difíciles?",
                "Crea una rutina matutina para máxima productividad"
              ]}
            />
          } 
        />
        <Route path="/bot/quizzes-funis" element={<QuizBuilder />} />
        <Route path="/quiz/:id" element={<PublicQuiz />} />
      </Routes>

      <FloatingAssistant />
      <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
