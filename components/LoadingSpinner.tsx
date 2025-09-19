
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-400 border-t-cyan-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-800">AI is thinking...</p>
      <p className="mt-1 text-sm text-gray-600">Analyzing your content to build the mind map.</p>
    </div>
  );
};
