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
  const [useManusImages, setUseManusImages] = useState(true);
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
        toast.info('🧠 Deep research mode: Analyzing topic comprehensively...');
        
        const base44ProResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an ELITE educational content architect using Base44 AI Pro's advanced research capabilities.

🎯 MISSION: Create a ${slideCount}-slide PREMIUM presentation about: "${topic}"
${details ? `Additional Context: ${details}` : ''}

👥 TARGET AUDIENCE: ${levelInstructions[educationLevel]}

📚 DEEP RESEARCH REQUIREMENTS:
1. Conduct COMPREHENSIVE research using multiple reliable sources
2. THINK DEEPLY about the topic - analyze, synthesize, connect concepts
3. Include SPECIFIC facts, statistics, real-world examples, case studies
4. Cite recent developments and current understanding (2024-2025)
5. Build logical flow from foundational concepts to advanced insights
6. Identify key debates, controversies, or evolving understanding in the field

🎨 PREMIUM SLIDE DESIGN - MANDATORY STYLING ELEMENTS:

TITLE SECTION (Always include at top of each slide):
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);">
  <h2 style="color: white; font-size: 28px; font-weight: 700; margin: 0;">[Slide Title]</h2>
</div>

KEY CONCEPTS BOX (Use for main points):
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white; margin: 20px 0; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
  <h3 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">✨ Key Concepts</h3>
  <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
    <li>Concept 1</li>
    <li>Concept 2</li>
  </ul>
</div>

INFORMATION CARDS (For detailed explanations):
<div style="background: linear-gradient(to right, #f8fafc, #e0e7ff); border-left: 5px solid #3b82f6; padding: 20px; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">📌 Section Title</h3>
  <p style="color: #334155; line-height: 1.7; margin: 0;">[Content here]</p>
</div>

STATISTICS/FACTS BOX:
<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px; border-radius: 10px; border: 2px solid #fbbf24; margin: 16px 0; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);">
  <strong style="color: #92400e; font-size: 16px;">💡 Did You Know?</strong>
  <p style="color: #78350f; margin: 8px 0 0 0; line-height: 1.6;">[Interesting fact]</p>
</div>

EXAMPLE/CASE STUDY BOX:
<div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 18px; border-radius: 10px; border-left: 4px solid #10b981; margin: 16px 0; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);">
  <strong style="color: #065f46; font-size: 16px;">🔬 Real-World Example</strong>
  <p style="color: #064e3b; margin: 8px 0 0 0; line-height: 1.6;">[Example content]</p>
</div>

BULLET POINTS (Use styled lists):
<ul style="list-style: none; padding: 0; margin: 16px 0;">
  <li style="background: white; padding: 12px 16px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <strong style="color: #6d28d9;">Point 1:</strong> <span style="color: #4b5563;">Description</span>
  </li>
</ul>

DIVIDER (Between sections):
<hr style="border: none; height: 3px; background: linear-gradient(to right, #3b82f6, #8b5cf6, transparent); margin: 24px 0; border-radius: 2px;">

MANDATORY: Use ALL these styling elements in EVERY slide. Make slides visually stunning with gradients, colors, shadows, and proper spacing.

${includeImages ? `
🖼️ IMAGE GENERATION INSTRUCTIONS (MANDATORY FOR EVERY SLIDE):

For EACH slide, you MUST provide:
1. "image_prompt": Ultra-detailed prompt for Manus AI image generation
   
   FORMAT EXAMPLE FOR SCIENTIFIC TOPICS:
   "Professional educational diagram showing [EXACT CONCEPT]. Include clearly labeled components: [LIST ALL LABELS]. Show [SPECIFIC PROCESS/RELATIONSHIP]. Style: Clean scientific illustration with blue and purple color scheme, white background, clear typography for labels, arrows showing flow/relationships. Educational poster quality."

   FORMAT EXAMPLE FOR DATA/PROCESSES:
   "Infographic illustrating [TOPIC] with [NUMBER] distinct sections. Section 1: [DETAIL], Section 2: [DETAIL]. Use icons, clear headings, color-coded elements (blue for X, green for Y). Modern flat design, professional layout."

   FORMAT EXAMPLE FOR CONCEPTS:
   "Conceptual diagram explaining [CONCEPT]. Show [VISUAL METAPHOR] with labeled parts: [LABELS]. Include text boxes with key definitions. Visual style: Modern educational graphic with gradient background, clean sans-serif fonts."

2. "image_description": Brief caption (e.g., "Diagram showing DNA structure with labeled components")

⚠️ CRITICAL IMAGE RULES:
- EVERY slide needs a relevant, educational image
- NO generic stock photos - only specific educational diagrams
- Describe EXACT visual elements, labels, colors, layout
- Specify what text/labels should appear in the image
- Images must teach something, not just decorate
` : ''}

📊 CONTENT STRUCTURE FOR EACH SLIDE:
1. Gradient header with title
2. Key concepts box (if applicable)
3. Main content in styled information cards
4. Did you know box with interesting fact
5. Real-world example or case study
6. Styled bullet points for takeaways
7. Section dividers between major points

CRITICAL: Return ONLY valid JSON:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "<div style='background: linear-gradient...'>[FULL RICH HTML WITH ALL STYLING ELEMENTS ABOVE]</div>",
      "order": 1,
      ${includeImages ? '"image_prompt": "Ultra-detailed educational image description with specific labels, colors, style, and layout requirements",' : ''}
      ${includeImages ? '"image_description": "Brief caption"' : ''}
    }
  ]
}

🎯 FINAL CHECKLIST:
✓ Used gradient header for title
✓ Included key concepts box
✓ Added information cards with gradients
✓ Included "Did you know?" fact box
✓ Added real-world example box
✓ Used styled bullet points
✓ Added section dividers
✓ Rich colors, gradients, shadows throughout
${includeImages ? '✓ Detailed image prompt with specific visual requirements' : ''}`,
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
          toast.success('✨ Premium content with deep research generated!');
        }
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
          taskMode: manusTaskMode
        });

        if (manusResult?.data?.text) {
          const content = manusResult.data.text.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            response = JSON.parse(jsonMatch[0]);
            toast.success('Advanced content generated with Manus AI!');
          } else {
            console.error('No JSON found in Manus response:', content);
            toast.error('Failed to parse Manus response');
          }
        } else {
          console.error('No text in Manus response:', manusResult);
          toast.error('Manus returned no content');
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
      if (includeImages && useManusImages) {
        toast.info('🎨 Generating high-quality educational images with Manus AI...');
        
        let completedCount = 0;
        slides = await Promise.all(
          slides.map(async (slide) => {
            if (slide.image_prompt) {
              try {
                const result = await base44.functions.invoke('generateImageWithManus', {
                  prompt: slide.image_prompt,
                  aspect_ratio: '16:9'
                });

                completedCount++;
                toast.info(`Generated image ${completedCount}/${slides.length}`, { duration: 2000 });

                if (result?.data?.url) {
                  const imageDescription = slide.image_description || slide.title;
                  const contentWithImage = `
<div style="text-align: center; margin: 28px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <img src="${result.data.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 4px solid white;" />
  <p style="font-size: 15px; color: #475569; margin-top: 16px; font-weight: 500; font-style: italic;">📊 ${imageDescription}</p>
</div>
${slide.content}`;

                  return { ...slide, content: contentWithImage };
                }
              } catch (error) {
                console.error('Failed to generate image for slide:', slide.title, error);
                toast.error(`Image generation failed for "${slide.title}"`);
              }
            }
            return slide;
          })
        );
        
        toast.success(`✅ Generated ${completedCount} educational images!`);
      }

      setGeneratedSlides(slides);
      onSlidesGenerated(slides);
      setHasGenerated(true);
      toast.success(`Generated ${slideCount} slides${includeImages && useManusImages ? ' with Manus AI images' : ''}!`);
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

          <div className="space-y-3">
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
                  AI will generate relevant images automatically
                </p>
              </Label>
            </div>

            {includeImages && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 ml-6">
                <input
                  type="checkbox"
                  id="useManusImages"
                  checked={useManusImages}
                  onChange={(e) => setUseManusImages(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <Label htmlFor="useManusImages" className="flex-1 cursor-pointer text-sm">
                  <span className="font-semibold text-indigo-900">Use Manus AI for Images</span>
                  <p className="text-xs text-indigo-700 mt-1">
                    Generate high-quality educational images with Manus
                  </p>
                </Label>
              </div>
            )}
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
              <div className="bg-white/70 rounded-lg p-3 mb-2">
                <p className="text-xs text-orange-800 font-medium mb-1">✨ Enhanced Features:</p>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• Deep research with comprehensive analysis</li>
                  <li>• High-quality educational diagrams & charts</li>
                  <li>• Modern slide design with rich formatting</li>
                  <li>• Meaningful, non-generic visuals</li>
                </ul>
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
              <p className="text-xs text-indigo-600">
                Using Manus autonomous agent mode for intelligent content generation
              </p>
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
          <li>• Generates high-quality educational images with Manus AI</li>
          <li>• Adapts content to your selected education level</li>
        </ul>
      </div>
      </div>
      );
      }