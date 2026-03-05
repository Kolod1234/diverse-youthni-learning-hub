import { useState, useEffect } from "react";
import { Course } from "@/api/entities";

export default function PastPapersPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [year, setYear] = useState("2024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    Course.list().then(setCourses);
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      setSelectedCourse(courses.find((c) => c.id === selectedCourseId) || null);
      setResult(null);
    }
  }, [selectedCourseId, courses]);

  async function handleFetch() {
    if (!selectedCourseId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/functions/fetchCCEAPastPapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: selectedCourseId, year: parseInt(year) }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: "Failed to connect. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const aLevel = courses.filter((c) => c.qualification_type === "alevel");
  const gcse = courses.filter((c) => c.qualification_type === "gcse");
  const resultMsg = result ? result["message"] : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white py-10 px-6 mb-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-2xl">📄</div>
          <div>
            <h1 className="text-2xl font-bold">CCEA Past Papers</h1>
            <p className="text-blue-200 text-sm mt-1">Download real CCEA past papers and mark schemes</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Find Past Papers</h2>
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Select a course --</option>
                {aLevel.length > 0 && (
                  <optgroup label="A-Level Courses">
                    {aLevel.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </optgroup>
                )}
                {gcse.length > 0 && (
                  <optgroup label="GCSE Courses">
                    {gcse.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </optgroup>
                )}
              </select>
            </div>

            {selectedCourse && (
              <div className="flex flex-wrap gap-2">
                {selectedCourse.exam_board && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{selectedCourse.exam_board}</span>
                )}
                {selectedCourse.qualification_type === "alevel" && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">A-Level</span>
                )}
                {selectedCourse.qualification_type === "gcse" && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">GCSE</span>
                )}
                {selectedCourse.alevel_stage === "as" && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">AS</span>
                )}
                {selectedCourse.alevel_stage === "a2" && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">A2</span>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {["2024", "2023", "2022", "2021", "2020"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFetch}
              disabled={!selectedCourseId || loading}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : "🔍 Find Past Papers"}
            </button>
          </div>
        </div>

        {result && result.success && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{result.subject} — {result.year}</h3>
                <p className="text-sm text-gray-500">{result.papers.length} paper{result.papers.length !== 1 ? "s" : ""} available</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{result.qualification}</span>
            </div>
            <div className="space-y-3">
              {result.papers.map((paper, i) => (
                <a
                  key={i}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-lg">📄</div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{paper.title}</span>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">Download PDF →</span>
                </a>
              ))}
            </div>
            <a
              href="https://ccea.org.uk/past-papers-mark-schemes"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              🔗 View all papers on [ccea.org](https://ccea.org).uk
            </a>
          </div>
        )}

        {result && !result.success && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-semibold text-amber-800">No papers found</div>
               
<div className="text-sm text-amber-700 mt-1">{resultMsg}</div>
              {result.ccea_url && (
                <a
                  href={result.ccea_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 font-medium mt-2 inline-block hover:underline"
                >
                  Browse all papers on CCEA website →
                </a>
              )}
            </div>
          </div>
        )}

        {result && result.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm">
            {result.error}
          </div>
        )}

      </div>
    </div>
  );
}