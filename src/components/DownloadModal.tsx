import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, CheckCircle2, Copy, Monitor, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = React.useState<'initial' | 'os-select' | 'installing' | 'complete'>('initial');
  const [progress, setProgress] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [selectedOS, setSelectedOS] = React.useState<'windows' | 'macos' | 'linux'>('windows');
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isIframe, setIsIframe] = React.useState(false);

  React.useEffect(() => {
    // Detect if running in an iframe
    setIsIframe(window.self !== window.top);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Basic OS detection
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) setSelectedOS('macos');
    else if (platform.includes('linux')) setSelectedOS('linux');
    else setSelectedOS('windows');

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIframe) {
        alert('Estás en modo vista previa. Haz clic en el botón verde "ABRIR EN NUEVA PESTAÑA" primero para poder instalar Lloyd.');
      } else {
        alert('El navegador aún está preparando la instalación. Por favor, espera 5 segundos y vuelve a intentarlo. Asegúrate de estar usando Chrome o Edge en una pestaña normal.');
      }
      return;
    }
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleCopyLink = () => {
    const lloydUrl = window.location.origin + '/lloyd';
    navigator.clipboard.writeText(lloydUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadShortcut = () => {
    const appUrl = window.location.origin + '/lloyd';
    const appName = "Lloyd Desktop";
    
    try {
      const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Abriendo Lloyd...</title>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${appUrl}">
  <style>
    body { 
      background: #050505; 
      color: #10b981; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
    }
    .loader { 
      border: 3px solid rgba(16, 185, 129, 0.1); 
      border-top: 3px solid #10b981; 
      border-radius: 50%; 
      width: 50px; 
      height: 50px; 
      animation: spin 1s linear infinite; 
      margin-bottom: 20px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    p { font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="loader"></div>
  <p>Iniciando Lloyd Assistant...</p>
  <script>
    setTimeout(() => { window.location.href = "${appUrl}"; }, 100);
  </script>
</body>
</html>`;
      
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lanzador_Lloyd.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Move to complete step directly for this option
      setStep('complete');
    } catch (err) {
      console.error("Shortcut download failed", err);
      alert("Error al crear el lanzador. Por favor, usa el botón 'COPIAR LINK' y pégalo en una pestaña nueva.");
    }
  };

  React.useEffect(() => {
    if (step === 'installing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('complete'), 800);
            return 100;
          }
          const increment = Math.random() * 8;
          return Math.min(prev + increment, 100);
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const getInstallerContent = () => `
PRODUCIA AI - LLOYD DESKTOP BETA
----------------------------------
TOKEN DE ACCESO APP: PRODUCIA-LLOYD-TOKEN-BETA-2026
ESTADO: FASE DE PRUEBAS PRIVADA
SISTEMA: ${selectedOS.toUpperCase()}

⚠️ NOTA IMPORTANTE SOBRE LA IA:
Este "Token de Acceso" es solo para validar tu versión de la aplicación.
Para que Lloyd pueda hablar y responder, DEBES configurar tu propia "GEMINI_API_KEY"
en el panel de Secrets (icono de engranaje ⚙️) en AI Studio.

INSTRUCCIONES PARA INSTALAR LLOYD COMO APP (RECOMENDADO):
1. Abre Producia AI en Chrome o Edge.
2. Haz clic en el icono de "Instalar" en la barra de direcciones.
3. Si no aparece, ve a los 3 puntos ⋮ > Guardar y compartir > Instalar.

¡Gracias por ser parte de la comunidad Producia!
  `;

  const handleStartDownload = () => {
    setStep('installing');
    setProgress(0);
    
    // Trigger the file download with realistic extension
    try {
      const content = getInstallerContent();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      a.download = `Lloyd_ACCESO_BETA_${selectedOS.toUpperCase()}.txt`;
      
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 100);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("PRODUCIA-LLOYD-TOKEN-BETA-2024");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const osOptions = [
    { id: 'windows', name: 'Windows', icon: '🪟' },
    { id: 'macos', name: 'macOS', icon: '🍎' },
    { id: 'linux', name: 'Linux', icon: '🐧' },
  ] as const;

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
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-purple-600/10 pointer-events-none" />
            
            <div className="p-10 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Monitor className="w-7 h-7 text-emerald-500" />
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 'initial' && (
                <>
                  {isIframe && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                        <X className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">⚠️ Atención: Modo Vista Previa</p>
                        <p className="text-[10px] text-amber-200/70 leading-relaxed">
                          Estás en una ventana de vista previa. Para ver el icono de instalación, debes hacer clic en el botón <b>"Abrir en nueva pestaña"</b> (arriba a la derecha).
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Lloyd Desktop (Beta)</h3>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Lloyd es una <b>Aplicación Web Progresiva (PWA)</b>. No necesitas descargar un instalador pesado para usarlo en tu escritorio.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-6 mb-10">
                    <div 
                      onClick={handleInstallClick}
                      className={cn(
                        "p-8 border-2 rounded-[40px] shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden group cursor-pointer transition-all transform hover:scale-[1.02]",
                        deferredPrompt 
                          ? "bg-emerald-500/20 border-emerald-500 hover:bg-emerald-500/30" 
                          : "bg-zinc-800/30 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="absolute top-0 right-0 p-6">
                        <div className={cn(
                          "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg",
                          deferredPrompt ? "bg-emerald-500 text-black animate-pulse" : "bg-zinc-700 text-zinc-400"
                        )}>
                          {deferredPrompt ? "¡RECOMENDADO!" : "PWA (Nativo)"}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mb-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-3",
                          deferredPrompt ? "bg-emerald-500 shadow-emerald-500/30" : "bg-zinc-800"
                        )}>
                          <Monitor className={cn("w-8 h-8", deferredPrompt ? "text-black" : "text-zinc-500")} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                            {deferredPrompt ? "Instalar Lloyd como App" : "Instalar Aplicación"}
                          </h4>
                          <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                            {deferredPrompt ? "Haz clic para añadir al escritorio" : "Experiencia Flotante Real"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                        {deferredPrompt 
                          ? "Tu navegador está listo. Haz clic aquí para instalar Lloyd como una aplicación independiente en tu PC."
                          : "Si no ves el botón de instalar, asegúrate de estar en Chrome o Edge y busca el icono de monitor en la barra de direcciones."}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-black text-emerald-500 uppercase tracking-widest bg-black/20 w-fit px-4 py-2 rounded-full">
                        <Download className="w-4 h-4" /> {deferredPrompt ? "INSTALAR AHORA" : "MÉTODO RECOMENDADO"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        onClick={handleDownloadShortcut}
                        className="p-6 bg-zinc-800/30 border border-white/5 rounded-[32px] hover:bg-zinc-800/50 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                              <FileText className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
                            </div>
                            <Download className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                          </div>
                          <h4 className="text-xs font-black text-zinc-400 group-hover:text-white uppercase tracking-widest mb-2">Acceso Directo</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Descarga un lanzador <b>.html</b> para tu escritorio. (Solo si falla la opción de arriba).
                          </p>
                        </div>
                      </div>

                      <div 
                        onClick={handleCopyLink}
                        className="p-6 bg-zinc-800/30 border border-white/5 rounded-[32px] hover:bg-zinc-800/50 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                              <Copy className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                          </div>
                          <h4 className="text-xs font-black text-zinc-400 group-hover:text-white uppercase tracking-widest mb-2">Copiar URL</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Copia el link directo para abrir en una pestaña nueva y forzar la instalación.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selecciona tu Sistema para el Token</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {osOptions.map(os => (
                        <button
                          key={os.id}
                          onClick={() => setSelectedOS(os.id)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                            selectedOS === os.id 
                              ? "bg-emerald-500/10 border-emerald-500 text-white" 
                              : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                          )}
                        >
                          <span className="text-2xl">{os.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{os.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> ¡IMPORTANTE: CONFIGURACIÓN DE IA!
                    </h4>
                    <p className="text-[11px] text-zinc-300 leading-relaxed mb-4">
                      Para que Lloyd pueda responder, debes configurar tu propia <b>GEMINI_API_KEY</b> en AI Studio. El "Token de Acceso" que descargas es solo para la versión Beta de la App, no es la llave de la IA.
                    </p>
                    <div className="space-y-4 mb-6">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          Ve al panel de <b>Secrets</b> (icono ⚙️ en AI Studio).
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          Añade una variable llamada <code className="bg-zinc-800 px-1 rounded text-emerald-400">GEMINI_API_KEY</code> con tu llave de Google AI.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        try {
                          const apiKey = process.env.GEMINI_API_KEY || "";
                          if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
                            alert("❌ API Key no detectada. Por favor, configúrala en el panel de Secrets.");
                          } else {
                            alert("✅ API Key detectada correctamente. Lloyd debería poder responder.");
                          }
                        } catch (e) {
                          alert("❌ Error al verificar la API Key.");
                        }
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/5"
                    >
                      VERIFICAR ESTADO DE LA API
                    </button>
                  </div>

                  <div className="mb-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-[32px]">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> GUÍA DE INSTALACIÓN NATIVA
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">A</div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          En la barra de direcciones de Chrome/Edge, busca el icono de <b>"Instalar"</b> (un monitor con una flecha).
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">B</div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          Si no lo ves, haz clic en los <b>3 puntos ⋮</b> &gt; <b>Guardar y compartir</b> &gt; <b>Instalar Producia AI</b>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">C</div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          <b>IMPORTANTE:</b> No uses el botón "Descargar Lanzador" si quieres la experiencia de App real; ese botón es solo un respaldo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => window.open(window.location.origin + '/lloyd', '_blank')}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
                    >
                      ABRIR LLOYD EN PESTAÑA NUEVA <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleCopyLink}
                        className="py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} 
                        {copied ? "COPIADO" : "COPIAR LINK"}
                      </button>
                      <button
                        onClick={() => setStep('os-select')}
                        className="py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        OTRAS OPCIONES <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 'os-select' && (
                <>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Confirmar Descarga</h3>
                  <p className="text-zinc-400 text-sm mb-10 leading-relaxed">
                    Se descargará el instalador para <span className="text-emerald-400 font-bold">{selectedOS.toUpperCase()}</span>. 
                    Una vez completado, ejecuta el archivo para iniciar la configuración de Lloyd.
                  </p>
                  
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">Lloyd_BETA_INFO_{selectedOS.toUpperCase()}.txt</p>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Documento de Acceso Beta</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('initial')}
                      className="flex-1 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-sm transition-all"
                    >
                      ATRÁS
                    </button>
                    <button
                      onClick={handleStartDownload}
                      className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
                    >
                      DESCARGAR TOKEN E INFO
                    </button>
                  </div>
                </>
              )}

              {step === 'installing' && (
                <div className="py-8">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Instalando...</h3>
                      <p className="text-zinc-500 text-xs mt-1">Desempaquetando componentes de IA...</p>
                    </div>
                    <span className="text-emerald-500 font-mono text-xl font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-10 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Core Engine', status: progress > 30 ? 'Listo' : 'Cargando...' },
                      { label: 'Voice Processing', status: progress > 60 ? 'Listo' : 'Cargando...' },
                      { label: 'Floating UI', status: progress > 85 ? 'Listo' : 'Cargando...' },
                      { label: 'Cloud Sync', status: progress > 95 ? 'Listo' : 'Cargando...' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.label}</span>
                        <span className={cn("text-[10px] font-black uppercase", item.status === 'Listo' ? "text-emerald-500" : "text-zinc-600")}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'complete' && (
                <>
                  <div className="flex flex-col items-center text-center py-6">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">¡Lloyd está Listo!</h3>
                    <p className="text-zinc-400 text-sm mb-10 leading-relaxed px-4">
                      La instalación se ha completado con éxito. Lloyd ahora vive en tu escritorio y está listo para ayudarte.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={onClose}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20"
                    >
                      ABRIR LLOYD DESKTOP
                    </button>
                    <button
                      onClick={handleCopy}
                      className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> TOKEN COPIADO
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" /> COPIAR TOKEN DE ACCESO
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Troubleshooting Section */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white/40 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <AlertCircle className="w-3 h-3 text-amber-500/50" />
                  ¿Problemas con la instalación?
                </h4>
                <div className="space-y-3 text-[10px] text-white/30 leading-relaxed font-medium">
                  <p>• Si ya instalaste la app antes, <span className="text-white/60">desinstálala primero</span> para que los nuevos cambios (como el modo flotante) se apliquen.</p>
                  <p>• Asegúrate de configurar tu <span className="text-emerald-400 font-bold">GEMINI_API_KEY</span> en el panel de <b>Secrets</b> (icono de engranaje ⚙️) para que Lloyd pueda responder.</p>
                  <p>• Asegúrate de estar en una pestaña normal de <span className="text-white/60">Chrome o Edge</span> (no modo incógnito).</p>
                  <p>• Si el botón de arriba no funciona, usa la <span className="text-white/60">Opción 2</span> para descargar el lanzador directo a tu escritorio.</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Lloyd Engine v1.0.4-BETA</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Seguro</span>
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Verificado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
