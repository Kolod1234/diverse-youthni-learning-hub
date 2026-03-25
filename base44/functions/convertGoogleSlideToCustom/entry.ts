import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Unauthorized: Admin or tutor access required' }, { status: 403 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return Response.json({ error: 'lessonId is required' }, { status: 400 });
    }

    // Get the lesson
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ id: lessonId });
    const lesson = lessons[0];

    if (!lesson || !lesson.google_slides_url) {
      return Response.json({ error: 'Lesson not found or no Google Slides URL' }, { status: 404 });
    }

    // Extract presentation ID from Google Slides URL
    const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!presentationId) {
      return Response.json({ error: 'Invalid Google Slides URL' }, { status: 400 });
    }

    // Get access token for Google Slides
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Fetch presentation data from Google Slides API
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!presentationResponse.ok) {
      const errorText = await presentationResponse.text();
      console.error('Google Slides API error:', errorText);
      return Response.json({ error: 'Failed to fetch Google Slides presentation', details: errorText }, { status: 500 });
    }

    const presentation = await presentationResponse.json();
    const customSlides = [];

    // Helper function to convert Google Slides color to hex
    const rgbToHex = (color) => {
      if (!color) return null;
      const r = Math.round((color.red || 0) * 255);
      const g = Math.round((color.green || 0) * 255);
      const b = Math.round((color.blue || 0) * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Helper function to convert arrayBuffer to base64
    const arrayBufferToBase64 = (buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    // Process each slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];
      let title = '';
      let content = '';
      let imageUrl = null;
      let videoUrl = null;
      let audioUrl = null;
      const images = [];

      // Extract text and media from slide elements
      if (slide.pageElements) {
        for (const element of slide.pageElements) {
          // Extract formatted text
          if (element.shape?.text?.textElements) {
            const paragraphStyle = element.shape.text.textElements[0]?.paragraphStyle;
            const alignment = paragraphStyle?.alignment || 'START';
            let alignStyle = alignment === 'CENTER' ? 'center' : alignment === 'END' ? 'right' : 'left';
            
            let formattedText = '';
            
            for (const textElement of element.shape.text.textElements) {
              if (textElement.textRun?.content) {
                const text = textElement.textRun.content;
                const style = textElement.textRun.style || {};
                
                let styledText = text;
                let inlineStyles = [];
                
                // Font size
                if (style.fontSize?.magnitude) {
                  inlineStyles.push(`font-size: ${style.fontSize.magnitude}pt`);
                }
                
                // Font family
                if (style.fontFamily) {
                  inlineStyles.push(`font-family: "${style.fontFamily}"`);
                }
                
                // Text color
                if (style.foregroundColor?.opaqueColor?.rgbColor) {
                  const color = rgbToHex(style.foregroundColor.opaqueColor.rgbColor);
                  if (color) inlineStyles.push(`color: ${color}`);
                }
                
                // Background color
                if (style.backgroundColor?.opaqueColor?.rgbColor) {
                  const bgColor = rgbToHex(style.backgroundColor.opaqueColor.rgbColor);
                  if (bgColor) inlineStyles.push(`background-color: ${bgColor}`);
                }
                
                // Bold
                if (style.bold) {
                  styledText = `<strong>${styledText}</strong>`;
                }
                
                // Italic
                if (style.italic) {
                  styledText = `<em>${styledText}</em>`;
                }
                
                // Underline
                if (style.underline) {
                  styledText = `<u>${styledText}</u>`;
                }
                
                // Strikethrough
                if (style.strikethrough) {
                  styledText = `<s>${styledText}</s>`;
                }
                
                // Apply inline styles
                if (inlineStyles.length > 0) {
                  styledText = `<span style="${inlineStyles.join('; ')}">${styledText}</span>`;
                }
                
                formattedText += styledText;
              }
            }
            
            if (formattedText.trim()) {
              const cleanText = formattedText.trim();
              if (!title) {
                title = cleanText.replace(/<[^>]*>/g, '').split('\n')[0];
              }
              // Wrap in paragraph with alignment
              const paragraphs = cleanText.split('\n').filter(p => p.trim());
              paragraphs.forEach(p => {
                content += `<p style="text-align: ${alignStyle}; margin: 0.5em 0;">${p}</p>`;
              });
            }
          }

          // Extract images
          if (element.image?.contentUrl) {
            try {
              console.log(`Fetching image from slide ${i}:`, element.image.contentUrl);
              const imageResponse = await fetch(element.image.contentUrl);
              
              if (!imageResponse.ok) {
                console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
                continue;
              }

              const arrayBuffer = await imageResponse.arrayBuffer();
              const contentType = imageResponse.headers.get('content-type') || 'image/png';
              const base64Data = arrayBufferToBase64(arrayBuffer);
              const dataUrl = `data:${contentType};base64,${base64Data}`;
              
              console.log(`Uploading image ${images.length} from slide ${i}, size: ${arrayBuffer.byteLength} bytes`);
              const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: dataUrl });
              
              if (!imageUrl) {
                imageUrl = uploadResult.file_url;
              }
              images.push(uploadResult.file_url);
              console.log(`Successfully uploaded image: ${uploadResult.file_url}`);
            } catch (error) {
              console.error(`Failed to process image from slide ${i}:`, error.message);
            }
          }

          // Extract videos (Google Slides videos are usually from YouTube or Drive)
          if (element.video) {
            if (element.video.url) {
              videoUrl = element.video.url;
            } else if (element.video.source === 'YOUTUBE' && element.video.id) {
              videoUrl = `https://www.youtube.com/embed/${element.video.id}`;
            }
          }
        }
      }

      // Add all images to content if multiple - responsive grid layout
      if (images.length > 1) {
        content += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1.5rem;">';
        images.forEach(img => {
          content += `<img src="${img}" alt="Slide image" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
        });
        content += '</div>';
      }

      customSlides.push({
        title: title || `Slide ${i + 1}`,
        content: content || '<p>No content</p>',
        order: i,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        audioUrl: audioUrl
      });
    }

    // Update the lesson with custom slides
    await base44.asServiceRole.entities.Lesson.update(lessonId, {
      content_type: 'richtext',
      slides: customSlides,
      // Keep google_slides_url as backup - don't remove it
    });

    return Response.json({
      success: true,
      message: 'Google Slides converted to custom slides successfully',
      slideCount: customSlides.length
    });

  } catch (error) {
    console.error('Error converting Google Slides:', error);
    return Response.json({ 
      error: 'Failed to convert Google Slides',
      details: error.message 
    }, { status: 500 });
  }
});