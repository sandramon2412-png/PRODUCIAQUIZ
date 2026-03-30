import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, CheckCircle2, Monitor, Copy, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOWNLOAD_URLS = {
  windows: 'https://github.com/sandramon2412-png/PRODUCIAQUIZ/releases/download/v1.0.9/Lloyd.Assistant.Setup.1.0.9.exe',
  macIntel: 'https://github.com/sandramon2412-png/PRODUCIAQUIZ/releases/download/v1.0.9/Lloyd.Assistant-1.0.9.dmg',
  macArm: 'https://github.com/sandramon2412-png/PRODUCIAQUIZ/releases/download/v1.0.9/Lloyd.Assistant-1.0.9-arm64.dmg',
};

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [installed, setInstalled] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac = platform.includes('mac');
  const isWindows = platform.includes('win');
  const isArmMac = isMac && (userAgent.includes('arm') || (navigator as any).userAgentData?.architecture === 'arm');

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

  const getMainDownloadUrl = () => {
    if (isWindows) return DOWNLOAD_URLS.windows;
    if (isMac && isArmMac) return DOWNLOAD_URLS.macArm;
    if (isMac) return DOWNLOAD_URLS.macIntel;
    return DOWNLOAD_URLS.windows;
  };

  const getMainLabel = () => {
    if (isWindows) return 'Descargar para Windows';
    if (isMac) return 'Descargar para Mac';
    return 'Descargar para Windows';
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
                App de escritorio con ventana transparente, captura de pantalla y siempre visible.
              </p>

              {/* Desktop App Downloads */}
              <div className="space-y-3 mb-6">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">App de Escritorio (Recomendado)</h4>

                <a
                  href={getMainDownloadUrl()}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20"
                >
                  <Download className="w-5 h-5" />
                  {getMainLabel()}
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={DOWNLOAD_URLS.windows}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    Windows (.exe)
                  </a>
                  <a
                    href={isArmMac ? DOWNLOAD_URLS.macArm : DOWNLOAD_URLS.macIntel}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    Mac (.dmg)
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">O usa la version web</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* PWA Install */}
              {installed ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-emerald-400 font-bold">Version web ya instalada</span>
                </div>
              ) : deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Instalar version web (PWA)
                </button>
              ) : (
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Link copiado" : "Copiar link de Lloyd"}
                </button>
              )}

              <p className="text-[9px] text-zinc-700 text-center mt-4">
                Atajo: Ctrl+Shift+L para mostrar/ocultar Lloyd
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
