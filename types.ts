
import type { Transformer as TTransformer } from 'markmap-lib';
import type { Markmap as TMarkmap } from 'markmap-view';
import type * as TPdfJs from 'pdfjs-dist';

declare global {
  interface Window {
    markmap: {
      Transformer: typeof TTransformer;
      Markmap: typeof TMarkmap;
    };
    pdfjsLib: typeof TPdfJs;
  }
}

export type InputMode = 'text' | 'file' | 'url';