import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LloydPanel } from './LloydPanel';
import { Monitor, X } from 'lucide-react';

export default function LloydStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [apiKeyMissing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    document.title = "Lloyd Assistant";
    document.body.style.backgroundColor = "black";
    
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone ||
                           document.referrer.includes('android-app://');
    
    setIsStandalone(checkStandalone);
    
    // PWA Install Prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Show manual install prompt if not standalone after a short delay
    if (!checkStandalone) {
      const timer = setTimeout(() => setShowInstallPrompt(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      document.body.style.backgroundColor = "";
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or if it's already installed
      alert("Para instalar Lloyd como App:\n1. Haz clic en los 3 puntos ⋮ del navegador\n2. Selecciona 'Guardar y compartir'\n3. Haz clic en 'Instalar Producia AI'");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Immersive background that feels like transparency */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence>
        {apiKeyMissing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl px-6 py-4 flex flex-col items-center gap-3 shadow-2xl max-w-[90%]"
          >
            <div className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">API Key no configurada</span>
            </div>
            <p className="text-[10px] text-white/60 text-center leading-relaxed">
              Lloyd no puede conectarse al servicio de IA. Intenta recargar la página.
            </p>
          </motion.div>
        )}
        {showInstallPrompt && !isStandalone && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 flex items-center gap-3 shadow-2xl"
          >
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] text-white/80 font-medium">Instala Lloyd para una experiencia flotante real</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleInstallClick}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-[10px] font-bold rounded-full border border-purple-500/30 transition-all"
              >
                INSTALAR
              </button>
              <button 
                onClick={() => setShowInstallPrompt(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full z-10 relative"
      >
        <div className="w-full h-full bg-zinc-900/40 backdrop-blur-3xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <LloydPanel isStandalone={true} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
