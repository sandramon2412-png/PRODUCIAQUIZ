import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, CheckCircle2, Monitor, Copy, ExternalLink, Clock } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [installed, setInstalled] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone;
    if (isStandalone) setInstalled(true);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  const handleCopyLink = () => {
    const lloydUrl = window.location.origin + '/lloyd';
    navigator.clipboard.writeText(lloydUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-purple-400" />
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Descargar Lloyd</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Tu asistente de inteligencia artificial siempre disponible.
              </p>

              {/* PWA Install - Primary option */}
              <div className="space-y-3 mb-6">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instalar ahora</h4>

                {installed ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-emerald-400 font-bold">Lloyd ya esta instalado</span>
                  </div>
                ) : deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Lloyd (Web App)
                  </button>
                ) : (
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Link copiado!" : "Copiar link de Lloyd"}
                  </button>
                )}

                {!installed && !deferredPrompt && (
                  <p className="text-[10px] text-zinc-600 text-center">
                    Abre el link en Chrome y usa "Instalar app" del menu del navegador
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Proximamente</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Desktop App - Coming Soon */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-3 bg-zinc-800/50 border border-white/5 text-zinc-600 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest cursor-not-allowed">
                    <Clock className="w-3 h-3" />
                    Windows (.exe)
                  </div>
                  <div className="py-3 bg-zinc-800/50 border border-white/5 text-zinc-600 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest cursor-not-allowed">
                    <Clock className="w-3 h-3" />
                    Mac (.dmg)
                  </div>
                </div>
                <p className="text-[10px] text-zinc-700 text-center">
                  App de escritorio con ventana transparente y captura nativa
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
