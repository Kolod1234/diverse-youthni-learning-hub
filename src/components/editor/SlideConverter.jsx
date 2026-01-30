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
      
      // Extract slide content from PPTX (simplified approach)
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );

      let htmlContent = '<div class="slides-container">';
      
      for (const slideName of slideFiles) {
        const slideXml = await zip.files[slideName].async('text');
        
        // Extract text content from XML
        const textMatches = slideXml.match(/<a:t>(.*?)<\/a:t>/g) || [];
        const texts = textMatches.map(match => 
          match.replace(/<\/?a:t>/g, '').trim()
        );

        if (texts.length > 0) {
          htmlContent += '<div class="slide" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">';
          htmlContent += `<h2 style="color: #2563eb; margin-bottom: 15px;">${texts[0] || 'Slide'}</h2>`;
          
          texts.slice(1).forEach(text => {
            htmlContent += `<p style="margin-bottom: 10px; line-height: 1.6;">${text}</p>`;
          });
          
          htmlContent += '</div>';
        }
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