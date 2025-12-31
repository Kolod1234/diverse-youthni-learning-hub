import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Get Google Slides access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Step 1: Download the PPTX file
    const fileResponse = await fetch(file_url);
    const fileBlob = await fileResponse.blob();
    const fileBuffer = await fileBlob.arrayBuffer();

    // Step 2: Upload to Google Drive and convert to Google Slides
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=boundary123'
      },
      body: createMultipartBody(fileBuffer, 'Converted Presentation')
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Google Drive upload failed: ${error}`);
    }

    const uploadData = await uploadResponse.json();
    const presentationId = uploadData.id;

    // Step 3: Get the presentation details
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!presentationResponse.ok) {
      throw new Error('Failed to fetch presentation details');
    }

    const presentation = await presentationResponse.json();

    // Step 4: Extract slides as HTML
    const slides = presentation.slides.map((slide, index) => {
      return {
        title: `Slide ${index + 1}`,
        content: `<iframe src="https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=id.${slide.objectId}" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>`,
        order: index,
        slideId: slide.objectId
      };
    });

    return Response.json({
      success: true,
      presentation_id: presentationId,
      presentation_url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      embed_url: `https://docs.google.com/presentation/d/${presentationId}/embed`,
      slides: slides,
      total_slides: slides.length
    });

  } catch (error) {
    console.error('PPTX to Google Slides conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PPTX',
      details: error.message 
    }, { status: 500 });
  }
});

function createMultipartBody(fileBuffer, fileName) {
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.presentation'
  };

  const boundary = 'boundary123';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata);

  const filePart = delimiter +
    'Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n';

  const uint8Array = new Uint8Array(fileBuffer);
  
  // Combine parts
  const metadataBytes = new TextEncoder().encode(metadataPart + filePart);
  const closeDelimiterBytes = new TextEncoder().encode(closeDelimiter);
  
  const combinedArray = new Uint8Array(metadataBytes.length + uint8Array.length + closeDelimiterBytes.length);
  combinedArray.set(metadataBytes, 0);
  combinedArray.set(uint8Array, metadataBytes.length);
  combinedArray.set(closeDelimiterBytes, metadataBytes.length + uint8Array.length);
  
  return combinedArray;
}