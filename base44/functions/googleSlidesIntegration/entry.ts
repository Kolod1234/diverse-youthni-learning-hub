import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, lessonId, presentationId } = await req.json();

    // Get Google Slides access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    if (action === 'export') {
      // Export lesson to Google Slides
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      const lesson = lessons[0];

      if (!lesson) {
        return Response.json({ error: 'Lesson not found' }, { status: 404 });
      }

      // Create a new presentation
      const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lesson.title,
        }),
      });

      const presentation = await createResponse.json();

      if (!createResponse.ok) {
        return Response.json({ error: 'Failed to create presentation', details: presentation }, { status: 500 });
      }

      const presentationId = presentation.presentationId;

      // Add slides
      const requests = [];
      const slides = lesson.slides || [];

      // Remove the default slide first
      if (presentation.slides && presentation.slides.length > 0) {
        requests.push({
          deleteObject: {
            objectId: presentation.slides[0].objectId,
          },
        });
      }

      // Create slides from lesson content
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideId = `slide_${i}`;

        // Create slide
        requests.push({
          createSlide: {
            objectId: slideId,
            insertionIndex: i,
            slideLayoutReference: {
              predefinedLayout: 'TITLE_AND_BODY',
            },
          },
        });

        // Strip HTML tags for plain text
        const stripHtml = (html) => {
          return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const titleText = slide.title || `Slide ${i + 1}`;
        const bodyText = stripHtml(slide.content || '');

        // Add title
        requests.push({
          insertText: {
            objectId: `${slideId}_title`,
            text: titleText,
          },
        });

        // Add body text (limited to 5000 chars)
        const truncatedBody = bodyText.substring(0, 5000);
        requests.push({
          insertText: {
            objectId: `${slideId}_body`,
            text: truncatedBody,
          },
        });
      }

      // Apply all requests
      const updateResponse = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        return Response.json({ error: 'Failed to update slides', details: updateResult }, { status: 500 });
      }

      return Response.json({
        success: true,
        presentationId,
        url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      });
    } else if (action === 'import') {
      // Import Google Slides presentation as lesson content
      const getResponse = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const presentation = await getResponse.json();

      if (!getResponse.ok) {
        return Response.json({ error: 'Failed to fetch presentation', details: presentation }, { status: 500 });
      }

      // Convert slides to lesson format with exact positioning
      const lessonSlides = presentation.slides.map((slide, index) => {
        let title = 'Untitled Slide';
        const elements = [];

        // Get slide dimensions (default Google Slides dimensions)
        const slideWidth = presentation.pageSize?.width?.magnitude || 720;
        const slideHeight = presentation.pageSize?.height?.magnitude || 405;

        // Get slide background
        let slideBackground = 'white';
        if (slide.slideProperties?.pageBackgroundFill?.solidFill?.color?.rgbColor) {
          const bg = slide.slideProperties.pageBackgroundFill.solidFill.color.rgbColor;
          const r = Math.round((bg.red || 0) * 255);
          const g = Math.round((bg.green || 0) * 255);
          const b = Math.round((bg.blue || 0) * 255);
          slideBackground = `rgb(${r},${g},${b})`;
        }

        // Extract all elements with positioning
        if (slide.pageElements) {
          for (let i = 0; i < slide.pageElements.length; i++) {
            const element = slide.pageElements[i];
            
            // Get positioning info
            const transform = element.transform || {};
            const size = element.size || {};
            const x = transform.translateX || 0;
            const y = transform.translateY || 0;
            const width = size.width?.magnitude || 100;
            const height = size.height?.magnitude || 100;
            
            // Convert EMU to percentage for responsive layout
            const leftPercent = (x / slideWidth) * 100;
            const topPercent = (y / slideHeight) * 100;
            const widthPercent = (width / slideWidth) * 100;
            const heightPercent = (height / slideHeight) * 100;

            // Extract text from shapes
            if (element.shape && element.shape.text) {
              const textElements = element.shape.text.textElements || [];
              let text = '';
              let styles = '';
              
              for (const te of textElements) {
                if (te.textRun) {
                  const content = te.textRun.content || '';
                  const style = te.textRun.style || {};
                  
                  let styledText = content;
                  if (style.bold) styledText = `<strong>${styledText}</strong>`;
                  if (style.italic) styledText = `<em>${styledText}</em>`;
                  if (style.underline) styledText = `<u>${styledText}</u>`;
                  
                  if (style.fontSize?.magnitude) {
                    // Font size in points - convert to pixels for better display
                    const fontSizePx = style.fontSize.magnitude * 1.33; // Convert points to pixels
                    styledText = `<span style="font-size: ${fontSizePx}px;">${styledText}</span>`;
                  }
                  
                  if (style.foregroundColor) {
                    const color = style.foregroundColor.opaqueColor?.rgbColor;
                    if (color) {
                      const r = Math.round((color.red || 0) * 255);
                      const g = Math.round((color.green || 0) * 255);
                      const b = Math.round((color.blue || 0) * 255);
                      styledText = `<span style="color: rgb(${r},${g},${b});">${styledText}</span>`;
                    }
                  }
                  
                  text += styledText;
                }
              }
              
              if (text.trim()) {
                // First text element is usually the title
                if (i === 0 && title === 'Untitled Slide') {
                  title = text.replace(/<[^>]*>/g, '').trim();
                }
                
                // Get text box styling
                let boxStyle = '';
                if (element.shape.shapeProperties?.shapeBackgroundFill?.solidFill) {
                  const bgColor = element.shape.shapeProperties.shapeBackgroundFill.solidFill.color?.rgbColor;
                  if (bgColor) {
                    const r = Math.round((bgColor.red || 0) * 255);
                    const g = Math.round((bgColor.green || 0) * 255);
                    const b = Math.round((bgColor.blue || 0) * 255);
                    boxStyle += `background-color: rgb(${r},${g},${b}); `;
                  }
                }
                
                // Get text alignment
                const alignment = element.shape.text?.textElements?.[0]?.paragraphMarker?.style?.alignment;
                if (alignment === 'CENTER') boxStyle += 'text-align: center; ';
                else if (alignment === 'END') boxStyle += 'text-align: right; ';
                else boxStyle += 'text-align: left; ';
                
                boxStyle += 'display: flex; align-items: center; overflow-wrap: break-word; word-wrap: break-word;';
                
                elements.push(`
                  <div style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%; ${boxStyle}">
                    ${text}
                  </div>
                `);
              }
            }
            
            // Extract images
            if (element.image && element.image.contentUrl) {
              const imageUrl = element.image.contentUrl;
              elements.push(`
                <img src="${imageUrl}" alt="Slide image" style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%; object-fit: contain;" />
              `);
            }
            
            // Extract tables
            if (element.table) {
              const table = element.table;
              let tableHtml = '<table style="width: 100%; border-collapse: collapse;">';
              
              if (table.tableRows) {
                for (const row of table.tableRows) {
                  tableHtml += '<tr>';
                  if (row.tableCells) {
                    for (const cell of row.tableCells) {
                      let cellText = '';
                      if (cell.text?.textElements) {
                        cellText = cell.text.textElements
                          .map(te => te.textRun?.content || '')
                          .join('');
                      }
                      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cellText}</td>`;
                    }
                  }
                  tableHtml += '</tr>';
                }
              }
              
              tableHtml += '</table>';
              elements.push(`
                <div style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%;">
                  ${tableHtml}
                </div>
              `);
            }
            
            // Extract charts/graphs
            if (element.sheetsChart) {
              const chartId = element.sheetsChart.chartId;
              const spreadsheetId = element.sheetsChart.spreadsheetId;
              // Chart image is available via contentUrl if present
              if (element.sheetsChart.contentUrl) {
                elements.push(`
                  <img src="${element.sheetsChart.contentUrl}" alt="Chart" style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%; object-fit: contain;" />
                `);
              } else {
                elements.push(`
                  <div style="position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${widthPercent}%; height: ${heightPercent}%; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">
                    <p>📊 Chart from Google Sheets</p>
                  </div>
                `);
              }
            }
          }
        }

        // Create positioned content container
        const content = `
          <div style="position: relative; width: 100%; padding-top: ${(slideHeight/slideWidth)*100}%; background: ${slideBackground}; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
              ${elements.join('\n')}
            </div>
          </div>
        `;

        return {
          title: title || `Slide ${index + 1}`,
          content: content || '<p>No content</p>',
          order: index + 1,
        };
      });

      return Response.json({
        success: true,
        title: presentation.title,
        slides: lessonSlides,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Google Slides integration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});