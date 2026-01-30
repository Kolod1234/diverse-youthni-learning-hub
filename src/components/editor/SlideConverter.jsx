import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

export default function SlideConverter() {
  const [editorHtml, setEditorHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const parseColor = (colorXml) => {
    if (!colorXml) return null;
    
    // RGB color
    const rgbMatch = colorXml.match(/srgbClr val="([^"]+)"/);
    if (rgbMatch) return `#${rgbMatch[1]}`;
    
    // Scheme color (approximations)
    const schemeMatch = colorXml.match(/schemeClr val="([^"]+)"/);
    if (schemeMatch) {
      const schemes = {
        'tx1': '#000000', 'bg1': '#FFFFFF', 'tx2': '#000000', 'bg2': '#FFFFFF',
        'accent1': '#4472C4', 'accent2': '#ED7D31', 'accent3': '#A5A5A5',
        'accent4': '#FFC000', 'accent5': '#5B9BD5', 'accent6': '#70AD47'
      };
      return schemes[schemeMatch[1]] || '#000000';
    }
    
    return null;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Extract images
      const images = {};
      const mediaFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/media/'));
      
      for (const mediaFile of mediaFiles) {
        const imageData = await zip.files[mediaFile].async('base64');
        const ext = mediaFile.split('.').pop().toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        images[mediaFile.split('/').pop()] = `data:${mimeType};base64,${imageData}`;
      }
      
      // Extract slides
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml') && !name.includes('_rels'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)/)?.[1] || 0);
          const numB = parseInt(b.match(/slide(\d+)/)?.[1] || 0);
          return numA - numB;
        });

      let htmlContent = '<div style="font-family: Arial, sans-serif;">';
      
      for (const slideName of slideFiles) {
        const slideXml = await zip.files[slideName].async('text');
        const slideNum = slideName.match(/slide(\d+)\.xml/)?.[1];
        
        // Get image relationships
        const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
        let imageRels = {};
        if (zip.files[relsPath]) {
          const relsXml = await zip.files[relsPath].async('text');
          [...relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="\.\.\/media\/([^"]+)"/g)]
            .forEach(m => imageRels[m[1]] = m[2]);
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
        
        htmlContent += '<div style="page-break-after: always; margin-bottom: 40px; padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px; background: white;">';
        htmlContent += `<h3 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Slide ${slideNum}</h3>`;
        
        // Process all shapes (text boxes, images, tables)
        const shapes = xmlDoc.querySelectorAll('p\\:sp, p\\:pic, p\\:graphicFrame');
        
        shapes.forEach(shape => {
          // Handle images
          const blip = shape.querySelector('a\\:blip');
          if (blip) {
            const embed = blip.getAttribute('r:embed') || blip.getAttribute('embed');
            if (embed && imageRels[embed] && images[imageRels[embed]]) {
              htmlContent += `<div style="margin: 20px 0; text-align: center;"><img src="${images[imageRels[embed]]}" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" /></div>`;
            }
            return;
          }
          
          // Handle tables
          const table = shape.querySelector('a\\:tbl');
          if (table) {
            htmlContent += '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
            const rows = table.querySelectorAll('a\\:tr');
            rows.forEach((row, rowIdx) => {
              htmlContent += '<tr>';
              const cells = row.querySelectorAll('a\\:tc');
              cells.forEach(cell => {
                const cellTexts = Array.from(cell.querySelectorAll('a\\:t')).map(t => t.textContent).join(' ');
                const isHeader = rowIdx === 0;
                const tag = isHeader ? 'th' : 'td';
                const style = `padding: 12px; border: 1px solid #ddd; text-align: left; ${isHeader ? 'background: #f3f4f6; font-weight: bold;' : ''}`;
                htmlContent += `<${tag} style="${style}">${cellTexts}</${tag}>`;
              });
              htmlContent += '</tr>';
            });
            htmlContent += '</table>';
            return;
          }
          
          // Handle text boxes
          const txBody = shape.querySelector('p\\:txBody');
          if (txBody) {
            const paragraphs = txBody.querySelectorAll('a\\:p');
            
            paragraphs.forEach(para => {
              const pPr = para.querySelector('a\\:pPr');
              let isBullet = false;
              let isNumbered = false;
              let level = 0;
              
              if (pPr) {
                isBullet = pPr.querySelector('a\\:buChar, a\\:buAutoNum') !== null;
                isNumbered = pPr.querySelector('a\\:buAutoNum') !== null;
                const lvlAttr = pPr.getAttribute('lvl');
                level = lvlAttr ? parseInt(lvlAttr) : 0;
              }
              
              let paraText = '';
              const runs = para.querySelectorAll('a\\:r');
              
              runs.forEach(run => {
                const text = run.querySelector('a\\:t')?.textContent || '';
                if (!text) return;
                
                const rPr = run.querySelector('a\\:rPr');
                let styles = '';
                
                if (rPr) {
                  // Font size (in hundredths of a point)
                  const sz = rPr.getAttribute('sz');
                  if (sz) styles += `font-size: ${parseInt(sz) / 100}pt; `;
                  
                  // Bold
                  const bold = rPr.getAttribute('b');
                  if (bold === '1') styles += 'font-weight: bold; ';
                  
                  // Italic
                  const italic = rPr.getAttribute('i');
                  if (italic === '1') styles += 'font-style: italic; ';
                  
                  // Underline
                  const underline = rPr.getAttribute('u');
                  if (underline && underline !== 'none') styles += 'text-decoration: underline; ';
                  
                  // Strike
                  const strike = rPr.getAttribute('strike');
                  if (strike === 'sngStrike') styles += 'text-decoration: line-through; ';
                  
                  // Color
                  const solidFill = rPr.querySelector('a\\:solidFill');
                  if (solidFill) {
                    const color = parseColor(solidFill.innerHTML);
                    if (color) styles += `color: ${color}; `;
                  }
                  
                  // Font family
                  const latin = rPr.querySelector('a\\:latin');
                  if (latin) {
                    const typeface = latin.getAttribute('typeface');
                    if (typeface) styles += `font-family: "${typeface}"; `;
                  }
                }
                
                paraText += styles ? `<span style="${styles}">${text}</span>` : text;
              });
              
              if (paraText.trim()) {
                const indent = level * 20;
                let listStyle = '';
                
                if (isBullet || isNumbered) {
                  const listType = isNumbered ? 'ol' : 'ul';
                  const listItemStyle = `margin-left: ${indent}px; margin-bottom: 8px; line-height: 1.6;`;
                  htmlContent += `<${listType} style="margin: 10px 0;"><li style="${listItemStyle}">${paraText}</li></${listType}>`;
                } else {
                  const paraStyle = `margin: 10px 0; margin-left: ${indent}px; line-height: 1.6;`;
                  htmlContent += `<p style="${paraStyle}">${paraText}</p>`;
                }
              }
            });
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