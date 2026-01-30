import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

export default function SlideConverter() {
  const [editorHtml, setEditorHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Extract images from PPTX
      const images = {};
      const mediaFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/media/')
      );
      
      for (const mediaFile of mediaFiles) {
        const imageData = await zip.files[mediaFile].async('base64');
        const ext = mediaFile.split('.').pop().toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        const imageName = mediaFile.split('/').pop();
        images[imageName] = `data:${mimeType};base64,${imageData}`;
      }
      
      // Extract slide relationships to map images
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml') && !name.includes('_rels')
      ).sort();

      let htmlContent = '<div class="slides-container">';
      
      for (const slideName of slideFiles) {
        const slideXml = await zip.files[slideName].async('text');
        const slideNum = slideName.match(/slide(\d+)\.xml/)?.[1];
        
        // Get relationships for this slide
        const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        let imageRels = {};
        if (zip.files[relsPath]) {
          const relsXml = await zip.files[relsPath].async('text');
          const relMatches = relsXml.matchAll(/<Relationship Id="([^"]+)"[^>]*Target="\.\.\/media\/([^"]+)"/g);
          for (const match of relMatches) {
            imageRels[match[1]] = match[2];
          }
        }
        
        htmlContent += '<div class="slide" style="position: relative; width: 960px; height: 540px; margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; overflow: hidden;">';
        
        // Extract text with positioning
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
        
        // Find all shapes (text boxes and images)
        const shapes = xmlDoc.querySelectorAll('p\\:sp, p\\:pic');
        
        shapes.forEach(shape => {
          // Get position and size
          const xfrm = shape.querySelector('a\\:xfrm, xdr\\:xfrm');
          if (xfrm) {
            const off = xfrm.querySelector('a\\:off');
            const ext = xfrm.querySelector('a\\:ext');
            
            if (off && ext) {
              const x = parseInt(off.getAttribute('x')) / 12700; // EMUs to pixels
              const y = parseInt(off.getAttribute('y')) / 12700;
              const w = parseInt(ext.getAttribute('cx')) / 12700;
              const h = parseInt(ext.getAttribute('cy')) / 12700;
              
              // Check if it's an image
              const blip = shape.querySelector('a\\:blip');
              if (blip) {
                const embed = blip.getAttribute('r:embed');
                if (embed && imageRels[embed]) {
                  const imageData = images[imageRels[embed]];
                  if (imageData) {
                    htmlContent += `<img src="${imageData}" style="position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;" />`;
                  }
                }
              } else {
                // It's a text box
                const texts = Array.from(shape.querySelectorAll('a\\:t')).map(t => t.textContent);
                if (texts.length > 0) {
                  const fontSize = shape.querySelector('a\\:sz');
                  const size = fontSize ? parseInt(fontSize.getAttribute('val')) / 100 : 16;
                  const isBold = shape.querySelector('a\\:latin[typeface*="Bold"]') || shape.querySelector('a\\:b[val="1"]');
                  
                  htmlContent += `<div style="position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px; font-size: ${size}px; ${isBold ? 'font-weight: bold;' : ''} overflow: hidden;">`;
                  htmlContent += texts.join('<br>');
                  htmlContent += '</div>';
                }
              }
            }
          }
        });
        
        htmlContent += '</div>';
      }
      
      htmlContent += '</div>';
      setEditorHtml(htmlContent);
    } catch (error) {
      console.error('Error parsing PPTX:', error);
      setEditorHtml('<p style="color: red;">Error parsing PPTX file. Please try a different file.</p>');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="converter-container p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">PowerPoint to Rich Text Converter</h2>
        <p className="text-muted-foreground">Upload a PPTX file to extract and edit its content</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="pptx-upload">
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={loading}
            onClick={() => document.getElementById('pptx-upload').click()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload PPTX File
              </>
            )}
          </Button>
        </label>
        <input 
          id="pptx-upload"
          type="file" 
          accept=".pptx" 
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="editor-wrapper bg-white rounded-lg border border-border">
        <ReactQuill 
          value={editorHtml}
          onChange={setEditorHtml}
          modules={modules}
          theme="snow"
          className="h-[600px]"
        />
      </div>

      {editorHtml && (
        <div className="mt-6">
          <Button onClick={() => {
            const blob = new Blob([editorHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted-content.html';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Download HTML
          </Button>
        </div>
      )}
    </div>
  );
}