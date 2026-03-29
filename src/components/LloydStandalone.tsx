import { useEffect } from 'react';
import { LloydPanel } from './LloydPanel';

export default function LloydStandalone() {
  useEffect(() => {
    document.title = "Lloyd Assistant";
    document.body.style.backgroundColor = "#050505";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Immersive background with glass/transparency feel */}
      <div className="fixed inset-0 bg-[#050505]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)] blur-[120px]" />
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08)_0%,transparent_60%)] blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      <div className="relative z-10 w-full h-full">
        <LloydPanel isStandalone={true} />
      </div>
    </div>
  );
}
