import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MathJaxContext } from "better-react-mathjax";
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
import ConfidenceBadge from "@/components/solver/ConfidenceBadge";
import AnswerFeedback from "@/components/solver/AnswerFeedback";
import StudentExtensionPanel from "@/components/solver/StudentExtensionPanel";
import SolutionExportButton from "@/components/solver/SolutionExportButton";
import QuestionSourceImage from "@/components/solver/QuestionSourceImage";
import GeneratedDiagram from "@/components/solver/GeneratedDiagram";
import AnswerBlock from "@/components/solver/AnswerBlock";
import SolverAccessGate from "@/components/solver/SolverAccessGate";
import PaperQuestionSource from "@/components/solver/PaperQuestionSource";
import { splitPdfIntoQuestions } from "@/components/solver/pdfQuestionSplitter";
import { extractPaperQuestionsWithAI } from "@/components/solver/extractPaperQuestionsWithAI";

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
1. Start with a "**Question & Diagram Breakdown**" section:
   - Restate the full question clearly (including any shared information or key established in earlier parts such as part (a)).
   - If the question involves a pictogram, table, chart, graph, or diagram, reconstruct the visual information clearly (for example, as a clean Markdown table \`| Category | Symbols / Value |\` or a labelled bullet breakdown showing every symbol, key, angle, length, or reading from the diagram).
2. Next, include a short "**What this question is asking**" summary in 1–2 plain English sentences.
3. Then show a COMPLETE "**Step-by-Step Worked Solution**". Number EVERY step (**Step 1:**, **Step 2:**, etc.).
4. After EACH step, write a short plain-English explanation in brackets like: *(This is because we need to convert km to m first)*
5. State the **FINAL ANSWER** clearly on its own line, in bold, with the correct units.
6. End with a "**Key things to remember**" section with 2–3 bullet points of tips.

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

const answerText = (response) => typeof response === "string" ? response : response?.text || JSON.stringify(response);
const modeIsValid = (text, selectedMode) => {
  if (selectedMode === "hint") return text.split(/\s+/).length <= 120 && !/final answer|the answer is/i.test(text);
  if (selectedMode === "mark_scheme") return /(^|\n)\s*[-*]\s/.test(text) && /\*\*Total:\s*\d+\s+marks?\*\*/i.test(text);
  if (selectedMode === "explain") return /The BIG idea here is/i.test(text) && /Top tip:/i.test(text);
  return true;
};

async function requestModeAnswer(prompt, fileUrls, selectedMode) {
  const invoke = (requestPrompt) => base44.integrations.Core.InvokeLLM({ prompt: requestPrompt, file_urls: fileUrls, model: "automatic" });
  let text = answerText(await invoke(prompt));
  if (!modeIsValid(text, selectedMode)) {
    text = answerText(await invoke(`${prompt}\n\nYour previous draft did not follow the selected ${selectedMode} response format. Rewrite it now and obey the response-mode rules exactly.\n\nDRAFT TO REWRITE:\n${text}`));
  }
  return text;
}

// Extract question text, page number, and diagram crop box from an uploaded paper/image
async function extractSingleQuestionVisualMeta(fileUrl, typedQuestion, subject, qualification) {
  if (!fileUrl) return null;
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are inspecting an uploaded ${qualification} ${subject} past paper file.
${typedQuestion ? `The student asked about: "${typedQuestion}"` : "Extract the question shown in the uploaded file."}

Identify:
- full_question_text: the complete verbatim question text (including any shared parent stem, table, or sub-questions)
- stem: any shared introductory stem or data from the main question
- marks: number of marks if shown, otherwise null
- page_number: 1-based page number where this question and its diagram appear (1 for single images)
- has_diagram: true if there is a diagram, pictogram, chart, graph, table, or figure for this question
- crop_box: [ymin, xmin, ymax, xmax] on a 0 to 1000 scale bounding the question AND its associated diagram/table/pictogram on that page
- diagram_summary: concise description of the diagram, key, labels, or table values`,
      file_urls: [fileUrl],
      model: "automatic",
      response_json_schema: {
        type: "object",
        properties: {
          full_question_text: { type: "string" },
          stem: { type: "string" },
          marks: { anyOf: [{ type: "number" }, { type: "null" }] },
          page_number: { type: "number" },
          has_diagram: { type: "boolean" },
          crop_box: {
            type: "array",
            items: { type: "number" },
          },
          diagram_summary: { type: "string" },
        },
      },
    });
    return res || null;
  } catch {
    return null;
  }
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
    const localPreview = type === "pdf" ? URL.createObjectURL(file) : null;
    setUploading(true);
    setUploadProgress("Uploading file…");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url, type, preview: localPreview });
    } catch {
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const removeFile = () => setUploadedFile(null);

  // ── Build prompt ───────────────────────────────────────────────────────────

  const buildPrompt = (question, fileAttached, followUpQ = null, selectedMode = mode) => {
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
${fileAttached ? "[See the attached file/image for diagrams, graphs or the paper itself. Inspect all labels, scales, arrows, spatial relationships, tables and visual evidence before answering. State what visual information you used.]" : ""}

RESPONSE MODE: ${SOLUTION_MODES.find((item) => item.id === selectedMode)?.label}. Follow ONLY this response mode; do not fall back to a full solution.
${modeInstructions[selectedMode]}

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
      const selectedMode = mode;
      const prompt = buildPrompt(questionText, !!uploadedFile, null, selectedMode);
      const fileUrls = uploadedFile ? [uploadedFile.url] : undefined;
      const [generatedAnswer, visualMeta] = await Promise.all([
        requestModeAnswer(prompt, fileUrls, selectedMode),
        uploadedFile ? extractSingleQuestionVisualMeta(uploadedFile.url, questionText, subject, qualification) : Promise.resolve(null),
      ]);
      const newKey = Date.now();
      const resolvedQuestion = questionText.trim() || visualMeta?.full_question_text || "";
      const hasDiagramHint =
        Boolean(visualMeta?.has_diagram) ||
        /\b(diagram|pictogram|graph|chart|triangle|circle|circuit|figure|table|axes|plot|sketch|ray|lens|force)\b/i.test(
          `${resolvedQuestion} ${generatedAnswer}`
        );

      // Fetch confidence score concurrently (non-blocking — updates state when done)
      const sol = {
        question: resolvedQuestion,
        stem: visualMeta?.stem || "",
        page_number: visualMeta?.page_number || 1,
        has_diagram: hasDiagramHint,
        crop_box: visualMeta?.crop_box || null,
        diagram_summary: visualMeta?.diagram_summary || "",
        uploadedFile,
        subject,
        qualification,
        marks: marks || (visualMeta?.marks != null ? String(visualMeta.marks) : ""),
        mode: selectedMode,
        answer: generatedAnswer,
        answerKey: newKey,
        confidenceScore: null, // populated after
        followUps: [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setSolution(sol);
      setHistory((prev) => [sol, ...prev.slice(0, 9)]);

      // Fetch confidence in background
      fetchConfidenceScore(resolvedQuestion, generatedAnswer, subject, qualification).then((score) => {
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
      // Text-based PDFs are split straight from the paper itself; anything else falls back to AI reading.
      let questions = [];
      if (uploadedFile.type === "pdf" && uploadedFile.preview) {
        questions = await splitPdfIntoQuestions(uploadedFile.preview).catch(() => []);
      }
      if (!questions.length) {
        questions = await extractPaperQuestionsWithAI(uploadedFile.url, subject, qualification);
      }
      if (!questions.length) {
        alert("Could not extract questions from the file. Try uploading a clearer image or PDF.");
        return;
      }

      const results = [];
      const batchSize = 3;
      const solveQuestion = async (q) => {
        const pages = q.segments?.length ? [...new Set(q.segments.map((s) => s.page))].join(" and ") : "";
        const prompt = `You are a careful CCEA ${qualification} ${subject} examiner and tutor.

Question ${q.number}${q.marks ? ` [${q.marks} marks]` : ""}:
${q.stem ? `Shared Question Context / Stem:\n${q.stem}\n\n` : ""}Question Text${q.segments?.length ? " (copied from the paper's text layer; fractions, powers and table layout may be flattened)" : ""}:
${q.text}
${q.diagram_summary ? `\nDiagram / Visual Information from Paper:\n${q.diagram_summary}\n` : ""}
The original paper is attached.${pages ? ` This question is printed on page ${pages} of the attached PDF.` : ""} Inspect it for every diagram, graph, table, source, extract or data item belonging to this question; do not answer from extracted text alone when visual evidence is required.
Answer every part in the order printed on the paper, using the paper's own part labels as bold headings (e.g. **(a)**, **(b)(i)**), so the student can match each answer to its part.

${modeInstructions[mode]}

Before finalising, independently check the command word, mark allocation, factual accuracy, calculations, units, significant figures and whether every subpart is answered. Do not call this an official mark scheme. Include a short **Answer check** explaining how the result was verified.

CRITICAL: Use LaTeX for ALL maths — inline $...$ and display $$...$$.`;
        const ans = await requestModeAnswer(prompt, [uploadedFile.url], mode);
        return {
          number: q.number,
          stem: q.stem || "",
          text: q.text,
          question: q.stem ? `${q.stem}\n\n${q.text}` : q.text,
          marks: q.marks,
          page_number: q.page_number || 1,
          has_diagram: Boolean(q.has_diagram),
          crop_box: q.crop_box || null,
          segments: q.segments || null,
          diagram_summary: q.diagram_summary || "",
          answer: ans,
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
    <SolverAccessGate>
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 text-white py-10 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🧠</div>
            <div>
              <h1 className="text-2xl font-bold">DYNI Past Paper Solver</h1>
              <p className="text-blue-200 text-sm mt-0.5">Solve text and image questions, draw explanations, test understanding and continue into matching courses</p>
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
                <div className="ml-auto flex items-center gap-3">
                  <SolutionExportButton solutions={paperSolutions} subject={subject} qualification={qualification} />
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{paperSolutions.length} questions</span>
                </div>
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
                    <PaperQuestionSource question={q} file={uploadedFile} nextQuestionText={paperSolutions[i + 1]?.text} />

                    {/* Confidence badge */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Solution</p>
                      {q.confidenceScore != null
                        ? <ConfidenceBadge score={q.confidenceScore} />
                        : <span className="text-xs text-gray-400 italic">Scoring confidence…</span>
                      }
                    </div>
                    <AnswerBlock text={q.answer} blockKey={q.answerKey} />
                    <StudentExtensionPanel key={q.answerKey} solution={{ ...q, uploadedFile }} />
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
                <div className="flex items-center gap-3">
                  <SolutionExportButton solutions={[solution]} subject={solution.subject} qualification={solution.qualification} />
                  <span className="text-blue-200 text-xs">{solution.timestamp}</span>
                </div>
              </div>

              {/* Question recap */}
              {(solution.question || solution.uploadedFile) && (
                <div className="px-6 pt-4 pb-4 bg-slate-50/90 border-b border-indigo-100 space-y-3">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Question</p>
                  <QuestionSourceImage
                    file={solution.uploadedFile}
                    pageNumber={solution.page_number}
                    cropBox={solution.crop_box}
                    caption={solution.diagram_summary}
                    questionText={solution.question}
                    stemText={solution.stem}
                  />
                  {solution.stem && (
                    <div className="rounded-lg border border-indigo-100 bg-white px-3.5 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 mb-1">
                        Question Context / Stem
                      </p>
                      <AnswerBlock text={solution.stem} blockKey={`${solution.answerKey}-stem`} />
                    </div>
                  )}
                  {solution.question && (
                    <AnswerBlock text={solution.question} blockKey={`${solution.answerKey}-qtext`} />
                  )}
                  {!solution.uploadedFile && solution.has_diagram && (
                    <GeneratedDiagram solution={solution} autoGenerate={true} />
                  )}
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
              <div className="px-6 pt-3 pb-5 space-y-5">
                <AnswerBlock text={solution.answer} blockKey={solution.answerKey} />
                <StudentExtensionPanel key={solution.answerKey} solution={solution} />
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
    </SolverAccessGate>
  );
}