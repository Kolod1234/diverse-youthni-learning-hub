import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2, X, ZoomIn, ZoomOut, RefreshCw, Tag } from 'lucide-react';

const TYPE_COLORS = {
  root: '#3b82f6',
  concept: '#8b5cf6',
  definition: '#10b981',
  example: '#f59e0b',
  principle: '#ef4444',
  process: '#06b6d4',
};

const DEPTH_OPTIONS = [
  { value: 1, label: 'Overview' },
  { value: 2, label: 'Standard' },
  { value: 3, label: 'Deep Dive' },
];

function ConceptMapCanvas({ centralConcept, nodes, edges }) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  // Simple radial layout
  const allNodes = [{ ...centralConcept, id: 'root' }, ...nodes];
  const rootNode = allNodes[0];
  const childNodes = allNodes.slice(1);

  const W = 900, H = 650;
  const cx = W / 2, cy = H / 2;

  const positions = { root: { x: cx, y: cy } };
  childNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / childNodes.length - Math.PI / 2;
    const r = childNodes.length > 8 ? 240 : 200;
    positions[node.id] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const onMouseDown = (e) => {
    if (e.target.closest('.node-element')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  const selectedNode = selected ? allNodes.find(n => n.id === selected) : null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200" style={{ height: 480 }}>
      {/* Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => setScale(s => Math.min(s + 0.2, 2.5))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => setScale(s => Math.max(s - 0.2, 0.4))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 2"
                />
                <text x={mx} y={my - 5} textAnchor="middle" fontSize={9} fill="#9ca3af" fontStyle="italic">
                  {edge.relationship}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {allNodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isRoot = node.id === 'root';
            const isSelected = selected === node.id;
            const color = TYPE_COLORS[node.type] || TYPE_COLORS.concept;
            const r = isRoot ? 44 : 32;
            const label = node.label || '';
            const words = label.split(' ');
            const lines = [];
            let line = '';
            words.forEach(w => {
              if ((line + ' ' + w).trim().length > 14) {
                if (line) lines.push(line.trim());
                line = w;
              } else {
                line = (line + ' ' + w).trim();
              }
            });
            if (line) lines.push(line);

            return (
              <g
                key={node.id}
                className="node-element"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(selected === node.id ? null : node.id)}
              >
                <circle
                  cx={pos.x} cy={pos.y} r={r}
                  fill={isSelected ? color : `${color}22`}
                  stroke={color}
                  strokeWidth={isRoot ? 3 : 2}
                />
                {lines.map((ln, li) => (
                  <text
                    key={li}
                    x={pos.x}
                    y={pos.y + (li - (lines.length - 1) / 2) * 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isRoot ? 11 : 9}
                    fontWeight={isRoot ? 700 : 500}
                    fill={isSelected ? 'white' : color}
                  >
                    {ln}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800 text-sm">{selectedNode.label}</span>
                {selectedNode.type && (
                  <Badge variant="outline" className="text-xs capitalize" style={{ borderColor: TYPE_COLORS[selectedNode.type], color: TYPE_COLORS[selectedNode.type] }}>
                    {selectedNode.type}
                  </Badge>
                )}
                {selectedNode.difficulty && (
                  <Badge variant="outline" className="text-xs capitalize">{selectedNode.difficulty}</Badge>
                )}
              </div>
              {selectedNode.description && (
                <p className="text-xs text-gray-600 mb-1">{selectedNode.description}</p>
              )}
              {selectedNode.example && (
                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  <strong>Example:</strong> {selectedNode.example}
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!selected && (
        <p className="absolute bottom-3 left-3 text-xs text-gray-400">Click a node to explore it · Drag to pan · Scroll to zoom</p>
      )}
    </div>
  );
}

export default function ConceptMapTool({ lessonId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [depth, setDepth] = useState(2);
  const [kwInput, setKwInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setMapData(null);
    try {
      const res = await base44.functions.invoke('generateConceptMap', { lessonId, depth, focusKeywords: keywords });
      if (res.data.success) {
        setMapData(res.data);
      } else {
        setError(res.data.error || 'Failed to generate concept map');
      }
    } catch (e) {
      setError('Failed to generate concept map. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addKw = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && kwInput.trim()) {
      e.preventDefault();
      const w = kwInput.trim().replace(/,$/, '');
      if (w && !keywords.includes(w)) setKeywords(p => [...p, w]);
      setKwInput('');
    }
  };

  if (!open) {
    return (
      <Button variant="outline" onClick={() => { setOpen(true); generate(); }} className="gap-2 w-full sm:w-auto">
        <Network className="w-4 h-4 text-blue-600" />
        Generate Concept Map
      </Button>
    );
  }

  return (
    <Card className="p-4 sm:p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-800">Concept Map</span>
          {mapData?.lessonTitle && (
            <span className="text-sm text-gray-500 hidden sm:inline">— {mapData.lessonTitle}</span>
          )}
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 mb-4 items-start">
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">Depth</p>
          <div className="flex gap-1.5">
            {DEPTH_OPTIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDepth(d.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  depth === d.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-40">
          <p className="text-xs text-gray-500 mb-1 font-medium"><Tag className="w-3 h-3 inline mr-0.5" />Focus Keywords</p>
          <div className="flex flex-wrap gap-1 mb-1">
            {keywords.map(kw => (
              <Badge key={kw} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs">
                {kw}
                <button onClick={() => setKeywords(p => p.filter(k => k !== kw))}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            ))}
          </div>
          <input
            type="text"
            value={kwInput}
            onChange={e => setKwInput(e.target.value)}
            onKeyDown={addKw}
            placeholder="Add keyword, press Enter..."
            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
        <div className="self-end">
          <Button size="sm" onClick={generate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {mapData ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Building your concept map with AI...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {mapData && !loading && (
        <>
          <ConceptMapCanvas
            centralConcept={mapData.centralConcept}
            nodes={mapData.nodes}
            edges={mapData.edges}
          />
          {mapData.summary && (
            <p className="mt-3 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
              {mapData.summary}
            </p>
          )}
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'root').map(([type, color]) => (
              <span key={type} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="inline-block w-3 h-3 rounded-full border-2" style={{ borderColor: color, background: `${color}33` }} />
                {type}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}