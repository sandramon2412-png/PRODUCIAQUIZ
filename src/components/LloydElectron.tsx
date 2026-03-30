import { useState, useEffect } from 'react';
import { LloydPanel } from './LloydPanel';
import { Minus, X, Pin, PinOff, ChevronUp, ChevronDown, Settings, Save, Key } from 'lucide-react';

declare global {
  interface Window {
    electronAPI?: {
      captureScreenshot: () => Promise<string | null>;
      toggleCompact: () => Promise<boolean>;
      getCompactState: () => Promise<boolean>;
      minimizeToTray: () => Promise<void>;
      toggleAlwaysOnTop: () => Promise<boolean>;
      closeApp: () => Promise<void>;
      isElectron: boolean;
    };
  }
}

export default function LloydElectron() {
  const [isCompact, setIsCompact] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('producia_groq_key') || '');
  const [claudeKey, setClaudeKey] = useState(() => localStorage.getItem('producia_claude_key') || '');
  const [saved, setSaved] = useState(false);

  // Show settings automatically if no API keys configured
  const hasKeys = !!(groqKey || claudeKey || (import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.VITE_CLAUDE_API_KEY);

  useEffect(() => {
    document.title = "Lloyd Assistant";
    if (!hasKeys) setShowSettings(true);
  }, []);

  const handleSaveKeys = () => {
    if (groqKey) localStorage.setItem('producia_groq_key', groqKey);
    if (claudeKey) localStorage.setItem('producia_claude_key', claudeKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
      window.location.reload(); // Reload to pick up new keys
    }, 1000);
  };

  const handleToggleCompact = async () => {
    if (window.electronAPI) {
      const compact = await window.electronAPI.toggleCompact();
      setIsCompact(compact);
    }
  };

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeToTray();
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.closeApp();
    }
  };

  const handleTogglePin = async () => {
    if (window.electronAPI) {
      const pinned = await window.electronAPI.toggleAlwaysOnTop();
      setIsPinned(pinned);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Custom draggable title bar */}
      <div
        className="h-10 flex items-center justify-between px-3 shrink-0 select-none bg-[#0d0d0d]/90 backdrop-blur-xl border-b border-white/5"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="flex items-center gap-2">
          <img
            src="./icon-192.png"
            alt="Lloyd"
            className="w-5 h-5 rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
            Lloyd
          </span>
        </div>

        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 transition-colors rounded-lg hover:bg-white/10 ${showSettings ? 'text-purple-400' : 'text-zinc-500 hover:text-white'}`}
            title="Configurar API Keys"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleCompact}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title={isCompact ? "Expandir" : "Comprimir"}
          >
            {isCompact ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleTogglePin}
            className={`p-1.5 transition-colors rounded-lg hover:bg-white/10 ${isPinned ? 'text-purple-400' : 'text-zinc-500 hover:text-white'}`}
            title={isPinned ? "Desfijar" : "Fijar encima"}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title="Minimizar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {!isCompact && showSettings && (
        <div className="p-4 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Configurar API Keys</span>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Groq API Key</label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Claude API Key (para fotos)</label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button
            onClick={handleSaveKeys}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            {saved ? '✓ Guardado!' : <><Save className="w-3.5 h-3.5" /> Guardar</>}
          </button>
          <p className="text-[9px] text-zinc-600 text-center">
            Las keys se guardan solo en tu computadora
          </p>
        </div>
      )}

      {/* Lloyd Panel - only show when expanded */}
      {!isCompact && !showSettings && (
        <div className="flex-1 overflow-hidden bg-[#0d0d0d]/80 backdrop-blur-3xl">
          <LloydPanel isStandalone={true} />
        </div>
      )}
    </div>
  );
}
