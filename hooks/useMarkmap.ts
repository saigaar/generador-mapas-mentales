
import { useRef, useEffect, useMemo } from 'react';

export const useMarkmap = (markdown: string) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Memoize the Transformer instance to avoid re-creating it on every render
    const transformer = useMemo(() => new window.markmap.Transformer(), []);

    useEffect(() => {
        if (!svgRef.current || !markdown) return;

        // Clear previous SVG content
        svgRef.current.innerHTML = '';
        
        // Transform markdown to markmap data
        const { root } = transformer.transform(markdown);
        
        // Create a new Markmap instance and render it
        const markmap = window.markmap.Markmap.create(svgRef.current, undefined, root);

        // Cleanup function to destroy the markmap instance when the component unmounts or markdown changes
        return () => {
            markmap.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markdown]); // Rerun only when markdown changes. Transformer is memoized.

    return { svgRef };
};
