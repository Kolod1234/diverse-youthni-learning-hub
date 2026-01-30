import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { FileText, Loader2 } from 'lucide-react';

const EMU_TO_PX = 9525;

const emuToPx = (emu) => {
  return (parseInt(emu) / EMU_TO_PX) + 'px';
};

export default function PowerPointRenderer({ fileUrl }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPPTX = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);
        
        // 1. Get Media (Images)
        const images = {};
        const mediaFolder = zip.folder("ppt/media");
        if (mediaFolder) {
          for (let path in mediaFolder.files) {
            const file = mediaFolder.files[path];
            if (!file.dir) {
              const base64 = await file.async("base64");
              const ext = path.split('.').pop().toLowerCase();
              const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
              images[path.split('/').pop()] = `data:${mimeType};base64,${base64}`;
            }
          }
        }

        // 2. Parse all slides
        const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/));
        const parsedSlides = [];

        for (let slideFile of slideFiles) {
          const slideXml = await zip.file(slideFile).async("text");
          const slideNum = slideFile.match(/slide(\d+)\.xml/)[1];
          const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
          
          let relsMap = {};
          if (zip.file(relsFile)) {
            const relsXml = await zip.file(relsFile).async("text");
            const relsDoc = new DOMParser().parseFromString(relsXml, "text/xml");
            Array.from(relsDoc.getElementsByTagName("Relationship")).forEach(rel => {
              const target = rel.getAttribute("Target");
              relsMap[rel.getAttribute("Id")] = target ? target.replace('../media/', '') : '';
            });
          }

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(slideXml, "text/xml");

          // Extract shapes/textboxes
          const shapes = Array.from(xmlDoc.getElementsByTagName("p:sp")).map(sp => {
            const xfr = sp.getElementsByTagName("a:off")[0];
            const ext = sp.getElementsByTagName("a:ext")[0];
            const textNodes = sp.getElementsByTagName("a:t");
            const text = Array.from(textNodes).map(t => t.textContent).join(' ');

            if (!xfr || !ext) return null;

            return {
              type: 'text',
              text,
              style: {
                position: 'absolute',
                left: emuToPx(xfr.getAttribute('x')),
                top: emuToPx(xfr.getAttribute('y')),
                width: emuToPx(ext.getAttribute('cx')),
                height: emuToPx(ext.getAttribute('cy')),
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                fontSize: '16px',
                overflow: 'hidden'
              }
            };
          }).filter(Boolean);

          // Extract images
          const picNodes = Array.from(xmlDoc.getElementsByTagName("p:pic")).map(pic => {
            const blip = pic.getElementsByTagName("a:blip")[0];
            const rId = blip?.getAttribute("r:link") || blip?.getAttribute("r:embed");
            const xfr = pic.getElementsByTagName("a:off")[0];
            const ext = pic.getElementsByTagName("a:ext")[0];

            if (!rId || !relsMap[rId] || !xfr || !ext) return null;

            const imgSrc = images[relsMap[rId]];
            if (!imgSrc) return null;

            return {
              type: 'image',
              src: imgSrc,
              style: {
                position: 'absolute',
                left: emuToPx(xfr.getAttribute('x')),
                top: emuToPx(xfr.getAttribute('y')),
                width: emuToPx(ext.getAttribute('cx')),
                height: emuToPx(ext.getAttribute('cy')),
                objectFit: 'contain'
              }
            };
          }).filter(Boolean);

          parsedSlides.push({
            elements: [...shapes, ...picNodes]
          });
        }

        setSlides(parsedSlides);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PPTX:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadPPTX();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center text-red-600">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>Failed to load presentation</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>No slides found</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Slide Display */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative bg-white shadow-2xl mx-auto" 
          style={{ 
            width: '960px', 
            height: '540px',
            maxWidth: '100%',
            aspectRatio: '16/9'
          }}
        >
          {slide.elements.map((element, i) => (
            element.type === 'image' ? (
              <img key={i} src={element.src} style={element.style} alt="" />
            ) : (
              <div key={i} style={element.style}>
                {element.text}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Previous
        </button>
        <span className="text-white font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}