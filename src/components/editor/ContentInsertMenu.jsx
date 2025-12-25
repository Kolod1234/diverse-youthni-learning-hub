import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, BarChart3, PieChart, LineChart, TrendingUp, Activity,
  MapPin, Globe, Map as MapIcon,
  Shapes, Circle, Square, Triangle, Pentagon, Hexagon,
  Zap, Battery, Plug, Power, Radio,
  Calculator, Sigma, Infinity, Pi,
  Atom, Dna, TestTube, Beaker,
  Brain, Heart, Eye, Microscope,
  Hash, Percent, DollarSign, Euro,
  Star, Award, Trophy, Target, Flag,
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Check, X, AlertCircle, Info, HelpCircle,
  Sun, Moon, Cloud, Droplet, Wind,
  Book, BookOpen, FileText, File, Folder,
  Image, Video, Music, Mic, Camera,
  Code, Terminal, Cpu, Database, Server,
  Users, User, UserPlus, UserCheck, UserX,
  Home, Building, Factory, Store, School,
  Car, Plane, Ship, Train, Bike,
  Clock, Calendar, Timer, Watch, Hourglass,
  Mail, Phone, MessageSquare, Send, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHART_TYPES = [
  { name: 'Bar Chart', icon: BarChart3, html: '<div class="my-4 p-4 bg-gray-50 rounded-lg"><canvas id="barChart" width="400" height="200"></canvas></div>' },
  { name: 'Pie Chart', icon: PieChart, html: '<div class="my-4 p-4 bg-gray-50 rounded-lg"><canvas id="pieChart" width="300" height="300"></canvas></div>' },
  { name: 'Line Graph', icon: LineChart, html: '<div class="my-4 p-4 bg-gray-50 rounded-lg"><canvas id="lineGraph" width="400" height="200"></canvas></div>' },
  { name: 'Area Chart', icon: Activity, html: '<div class="my-4 p-4 bg-gray-50 rounded-lg"><canvas id="areaChart" width="400" height="200"></canvas></div>' },
];

const MATH_SYMBOLS = [
  { name: 'Plus', symbol: '+', html: '<span class="text-2xl font-bold mx-1">+</span>' },
  { name: 'Minus', symbol: '−', html: '<span class="text-2xl font-bold mx-1">−</span>' },
  { name: 'Multiply', symbol: '×', html: '<span class="text-2xl font-bold mx-1">×</span>' },
  { name: 'Divide', symbol: '÷', html: '<span class="text-2xl font-bold mx-1">÷</span>' },
  { name: 'Equals', symbol: '=', html: '<span class="text-2xl font-bold mx-1">=</span>' },
  { name: 'Not Equal', symbol: '≠', html: '<span class="text-2xl font-bold mx-1">≠</span>' },
  { name: 'Less Than', symbol: '<', html: '<span class="text-2xl font-bold mx-1">&lt;</span>' },
  { name: 'Greater Than', symbol: '>', html: '<span class="text-2xl font-bold mx-1">&gt;</span>' },
  { name: 'Less or Equal', symbol: '≤', html: '<span class="text-2xl font-bold mx-1">≤</span>' },
  { name: 'Greater or Equal', symbol: '≥', html: '<span class="text-2xl font-bold mx-1">≥</span>' },
  { name: 'Pi', symbol: 'π', html: '<span class="text-2xl font-bold mx-1">π</span>' },
  { name: 'Infinity', symbol: '∞', html: '<span class="text-2xl font-bold mx-1">∞</span>' },
  { name: 'Square Root', symbol: '√', html: '<span class="text-2xl font-bold mx-1">√</span>' },
  { name: 'Squared', symbol: 'x²', html: '<span class="text-xl mx-1">x<sup>2</sup></span>' },
  { name: 'Cubed', symbol: 'x³', html: '<span class="text-xl mx-1">x<sup>3</sup></span>' },
  { name: 'Fraction', symbol: '½', html: '<span class="text-xl mx-1"><sup>a</sup>/<sub>b</sub></span>' },
  { name: 'Theta', symbol: 'θ', html: '<span class="text-2xl font-bold mx-1">θ</span>' },
  { name: 'Alpha', symbol: 'α', html: '<span class="text-2xl font-bold mx-1">α</span>' },
  { name: 'Beta', symbol: 'β', html: '<span class="text-2xl font-bold mx-1">β</span>' },
  { name: 'Delta', symbol: 'Δ', html: '<span class="text-2xl font-bold mx-1">Δ</span>' },
  { name: 'Sigma Sum', symbol: 'Σ', html: '<span class="text-2xl font-bold mx-1">Σ</span>' },
  { name: 'Integral', symbol: '∫', html: '<span class="text-2xl font-bold mx-1">∫</span>' },
  { name: 'Partial', symbol: '∂', html: '<span class="text-2xl font-bold mx-1">∂</span>' },
  { name: 'Therefore', symbol: '∴', html: '<span class="text-2xl font-bold mx-1">∴</span>' },
  { name: 'Because', symbol: '∵', html: '<span class="text-2xl font-bold mx-1">∵</span>' },
  { name: 'Approximately', symbol: '≈', html: '<span class="text-2xl font-bold mx-1">≈</span>' },
  { name: 'Angle', symbol: '∠', html: '<span class="text-2xl font-bold mx-1">∠</span>' },
  { name: 'Perpendicular', symbol: '⊥', html: '<span class="text-2xl font-bold mx-1">⊥</span>' },
  { name: 'Parallel', symbol: '∥', html: '<span class="text-2xl font-bold mx-1">∥</span>' },
  { name: 'Degree', symbol: '°', html: '<span class="text-xl mx-1">°</span>' },
];

const ELECTRICAL_SYMBOLS = [
  { name: 'Battery', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">⚡ Battery</div>' },
  { name: 'Resistor', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">▭ Resistor</div>' },
  { name: 'Bulb/Lamp', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">💡 Bulb</div>' },
  { name: 'Switch (Open)', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">⚊ Switch (Open)</div>' },
  { name: 'Switch (Closed)', html: '<div class="inline-block p-2 border-gray-800 rounded">━ Switch (Closed)</div>' },
  { name: 'Ammeter', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded-full">A</div>' },
  { name: 'Voltmeter', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded-full">V</div>' },
  { name: 'Fuse', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">▬◆▬ Fuse</div>' },
  { name: 'Diode', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">▷| Diode</div>' },
  { name: 'LED', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">▷| LED</div>' },
  { name: 'Motor', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded-full">M Motor</div>' },
  { name: 'Cell', html: '<div class="inline-block p-2 border-2 border-gray-800 rounded">| Cell</div>' },
];

const BASIC_SHAPES = [
  { name: 'Square', html: '<span class="inline-block w-12 h-12 border-2 border-gray-800 mx-1"></span>' },
  { name: 'Rectangle', html: '<span class="inline-block w-16 h-10 border-2 border-gray-800 mx-1"></span>' },
  { name: 'Circle', html: '<span class="inline-block w-12 h-12 border-2 border-gray-800 rounded-full mx-1"></span>' },
  { name: 'Oval', html: '<span class="inline-block w-16 h-10 border-2 border-gray-800 rounded-full mx-1"></span>' },
  { name: 'Triangle', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-left: 24px solid transparent; border-right: 24px solid transparent; border-bottom: 40px solid #000;"></span>' },
  { name: 'Triangle (Inverted)', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-left: 24px solid transparent; border-right: 24px solid transparent; border-top: 40px solid #000;"></span>' },
  { name: 'Diamond', html: '<span class="inline-block w-10 h-10 border-2 border-gray-800 mx-1" style="transform: rotate(45deg);"></span>' },
  { name: 'Pentagon', html: '<span class="inline-block w-12 h-12 mx-1" style="clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); background: #000;"></span>' },
  { name: 'Hexagon', html: '<span class="inline-block w-12 h-12 mx-1" style="clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); background: #000;"></span>' },
  { name: 'Star', html: '<span class="inline-block w-12 h-12 mx-1" style="clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); background: #000;"></span>' },
  { name: 'Heart', html: '<span class="inline-block text-red-500 text-3xl mx-1">♥</span>' },
  { name: 'Arrow Right', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 24px solid #000;"></span>' },
  { name: 'Arrow Left', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-right: 24px solid #000;"></span>' },
  { name: 'Arrow Up', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 24px solid #000;"></span>' },
  { name: 'Arrow Down', html: '<span class="inline-block mx-1" style="width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 24px solid #000;"></span>' },
  { name: 'Cross/Plus', html: '<span class="inline-block text-3xl font-bold mx-1">+</span>' },
  { name: 'Parallelogram', html: '<span class="inline-block w-16 h-10 border-2 border-gray-800 mx-1" style="transform: skew(-20deg);"></span>' },
  { name: 'Trapezoid', html: '<span class="inline-block mx-1" style="width: 60px; height: 40px; clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%); background: #000;"></span>' },
  { name: 'Crescent', html: '<span class="inline-block text-3xl mx-1">☾</span>' },
  { name: 'Cloud', html: '<span class="inline-block text-3xl mx-1">☁</span>' },
  { name: 'Lightning', html: '<span class="inline-block text-3xl mx-1">⚡</span>' },
  { name: 'Flower', html: '<span class="inline-block text-3xl mx-1">✿</span>' },
  { name: 'Smiley', html: '<span class="inline-block text-3xl mx-1">☺</span>' },
  { name: 'Music Note', html: '<span class="inline-block text-3xl mx-1">♪</span>' },
  { name: 'Checkmark', html: '<span class="inline-block text-green-600 text-3xl font-bold mx-1">✓</span>' },
  { name: 'X Mark', html: '<span class="inline-block text-red-600 text-3xl font-bold mx-1">✗</span>' },
];

const SHAPES_3D = [
  { name: 'Cube', html: '<div class="inline-block p-4 m-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold shadow-lg" style="transform: perspective(500px) rotateY(-15deg);">Cube</div>' },
  { name: 'Sphere', html: '<div class="inline-block w-20 h-20 m-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"></div>' },
  { name: 'Cylinder', html: '<div class="inline-block p-4 m-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg">Cylinder</div>' },
  { name: 'Cone', html: '<div class="inline-block m-2" style="width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 80px solid #f59e0b;"></div>' },
  { name: 'Pyramid', html: '<div class="inline-block m-2" style="width: 0; height: 0; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 80px solid #ef4444;"></div>' },
  { name: 'Prism', html: '<div class="inline-block p-3 m-2 bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-lg" style="clip-path: polygon(0% 100%, 50% 0%, 100% 100%);">Prism</div>' },
];

const GENERAL_ICONS = [
  { name: 'Check', icon: Check, html: '<span class="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full mx-1">✓</span>' },
  { name: 'Cross', icon: X, html: '<span class="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full mx-1">✗</span>' },
  { name: 'Info', icon: Info, html: '<span class="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full mx-1">i</span>' },
  { name: 'Warning', icon: AlertCircle, html: '<span class="inline-flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full mx-1">!</span>' },
  { name: 'Star', icon: Star, html: '<span class="text-yellow-500 text-2xl mx-1">★</span>' },
  { name: 'Arrow Right', icon: ArrowRight, html: '<span class="text-2xl mx-1">→</span>' },
  { name: 'Arrow Up', icon: ArrowUp, html: '<span class="text-2xl mx-1">↑</span>' },
  { name: 'Arrow Down', icon: ArrowDown, html: '<span class="text-2xl mx-1">↓</span>' },
  { name: 'Arrow Left', icon: ArrowLeft, html: '<span class="text-2xl mx-1">←</span>' },
];

const EQUATIONS = [
  { name: 'Quadratic Formula', html: '<div class="my-4 p-4 bg-blue-50 rounded-lg text-center"><span class="text-xl">x = <sup>-b ± √(b² - 4ac)</sup>/<sub>2a</sub></span></div>' },
  { name: 'Pythagorean Theorem', html: '<div class="my-4 p-4 bg-purple-50 rounded-lg text-center"><span class="text-xl">a² + b² = c²</span></div>' },
  { name: "Einstein's E=mc²", html: '<div class="my-4 p-4 bg-indigo-50 rounded-lg text-center"><span class="text-2xl font-bold">E = mc²</span></div>' },
  { name: 'Area of Circle', html: '<div class="my-4 p-4 bg-green-50 rounded-lg text-center"><span class="text-xl">A = πr²</span></div>' },
  { name: 'Volume of Sphere', html: '<div class="my-4 p-4 bg-yellow-50 rounded-lg text-center"><span class="text-xl">V = <sup>4</sup>/<sub>3</sub>πr³</span></div>' },
  { name: 'Ohms Law', html: '<div class="my-4 p-4 bg-orange-50 rounded-lg text-center"><span class="text-xl">V = IR</span></div>' },
  { name: 'Kinetic Energy', html: '<div class="my-4 p-4 bg-red-50 rounded-lg text-center"><span class="text-xl">KE = <sup>1</sup>/<sub>2</sub>mv²</span></div>' },
  { name: 'Gravitational Force', html: '<div class="my-4 p-4 bg-pink-50 rounded-lg text-center"><span class="text-xl">F = <sup>Gm₁m₂</sup>/<sub>r²</sub></span></div>' },
];

export default function ContentInsertMenu({ onInsert, position = "bottom" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Insert Content
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" side={position}>
        {/* Charts */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BarChart3 className="w-4 h-4 mr-2" />
            Charts & Graphs
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto">
            {CHART_TYPES.map((chart) => (
              <DropdownMenuItem key={chart.name} onClick={() => onInsert(chart.html)}>
                <chart.icon className="w-4 h-4 mr-2" />
                {chart.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Math Symbols */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calculator className="w-4 h-4 mr-2" />
            Math Symbols
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto w-48">
            {MATH_SYMBOLS.map((symbol) => (
              <DropdownMenuItem key={symbol.name} onClick={() => onInsert(symbol.html)}>
                <span className="text-lg mr-2">{symbol.symbol}</span>
                {symbol.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Equations */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sigma className="w-4 h-4 mr-2" />
            Common Equations
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto">
            {EQUATIONS.map((eq) => (
              <DropdownMenuItem key={eq.name} onClick={() => onInsert(eq.html)}>
                {eq.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Electrical Symbols */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Zap className="w-4 h-4 mr-2" />
            Electrical Symbols
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto">
            {ELECTRICAL_SYMBOLS.map((symbol) => (
              <DropdownMenuItem key={symbol.name} onClick={() => onInsert(symbol.html)}>
                {symbol.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Basic Shapes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Square className="w-4 h-4 mr-2" />
            Basic Shapes
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto w-56">
            {BASIC_SHAPES.map((shape) => (
              <DropdownMenuItem key={shape.name} onClick={() => onInsert(shape.html)}>
                {shape.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 3D Shapes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shapes className="w-4 h-4 mr-2" />
            3D Shapes
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto">
            {SHAPES_3D.map((shape) => (
              <DropdownMenuItem key={shape.name} onClick={() => onInsert(shape.html)}>
                {shape.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* General Icons */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Star className="w-4 h-4 mr-2" />
            Icons & Markers
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 overflow-y-auto">
            {GENERAL_ICONS.map((item) => (
              <DropdownMenuItem key={item.name} onClick={() => onInsert(item.html)}>
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Map */}
        <DropdownMenuItem onClick={() => onInsert('<div class="my-4 p-4 bg-gray-100 rounded-lg text-center h-64 flex items-center justify-center"><span class="text-gray-500">🗺️ Interactive Map Placeholder</span></div>')}>
          <MapIcon className="w-4 h-4 mr-2" />
          Insert Map
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}