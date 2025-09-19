
import React from 'react';
import { BrainCircuitIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-4">
        <BrainCircuitIcon className="h-10 w-10 text-cyan-400" />
        <div>
            <h1 className="text-2xl font-bold text-white">AI Mind Map Generator</h1>
            <p className="text-sm text-gray-400">Transform documents and URLs into interactive mind maps with Gemini.</p>
        </div>
      </div>
    </header>
  );
};
