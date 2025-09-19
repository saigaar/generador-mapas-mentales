import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, FileCodeIcon, FileTextIcon, FileWordIcon, ImageIcon, ListTreeIcon } from './icons';

interface ExportPanelProps {
  markdown: string;
  getSvgContent: () => string | undefined;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ markdown, getSvgContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMindMapTitle = () => {
    const match = markdown.match(/^---\s*title:\s*(.*)\s*---/m);
    const safeTitle = match ? match[1].trim() : 'mind_map';
    return safeTitle.replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_');
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };
  
  const generateInteractiveHtml = () => {
    const title = getMindMapTitle();
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title.replace(/_/g, ' ')}</title>
  <style>
    body, html, #mindmap { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
    @media print {
        @page { size: A4 landscape; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.17.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.17.0"></script>
</head>
<body>
  <svg id="mindmap" style="width: 100%; height: 100%"></svg>
  <script type="text/template">${markdown.replace(/<\/script>/g, '<\\/script>')}</script>
  <script>
    const { Transformer, Markmap } = window.markmap;
    const transformer = new Transformer();
    const { root } = transformer.transform(document.querySelector('script[type="text/template"]').textContent);
    Markmap.create('#mindmap', null, root);
  </script>
</body>
</html>`;
    handleDownload(htmlContent, `${title}_interactive.html`, 'text/html');
  };
  
  const downloadSvg = () => {
    const svgContent = getSvgContent();
    if (svgContent) {
      const title = getMindMapTitle();
      handleDownload(svgContent, `${title}.svg`, 'image/svg+xml');
    }
  };
  
  const downloadMarkdown = (isTxt: boolean = false) => {
    const title = getMindMapTitle();
    const extension = isTxt ? 'txt' : 'md';
    handleDownload(markdown, `${title}.${extension}`, isTxt ? 'text/plain' : 'text/markdown');
  };

  const parseMarkdownToHtmlList = (md: string) => {
      const lines = md.split('\n').filter(line => line.trim().startsWith('#') || line.trim().startsWith('-'));
      let html = '';
      let lastLevel = 0;
      const levelStack: string[] = [];

      const getLevel = (line: string): number => {
          if(line.trim().startsWith('#')) {
              return line.trim().match(/^#+/)?.[0].length ?? 0;
          }
          if(line.trim().startsWith('-')) {
              return (line.match(/^\s*/)?.[0].length ?? 0) / 2 + 2;
          }
          return 0;
      }
      
      lines.forEach(line => {
          const content = line.trim().replace(/^#+\s*/, '').replace(/^-+\s*/, '');
          if(!content) return;
          const level = getLevel(line);
          
          if(level > lastLevel) {
              for(let i = lastLevel; i < level; i++) {
                  html += '<ul>';
                  levelStack.push('</ul>');
              }
          } else if (level < lastLevel) {
              for(let i = lastLevel; i > level; i--) {
                  html += levelStack.pop();
              }
          }
          html += `<li>${content}</li>`;
          lastLevel = level;
      });

      html += levelStack.reverse().join('');
      return html;
  };

  const downloadWord = () => {
    const title = getMindMapTitle();
    const titleString = title.replace(/_/g, ' ');
    const listHtml = parseMarkdownToHtmlList(markdown);

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${titleString}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 2cm;
    }
    body {
      font-family: Calibri, sans-serif;
      font-size: 11pt;
    }
    h1 {
      color: #333;
    }
    ul {
      list-style-type: disc;
      margin-left: 20px;
    }
    ul ul {
      list-style-type: circle;
    }
    ul ul ul {
      list-style-type: square;
    }
  </style>
</head>
<body>
  <h1>${titleString}</h1>
  ${listHtml}
</body>
</html>`;
    handleDownload(htmlContent, `${title}.doc`, 'application/vnd.ms-word');
  };
  
  const generateCollapsibleHtml = () => {
    const title = getMindMapTitle();
    const titleString = title.replace(/_/g, ' ');

    const parseMarkdownToDetailsHtml = (md: string) => {
        const lines = md.replace(/---[\s\S]*?---/, '').trim().split('\n').filter(Boolean);
        if (!lines.length) return '';

        let html = '';
        const levelStack: number[] = [];

        const getLevel = (line: string): number => {
            if (line.trim().startsWith('#')) return (line.trim().match(/^#+/)?.[0].length ?? 1) - 1;
            return Math.floor((line.match(/^\s*/)?.[0].length ?? 0) / 2) + 1;
        };

        lines.forEach((line, index) => {
            const currentLevel = getLevel(line);
            const content = line.trim().replace(/^#+\s*|^-+\s*/, '').trim();

            while (levelStack.length > 0 && currentLevel <= levelStack[levelStack.length - 1]) {
                html += '</details>';
                levelStack.pop();
            }

            const hasChildren = index + 1 < lines.length && getLevel(lines[index + 1]) > currentLevel;

            if (hasChildren) {
                html += `<details open><summary>${content}</summary>`;
                levelStack.push(currentLevel);
            } else {
                html += `<p class="leaf">${content}</p>`;
            }
        });

        html += '</details>'.repeat(levelStack.length);
        return html;
    };

    const collapsibleHtml = parseMarkdownToDetailsHtml(markdown);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Outline: ${titleString}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background-color: #fdfdfd; }
    h1 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    details { margin-left: 20px; border-left: 1px solid #e0e0e0; padding-left: 15px; margin-top: 5px; }
    summary { cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; list-style-position: inside; }
    summary:hover { background-color: #f0f0f0; }
    .leaf { margin-left: 20px; padding: 4px 8px; }
  </style>
</head>
<body>
  <h1>${titleString}</h1>
  ${collapsibleHtml}
</body>
</html>`;
    handleDownload(htmlContent, `${title}_outline.html`, 'text/html');
  };

  const menuItems = [
    { label: 'Markmap App (.html)', icon: FileCodeIcon, action: generateInteractiveHtml },
    { label: 'Interactive Outline (.html)', icon: ListTreeIcon, action: generateCollapsibleHtml },
    { label: 'Image (.svg)', icon: ImageIcon, action: downloadSvg },
    { label: 'Markdown (.md)', icon: FileCodeIcon, action: () => downloadMarkdown(false) },
    { label: 'Text (.txt)', icon: FileTextIcon, action: () => downloadMarkdown(true) },
    { label: 'Word (.doc)', icon: FileWordIcon, action: downloadWord },
  ];

  return (
    <div className="absolute bottom-4 right-4" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-cyan-500 transition-all transform hover:scale-110"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Download options"
      >
        <DownloadIcon className="h-6 w-6" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
          <ul>
            {menuItems.map(({ label, icon: Icon, action }) => (
              <li key={label}>
                <button
                  onClick={action}
                  className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <Icon className="h-5 w-5 text-cyan-400" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};