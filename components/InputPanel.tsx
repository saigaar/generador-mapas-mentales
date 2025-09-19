import React, { useState, useCallback, useRef } from 'react';
import { InputMode } from '../types';
import { FileIcon, LinkIcon, SparklesIcon, UploadCloudIcon, TypeIcon } from './icons';

interface InputPanelProps {
  onGenerate: (source: File | string, mode: InputMode) => void;
  isLoading: boolean;
  isApiKeyMissing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading, isApiKeyMissing }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid file type. Please select a PDF or TXT file.');
        setFile(null);
      }
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
       if (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Invalid file type. Please drop a PDF or TXT file.');
        setFile(null);
      }
    }
  };

  const handleSubmit = useCallback(() => {
    setError(null);
    if (mode === 'text') {
      if (text.trim()) {
        onGenerate(text, 'text');
      } else {
        setError('Please enter some text to generate the mind map.');
      }
    } else if (mode === 'file') {
      if (file) {
        onGenerate(file, 'file');
      } else {
        setError('Please select a file to generate the mind map.');
      }
    } else if (mode === 'url') {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        onGenerate(url, 'url');
      } else {
        setError('Please enter a valid URL.');
      }
    }
  }, [mode, file, url, text, onGenerate]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 h-full flex flex-col">
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setMode('text')}
          disabled={isLoading}
          className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <TypeIcon className="h-5 w-5" />
          From Text
        </button>
        <button
          onClick={() => setMode('file')}
          disabled={isLoading}
          className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'file' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <FileIcon className="h-5 w-5" />
          From File
        </button>
        <button
          onClick={() => setMode('url')}
          disabled={isLoading}
          className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'url' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <LinkIcon className="h-5 w-5" />
          From URL
        </button>
      </div>
      
      <div className="flex-grow">
        {mode === 'text' && (
            <div>
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">Your Content</label>
                <textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text, notes, or an article here..."
                    disabled={isLoading}
                    rows={12}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
        )}
        {mode === 'file' && (
          <div className="flex flex-col gap-4">
            <label 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                htmlFor="file-upload" 
                className="cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors bg-gray-900/50"
            >
                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">
                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or TXT</p>
            </label>
            <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" disabled={isLoading} />
            {file && <p className="text-center text-sm text-gray-300">Selected: <span className="font-medium text-white">{file.name}</span></p>}
          </div>
        )}
        {mode === 'url' && (
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-300 mb-2">Web Page URL</label>
            <input
              type="url"
              id="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isLoading}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      
      <div className="mt-6">
        {isApiKeyMissing && <p className="text-yellow-500 text-xs text-center mb-2">Generation is disabled because the API Key is not configured.</p>}
        <button
          onClick={handleSubmit}
          disabled={isLoading || isApiKeyMissing}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Generate Mind Map
            </>
          )}
        </button>
      </div>
    </div>
  );
};
