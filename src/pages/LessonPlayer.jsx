import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Home, Plus, Table, Monitor, UserPlus, Type, Image as ImageIcon, 
  Shapes, PieChart, Wand2, ArrowUp, Eraser, Star, Circle, Plane, Play, 
  FastForward, Radio, Save, FileDown, Printer, ChevronLeft, ChevronRight,
  X, RotateCcw, Grid3x3, BookOpen, Check
} from 'lucide-react';

export default function LessonPlayer() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: "Resilience & Discovery",
      subtitle: "Unit 4: Microscopy and the Unseen World",
      footer: "Diverse Youth NI - Early Intervention Support",
      layout: 'title',
      elements: []
    },
    {
      id: 2,
      title: "Our Wellbeing Journey",
      content: "Our organization is rooted in our community, responding to the needs of marginalized young people. This unit focuses on building internal strength.",
      features: [
        { label: "Early Intervention", desc: "Identifying challenges early helps resilience." },
        { label: "Youth at the Centre", desc: "Work planned around your views." }
      ],
      layout: 'content',
      elements: []
    },
    {
      id: 3,
      title: "The Science of Observation",
      content: "Just as we use tools to see a cell, we use skills to navigate challenges like family breakdown or hidden homelessness.",
      list: ["Magnification: Bigger picture", "Resolution: Clarity in chaos", "Contrast: Hope vs difficulty"],
      layout: 'two-col',
      elements: []
    }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsPresentationMode(false);
      if (e.key === "ArrowRight" || e.key === " ") navigateSlide(1);
      if (e.key === "ArrowLeft") navigateSlide(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, slides.length]);

  const toolbarContent = {
    home: [
      { icon: RotateCcw, label: 'Reset', action: () => window.location.reload() },
      { icon: Plus, label: 'New Slide', action: addSlide },
      { icon: Table, label: 'Layout', action: cycleLayout },
      { divider: true },
      { icon: Monitor, label: 'Present', action: togglePresentation },
      { icon: UserPlus, label: 'Share Live', action: shareLive }
    ],
    insert: [
      { icon: Type, label: 'Text Box', action: addTextBox },
      { icon: ImageIcon, label: 'Pictures', action: addPicture },
      { icon: Shapes, label: 'Shapes', action: addShape },
      { icon: PieChart, label: 'Chart', action: addChart }
    ],
    transitions: [
      { icon: Wand2, label: 'Fade', action: () => showToast('Fade applied') },
      { icon: ArrowUp, label: 'Push', action: () => showToast('Push applied') },
      { icon: Eraser, label: 'Wipe', action: () => showToast('Wipe applied') }
    ],
    animations: [
      { icon: Star, label: 'Appear', action: () => showToast('Appear animation added') },
      { icon: Circle, label: 'Fade', action: () => showToast('Fade animation added') },
      { icon: Plane, label: 'Fly In', action: () => showToast('Fly In animation added') }
    ],
    slideshow: [
      { icon: Play, label: 'From Start', action: () => { setCurrentIdx(0); togglePresentation(); } },
      { icon: FastForward, label: 'From Current', action: togglePresentation },
      { divider: true },
      { icon: Radio, label: 'Present Online', action: () => showToast('Live Presentation Started') }
    ],
    file: [
      { icon: Save, label: 'Save', action: () => showToast('Saving...') },
      { icon: FileDown, label: 'Export PDF', action: () => showToast('Exporting as PDF...') },
      { icon: Printer, label: 'Print', action: () => showToast('Printing...') }
    ]
  };

  const navigateSlide = (dir) => {
    const next = currentIdx + dir;
    if (next >= 0 && next < slides.length) setCurrentIdx(next);
  };

  const addSlide = () => {
    const newId = slides.length + 1;
    setSlides([...slides, {
      id: newId,
      title: `New Slide ${newId}`,
      content: "Add content here...",
      layout: 'content',
      features: [{ label: "New Support", desc: "Build impact." }],
      elements: []
    }]);
    setCurrentIdx(slides.length);
    showToast("New slide added");
  };

  const cycleLayout = () => {
    const layouts = ['title', 'content', 'two-col'];
    const currentLayout = slides[currentIdx].layout;
    const currentLayoutIdx = layouts.indexOf(currentLayout);
    const newLayout = layouts[(currentLayoutIdx + 1) % layouts.length];
    
    const updatedSlides = [...slides];
    updatedSlides[currentIdx] = { ...updatedSlides[currentIdx], layout: newLayout };
    setSlides(updatedSlides);
    showToast(`Switched to ${newLayout} layout`);
  };

  const addTextBox = () => {
    const updatedSlides = [...slides];
    updatedSlides[currentIdx].elements.push({
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100
    });
    setSlides(updatedSlides);
    showToast("Text Box inserted");
  };

  const addPicture = () => {
    const url = prompt("Enter Image URL:", "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400");
    if (url) {
      const updatedSlides = [...slides];
      updatedSlides[currentIdx].elements.push({
        type: 'image',
        url: url,
        x: 150,
        y: 150
      });
      setSlides(updatedSlides);
      showToast("Picture inserted");
    }
  };

  const addShape = () => {
    const shapes = ['square', 'circle', 'heart'];
    const choice = prompt("Enter shape (square, circle, heart):", "heart");
    if (shapes.includes(choice)) {
      const updatedSlides = [...slides];
      updatedSlides[currentIdx].elements.push({
        type: 'shape',
        shape: choice,
        x: 200,
        y: 200
      });
      setSlides(updatedSlides);
      showToast("Shape inserted");
    }
  };

  const addChart = () => {
    const updatedSlides = [...slides];
    updatedSlides[currentIdx].elements.push({
      type: 'chart',
      x: 250,
      y: 250
    });
    setSlides(updatedSlides);
    showToast("Chart inserted");
  };

  const togglePresentation = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(isPresentationMode ? "Presentation Mode: OFF" : "Presentation Mode: ON (Press ESC to exit)");
  };

  const shareLive = () => {
    const sessionID = Math.random().toString(36).substring(7).toUpperCase();
    showToast(`Live Session Started! ID: ${sessionID}`);
  };

  const showToast = (message) => {
    // Simple toast implementation - could be replaced with a proper toast library
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl z-[2000] text-sm';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const renderSlideContent = (slide) => {
    if (slide.layout === 'title') {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center">
          <h1 className="text-5xl font-bold text-[#d24726] mb-4">{slide.title}</h1>
          {slide.subtitle && <p className="text-2xl text-gray-600 mt-2">{slide.subtitle}</p>}
          {slide.footer && <div className="mt-12 font-semibold text-blue-600">{slide.footer}</div>}
        </div>
      );
    }

    if (slide.layout === 'content') {
      return (
        <div className="flex flex-col">
          <div className="text-4xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-[#d24726] w-fit">
            {slide.title}
          </div>
          <div className="text-lg leading-relaxed text-gray-800">
            <p className="mb-6">{slide.content}</p>
            <div className="grid grid-cols-2 gap-6">
              {(slide.features || []).map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-5 border-l-4 border-[#d24726]">
                  <strong className="text-lg">{f.label}</strong>
                  <p className="text-sm mt-2 text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (slide.layout === 'two-col') {
      return (
        <div className="flex flex-col">
          <div className="text-4xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-[#d24726] w-fit">
            {slide.title}
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-lg mb-4">{slide.content}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(slide.list || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg h-52 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
              <ImageIcon size={40} className="mb-2" />
              <span>Visual Support</span>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderInsertedElements = (elements) => {
    return elements.map((el, i) => {
      const style = { top: `${el.y}px`, left: `${el.x}px` };

      if (el.type === 'text') {
        return (
          <div
            key={i}
            className="absolute z-10 cursor-move border border-dashed border-transparent hover:border-blue-400 p-1 min-w-[100px]"
            style={style}
            contentEditable
            suppressContentEditableWarning
          >
            {el.content}
          </div>
        );
      }

      if (el.type === 'image') {
        return (
          <div key={i} className="absolute z-10 cursor-move" style={{ ...style, width: '150px', height: '100px' }}>
            <img src={el.url} alt="" className="w-full h-full object-cover rounded border border-gray-300" />
          </div>
        );
      }

      if (el.type === 'shape') {
        const shapeClass = el.shape === 'circle' ? 'rounded-full' : el.shape === 'heart' ? 'heart-shape' : '';
        return (
          <div
            key={i}
            className={`absolute z-10 cursor-move bg-red-500 ${shapeClass}`}
            style={{ ...style, width: '100px', height: '100px' }}
          />
        );
      }

      if (el.type === 'chart') {
        return (
          <div key={i} className="absolute z-10 cursor-move bg-white border border-gray-300 p-2 flex items-end gap-1" style={{ ...style, width: '150px', height: '100px' }}>
            <div className="flex-1 bg-blue-500 h-[40%]" />
            <div className="flex-1 bg-red-500 h-[70%]" />
            <div className="flex-1 bg-green-500 h-[50%]" />
          </div>
        );
      }

      return null;
    });
  };

  const currentSlide = slides[currentIdx];

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isPresentationMode ? 'bg-black' : 'bg-[#f3f2f1]'}`}>
      {/* Exit Presentation Button */}
      {isPresentationMode && (
        <button
          onClick={togglePresentation}
          className="fixed top-5 right-5 bg-white/20 text-white border border-white/40 px-4 py-2 rounded z-[3000] hover:bg-white/30 transition-colors"
        >
          <X className="inline w-4 h-4 mr-1" /> Exit Presentation
        </button>
      )}

      {/* Ribbon Area */}
      {!isPresentationMode && (
        <div className="flex-none z-[100] bg-[#f3f2f1] border-b border-gray-200">
          {/* Top Bar */}
          <div className="h-8 bg-[#d24726] text-white px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileText size={14} />
              <span>Diverse Youth NI — Unit 4: Resilience & Science — Saved</span>
            </div>
            <span>Youth Tutor</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-2 bg-[#f3f2f1]">
            {['file', 'home', 'insert', 'transitions', 'animations', 'slideshow'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-[#d24726] font-semibold text-[#d24726]'
                    : 'hover:bg-gray-100'
                }`}
              >
                {tab === 'slideshow' ? 'Slide Show' : tab}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="h-24 bg-white flex items-center px-5 gap-5 overflow-x-auto border-b border-gray-200">
            {toolbarContent[activeTab]?.map((tool, i) =>
              tool.divider ? (
                <div key={i} className="w-px h-12 bg-gray-200 mx-2" />
              ) : (
                <button
                  key={i}
                  onClick={tool.action}
                  className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors min-w-[60px]"
                >
                  <tool.icon size={20} className="text-gray-600" />
                  <span className="text-[11px] text-gray-600 whitespace-nowrap">{tool.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filmstrip Sidebar */}
        {!isPresentationMode && (
          <aside className="w-52 bg-white border-r border-gray-200 overflow-y-auto p-3 flex flex-col gap-3 hidden lg:flex">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                onClick={() => setCurrentIdx(i)}
                className={`relative w-full aspect-video bg-white border rounded cursor-pointer transition-all ${
                  i === currentIdx ? 'border-2 border-[#d24726] bg-orange-50' : 'border-gray-300 hover:border-[#d24726]'
                }`}
              >
                <span className="absolute -left-3 top-0 text-[10px] text-gray-500">{i + 1}</span>
                <div className="flex-1 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-400 p-1 h-full">
                  {slide.title.substring(0, 15)}...
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Stage */}
        <main className={`flex-1 overflow-auto flex flex-col items-center ${isPresentationMode ? 'bg-black justify-center p-0' : 'bg-[#edebe9] p-10'}`}>
          <div
            className={`bg-white relative flex flex-col ${
              isPresentationMode
                ? 'w-screen h-screen max-w-none max-h-none m-0 shadow-none rounded-none'
                : 'w-full max-w-5xl aspect-video shadow-xl rounded p-10 mb-10'
            }`}
          >
            {renderSlideContent(currentSlide)}
            {renderInsertedElements(currentSlide.elements)}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      {!isPresentationMode && (
        <footer className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
          <div className="flex items-center gap-5">
            <span>Slide {currentIdx + 1} of {slides.length}</span>
            <span>English (United Kingdom)</span>
            <span className="text-[#d24726] font-bold flex items-center gap-1">
              <Check size={14} /> Accessibility: Good
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 cursor-pointer">
              <Grid3x3 size={14} />
              <BookOpen size={14} />
              <Monitor size={14} onClick={togglePresentation} />
            </div>
            <span>100%</span>
          </div>
        </footer>
      )}

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-3 bg-black/80 px-5 py-3 rounded-full z-[1000]">
        <button onClick={() => navigateSlide(-1)} className="text-white">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => navigateSlide(1)} className="text-white">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}