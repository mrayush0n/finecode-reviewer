import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

const MermaidViewer = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      mermaid.render(`mermaid-${Math.random().toString(36).substring(7)}`, chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((e) => {
          console.error('Mermaid render failed', e);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-red-400 text-xs">Failed to render diagram</div>`;
          }
        });
    }
  }, [chart]);

  return <div ref={containerRef} className="overflow-x-auto flex justify-center py-4 bg-[#1e1e1e] rounded-md border border-gray-800" />;
};

export default MermaidViewer;
