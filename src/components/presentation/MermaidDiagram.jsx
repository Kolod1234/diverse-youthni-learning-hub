import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle } from 'lucide-react';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'strict', // 'loose' allowed HTML and click handlers inside diagram labels
  fontFamily: 'inherit'
});

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code) return;

      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
      } catch (err) {
        console.error("Mermaid Syntax Error:", err);
        setError("Failed to render diagram. The AI generated invalid syntax.");
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex justify-center items-center w-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}