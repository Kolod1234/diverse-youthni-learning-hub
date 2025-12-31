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

        // Get Google Drive access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

        // Download the PPTX file
        const fileResponse = await fetch(file_url);
        const fileBlob = await fileResponse.blob();

        // Upload to Google Drive and convert to Google Slides
        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&convert=true', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: await createMultipartBody(fileBlob, 'Presentation'),
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            return Response.json({ error: `Failed to upload: ${error}` }, { status: 500 });
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

async function createMultipartBody(blob, name) {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
        name: name || 'Presentation',
        mimeType: 'application/vnd.google-apps.presentation'
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n';

    const uint8Array = new Uint8Array(await blob.arrayBuffer());
    
    const encoder = new TextEncoder();
    const firstPart = encoder.encode(multipartRequestBody);
    const lastPart = encoder.encode(close_delim);

    const totalLength = firstPart.length + uint8Array.length + lastPart.length;
    const combined = new Uint8Array(totalLength);
    
    combined.set(firstPart, 0);
    combined.set(uint8Array, firstPart.length);
    combined.set(lastPart, firstPart.length + uint8Array.length);

    return new Blob([combined], { type: `multipart/related; boundary=${boundary}` });
}