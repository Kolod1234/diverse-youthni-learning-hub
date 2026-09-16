import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Loader2 = _w(HourglassEmptyIcon), Send = _w(SendIcon), RotateCcw = _w(RestartAltIcon), BookOpen = _w(MenuBookIcon);
const Lightbulb = _w(LightbulbIcon), CheckCircle = _w(CheckCircleIcon), ChevronDown = _w(ExpandMoreIcon), ChevronUp = _w(ExpandLessIcon);
const FileText = _w(DescriptionIcon), X = _w(CloseIcon), Upload = _w(UploadIcon), Sparkles = _w(AutoAwesomeIcon), Brain = _w(PsychologyIcon);
import ReactMarkdown from "react-markdown";
import ConfidenceBadge from "@/components/solver/ConfidenceBadge";
import AnswerFeedback from "@/components/solver/AnswerFeedback";

const mathJaxConfig = {
  loader: { load: ["[tex]/ams", "input/tex", "output/chtml"] },
  tex: {
    packages: { "[+]": ["ams"] },
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
  },
};

const SUBJECTS = [
  "Mathematics", "Biology", "Chemistry", "Physics",
  "English Language", "English Literature", "History", "Geography",
  "Business Studies", "Economics", "Religious Studies", "ICT / Digital Technology",
];

const SOLUTION_MODES = [
  { id: "full", label: "Full Solution", desc: "Complete step-by-step worked answer", emoji: "📝" },
  { id: "hint", label: "Hint Only", desc: "A nudge to get you started", emoji: "💡" },
  { id: "mark_scheme", label: "Mark Scheme", desc: "Examiner-style bullet points", emoji: "✅" },
  { id: "explain", label: "Explain Concept", desc: "Plain English explanation", emoji: "🎓" },
];

const modeInstructions = {
  full: `You are a friendly, encouraging CCEA tutor helping a student understand this problem at their selected qualification level.

IMPORTANT RULES FOR YOUR RESPONSE:
1. Start with a short "What this question is asking" summary in 1–2 plain English sentences.
2. Then show a COMPLETE step-by-step worked solution. Number EVERY step (Step 1, Step 2, etc.).
3. After EACH step, write a short plain-English explanation in brackets like: *(This is because we need to convert km to m first)*
4. State the FINAL ANSWER clearly on its own line, in bold, with the correct units.
5. End with a "Key things to remember" section with 2–3 bullet points of tips.

MATHS FORMATTING — THIS IS CRITICAL:
- Use LaTeX for EVERY mathematical expression without exception.
- Inline expressions: $expression$ — e.g. $x = 5$, $v = 30 \\text{ m/s}$
- Display (standalone) equations: $$expression$$ on their own line
- Write fractions as \\frac{numerator}{denominator} — e.g. $$\\frac{120}{1.5} = 80$$
- Powers/indices: x^{2}, x^{3}, 10^{-3}
- Square roots: \\sqrt{x}
- Multiplication dot: \\times
- Division: \\div or \\frac{}{}
- Units always inside \\text{}: $30 \\text{ m/s}$, $5 \\text{ kg}$, $100 \\text{ cm}^2$
- Subscripts: $v_1$, $T_1$, $H_2O$
- Greek letters: \\alpha, \\beta, \\theta, \\pi, \\Delta, \\lambda
- Do NOT write maths as plain text. Never write "x^2" without dollar signs.`,

  hint: `You are a friendly CCEA tutor working at the selected qualification level. Give ONLY a helpful hint (2–3 sentences) pointing the student in the right direction WITHOUT solving it. Use simple, encouraging language suitable for a 14–16 year old. Do NOT give the full answer.

For any maths in your hint, use LaTeX: inline $...$ or display $$...$$.`,

  mark_scheme: `You are writing a CCEA-style examiner's mark scheme for this question at the selected qualification level. Do not present it as an official CCEA mark scheme.

Format exactly like this:
- Use bullet points, one per mark point
- Each bullet ends with [1] to show it's worth 1 mark
- Include "accept" alternatives where relevant
- Use LaTeX for all maths: inline $...$ or display $$...$$
- End with **Total: X marks**

Keep language precise and examiner-appropriate.`,

  explain: `You are a friendly CCEA tutor explaining a concept at the selected qualification level.

IMPORTANT RULES:
1. Start with: "The BIG idea here is..." and explain in plain English.
2. Use a real-life analogy or example to make it click.
3. Show how the concept applies to this specific question.
4. End with: "Top tip:" — one sentence exam technique advice.

For any maths expressions, use LaTeX: inline $...$ or display $$...$$.
Avoid jargon. Be warm, clear and encouraging.`,
};

// Strip rogue code fences the model sometimes wraps around LaTeX
function cleanMathText(text) {
  if (!text) return "";
  return text
    .replace(/```(?:latex|math)?\n?([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, (_, inner) => {
      if (/[=+\-*/^\\{}]/.test(inner)) return `$${inner}$`;
      return `\`${inner}\``;
    });
}

function AnswerBlock({ text, blockKey }) {
  const cleaned = cleanMathText(text);
  return (
    <MathJax key={blockKey} dynamic>
      <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-base">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-4 leading-loose text-gray-800">{children}</p>,
            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
            ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-3">{children}</ol>,
            li: ({ children }) => <li className="leading-loose text-gray-800">{children}</li>,
            h2: ({ children }) => (
              <h2 className="text-base font-bold mt-6 mb-2 text-indigo-800 border-b border-indigo-100 pb-1">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold mt-4 mb-1 text-gray-800">{children}</h3>
            ),
            code: ({ inline, children }) =>
              inline ? (
                <code className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-sm font-mono text-amber-800">{children}</code>
              ) : (
                <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto text-sm font-mono my-3">
                  <code>{children}</code>
                </pre>
              ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-green-400 bg-green-50 pl-4 pr-3 py-2 rounded-r-xl text-gray-700 my-4 italic">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-gray-200 my-4" />,
          }}
        >
          {cleaned}
        </ReactMarkdown>
      </div>
    </MathJax>
  );
}

// Ask AI for a confidence score (0–100) for a given answer
async function fetchConfidenceScore(question, answer, subject, qualification) {
  try {
    const prompt = `You are an AI quality assessor for CCEA exam answers.

Given this student question and AI-generated answer, rate your confidence that the answer is CORRECT and COMPLETE on a scale of 0 to 100.

Subject: ${subject} (${qualification})

Question: ${question?.slice(0, 600) || "(from uploaded file)"}

Answer (first 800 chars): ${answer?.slice(0, 800)}

Respond ONLY with a JSON object like: {"confidence": 87}

Base your score on:
- Is the method correct for this type of question?
- Are all steps logically sound?
- Is the answer likely accurate? 
- Any ambiguity or uncertainty?`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "automatic",
      response_json_schema: {
        type: "object",
        properties: { confidence: { type: "number" } },
      },
    });
    return typeof result?.confidence === "number" ? Math.min(100, Math.max(0, Math.round(result.confidence))) : null;
  } catch {
    return null;
  }
}

export default function PastPaperSolver() {
  const [subject, setSubject] = useState("Mathematics");
  const [qualification, setQualification] = useState("GCSE");
  const [questionText, setQuestionText] = useState("");
  const [mode, setMode] = useState("full");
  const [marks, setMarks] = useState("");
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpSolving, setFollowUpSolving] = useState(false);

  // File / image upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Full-paper mode
  const [fullPaperSolving, setFullPaperSolving] = useState(false);
  const [fullPaperProgress, setFullPaperProgress] = useState("");
  const [paperSolutions, setPaperSolutions] = useState(null);

  const imageInputRef = useRef();
  const fileInputRef = useRef();

  // ── Upload handlers ────────────────────────────────────────────────────────

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress("Uploading image…");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url, type: "image", preview: URL.createObjectURL(file) });
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDocUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const type = ext === "pdf" ? "pdf" : ["doc", "docx"].includes(ext) ? "doc" : "other";
    setUploading(true);
    setUploadProgress("Uploading file…");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url, type, preview: null });
    } catch {
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const removeFile = () => setUploadedFile(null);

  // ── Build prompt ───────────────────────────────────────────────────────────

  const buildPrompt = (question, fileAttached, followUpQ = null) => {
    const marksLine = marks ? `\nThis question is worth ${marks} mark${marks !== "1" ? "s" : ""} — calibrate the depth of your answer accordingly.` : "";

    if (followUpQ) {
      return `A GCSE student is asking a follow-up question. Answer clearly and simply for a 14–16 year old.

Follow-up question: ${followUpQ}

Context — the original question was:
${question}
${fileAttached ? "[An image/file of the question was also provided]" : ""}

Be encouraging, clear, and use LaTeX for any maths ($...$ inline, $$...$$ for display equations). Explain WHY as well as HOW.`;
    }

    return `You are an expert, friendly ${qualification} ${subject} tutor helping a student aged 14–16.

Subject: ${subject}
Qualification: ${qualification}${marksLine}

STUDENT QUESTION:
${question}
${fileAttached ? "[See the attached file/image for diagrams, graphs or the paper itself]" : ""}

${modeInstructions[mode]}

CRITICAL FORMATTING REMINDER:
- EVERY number, variable, formula, equation, unit MUST be in LaTeX.
- Inline: $x = 5$, $F = ma$, $v = 30 \\text{ m/s}$
- Display: $$v = \\frac{d}{t}$$ (on its own line)
- NEVER write raw maths outside dollar signs.`;
  };

  // ── Solve single question ──────────────────────────────────────────────────

  const solve = async () => {
    if (!questionText.trim() && !uploadedFile) return;
    setSolving(true);
    setSolution(null);
    setPaperSolutions(null);
    try {
      const prompt = buildPrompt(questionText, !!uploadedFile);
      const file_urls = uploadedFile ? [uploadedFile.url] : undefined;

      // Run answer generation and confidence scoring in parallel (confidence after answer)
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls,
        model: "automatic",
      });

      const answerText = typeof response === "string" ? response : response?.text || JSON.stringify(response);
      const newKey = Date.now();

      // Fetch confidence score concurrently (non-blocking — updates state when done)
      const sol = {
        question: questionText,
        uploadedFile,
        subject,
        qualification,
        marks,
        mode,
        answer: answerText,
        answerKey: newKey,
        confidenceScore: null, // populated after
        followUps: [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setSolution(sol);
      setHistory((prev) => [sol, ...prev.slice(0, 9)]);

      // Fetch confidence in background
      fetchConfidenceScore(questionText, answerText, subject, qualification).then((score) => {
        setSolution((prev) => prev ? { ...prev, confidenceScore: score } : prev);
      });

    } catch {
      alert("Failed to solve. Please try again.");
    } finally {
      setSolving(false);
    }
  };

  // ── Solve full paper ───────────────────────────────────────────────────────

  const solveFullPaper = async () => {
    if (!uploadedFile) return;
    setFullPaperSolving(true);
    setPaperSolutions(null);
    setSolution(null);

    try {
      setFullPaperProgress("Reading every question and diagram…");
      const extractPrompt = `You are an expert CCEA ${qualification} ${subject} examiner.

The attached file is a CCEA ${qualification} ${subject} past paper.

Extract EVERY question and sub-question from the document (e.g. 1, 1a, 1b, 2, 2a, 2(i), etc.).
For each question include:
- number: the question number/label as a string
- text: the full question text exactly as written
- marks: the number of marks awarded (integer), or null if not shown

Return the result as a JSON object with a single key "questions" containing an array.`;

      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt: extractPrompt,
        file_urls: [uploadedFile.url],
        model: "automatic",
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  number: { type: "string" },
                  text: { type: "string" },
                  marks: { anyOf: [{ type: "number" }, { type: "null" }] },
                },
                required: ["number", "text"],
              },
            },
          },
        },
      });

      const questions = extracted?.questions || [];
      if (!questions.length) {
        alert("Could not extract questions from the file. Try uploading a clearer image or PDF.");
        return;
      }

      const results = [];
      const batchSize = 3;
      const solveQuestion = async (q) => {
        const prompt = `You are a careful CCEA ${qualification} ${subject} examiner and tutor.

Question ${q.number}${q.marks ? ` [${q.marks} marks]` : ""}:
${q.text}

The original paper is attached. Inspect it for every diagram, graph, table, source, extract or data item belonging to this question; do not answer from extracted text alone when visual evidence is required.

${modeInstructions[mode]}

Before finalising, independently check the command word, mark allocation, factual accuracy, calculations, units, significant figures and whether every subpart is answered. Do not call this an official mark scheme. Include a short **Answer check** explaining how the result was verified.

CRITICAL: Use LaTeX for ALL maths — inline $...$ and display $$...$$.`;
        const request = () => base44.integrations.Core.InvokeLLM({
          prompt,
          file_urls: [uploadedFile.url],
          model: "automatic",
        });
        let ans;
        try { ans = await request(); } catch { ans = await request(); }
        return {
          number: q.number,
          text: q.text,
          marks: q.marks,
          answer: typeof ans === "string" ? ans : ans?.text || "",
          answerKey: Date.now() + Math.random(),
          confidenceScore: null,
          subject,
          qualification,
          mode,
        };
      };

      for (let start = 0; start < questions.length; start += batchSize) {
        const batch = questions.slice(start, start + batchSize);
        setFullPaperProgress(`Solving questions ${start + 1}–${Math.min(start + batch.length, questions.length)} of ${questions.length}…`);
        const solvedBatch = await Promise.all(batch.map(solveQuestion));
        results.push(...solvedBatch);
        setPaperSolutions([...results]);
      }

      // Fetch confidence scores for all in background
      results.forEach((q, idx) => {
        fetchConfidenceScore(q.text, q.answer, subject, qualification).then((score) => {
          setPaperSolutions((prev) => {
            if (!prev) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], confidenceScore: score };
            return updated;
          });
        });
      });

    } catch (e) {
      alert("Failed to solve paper: " + (e?.message || "Unknown error"));
    } finally {
      setFullPaperSolving(false);
      setFullPaperProgress("");
    }
  };

  // ── Follow-up ──────────────────────────────────────────────────────────────

  const askFollowUp = async () => {
    if (!followUp.trim() || !solution) return;
    setFollowUpSolving(true);
    try {
      const prompt = buildPrompt(solution.question, !!solution.uploadedFile, followUp);
      const response = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      const answer = typeof response === "string" ? response : response?.text || JSON.stringify(response);
      const fuKey = Date.now();
      setSolution((prev) => ({
        ...prev,
        followUps: [...(prev.followUps || []), { question: followUp, answer, answerKey: fuKey }],
      }));
      setFollowUp("");
    } catch {
      alert("Failed to get follow-up answer.");
    } finally {
      setFollowUpSolving(false);
    }
  };

  const reset = () => {
    setQuestionText("");
    setUploadedFile(null);
    setSolution(null);
    setPaperSolutions(null);
    setFollowUp("");
    setMarks("");
  };

  const hasInput = questionText.trim() || uploadedFile;

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 text-white py-10 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🧠</div>
            <div>
              <h1 className="text-2xl font-bold">Past Paper AI Solver</h1>
              <p className="text-blue-200 text-sm mt-0.5">Upload a past paper or type a question — step-by-step explanations, powered by AI</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* ── Input Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-800 text-lg">Your Question</h2>
            </div>

            {/* Subject & Qualification */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {["GCSE", "AS-Level", "A-Level", "A2-Level"].map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
            </div>

            {/* Upload Zone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Upload Paper or Image</label>
              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  {uploadedFile.type === "image" && uploadedFile.preview ? (
                    <img src={uploadedFile.preview} alt="Uploaded" className="h-16 w-24 object-cover rounded-lg border border-blue-200" />
                  ) : (
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{uploadedFile.type} file uploaded ✓</p>
                  </div>
                  <button onClick={removeFile} className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                    <span className="text-xs font-medium">{uploading ? uploadProgress : "Photo / Screenshot"}</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                    <span className="text-xs font-medium">{uploading ? uploadProgress : "Upload Full Paper"}</span>
                    <span className="text-xs text-gray-400">PDF, DOC, DOCX</span>
                  </button>
                </div>
              )}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0])} />
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={(e) => handleDocUpload(e.target.files?.[0])} />
            </div>

            {/* Question text */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Or type / paste a question <span className="text-gray-400">(optional if file uploaded)</span>
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. A car travels 120 km in 1.5 hours. Calculate its average speed in m/s. Show all working. [3 marks]"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Marks */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marks (optional)</label>
              <input
                type="number" min={1} max={25}
                value={marks} onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g. 4"
                className="w-32 h-9 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mode picker */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">What kind of help do you need?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SOLUTION_MODES.map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${mode === m.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white"}`}
                  >
                    <div className="text-base mb-0.5">{m.emoji}</div>
                    <div className={`text-xs font-semibold ${mode === m.id ? "text-blue-700" : "text-gray-700"}`}>{m.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={solve}
                disabled={solving || uploading || !hasInput || fullPaperSolving}
                className="flex-1 min-w-[160px] bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {solving
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Solving…</>
                  : <><Lightbulb className="w-5 h-5" />Solve Question</>}
              </button>

              {uploadedFile && (uploadedFile.type === "pdf" || uploadedFile.type === "doc" || uploadedFile.type === "image") && (
                <button
                  onClick={solveFullPaper}
                  disabled={solving || uploading || fullPaperSolving}
                  className="flex-1 min-w-[160px] bg-gradient-to-r from-purple-700 to-pink-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {fullPaperSolving
                    ? <><Loader2 className="w-5 h-5 animate-spin" />{fullPaperProgress || "Preparing paper…"}</>
                    : <><Sparkles className="w-5 h-5" />Solve Entire Paper</>}
                </button>
              )}

              {(solution || paperSolutions) && (
                <button onClick={reset}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />New
                </button>
              )}
            </div>
          </div>

          {/* ── Full Paper Solutions ── */}
          {paperSolutions && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-gray-800 text-lg">Full Paper Solutions</h2>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{paperSolutions.length} questions</span>
              </div>
              <p className="px-1 text-xs text-gray-500">AI-generated worked solutions with CCEA-style checks; compare final answers with the official CCEA mark scheme.</p>
              {paperSolutions.map((q, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 flex items-center gap-3">
                    <span className="bg-white/20 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">Q{q.number}</span>
                    {q.marks && <span className="text-purple-100 text-xs">{q.marks} marks</span>}
                    <p className="text-white text-sm line-clamp-1 flex-1">{q.text}</p>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    {/* Confidence badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Solution</p>
                      {q.confidenceScore != null
                        ? <ConfidenceBadge score={q.confidenceScore} />
                        : <span className="text-xs text-gray-400 italic">Scoring confidence…</span>
                      }
                    </div>
                    <AnswerBlock text={q.answer} blockKey={q.answerKey} />
                    {/* Feedback */}
                    <div className="border-t border-gray-100 pt-3">
                      <AnswerFeedback solutionMeta={q} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Single Solution Card ── */}
          {solution && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">{SOLUTION_MODES.find(m => m.id === solution.mode)?.label}</div>
                    <div className="text-blue-200 text-xs">{solution.subject} · {solution.qualification}{solution.marks ? ` · ${solution.marks} marks` : ""}</div>
                  </div>
                </div>
                <span className="text-blue-200 text-xs">{solution.timestamp}</span>
              </div>

              {/* Question recap */}
              {(solution.question || solution.uploadedFile) && (
                <div className="px-6 pt-4 pb-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Question</p>
                  {solution.uploadedFile?.preview && (
                    <img src={solution.uploadedFile.preview} alt="Uploaded" className="max-h-48 rounded-lg mb-2 border border-gray-200 object-contain" />
                  )}
                  {solution.uploadedFile && !solution.uploadedFile.preview && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-red-500" /> {solution.uploadedFile.name}
                    </div>
                  )}
                  {solution.question && <p className="text-sm text-gray-700">{solution.question}</p>}
                </div>
              )}

              {/* Confidence badge */}
              <div className="px-6 pt-4 flex items-center gap-3 flex-wrap">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Explanation</p>
                {solution.confidenceScore != null
                  ? <ConfidenceBadge score={solution.confidenceScore} />
                  : solving ? null : <span className="text-xs text-gray-400 italic animate-pulse">Calculating confidence…</span>
                }
              </div>

              {/* Answer */}
              <div className="px-6 pt-3 pb-5">
                <AnswerBlock text={solution.answer} blockKey={solution.answerKey} />
              </div>

              {/* Follow-up Q&As */}
              {solution.followUps?.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-5">
                  {solution.followUps.map((fu, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium shrink-0 mt-0.5">You</span>
                        <p className="text-sm text-gray-700">{fu.question}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl px-5 py-4 border border-indigo-100">
                        <AnswerBlock text={fu.answer} blockKey={fu.answerKey} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback + Follow-up */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-4">
                {/* Feedback */}
                <AnswerFeedback solutionMeta={solution} />

                {/* Follow-up input */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">💬 Still confused? Ask a follow-up question…</p>
                  <div className="flex gap-2">
                    <input
                      type="text" value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askFollowUp()}
                      placeholder="e.g. Why do we divide by 1000 here?"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={followUpSolving}
                    />
                    <button
                      onClick={askFollowUp}
                      disabled={!followUp.trim() || followUpSolving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-1 text-sm font-medium transition-all"
                    >
                      {followUpSolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── History ── */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-2xl transition-all"
              >
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" />Recent Questions ({history.length})</span>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showHistory && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => setSolution(h)}
                      className="w-full text-left px-6 py-3 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-700 line-clamp-1 flex-1">{h.question || (h.uploadedFile?.name) || "(File question)"}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {h.confidenceScore != null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              h.confidenceScore >= 85 ? "bg-green-100 text-green-700" :
                              h.confidenceScore >= 60 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }`}>{h.confidenceScore}%</span>
                          )}
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{h.subject}</span>
                          <span className="text-xs text-gray-400">{h.timestamp}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </MathJaxContext>
  );
}