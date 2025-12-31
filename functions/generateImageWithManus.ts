import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, aspect_ratio = "1:1" } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const manusApiKey = Deno.env.get("MANUS_API_KEY");
        if (!manusApiKey) {
            return Response.json({ error: 'MANUS_API_KEY is not set' }, { status: 500 });
        }

        const response = await fetch("https://api.manus.im/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${manusApiKey}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: aspect_ratio,
                n: 1
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Manus API error:", errorData);
            return Response.json({ error: `Manus API error: ${errorData.message || response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url || data.url;

        if (!imageUrl) {
            return Response.json({ error: 'No image URL returned from Manus API' }, { status: 500 });
        }

        return Response.json({ url: imageUrl, data });

    } catch (error) {
        console.error("Error in generateImageWithManus:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});