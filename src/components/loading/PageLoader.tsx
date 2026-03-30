import React from 'react';
import PECLoader from './PECLoader';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <PECLoader />
    </div>
  );
}
