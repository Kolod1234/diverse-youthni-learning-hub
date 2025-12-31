import React, { useState } from 'react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

const RichSlideViewer = ({ onSlidesExtracted }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const processPptx = async (file) => {
    setLoading(true);
    const zip = new JSZip();
    
    try {
      const content = await zip.loadAsync(file);
      const slideData = [];
      
      // 1. Find all slide files
      const slideFiles = Object.keys(content.files).filter(path => 
        path.startsWith("ppt/slides/slide") && path.endsWith(".xml")
      ).sort((a, b) => {
        // Sort specifically by number to avoid 1, 10, 2 ordering
        const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
        return numA - numB;
      });

      // 2. Process each slide
      for (const slidePath of slideFiles) {
        const slideNum = slidePath.match(/slide(\d+)\.xml/)[1];
        
        // A. Extract Text
        const slideXmlStr = await content.file(slidePath).async("string");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXmlStr, "text/xml");
        
        const textNodes = xmlDoc.getElementsByTagName("a:t");
        const textLines = [];
        for (let i = 0; i < textNodes.length; i++) {
          textLines.push(textNodes[i].textContent);
        }

        // B. Extract Images
        const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        const images = [];

        if (content.files[relsPath]) {
          const relsXmlStr = await content.file(relsPath).async("string");
          const relsDoc = parser.parseFromString(relsXmlStr, "text/xml");
          const relationships = relsDoc.getElementsByTagName("Relationship");

          for (let i = 0; i < relationships.length; i++) {
            const rel = relationships[i];
            const target = rel.getAttribute("Target");
            const type = rel.getAttribute("Type");

            if (type && type.includes("image")) {
              let imagePath = target.replace("../", "ppt/");
              
              if (!imagePath.startsWith("ppt/")) {
                imagePath = "ppt/" + target;
              }

              if (content.files[imagePath]) {
                const imgBlob = await content.file(imagePath).async("blob");
                const imgUrl = URL.createObjectURL(imgBlob);
                images.push(imgUrl);
              }
            }
          }
        }

        slideData.push({
          id: slideNum,
          title: textLines[0] || `Slide ${slideNum}`,
          content: `<div>${textLines.map(t => `<p>${t}</p>`).join('')}</div>`,
          images: images,
          order: parseInt(slideNum)
        });
      }

      setSlides(slideData);
      if (onSlidesExtracted) {
        onSlidesExtracted(slideData);
      }
    } catch (err) {
      console.error(err);
      alert("Error reading PPTX file");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    if (e.target.files[0]) processPptx(e.target.files[0]);
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h3 className="text-xl font-bold text-center mb-6">PPTX Text & Image Extractor</h3>
      
      <div className="text-center mb-6">
        <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Upload className="w-5 h-5" />
          <span>Upload PPTX File</span>
          <input type="file" onChange={handleFile} accept=".pptx" className="hidden" />
        </label>
      </div>

      {loading && <div className="text-center text-gray-600">Extracting media...</div>}

      {!loading && currentSlide && (
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
            <Button 
              variant="outline"
              size="sm"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex(i => i - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="font-semibold text-gray-700">Slide {currentSlideIndex + 1} / {slides.length}</span>
            <Button 
              variant="outline"
              size="sm"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex(i => i + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Slide Content Area */}
          <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
            
            {/* Render Images First */}
            {currentSlide.images.length > 0 && (
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                {currentSlide.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    className="max-w-full max-h-[300px] object-contain border border-gray-200 rounded-lg shadow-sm" 
                    alt="slide-asset" 
                  />
                ))}
              </div>
            )}

            {/* Render Text */}
            <div className="w-full">
              {currentSlide.text && currentSlide.text.length > 0 ? (
                currentSlide.text.map((line, idx) => (
                  <p key={idx} className="text-lg mb-2 leading-relaxed text-gray-800">{line}</p>
                ))
              ) : (
                <p className="text-gray-400 italic text-center">No text on this slide</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichSlideViewer;