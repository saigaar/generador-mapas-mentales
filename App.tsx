import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { MindMap } from './components/MindMap';
import { LoadingSpinner } from './components/LoadingSpinner';
import { extractTextFromFile } from './utils/fileExtractor';
import { generateMarkmapMarkdown } from './services/geminiService';
import { InputMode } from './types';

const initialMarkdown = `
---
title: AI Mind Map Generator
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 2
---

# AI Mind Map Generator

## How to Use
1. **Choose your source**
   - Paste any text
   - Upload a File (PDF or TXT)
   - Enter a URL
2. **Click "Generate"**
   - The AI will analyze the content.
3. **Explore your Mind Map**
   - Interact with the generated map.
   - Zoom, pan, and expand nodes.

## Features
- **AI-Powered**: Uses Gemini to understand and structure information.
- **Multiple Sources**: Supports text, files, and web pages.
- **Interactive Visualization**: Powered by markmap.js.
- **Simple & Fast**

## Technologies Used
- React & TypeScript
- Gemini API
- Tailwind CSS
- markmap.js
`;

function App() {
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mindMapKey, setMindMapKey] = useState<number>(0);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("Configuration Error: The Gemini API Key is not set. Please configure the API_KEY environment variable in your deployment settings.");
      setIsApiKeyMissing(true);
    }
  }, []);

  const handleGenerate = useCallback(async (source: File | string, mode: InputMode) => {
    setIsLoading(true);
    setError(null);

    try {
      let content = '';
      let sourceType: 'file content' | 'URL' | 'direct text' = 'file content';

      if (mode === 'file' && source instanceof File) {
        content = await extractTextFromFile(source);
      } else if (mode === 'url' && typeof source === 'string') {
        content = source;
        sourceType = 'URL';
      } else if (mode === 'text' && typeof source === 'string') {
        content = source;
        sourceType = 'direct text';
      } else {
        throw new Error("Invalid source or mode provided.");
      }
      
      if (!content.trim()) {
        throw new Error("Source is empty or could not be read. Please check the file, URL or text input.");
      }

      const generatedMarkdown = await generateMarkmapMarkdown(content, sourceType);
      setMarkdown(generatedMarkdown);
      setMindMapKey(prev => prev + 1); // Force re-mount of MindMap component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate mind map: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
        <div className="lg:w-1/3 xl:w-1/4">
          <InputPanel onGenerate={handleGenerate} isLoading={isLoading} isApiKeyMissing={isApiKeyMissing} />
        </div>
        <div className="flex-grow lg:w-2/3 xl:w-3/4 bg-slate-100 rounded-lg shadow-2xl p-4 flex items-center justify-center relative min-h-[500px] lg:min-h-0">
          {isLoading && <LoadingSpinner />}
          {!isLoading && error && (
            <div className="text-center text-red-600">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && (
            <MindMap key={mindMapKey} markdown={markdown} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
