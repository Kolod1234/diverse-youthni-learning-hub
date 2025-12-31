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
  const [aiProvider, setAiProvider] = useState('perplexity');
  const [educationLevel, setEducationLevel] = useState('gcse');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState([]);
  
  // Perplexity settings
  const [perplexitySearchDepth, setPerplexitySearchDepth] = useState('standard');
  
  // Base44 AI Pro settings
  const [base44EnforceSpelling, setBase44EnforceSpelling] = useState(true);
  const [base44AutoCorrect, setBase44AutoCorrect] = useState(true);
  
  // Manus settings
  const [manusAgentProfile, setManusAgentProfile] = useState('manus-1.6');
  const [manusTaskMode, setManusTaskMode] = useState('agent');
  const [manusConnectors, setManusConnectors] = useState([]);

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
        const researchResult = await base44.functions.invoke('perplexitySearch', {
          query: `Create a ${slideCount}-slide educational presentation about: "${topic}"
${details ? `\nContext: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}

CRITICAL: Return ONLY valid JSON in this EXACT format:
{
"slides": [
{
"title": "Engaging slide title",
"content": "Well-researched content with <h2>, <h3>, <p>, <strong>, <ul>, <li> HTML tags. Include specific facts, statistics, examples.",
"order": 1,
${includeImages ? '"image_prompt": "Detailed description for AI image generation",' : ''}
"image_description": "Brief description of the visual"
}
]
}

Research requirements:
- Use current, accurate information from reliable sources
- Include specific facts, statistics, and real examples
- Format content with proper HTML for visual hierarchy
${includeImages ? '- Include "image_prompt" for EVERY slide with detailed instructions for generating educational diagrams' : ''}

Return ONLY the JSON object, nothing else.`,
          searchDepth: perplexitySearchDepth
        });

        if (researchResult?.data?.content) {
          try {
            const content = researchResult.data.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              response = JSON.parse(jsonMatch[0]);
              toast.success('Research-based content generated with Perplexity!');
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse Perplexity response:', parseError);
            toast.error('Failed to parse Perplexity response');
          }
        } else {
          console.error('No content in Perplexity response:', researchResult);
          toast.error('Perplexity returned no content');
        }
          } else if (aiProvider === 'base44-pro') {
            const base44ProResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an elite educational content creator for Base44 AI Pro.

Create a ${slideCount}-slide premium presentation about: "${topic}"
${details ? `\nContext: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}

Use modern HTML formatting with styled sections, gradients, and visual hierarchy.

CRITICAL: Return ONLY valid JSON:
{
"slides": [
{
"title": "Engaging title",
"content": "Modern HTML with <h2>, <h3>, <p>, <strong>, <ul>, <li> tags and inline styles",
"order": 1,
${includeImages ? '"image_prompt": "Detailed description for AI image generation",' : ''}
"image_description": "Visual description"
}
]
}

${includeImages ? 'Include "image_prompt" for EVERY slide.' : ''}`,
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
          } else if (aiProvider === 'manus') {
            const manusResult = await base44.functions.invoke('manusTextGeneration', {
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
              agentProfile: manusAgentProfile,
              taskMode: manusTaskMode,
              connectors: manusConnectors
            });

            if (manusResult?.data?.text) {
              const content = manusResult.data.text.trim();
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                response = JSON.parse(jsonMatch[0]);
                toast.success('Advanced content generated with Manus AI!');
              }
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

      // Add AI-generated images if requested
      if (includeImages) {
        let imageGenFunction = 'geminiImageGeneration'; // DALL-E 3
        let generatorName = 'DALL-E 3';
        
        if (aiProvider === 'base44-pro') {
          imageGenFunction = 'geminiImageGeneration';
          generatorName = 'Base44 AI (DALL-E 3)';
        } else if (aiProvider === 'manus') {
          imageGenFunction = 'puterImageGeneration';
          generatorName = 'Manus AI';
        }
        
        toast.info(`Generating educational diagrams with ${generatorName}...`);
          
        slides = await Promise.all(
          slides.map(async (slide) => {
            if (slide.image_prompt) {
              try {
                let generatedImage;
                
                if (aiProvider === 'perplexity' || aiProvider === 'base44-pro') {
                  const dallePrompt = base44EnforceSpelling && aiProvider === 'base44-pro'
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

                  const result = await base44.functions.invoke(imageGenFunction, {
                    prompt: dallePrompt,
                    topic: `${topic} - ${slide.title}`
                  });
                  
                  if (result.data?.url) {
                    generatedImage = { url: result.data.url };
                  }
                } else if (aiProvider === 'manus') {
                  const manusPrompt = `Create a high-resolution educational diagram of: ${slide.image_prompt} 
Educational Context:
- Topic: ${topic} - ${slide.title}
- Level: ${levelInstructions[educationLevel]}
- Style: Professional educational diagram`;

                  const result = await base44.functions.invoke(imageGenFunction, {
                    prompt: manusPrompt,
                    agentProfile: manusAgentProfile,
                    taskMode: manusTaskMode,
                    connectors: manusConnectors
                  });

                  if (result?.data?.url) {
                    generatedImage = { url: result.data.url };
                  }
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
      toast.success(`Generated ${slideCount} slides${includeImages ? ' with AI-generated images' : ''}!`);
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
                AI will generate relevant images automatically using its preferred method
              </p>
            </Label>
          </div>

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
                onClick={() => setAiProvider('base44-pro')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'base44-pro'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🚀 Base44 AI Pro</div>
                <div className="text-xs text-gray-600">Premium quality</div>
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

          {/* AI-Specific Settings */}
          {aiProvider === 'perplexity' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-blue-900 text-sm">🔍 Perplexity Settings</h4>
              <div>
                <Label>Search Depth</Label>
                <select
                  value={perplexitySearchDepth}
                  onChange={(e) => setPerplexitySearchDepth(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
                >
                  <option value="basic">Basic (Fast)</option>
                  <option value="standard">Standard (Balanced)</option>
                  <option value="advanced">Advanced (Comprehensive)</option>
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  {perplexitySearchDepth === 'advanced' ? 'Most comprehensive research with multiple sources' : 
                   perplexitySearchDepth === 'basic' ? 'Quick search for basic information' : 
                   'Balanced research depth and speed'}
                </p>
              </div>
            </div>
          )}

          {aiProvider === 'base44-pro' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-orange-900 text-sm">🚀 Base44 AI Pro Settings</h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="base44-spelling"
                  checked={base44EnforceSpelling}
                  onChange={(e) => setBase44EnforceSpelling(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600"
                />
                <Label htmlFor="base44-spelling" className="text-sm cursor-pointer">
                  Enforce perfect spelling in images
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="base44-autocorrect"
                  checked={base44AutoCorrect}
                  onChange={(e) => setBase44AutoCorrect(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600"
                />
                <Label htmlFor="base44-autocorrect" className="text-sm cursor-pointer">
                  Auto-scan & correct text errors
                </Label>
              </div>
            </div>
          )}

          {aiProvider === 'manus' && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-indigo-900 text-sm">⚡ Manus Settings</h4>
              <div>
                <Label>Agent Profile</Label>
                <select
                  value={manusAgentProfile}
                  onChange={(e) => setManusAgentProfile(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
                >
                  <option value="manus-1.6">Manus 1.6 (Balanced)</option>
                  <option value="manus-1.6-lite">Manus 1.6 Lite (Fast)</option>
                  <option value="manus-1.6-max">Manus 1.6 Max (Advanced)</option>
                </select>
              </div>
              <div>
                <Label>Task Mode</Label>
                <select
                  value={manusTaskMode}
                  onChange={(e) => setManusTaskMode(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
                >
                  <option value="agent">Agent (Autonomous)</option>
                  <option value="adaptive">Adaptive (Smart)</option>
                  <option value="chat">Chat (Interactive)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Connectors</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="manus-web"
                      checked={manusConnectors.includes('web-search')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManusConnectors([...manusConnectors, 'web-search']);
                        } else {
                          setManusConnectors(manusConnectors.filter(c => c !== 'web-search'));
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <Label htmlFor="manus-web" className="text-sm cursor-pointer">Web Search</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="manus-img"
                      checked={manusConnectors.includes('image-generation')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManusConnectors([...manusConnectors, 'image-generation']);
                        } else {
                          setManusConnectors(manusConnectors.filter(c => c !== 'image-generation'));
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <Label htmlFor="manus-img" className="text-sm cursor-pointer">Image Generation</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

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
          How It Works
        </h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Researches topic using internet data and reliable sources</li>
          <li>• Creates structured, educational content with proper formatting</li>
          <li>• Each AI uses its preferred image generation method</li>
          <li>• Adapts content to your selected education level</li>
        </ul>
      </div>
      </div>
      );
      }