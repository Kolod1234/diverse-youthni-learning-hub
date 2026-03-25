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

        // Get Google Slides access token (includes drive.file scope)
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

        // Download the PPTX file
        const fileResponse = await fetch(file_url);
        if (!fileResponse.ok) {
            return Response.json({ error: 'Failed to download PPTX file' }, { status: 500 });
        }
        const fileBlob = await fileResponse.blob();

        // Upload to Google Drive and convert to Google Slides
        const boundary = '-------314159265358979323846';
        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: await createMultipartBody(fileBlob, 'Presentation', boundary),
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            console.error('Google Drive upload error:', error);
            return Response.json({ error: `Failed to upload to Google Drive: ${error}` }, { status: 500 });
        }

        const uploadData = await uploadResponse.json();
        const presentationId = uploadData.id;

        // Get the presentation details
        const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
        const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed`;

        return Response.json({
            presentationId,
            presentationUrl,
            embedUrl,
            message: 'PPTX converted to Google Slides successfully'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function createMultipartBody(blob, name, boundary) {
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
        name: name || 'Presentation',
        mimeType: 'application/vnd.google-apps.presentation'
    };

    const metadataPart = delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata);

    const filePart = delimiter +
        'Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n';

    const uint8Array = new Uint8Array(await blob.arrayBuffer());
    
    const encoder = new TextEncoder();
    const metadataBytes = encoder.encode(metadataPart);
    const filePartBytes = encoder.encode(filePart);
    const closeDelimBytes = encoder.encode(close_delim);

    const totalLength = metadataBytes.length + filePartBytes.length + uint8Array.length + closeDelimBytes.length;
    const combined = new Uint8Array(totalLength);
    
    let offset = 0;
    combined.set(metadataBytes, offset);
    offset += metadataBytes.length;
    combined.set(filePartBytes, offset);
    offset += filePartBytes.length;
    combined.set(uint8Array, offset);
    offset += uint8Array.length;
    combined.set(closeDelimBytes, offset);

    return combined;
}