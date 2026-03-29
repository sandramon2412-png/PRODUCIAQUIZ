import { useState, useEffect } from 'react';
import { LloydPanel } from './LloydPanel';
import { Minus, X, Pin, PinOff, ChevronUp, ChevronDown } from 'lucide-react';

// Type for the electronAPI exposed via preload
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
  const [isPinned, setIsPinned] = useState(true);

  useEffect(() => {
    document.title = "Lloyd Assistant";
  }, []);

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
            src="https://i.imgur.com/GWLu6bm.png"
            alt="Lloyd"
            className="w-5 h-5 rounded"
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

      {/* Lloyd Panel - only show when expanded */}
      {!isCompact && (
        <div className="flex-1 overflow-hidden bg-[#0d0d0d]/80 backdrop-blur-3xl">
          <LloydPanel isStandalone={true} />
        </div>
      )}
    </div>
  );
}
