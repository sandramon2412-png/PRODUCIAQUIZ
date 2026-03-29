import { useEffect } from 'react';
import { LloydPanel } from './LloydPanel';

export default function LloydStandalone() {
  useEffect(() => {
    document.title = "Lloyd Assistant";
    document.body.style.backgroundColor = "#0a0a0a";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden">
      <LloydPanel isStandalone={true} />
    </div>
  );
}
