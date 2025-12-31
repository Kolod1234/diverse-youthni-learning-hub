import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Lightbulb, Image } from 'lucide-react';
import { toast } from 'sonner';
import ImageSearchPreview from './ImageSearchPreview';
import TextLayoutArchitect from './TextLayoutArchitect';
import Tesseract from 'tesseract.js';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeImages, setIncludeImages] = useState(true);
  const [aiProvider, setAiProvider] = useState('perplexity'); // 'perplexity', 'chatgpt', 'canva', 'base44-pro', 'manus'
  const [useWebImages, setUseWebImages] = useState(true);
  const [imageGenerator, setImageGenerator] = useState('nano-banana'); // 'nano-banana', 'dalle', 'imagen', 'base44-pro', 'manus'
  const [educationLevel, setEducationLevel] = useState('gcse');
  const [imageSearchTerms, setImageSearchTerms] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentSlideForImage, setCurrentSlideForImage] = useState(null);
  const [generatedSlides, setGeneratedSlides] = useState([]);
  const [enforceSpelling, setEnforceSpelling] = useState(true);
  const [showArchitect, setShowArchitect] = useState(false);
  const [architectPrompt, setArchitectPrompt] = useState('');
  const [autoCorrectText, setAutoCorrectText] = useState(true);

  // Text scanning and auto-correction for Base44 AI Pro
  const scanAndCorrectImageText = async (imageUrl, slideContext, originalPrompt, maxRetries = 2) => {
    if (!imageUrl) {
      console.error('No image URL provided for scanning');
      return { isValid: false, imageUrl: null };
    }

    try {
      console.log('Starting OCR scan on image:', imageUrl);
      toast.info('🔍 Scanning image for spelling errors...', { duration: 3000 });
      
      // Load image with CORS handling
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for OCR'));
        img.src = imageUrl;
      });

      // Run OCR with Tesseract
      const { data: { text, confidence } } = await Tesseract.recognize(imageUrl, 'eng', {
        logger: () => {} // Suppress logs
      });

      console.log('OCR detected text:', text, 'Confidence:', confidence);

      if (!text || text.trim().length < 3) {
        console.log('No significant text detected');
        toast.success('✓ Image verified (no text detected)');
        return { isValid: true, imageUrl };
      }

      toast.info(`📝 Analyzing detected text: "${text.slice(0, 50)}..."`, { duration: 3000 });

      // Verify spelling with LLM - ULTRA STRICT MODE
      const verificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an ULTRA-STRICT spelling verification AI for educational content.

CONTEXT: ${slideContext}

DETECTED TEXT FROM IMAGE (raw OCR output): 
"${text}"

🎯 MISSION: Verify EVERY SINGLE WORD is spelled 100% correctly.

📚 VERIFICATION RULES (ZERO TOLERANCE):
1. ✅ Check against standard English dictionary
2. ✅ Verify scientific/technical terms (e.g., "photosynthesis", "evaporation", "condensation")
3. ✅ Flag common OCR errors:
   - "TRANSIPRATION" → should be "TRANSPIRATION"
   - "CONDENSTATION" → should be "CONDENSATION"
   - "PRECIPATION" → should be "PRECIPITATION"
   - "INFILITRATION" → should be "INFILTRATION"
   - Letter substitutions: I/L, O/0, S/5, B/8, etc.
4. ✅ Ignore: numbers, symbols, punctuation
5. ✅ Case-insensitive comparison (EVAPORATION = evaporation)
6. ✅ Report EVERY error - no threshold, no mercy

⚠️ EXAMPLES OF ERRORS TO CATCH:
- Missing letters: "EVAPORATON" (missing I)
- Wrong letters: "CONDENSTION" (missing A)
- Letter swaps: "PRECIPITAION" (I and T swapped)
- OCR confusion: "COLL3CTION" (3 should be E)

Return JSON with ALL detected errors.`,
        response_json_schema: {
          type: "object",
          properties: {
            has_errors: { type: "boolean" },
            misspelled_words: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  wrong: { type: "string" },
                  correct: { type: "string" },
                  position: { type: "string" }
                }
              }
            },
            severity: { type: "string", enum: ["none", "minor", "critical"] },
            total_words_checked: { type: "number" }
          },
          required: ["has_errors", "misspelled_words", "severity"]
        }
      });

      console.log('Verification result:', verificationResult);

      if (!verificationResult.has_errors || verificationResult.misspelled_words.length === 0) {
        toast.success('✅ Spelling verified - all correct!');
        return { isValid: true, imageUrl };
      }

      // ERRORS FOUND
      const errorList = verificationResult.misspelled_words.map(e => `"${e.wrong}" → "${e.correct}"`).join(', ');
      toast.error(`❌ Spelling errors found: ${errorList}`, { duration: 5000 });
      console.error('Spelling errors detected:', verificationResult.misspelled_words);

      if (maxRetries === 0) {
        toast.error('❌ Max retries reached - image has spelling errors');
        return { isValid: false, imageUrl, errors: verificationResult };
      }

      // AUTO-REGENERATE with corrections
      toast.info('🔄 Regenerating image with correct spelling...', { duration: 4000 });

      const correctionInstructions = verificationResult.misspelled_words
        .map(e => `CORRECT: "${e.correct}" (NOT "${e.wrong}")`)
        .join('\n');

      const correctedPrompt = `⚠️ REGENERATION REQUIRED - SPELLING ERRORS DETECTED ⚠️

Original request: ${originalPrompt}

🚨 CRITICAL CORRECTIONS (MANDATORY) 🚨
The previous image had UNACCEPTABLE spelling errors that will MISINFORM students:

${correctionInstructions}

📋 STRICT REQUIREMENTS FOR THIS ATTEMPT:
1. ✅ Spell each word LETTER BY LETTER correctly
2. ✅ Use ONLY the correct spellings listed above
3. ✅ Double-check BEFORE rendering
4. ✅ Treat text as TYPED DATA, not painted art
5. ✅ Use clear, readable sans-serif fonts
6. ✅ High contrast (black text on light background)
7. ✅ NO artistic distortion of letters
8. ✅ Each word must match English dictionary EXACTLY

🎯 VERIFICATION CHECKLIST (before submitting):
- [ ] Compared each word to correct spelling above
- [ ] Verified letter-by-letter accuracy
- [ ] Used clear, legible typography
- [ ] Text is sharp and readable

⚡ THIS IS ATTEMPT ${3 - maxRetries} OF 3. Get it right this time.
Educational accuracy is NON-NEGOTIABLE.`;

      console.log('Regenerating with corrected prompt:', correctedPrompt);

      const newImage = await base44.integrations.Core.GenerateImage({
        prompt: correctedPrompt
      });

      if (!newImage?.url) {
        toast.error('❌ Regeneration failed');
        return { isValid: false, imageUrl, errors: verificationResult };
      }

      toast.success('✅ Image regenerated - verifying again...');
      
      // Recursive verification
      return await scanAndCorrectImageText(newImage.url, slideContext, originalPrompt, maxRetries - 1);

    } catch (error) {
      console.error('OCR scanning failed:', error);
      toast.error(`❌ Text scanning error: ${error.message}`);
      return { isValid: false, imageUrl, error: error.message };
    }
  };

  const generateFromTopic = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Researching and generating slides...');

      let response;

      const levelInstructions = {
        phd: 'PhD/Research level - Advanced academic content with in-depth analysis, research methodologies, and scholarly references',
        alevel: 'A-Level (16-18 years) - Advanced secondary education with detailed explanations and analytical depth',
        gcse: 'GCSE Level (14-16 years) - Clear, structured content suitable for secondary school students',
        primary: 'Primary School (5-11 years) - Simple, engaging content with clear examples and age-appropriate language'
      };

      if (aiProvider === 'perplexity') {
        // Use Perplexity for research-based content
        const researchResult = await base44.functions.invoke('perplexitySearch', {
          query: `Create a ${slideCount}-slide educational presentation about: "${topic}"
      ${details ? `\nContext: ${details}` : ''}
      
      TARGET AUDIENCE: ${levelInstructions[educationLevel]}
      Adapt the complexity, vocabulary, and depth of content accordingly.

      CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
      {
      "slides": [
      {
      "title": "Engaging slide title",
      "content": "Well-researched content with <h2>, <h3>, <p>, <strong>, <ul>, <li> HTML tags. Include specific facts, statistics, examples with proper context.",
      "order": 1,
      ${includeImages && useWebImages ? '"image_url": "Direct URL to relevant educational image from web (Wikimedia Commons, NASA, NIH, .edu, .gov sources)",' : includeImages ? '"image_prompt": "Specific search query for finding a relevant educational image",' : ''}
      "image_description": "Brief description of what the image shows"
      }
      ]
      }

      Research requirements:
      - Use current, accurate information from reliable sources
      - Include specific facts, statistics, and real examples
      - Make content educational and engaging for students
      - Format content with proper HTML for visual hierarchy

      ${includeImages && useWebImages ? 'IMPORTANT: For EVERY slide, search the web for a RELEVANT educational image that DIRECTLY relates to that specific slide\'s content. Use image_url (full https:// URL ending in .jpg, .png, .svg) and image_description. CRITICAL: The image MUST match the slide topic exactly - if the slide is about cell division, find cell division diagrams from biology sources (Wikimedia Commons biology images, .edu biology departments, science textbooks). If about space, use NASA. Always match image source to the subject matter. Prioritize labeled diagrams and illustrations over generic photos.' : includeImages ? 'IMPORTANT: Include "image_prompt" (detailed instructions for generating educational diagrams using Nano Banana image generation) and "image_description" for EVERY slide. For image_prompt, provide specific, detailed instructions for creating educational diagrams, infographics, or illustrations suitable for the topic.' : ''}

      Return ONLY the JSON object, nothing else.`
        });

        if (researchResult?.data?.content) {
          try {
            // Try to parse JSON from the response
            const content = researchResult.data.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              response = JSON.parse(jsonMatch[0]);
              toast.success('Research-based content generated with citations!');
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse Perplexity response:', parseError);
            toast.error('Failed to parse AI response, falling back to standard AI');
          }
          }
          } else if (aiProvider === 'chatgpt') {
            // Use ChatGPT for content generation
            const chatgptResult = await base44.functions.invoke('geminiGeneration', {
          query: `Create a ${slideCount}-slide educational presentation about: "${topic}"
          ${details ? `\nContext: ${details}` : ''}

          TARGET AUDIENCE: ${levelInstructions[educationLevel]}
          Adapt the complexity, vocabulary, and depth of content accordingly.

          CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
          {
          "slides": [
          {
          "title": "Engaging slide title",
          "content": "Well-researched content with <h2>, <h3>, <p>, <strong>, <ul>, <li> HTML tags. Include specific facts, statistics, examples.",
          "order": 1,
          ${includeImages ? '"image_prompt": "Specific search query for finding a relevant educational image",' : ''}
          "image_description": "Brief description of what the image shows"
          }
          ]
          }

          ${includeImages ? 'IMPORTANT: Include "image_prompt" (detailed search query) and "image_description" for EVERY slide.' : ''}

          Return ONLY the JSON object, nothing else.`
          });

          if (chatgptResult?.data?.content) {
          try {
            const content = chatgptResult.data.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              response = JSON.parse(jsonMatch[0]);
              toast.success('Content generated with ChatGPT!');
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse ChatGPT response:', parseError);
            toast.error('Failed to parse AI response, falling back to standard AI');
          }
          }
          } else if (aiProvider === 'canva') {
        // Use Canva AI for design-focused content
        const canvaResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional presentation designer creating visually stunning slides.

Create a ${slideCount}-slide presentation about: "${topic}"
${details ? `\nContext: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}

DESIGN PRINCIPLES (Canva-style):
- Use clear, visual hierarchy with bold headings
- Keep text concise and impactful (bullet points preferred)
- Focus on visual storytelling over dense text
- Each slide should have one key message
- Content should be easily digestible at a glance
- Use professional, engaging language

CRITICAL: Return ONLY valid JSON in this EXACT format:
{
  "slides": [
    {
      "title": "Short, impactful title (max 6 words)",
      "content": "Concise, visually-focused content with <h2>, <h3>, <p>, <strong>, <ul>, <li> tags. Use short sentences and bullet points. Max 3-4 points per slide.",
      "order": 1,
      ${includeImages ? '"image_prompt": "Design-focused description for finding relevant visual",' : ''}
      "image_description": "What the visual represents",
      "design_notes": "Color scheme suggestion (e.g., 'vibrant blues', 'warm sunset tones')"
    }
  ]
}

Design requirements:
- Each slide max 50 words of text
- Focus on visual impact and clarity
- Use bullet points liberally
- Create slides that "pop" visually
- Think like a graphic designer, not a writer

${includeImages ? 'Include "image_prompt" (visual search query for design-focused images) and "image_description" for EVERY slide. Focus on impactful visuals.' : ''}

Return ONLY the JSON object, nothing else.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    order: { type: "number" },
                    ...(includeImages ? {
                      image_prompt: { type: "string" },
                      image_description: { type: "string" },
                      design_notes: { type: "string" }
                    } : {})
                  },
                  required: ["title", "content", "order"]
                }
              }
            },
            required: ["slides"]
          }
        });

        if (canvaResult?.slides) {
          response = canvaResult;
          toast.success('Design-focused content generated with Canva AI!');
        }
      } else if (aiProvider === 'base44-pro') {
        // Use Base44 AI Pro for premium content generation
        const base44ProResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an elite educational content creator specializing in modern, visually stunning presentations.

      Create a ${slideCount}-slide premium educational presentation about: "${topic}"
      ${details ? `\nContext: ${details}` : ''}

      TARGET AUDIENCE: ${levelInstructions[educationLevel]}

      MODERN FORMATTING REQUIREMENTS:
      1. Typography: Use clear hierarchy with styled headings
      2. Layout: Modern card-based design with spacing and visual sections
      3. Style: Professional gradient accents, rounded elements, subtle shadows
      4. Structure: Organized content blocks with clear separation
      5. Visual Appeal: Color-coded sections, modern fonts, breathable white space

      HTML STRUCTURE - Use this modern template for EVERY slide:
      <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin-bottom: 16px;">
      <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">{{Main Title}}</h1>
      </div>

      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 16px;">
      <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin-bottom: 12px; border-left: 4px solid #667eea; padding-left: 12px;">{{Section Heading}}</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">{{Content paragraph}}</p>
      </div>

      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
      <h3 style="color: white; font-size: 20px; font-weight: 600; margin-bottom: 8px;">💡 Key Insight</h3>
      <p style="color: white; font-size: 15px; line-height: 1.5;">{{Important point}}</p>
      </div>

      <ul style="list-style: none; padding: 0;">
      <li style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #3b82f6;">
      <strong style="color: #1e40af;">Point Title:</strong> <span style="color: #475569;">Description</span>
      </li>
      </ul>

      CRITICAL: Return ONLY valid JSON in this EXACT format:
      {
      "slides": [
      {
      "title": "Clear, engaging title",
      "content": "Modern HTML with gradient headers, card layouts, styled sections. Use the template structure above.",
      "order": 1,
      ${includeImages ? '"image_prompt": "Detailed description for premium educational visual",' : ''}
      "image_description": "What the visual represents"
      }
      ]
      }

      ${includeImages ? 'Include "image_prompt" and "image_description" for EVERY slide.' : ''}

      Return ONLY the JSON object, nothing else.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    order: { type: "number" },
                    ...(includeImages ? {
                      image_prompt: { type: "string" },
                      image_description: { type: "string" }
                    } : {})
                  },
                  required: ["title", "content", "order"]
                }
              }
            },
            required: ["slides"]
          }
        });

        if (base44ProResult?.slides) {
          response = base44ProResult;
          toast.success('Premium content generated with Base44 AI Pro!');
          }
          } else if (aiProvider === 'manus') {
          // Use Manus AI for advanced content generation
          const manusResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an advanced AI content creator using state-of-the-art language models.

          Create a ${slideCount}-slide high-quality educational presentation about: "${topic}"
          ${details ? `\nContext: ${details}` : ''}

          TARGET AUDIENCE: ${levelInstructions[educationLevel]}

          QUALITY STANDARDS:
          - Comprehensive, well-researched content
          - Clear explanations with real-world examples
          - Engaging and interactive learning approach
          - Professional formatting with visual hierarchy
          - Rich HTML formatting for modern presentation

          CRITICAL: Return ONLY valid JSON in this EXACT format:
          {
          "slides": [
          {
          "title": "Engaging, clear title",
          "content": "High-quality content with <h2>, <h3>, <p>, <strong>, <ul>, <li> tags. Include examples, key concepts, and detailed explanations.",
          "order": 1,
          ${includeImages ? '"image_prompt": "Detailed description for generating educational visual",' : ''}
          "image_description": "What the visual represents"
          }
          ]
          }

          ${includeImages ? 'Include "image_prompt" and "image_description" for EVERY slide.' : ''}

          Return ONLY the JSON object, nothing else.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    order: { type: "number" },
                    ...(includeImages ? {
                      image_prompt: { type: "string" },
                      image_description: { type: "string" }
                    } : {})
                  },
                  required: ["title", "content", "order"]
                }
              }
            },
            required: ["slides"]
          }
          });

          if (manusResult?.slides) {
          response = manusResult;
          toast.success('Advanced content generated with Manus AI!');
          }
          }

          if (!response) {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Create a ${slideCount}-slide educational presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}
Adapt the complexity, vocabulary, and depth of content accordingly.

For each slide, provide:
- A clear title
- Well-structured HTML content with paragraphs and lists
- ${includeImages ? 'A brief image search query and description' : 'No images'}

Use proper HTML formatting:
- Headings: <h2>, <h3>
- Paragraphs: <p>
- Bold: <strong>
- Lists: <ul><li>

${includeImages ? 'Include image_prompt (search query) and image_description for each slide.' : ''}

Return ONLY valid JSON.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    order: { type: "number" },
                    ...(includeImages ? {
                      image_prompt: { type: "string" },
                      image_description: { type: "string" }
                    } : {})
                  },
                  required: ["title", "content", "order"]
                }
              }
            },
            required: ["slides"]
          }
        });
      }

      if (!response?.slides) {
        toast.error('Invalid response from AI');
        return;
      }

      let slides = response.slides;

      // Add images if requested
      if (includeImages) {
        if (useWebImages) {
          toast.info('Searching high-quality images from Unsplash...');
          slides = await Promise.all(
            slides.map(async (slide) => {
              const searchQuery = imageSearchTerms || slide.image_prompt || slide.title;
              try {
                const result = await base44.functions.invoke('searchUnsplashImages', {
                  query: searchQuery,
                  perPage: 1
                });

                if (result.data.images?.length > 0) {
                  const image = result.data.images[0];
                  const imageDescription = slide.image_description || slide.title;
                  const contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                    <img src="${image.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                    <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Photo by <a href="${image.photographer_url}" target="_blank" style="color: #64748b;">${image.photographer}</a></p>
                  </div>${slide.content}`;
                  return { ...slide, content: contentWithImage };
                }
              } catch (error) {
                console.error('Failed to fetch Unsplash image:', error);
              }
              return slide;
            })
          );
        } else {
          const generatorName = imageGenerator === 'dalle' ? 'DALL-E 3' : imageGenerator === 'imagen' ? 'Stable Diffusion' : imageGenerator === 'base44-pro' ? 'Base44 AI Pro' : 'Nano Banana AI';
          toast.info(`Generating educational diagrams with ${generatorName}...`);
          
          slides = await Promise.all(
            slides.map(async (slide) => {
              if (slide.image_prompt) {
                try {
                  let generatedImage;
                  
                  if (imageGenerator === 'dalle') {
                    // Use DALL-E for image generation with optimized spelling
                    const dallePrompt = enforceSpelling 
                      ? `Create a high-resolution educational image of: ${slide.image_prompt}

CRITICAL TYPOGRAPHY REQUIREMENT:
The image MUST feature perfectly spelled text and labels.

TEXT INSTRUCTIONS:
1. Spelling must be 100% accurate: "${slide.image_prompt}"
2. Font style: Bold, legible, high-contrast
3. Text placement: Integrated naturally (on diagrams, labels, or educational visuals)
4. Do not hallucinate extra letters
5. Each character must be clearly visible and correctly spelled

Educational Context: ${topic} - ${slide.title}`
                      : `Create a high-resolution educational image of: ${slide.image_prompt}. Educational Context: ${topic} - ${slide.title}`;

                    const result = await base44.functions.invoke('geminiImageGeneration', {
                      prompt: dallePrompt,
                      topic: `${topic} - ${slide.title}`
                    });
                    
                    if (result.data?.url) {
                      generatedImage = { url: result.data.url };
                    }
                  } else if (imageGenerator === 'imagen') {
                    // Use Stable Diffusion for image generation with optimized spelling
                    const imagenPrompt = enforceSpelling 
                      ? `Create a high-resolution educational diagram of: ${slide.image_prompt}

CRITICAL TYPOGRAPHY REQUIREMENT:
All text in the diagram must be spelled 100% accurately.

TEXT INSTRUCTIONS:
1. Spelling must be perfect: verify scientific terms, labels, and titles
2. Font style: Bold, legible, high-contrast for classroom visibility
3. Text placement: Integrated naturally (labels, annotations, titles)
4. Do not hallucinate extra letters or characters
5. Each character must be clearly visible and correctly spelled

Educational Context:
- Topic: ${topic} - ${slide.title}
- Level: ${levelInstructions[educationLevel]}
- Style: Professional educational diagram, clear and informative
- Quality: High-detail, classroom-ready visual`
                      : `Create a high-resolution educational diagram of: ${slide.image_prompt}. Educational Context: ${topic} - ${slide.title}, Level: ${levelInstructions[educationLevel]}, Style: Professional educational diagram`;

                    const result = await base44.functions.invoke('generateImagenAI', {
                      prompt: imagenPrompt,
                      aspectRatio: 'landscape'
                    });
                    
                    if (result.data?.url) {
                      generatedImage = { url: result.data.url };
                    }
                  } else if (imageGenerator === 'manus') {
                    // Use Manus for image generation with optimized spelling
                    const manusPrompt = enforceSpelling 
                      ? `Create a high-resolution educational diagram of: ${slide.image_prompt}

                  🎯 TEXT ACCURACY REQUIREMENTS:
                  All text in the diagram must be spelled 100% correctly.

                  TEXT INSTRUCTIONS:
                  1. Spelling must be perfect: verify scientific terms, labels, and titles
                  2. Font style: Bold, legible, high-contrast for classroom visibility
                  3. Text placement: Integrated naturally (labels, annotations, titles)
                  4. Do not hallucinate extra letters or characters
                  5. Each character must be clearly visible and correctly spelled

                  Educational Context:
                  - Topic: ${topic} - ${slide.title}
                  - Level: ${levelInstructions[educationLevel]}
                  - Style: Professional educational diagram, clear and informative
                  - Quality: High-detail, classroom-ready visual`
                      : `Create a high-resolution educational diagram of: ${slide.image_prompt}. Educational Context: ${topic} - ${slide.title}, Level: ${levelInstructions[educationLevel]}, Style: Professional educational diagram`;

                    const result = await base44.functions.invoke('puterImageGeneration', {
                      prompt: manusPrompt
                    });

                    if (result.data?.url) {
                      generatedImage = { url: result.data.url };
                    }
                  } else if (imageGenerator === 'base44-pro') {
                    // Use Base44 AI Pro with MAXIMUM spelling enforcement
                    let base44ProPrompt;

                    // Extract key terms from the prompt for verification
                    const keyTerms = slide.image_prompt.match(/\b[A-Za-z]{4,}\b/g) || [];
                    const scientificTerms = keyTerms.filter(term => 
                      /^[A-Z]|tion|sion|ation|ence|ance|ment|ness/.test(term)
                    );

                    if (architectPrompt) {
                      // Use Text Layout Architect prompt structure
                      base44ProPrompt = `${architectPrompt}

                  Educational Context:
                  - Topic: ${topic} - ${slide.title}
                  - Level: ${levelInstructions[educationLevel]}
                  - Purpose: ${slide.image_prompt}

                  🚨 ABSOLUTE TEXT ACCURACY REQUIREMENT 🚨
                  Expected key terms: ${scientificTerms.join(', ')}
                  VERIFY spelling of EVERY word before rendering.
                  Treat text as DATABASE ENTRIES - zero tolerance for errors.`;
                    } else if (enforceSpelling) {
                      // MAXIMUM enforcement prompt
                      base44ProPrompt = `🎯 MISSION: Create educational diagram for "${slide.image_prompt}"

                  ⚠️ TEXT IS MISSION-CRITICAL DATA ⚠️
                  This is EDUCATIONAL CONTENT. Students will memorize these words.
                  ONE spelling error = ONE misinformed student = FAILURE.

                  📋 EXPECTED TERMS (verify each letter):
                  ${scientificTerms.length > 0 ? scientificTerms.map(t => `• ${t.toUpperCase()}`).join('\n') : '• Verify ALL words in image'}

                  🎨 RENDERING REQUIREMENTS:
                  1. TEXT TYPE: Vector/Typography layer (NOT painted/artistic text)
                  2. FONT: Sans-serif, bold, 18pt+ minimum
                  3. CONTRAST: Black on white OR white on dark (minimum 4.5:1 ratio)
                  4. SPACING: 120% line height, clear kerning
                  5. EDGES: Sharp, crisp anti-aliasing (no blur, no artistic effects)
                  6. PLACEMENT: Horizontal text (no rotation/warping/artistic transforms)
                  7. QUALITY: Textbook/worksheet standard

                  🔍 PRE-GENERATION CHECKLIST:
                  - [ ] Spell-check EVERY word before rendering
                  - [ ] Verify scientific terminology accuracy
                  - [ ] Confirm letter-by-letter accuracy
                  - [ ] No artistic font distortions
                  - [ ] Text is readable at thumbnail size

                  📚 CONTEXT:
                  Topic: ${topic} - ${slide.title}
                  Level: ${levelInstructions[educationLevel]}
                  Purpose: ${slide.image_prompt}

                  ⚡ REMEMBER: You are creating REFERENCE MATERIAL for students.
                  Spelling accuracy = 100% mandatory. No exceptions.`;
                    } else {
                      base44ProPrompt = `Create a high-resolution professional educational diagram of: ${slide.image_prompt}

                  Educational Context:
                  - Topic: ${topic} - ${slide.title}
                  - Level: ${levelInstructions[educationLevel]}
                  - Style: Professional, high-quality educational diagram suitable for classroom use`;
                    }

                    generatedImage = await base44.integrations.Core.GenerateImage({
                      prompt: base44ProPrompt
                    });

                    // CRITICAL: Auto-scan and correct text for Base44 AI Pro
                    if (generatedImage?.url && autoCorrectText) {
                      console.log('Starting auto-scan for image:', generatedImage.url);
                      
                      const scanResult = await scanAndCorrectImageText(
                        generatedImage.url,
                        `${slide.image_prompt} for ${topic} - ${slide.title}`,
                        base44ProPrompt,
                        2 // Max 2 regeneration attempts
                      );
                      
                      if (scanResult.isValid && scanResult.imageUrl) {
                        generatedImage = { url: scanResult.imageUrl };
                        console.log('✓ Image passed spelling verification');
                      } else {
                        console.error('✗ Image failed spelling verification');
                        toast.error('⚠️ Generated image has uncorrected spelling errors');
                      }
                    }
                  } else {
                  // Use Nano Banana (default) with optimized spelling
                  const imagePrompt = enforceSpelling 
                    ? `Request: Create a professional educational diagram showing ${slide.image_prompt}

                  Style: Vector Illustration / High-Contrast Graphic Design. Text must be flat, sharp, and 2D.

                  --- TYPOGRAPHY RULES (STRICT) ---
                  1. TEXT IS VECTOR DATA: Treat all text as distinct graphic elements, not painted strokes
                  2. SPELLING MUST BE PERFECT: Use only verified English dictionary words and accurate scientific terminology
                  3. KERNING: Uniform letter spacing - no irregular gaps or overlaps
                  4. SHARPNESS: Text edges must be crisp and clean (anti-aliased), not blurry or painterly
                  5. LEGIBILITY: Bold, high-contrast fonts for classroom visibility
                  6. NO PSEUDO-TEXT: Do NOT generate squiggles or gibberish. If text cannot be rendered clearly, omit it.
                  7. ACCURACY CHECK: Each word must be spelled correctly - this is educational content

                  Educational Context:
                  - Topic: ${topic} - ${slide.title}
                  - Audience: ${levelInstructions[educationLevel]}
                  - Purpose: Help students learn ${slide.image_prompt}
                  - Critical: Spelling errors will misinform students

                  Style: Clean, professional educational diagram suitable for textbooks and classroom use.`
                    : `Create a high-resolution educational diagram of: ${slide.image_prompt}. Topic: ${topic} - ${slide.title}, Level: ${levelInstructions[educationLevel]}, Style: Clean, professional educational diagram`;

                  generatedImage = await base44.integrations.Core.GenerateImage({
                    prompt: imagePrompt
                  });
                  }

                  if (generatedImage?.url) {
                    const imageDescription = slide.image_description || slide.title;
                    const contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                      <img src="${generatedImage.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                      <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    </div>${slide.content}`;

                    return { ...slide, content: contentWithImage };
                  }
                } catch (error) {
                  console.error('Failed to generate image:', error);
                }
              }
              return slide;
            })
          );
        }
      }

      setGeneratedSlides(slides);
      onSlidesGenerated(slides);
      setHasGenerated(true);
      toast.success(`Generated ${slideCount} slides${includeImages ? (useWebImages ? ' with Unsplash images' : ' with AI-generated images') : ''}!`);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error('Failed to generate presentation: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">AI-Powered Generation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Let AI create a complete presentation on any topic
        </p>

        <div className="space-y-4">
          <div>
            <Label>Topic *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change, The Water Cycle, World War II"
            />
          </div>

          <div>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add specific points to cover, target audience, or any other details..."
              rows={4}
            />
          </div>

          {includeImages && useWebImages && (
            <div>
              <Label>Image Search Terms (Optional)</Label>
              <Input
                value={imageSearchTerms}
                onChange={(e) => setImageSearchTerms(e.target.value)}
                placeholder="e.g., biology diagrams, chemical structures, historical photos"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify custom search terms for images. Leave empty to use slide titles.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Slides</Label>
              <Input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                min={3}
                max={15}
              />
            </div>
            
            <div>
              <Label>Education Level</Label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="primary">Primary School (5-11)</option>
                <option value="gcse">GCSE (14-16)</option>
                <option value="alevel">A-Level (16-18)</option>
                <option value="phd">PhD/Research</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <input
              type="checkbox"
              id="includeImages"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <Label htmlFor="includeImages" className="flex-1 cursor-pointer text-sm">
              <span className="font-semibold text-purple-900">Generate Educational Diagrams</span>
              <p className="text-xs text-purple-700 mt-1">
                AI-generated illustrative diagrams and infographics with correct spelling verification
              </p>
            </Label>
          </div>

          {includeImages && (
            <>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  id="useWebImages"
                  checked={useWebImages}
                  onChange={(e) => setUseWebImages(e.target.checked)}
                  className="w-4 h-4 rounded text-green-600"
                />
                <Label htmlFor="useWebImages" className="flex-1 cursor-pointer text-sm">
                  <span className="font-semibold text-green-900">🌐 Use Web-Sourced Images</span>
                  <p className="text-xs text-green-700 mt-1">
                    Find real educational images from authoritative sources (unchecked = AI-generated images)
                  </p>
                </Label>
              </div>

              {!useWebImages && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="enforceSpelling"
                      checked={enforceSpelling}
                      onChange={(e) => setEnforceSpelling(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <Label htmlFor="enforceSpelling" className="flex-1 cursor-pointer text-sm">
                      <span className="font-semibold text-blue-900">✓ Enforce Perfect Spelling</span>
                      <p className="text-xs text-blue-700 mt-1">
                        Apply strict spelling accuracy instructions to all AI-generated images - ensures text is treated as critical content, not noise
                      </p>
                    </Label>
                  </div>

                  {imageGenerator === 'base44-pro' && (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <input
                          type="checkbox"
                          id="autoCorrectText"
                          checked={autoCorrectText}
                          onChange={(e) => setAutoCorrectText(e.target.checked)}
                          className="w-4 h-4 rounded text-green-600"
                        />
                        <Label htmlFor="autoCorrectText" className="flex-1 cursor-pointer text-sm">
                          <span className="font-semibold text-green-900">🔍 Auto-Scan & Correct Text</span>
                          <p className="text-xs text-green-700 mt-1">
                            Automatically scan images with OCR, detect spelling errors, and regenerate if needed - ensures 100% accuracy
                          </p>
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Button
                          type="button"
                          onClick={() => setShowArchitect(!showArchitect)}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          {showArchitect ? 'Hide' : 'Show'} Text Layout Architect (Advanced)
                        </Button>
                        {showArchitect && (
                          <TextLayoutArchitect 
                            onPromptGenerated={(prompt) => {
                              setArchitectPrompt(prompt);
                              toast.success('Architect prompt will be used for Base44 AI Pro images');
                            }}
                          />
                        )}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Image Generator</Label>
                    <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setImageGenerator('nano-banana')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'nano-banana'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">🍌 Nano Banana</div>
                      <div className="text-xs text-gray-600">Fast diagrams</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('dalle')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'dalle'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">✨ DALL-E 3</div>
                      <div className="text-xs text-gray-600">High-quality</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('imagen')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'imagen'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">🎨 Stable Diffusion</div>
                      <div className="text-xs text-gray-600">Professional</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('base44-pro')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'base44-pro'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">🚀 Base44 AI Pro</div>
                      <div className="text-xs text-gray-600">Premium quality</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('manus')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'manus'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">⚡ Manus</div>
                      <div className="text-xs text-gray-600">Advanced AI</div>
                    </button>
                    </div>
                </div>
                </>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>AI Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAiProvider('perplexity')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'perplexity'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🔍 Perplexity</div>
                <div className="text-xs text-gray-600">Web search & citations</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('chatgpt')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'chatgpt'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">💬 GPT-3.5</div>
                <div className="text-xs text-gray-600">OpenAI GPT-3.5</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('canva')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'canva'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🎨 Canva AI</div>
                <div className="text-xs text-gray-600">Design-focused</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('base44-pro')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'base44-pro'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🚀 Base44 AI Pro</div>
                <div className="text-xs text-gray-600">Premium AI</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('manus')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'manus'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">⚡ Manus</div>
                <div className="text-xs text-gray-600">Advanced AI</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateFromTopic}
              disabled={!topic.trim() || generating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {hasGenerated ? 'Generate Again' : 'Generate Presentation'}
                </>
              )}
            </Button>
            
            {hasGenerated && !generating && (
              <Button
                onClick={generateFromTopic}
                disabled={!topic.trim()}
                variant="outline"
                className="px-6 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
      <Lightbulb className="w-4 h-4" />
      AI Features
      </h4>
      <ul className="text-sm text-purple-700 space-y-1">
      <li>• Researches topic using internet data with cited sources</li>
      <li>• Creates structured, educational content with expert quotes</li>
      <li>• Formats with professional styling and HTML</li>
      <li>• Includes real statistics, examples, and definitions</li>
      <li>• Searches high-quality images from Unsplash with proper attribution</li>
      <li>• Integrates visuals seamlessly with content</li>
      </ul>
      </div>

      <ImageSearchPreview
      isOpen={showImagePreview}
      onClose={() => setShowImagePreview(false)}
      onSelectImage={(image) => {
      // Handle image selection if needed
      toast.success('Image selected!');
      }}
      defaultQuery={imageSearchTerms || topic}
      />
      </div>
      );
      }