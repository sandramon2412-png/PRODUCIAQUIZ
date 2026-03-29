import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, CheckCircle2, Monitor, Copy, ExternalLink } from 'lucide-react';

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

    // Check if already installed
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

  const handleOpenNewTab = () => {
    window.open(window.location.origin + '/lloyd', '_blank');
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

              <h3 className="text-2xl font-black text-white mb-2">Instalar Lloyd</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Instala Lloyd como app independiente en tu dispositivo. Se abre en su propia ventana, sin barra del navegador.
              </p>

              {installed ? (
                /* Already installed */
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-black text-white mb-2">Lloyd ya esta instalado</h4>
                  <p className="text-zinc-500 text-sm mb-6">Busca "Lloyd Assistant" en tus aplicaciones.</p>
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-sm transition-all"
                  >
                    CERRAR
                  </button>
                </div>
              ) : deferredPrompt ? (
                /* Browser supports install */
                <div className="space-y-4">
                  <button
                    onClick={handleInstall}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20"
                  >
                    <Download className="w-5 h-5" />
                    INSTALAR COMO APP
                  </button>
                  <p className="text-center text-[10px] text-zinc-600">
                    Se instala en segundos. Sin descargas pesadas.
                  </p>
                </div>
              ) : (
                /* Browser doesn't support beforeinstallprompt - show manual instructions */
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">
                      Pasos para instalar
                    </h4>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                      <p className="text-sm text-zinc-300">
                        Abre Lloyd en <b>Chrome</b> o <b>Edge</b> en una pestaña nueva
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                      <p className="text-sm text-zinc-300">
                        Haz clic en los <b>3 puntos</b> del navegador (arriba a la derecha)
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</div>
                      <p className="text-sm text-zinc-300">
                        Selecciona <b>"Instalar Lloyd Assistant"</b> o <b>"Guardar y compartir" &gt; "Instalar"</b>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleOpenNewTab}
                      className="py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      ABRIR LLOYD
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "COPIADO" : "COPIAR LINK"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
