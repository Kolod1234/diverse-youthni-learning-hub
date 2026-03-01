import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, X, ZoomIn, ZoomOut, RotateCcw, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const NODE_COLORS = {
  root: { bg: '#4f46e5', text: '#fff', border: '#3730a3' },
  concept: { bg: '#0ea5e9', text: '#fff', border: '#0284c7' },
  definition: { bg: '#10b981', text: '#fff', border: '#059669' },
  example: { bg: '#f59e0b', text: '#fff', border: '#d97706' },
  principle: { bg: '#8b5cf6', text: '#fff', border: '#7c3aed' },
  process: { bg: '#ec4899', text: '#fff', border: '#db2777' },
};

function getColor(type) {
  return NODE_COLORS[type] || NODE_COLORS.concept;
}

// Simple force-directed layout
function computeLayout(centralConcept, nodes) {
  const allNodes = [{ ...centralConcept, id: 'root' }, ...nodes];
  const cx = 500, cy = 350;
  const positions = { root: { x: cx, y: cy } };

  const nonRoot = allNodes.filter(n => n.id !== 'root');
  const count = nonRoot.length;

  nonRoot.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const radius = 220 + (i % 3) * 60;
    positions[node.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return positions;
}

export default function ConceptMapTool({ lessonId, lessonTitle }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [depth, setDepth] = useState(2);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const svgRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const generate = async () => {
    setLoading(true);
    setMapData(null);
    setSelectedNode(null);
    try {
      const res = await base44.functions.invoke('generateConceptMap', { lessonId, depth, focusKeywords: keywords });
      if (res.data.success) {
        setMapData(res.data);
      } else {
        toast.error('Failed to generate concept map');
      }
    } catch {
      toast.error('Failed to generate concept map');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const word = keywordInput.trim().replace(/,$/, '');
      if (word && !keywords.includes(word)) setKeywords(k => [...k, word]);
      setKeywordInput('');
    }
  };

  const positions = mapData ? computeLayout(mapData.centralConcept, mapData.nodes) : {};

  const allNodes = mapData
    ? [{ ...mapData.centralConcept, id: 'root' }, ...mapData.nodes]
    : [];

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text' || e.target.tagName === 'foreignObject') return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => { setOpen(true); if (!mapData) generate(); }}
        className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
      >
        <Brain className="w-4 h-4" />
        Concept Map
      </Button>
    );
  }

  return (
    <Card className="mt-6 overflow-hidden border border-indigo-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Concept Map</span>
          {mapData && <Badge className="bg-white/20 text-white text-xs">{allNodes.length} concepts</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowOptions(s => !s)} className="text-white/80 hover:text-white text-xs flex items-center gap-1">
            Options {showOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Map Depth</p>
            <div className="flex gap-1">
              {[1, 2, 3].map(d => (
                <button key={d} onClick={() => setDepth(d)}
                  className={`px-3 py-1 rounded text-sm border-2 transition-all ${depth === d ? 'border-indigo-500 bg-indigo-100 text-indigo-700 font-semibold' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}>
                  {d === 1 ? 'Shallow' : d === 2 ? 'Medium' : 'Deep'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <p className="text-xs font-medium text-gray-500 mb-1">Focus Keywords</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-indigo-100 text-indigo-700">
                  {kw}
                  <button onClick={() => setKeywords(k => k.filter(x => x !== kw))}><X className="w-2.5 h-2.5" /></button>
                </Badge>
              ))}
            </div>
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={addKeyword}
              placeholder="Type keyword + Enter"
              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <Button onClick={generate} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
      )}

      {/* Controls */}
      {mapData && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-1.5 rounded hover:bg-gray-200 text-gray-600"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-1.5 rounded hover:bg-gray-200 text-gray-600"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={resetView} className="p-1.5 rounded hover:bg-gray-200 text-gray-600"><RotateCcw className="w-4 h-4" /></button>
          <span className="text-xs text-gray-400 ml-1">{Math.round(zoom * 100)}%</span>
          {mapData.summary && (
            <span className="text-xs text-gray-500 ml-auto hidden sm:block max-w-xs truncate">{mapData.summary}</span>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative bg-gray-50" style={{ height: 480 }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-600">Generating concept map...</p>
          </div>
        )}

        {!loading && !mapData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Brain className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No map generated yet</p>
          </div>
        )}

        {mapData && (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 1000 700"
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={{ transformOrigin: '500px 350px' }}>
              {/* Edges */}
              {mapData.edges.map((edge, i) => {
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) return null;
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                return (
                  <g key={i}>
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#c7d2fe" strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    {edge.relationship && (
                      <text x={mx} y={my - 5} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="500">
                        {edge.relationship}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#c7d2fe" />
                </marker>
              </defs>

              {/* Nodes */}
              {allNodes.map((node) => {
                const pos = positions[node.id];
                if (!pos) return null;
                const color = getColor(node.type);
                const isRoot = node.id === 'root';
                const r = isRoot ? 52 : 38;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pos.x} cy={pos.y} r={r}
                      fill={color.bg}
                      stroke={isSelected ? '#fff' : color.border}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' : undefined}
                    />
                    <foreignObject
                      x={pos.x - r + 4} y={pos.y - r + 4}
                      width={(r - 4) * 2} height={(r - 4) * 2}
                      style={{ pointerEvents: 'none' }}
                    >
                      <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textAlign: 'center', color: color.text,
                          fontSize: isRoot ? '11px' : '9px', fontWeight: 600,
                          lineHeight: '1.2', wordBreak: 'break-word', overflow: 'hidden'
                        }}
                      >
                        {node.label}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <div className="px-4 py-3 border-t border-indigo-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: getColor(selectedNode.type).bg }} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800 text-sm">{selectedNode.label}</h4>
                <Badge variant="outline" className="text-xs capitalize">{selectedNode.type}</Badge>
                {selectedNode.difficulty && (
                  <Badge variant="outline" className="text-xs capitalize">{selectedNode.difficulty}</Badge>
                )}
              </div>
              {selectedNode.description && <p className="text-sm text-gray-600 mb-1">{selectedNode.description}</p>}
              {selectedNode.example && (
                <p className="text-xs text-gray-500 italic">Example: {selectedNode.example}</p>
              )}
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}