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
      
      // Extract slide content
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml') && !name.includes('_rels')
      ).sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || 0);
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || 0);
        return numA - numB;
      });

      let htmlContent = '<div class="slides-container">';
      
      for (const slideName of slideFiles) {
        const slideXml = await zip.files[slideName].async('text');
        const slideNum = slideName.match(/slide(\d+)\.xml/)?.[1];
        
        // Get relationships for this slide
        const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        let imageRels = {};
        if (zip.files[relsPath]) {
          const relsXml = await zip.files[relsPath].async('text');
          const relMatches = [...relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="\.\.\/media\/([^"]+)"/g)];
          for (const match of relMatches) {
            imageRels[match[1]] = match[2];
          }
        }
        
        htmlContent += '<div class="slide" style="position: relative; width: 960px; height: 540px; margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; overflow: hidden;">';
        
        // Extract text content
        const textMatches = [...slideXml.matchAll(/<a:t>([^<]+)<\/a:t>/g)];
        const texts = textMatches.map(m => m[1]);
        
        // Extract image references
        const imageMatches = [...slideXml.matchAll(/<a:blip[^>]+r:embed="([^"]+)"/g)];
        
        // Add texts as positioned elements
        let yPos = 50;
        texts.forEach((text, idx) => {
          const isTitle = idx === 0;
          const fontSize = isTitle ? 32 : 18;
          const fontWeight = isTitle ? 'bold' : 'normal';
          
          htmlContent += `<div style="position: absolute; left: 50px; top: ${yPos}px; width: 860px; font-size: ${fontSize}px; font-weight: ${fontWeight};">${text}</div>`;
          yPos += isTitle ? 80 : 40;
        });
        
        // Add images
        let imgX = 50;
        let imgY = Math.max(yPos + 20, 200);
        imageMatches.forEach(match => {
          const embedId = match[1];
          if (imageRels[embedId]) {
            const imageData = images[imageRels[embedId]];
            if (imageData) {
              htmlContent += `<img src="${imageData}" style="position: absolute; left: ${imgX}px; top: ${imgY}px; max-width: 400px; max-height: 300px; object-fit: contain;" />`;
              imgX += 420;
              if (imgX > 800) {
                imgX = 50;
                imgY += 320;
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