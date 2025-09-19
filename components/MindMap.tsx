
import React from 'react';
import { useMarkmap } from '../hooks/useMarkmap';
import { ExportPanel } from './ExportPanel';

interface MindMapProps {
  markdown: string;
}

export const MindMap: React.FC<MindMapProps> = ({ markdown }) => {
  const { svgRef } = useMarkmap(markdown);

  if (!markdown) {
    return <div className="text-center text-gray-400">Generate a mind map to see it here.</div>;
  }
  
  const getSvgContent = () => {
      if (!svgRef.current) return undefined;
      // Clone the node to avoid modifying the original
      const svgNode = svgRef.current.cloneNode(true) as SVGSVGElement;
      // Add xmlns for proper rendering as a standalone file
      svgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      return svgNode.outerHTML;
  }

  return (
    <div className="w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full" />
        <ExportPanel markdown={markdown} getSvgContent={getSvgContent} />
    </div>
  );
};
