import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Loader2, Upload, Send, RotateCcw, BookOpen, Lightbulb, CheckCircle, ChevronDown, ChevronUp, Camera } from "lucide-react";

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]], displayMath: [["$$", "$$"], ["\\[", "\\]"]] },
};

const SUBJECTS = [
  "Mathematics", "Biology", "Chemistry", "Physics",
  "English Language", "English Literature", "History", "Geography",
  "Business Studies", "Economics", "Religious Studies", "ICT / Digital Technology",
];

const SOLUTION_MODES = [
  { id: "full", label: "Full Solution", desc: "Complete step-by-step worked answer" },
  { id: "hint", label: "Hint Only", desc: "A nudge to get you started" },
  { id: "mark_scheme", label: "Mark Scheme Style", desc: "Bullet points like an examiner would award" },
  { id: "explain", label: "Explain Concept", desc: "Teach the underlying idea in plain English" },
];

export default function PastPaperSolver() {
  const [subject, setSubject] = useState("Mathematics");
  const [qualification, setQualification] = useState("GCSE");
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mode, setMode] = useState("full");
  const [marks, setMarks] = useState("");
  const [solving, setSolving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpSolving, setFollowUpSolving] = useState(false);
  const fileInputRef = useRef();

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const buildPrompt = (question, img, followUpQ = null) => {
    const modeInstructions = {
      full: `Provide a COMPLETE step-by-step worked solution. Show ALL working clearly numbered. State the final answer prominently. Use LaTeX for all maths ($...$). Lay out like an A-grade student's model answer.`,
      hint: `Give ONLY a helpful hint (2-3 sentences max) that points the student in the right direction WITHOUT solving it for them. Do not give the full answer.`,
      mark_scheme: `Write the answer as a mark scheme. Use bullet points. Each point = 1 mark. Mark with [1] at the end of each marking point. Include "accept" alternatives where relevant. Final line: "Total: X marks".`,
      explain: `Explain the CONCEPT or SKILL being tested in plain, simple English. Use an analogy if helpful. Then briefly show how it applies to this specific question. Avoid heavy notation unless essential.`,
    };

    const marksLine = marks ? `\nThis question is worth ${marks} mark${marks !== "1" ? "s" : ""}.` : "";

    if (followUpQ) {
      return `${followUpQ}

Context — the original question was:
${question}
${img ? "[An image of the question was also provided]" : ""}

Continue to assist the student with the above follow-up question. Be clear and educational.`;
    }

    return `You are an expert ${qualification} ${subject} tutor. A student needs help with the following past paper question.

Subject: ${subject}
Qualification: ${qualification}${marksLine}

QUESTION:
${question}
${img ? "[See the attached image for diagrams/figures]" : ""}

${modeInstructions[mode]}

Important: Use LaTeX notation wrapped in $...$ for inline maths and $$...$$ for display maths. Keep the explanation student-friendly.`;
  };

  const solve = async () => {
    if (!questionText.trim() && !imageUrl) return;
    setSolving(true);
    setSolution(null);
    try {
      const prompt = buildPrompt(questionText, imageUrl);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: imageUrl ? [imageUrl] : undefined,
      });
      const sol = {
        question: questionText,
        imagePreview,
        subject,
        qualification,
        marks,
        mode,
        answer: typeof response === "string" ? response : response?.text || JSON.stringify(response),
        followUps: [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setSolution(sol);
      setHistory((prev) => [sol, ...prev.slice(0, 9)]);
    } catch (e) {
      alert("Failed to solve. Please try again.");
    } finally {
      setSolving(false);
    }
  };

  const askFollowUp = async () => {
    if (!followUp.trim() || !solution) return;
    setFollowUpSolving(true);
    try {
      const prompt = buildPrompt(solution.question, solution.imagePreview, followUp);
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const answer = typeof response === "string" ? response : response?.text || JSON.stringify(response);
      setSolution((prev) => ({
        ...prev,
        followUps: [...(prev.followUps || []), { question: followUp, answer }],
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
    setImageUrl(null);
    setImagePreview(null);
    setSolution(null);
    setFollowUp("");
    setMarks("");
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 text-white py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
              <div>
                <h1 className="text-2xl font-bold">GCSE Past Paper Solver</h1>
                <p className="text-blue-200 text-sm">Type or photograph any past paper question — get instant AI help</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* Input Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg">Your Question</h2>

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

            {/* Question text */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Paste or type the question</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. A car travels 120 km in 1.5 hours. Calculate its average speed in m/s. Show all working. [3 marks]"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Marks */}
            <div className="flex items-center gap-4">
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Marks (optional)</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image upload */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Attach image (optional)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 text-sm hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {uploading ? "Uploading…" : "Photo / Screenshot"}
                  </button>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Question" className="h-12 w-20 object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => { setImageUrl(null); setImagePreview(null); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >×</button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                </div>
              </div>
            </div>

            {/* Solution Mode */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">What kind of help do you need?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SOLUTION_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      mode === m.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div className={`text-xs font-semibold ${mode === m.id ? "text-blue-700" : "text-gray-700"}`}>{m.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={solve}
                disabled={solving || uploading || (!questionText.trim() && !imageUrl)}
                className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {solving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Solving…</>
                ) : (
                  <><Lightbulb className="w-5 h-5" />Solve Question</>
                )}
              </button>
              {solution && (
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />New
                </button>
              )}
            </div>
          </div>

          {/* Solution Card */}
          {solution && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              {/* Header */}
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
              {(solution.question || solution.imagePreview) && (
                <div className="px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question</p>
                  {solution.imagePreview && (
                    <img src={solution.imagePreview} alt="Question" className="max-h-40 rounded-lg mb-2 border border-gray-200 object-contain" />
                  )}
                  {solution.question && <p className="text-sm text-gray-700">{solution.question}</p>}
                </div>
              )}

              {/* Answer */}
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Answer</p>
                <MathJax>
                  <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {solution.answer}
                  </div>
                </MathJax>
              </div>

              {/* Follow-up Q&As */}
              {solution.followUps?.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-4">
                  {solution.followUps.map((fu, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium shrink-0">You</span>
                        <p className="text-sm text-gray-700">{fu.question}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl px-4 py-3">
                        <MathJax>
                          <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                            {fu.answer}
                          </div>
                        </MathJax>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up input */}
              <div className="border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-500 mb-2">Still confused? Ask a follow-up question…</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askFollowUp()}
                    placeholder="e.g. Why do we divide by 1000 here?"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          )}

          {/* History */}
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
                    <button
                      key={i}
                      onClick={() => setSolution(h)}
                      className="w-full text-left px-6 py-3 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-700 line-clamp-1 flex-1">{h.question || "(Image question)"}</p>
                        <div className="flex items-center gap-2 shrink-0">
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