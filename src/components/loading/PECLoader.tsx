'use client';

import React from 'react';

const PECLoader = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black overflow-hidden select-none pointer-events-none">
      <style>{`
        .sharp-path {
          fill: none;
          stroke: #FFD700;
          stroke-width: 18; /* MEGAHEAVY */
          stroke-linecap: square;
          stroke-linejoin: miter;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: tracing 3.5s cubic-bezier(0.9, 0, 0.1, 1) infinite;
        }

        .dark .sharp-path {
          stroke: #FFF44F;
        }

        @keyframes tracing {
          0% { stroke-dashoffset: 1000; }
          40%, 80% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }

        /* The Mega Red Slash */
        .pec-slash-top {
          fill: #FF0000;
          filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.4));
          animation: slashEffect 3.5s cubic-bezier(0.9, 0, 0.1, 1) infinite;
        }

        @keyframes slashEffect {
          0%, 35% { opacity: 0; transform: translateX(-30px) scaleX(0); }
          45%, 85% { opacity: 1; transform: translateX(0) scaleX(1); }
          100% { opacity: 0; }
        }

        /* Monumental Brutalist Typography */
        .motto-vibe {
          font-family: inherit; /* Use Geist/Inter */
          font-weight: 1000; /* Max Weight */
          letter-spacing: 0.6em;
          text-transform: uppercase;
          font-size: 1rem; /* Slightly larger */
          color: #FFD700;
          margin-top: 5rem;
          opacity: 0.8;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
          animation: monumentReveal 3.5s ease-in-out infinite;
        }

        @keyframes monumentReveal {
          0%, 100% { opacity: 0; transform: translateY(10px) scale(0.95); }
          50% { opacity: 0.9; transform: translateY(0) scale(1); }
        }

        /* Radial Depth */
        .depth-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
      `}</style>

      <div className="depth-overlay" />

      <div className="flex flex-col items-center">
        {/* MONUMENTAL PEC IDENTIFIER */}
        <div className="flex items-center gap-14 relative scale-125">
          
          {/* P - Mega Heavy */}
          <svg width="120" height="140" viewBox="0 0 100 120" className="overflow-visible">
             <path 
                className="sharp-path" 
                d="M 20,110 V 10 H 85 V 70 H 20" 
                pathLength="1000"
             />
          </svg>

          {/* E - Mega Heavy with Massive Slash */}
          <div className="relative">
             <svg width="130" height="140" viewBox="0 0 110 120" className="absolute -top-6 -right-2 z-10 overflow-visible">
                <polygon points="10,5 105,5 85,38 10,38" className="pec-slash-top" />
             </svg>
             <svg width="130" height="140" viewBox="0 0 110 120" className="overflow-visible">
                <path 
                    className="sharp-path" 
                    d="M 15,110 H 100 M 15,70 H 85 M 15,110 V 38" 
                    pathLength="1000"
                />
             </svg>
          </div>

          {/* C - Mega Heavy */}
          <svg width="120" height="140" viewBox="0 0 100 120" className="overflow-visible">
             <path 
                className="sharp-path" 
                d="M 90,10 H 15 V 110 H 90" 
                pathLength="1000"
             />
          </svg>
        </div>

        {/* BRUTALIST SUBTEXT */}
        <div className="motto-vibe">
          EXPLORE. INNOVATE. EXCEL.
        </div>
      </div>
    </div>
  );
};

export default PECLoader;
