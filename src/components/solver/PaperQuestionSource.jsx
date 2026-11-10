import QuestionSourceImage from "@/components/solver/QuestionSourceImage";
import AnswerBlock from "@/components/solver/AnswerBlock";

// The original question for one full-paper solution.
// Questions split from the PDF show every page area they occupy, exactly as printed (text, tables and diagrams).
// AI-extracted questions (scans, photos) fall back to the located crop plus the transcribed text.
export default function PaperQuestionSource({ question: q, file, nextQuestionText }) {
  const marksLabel = q.marks ? ` (${q.marks} mark${q.marks === 1 ? "" : "s"})` : "";
  const fromPdf = Array.isArray(q.segments) && q.segments.length > 0;

  return (
    <div className="rounded-xl border border-indigo-100 bg-slate-50/80 p-4 space-y-3">
      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
        Question {q.number}{marksLabel}
      </span>
      {fromPdf ? (
        q.segments.map((segment) => (
          <QuestionSourceImage
            key={`${segment.page}-${segment.top}`}
            file={file}
            pageNumber={segment.page}
            region={segment}
            caption=""
          />
        ))
      ) : (
        <>
          <QuestionSourceImage
            file={file}
            pageNumber={q.page_number}
            cropBox={q.crop_box}
            caption={q.diagram_summary}
            questionText={q.text}
            stemText={q.stem}
            nextQuestionText={nextQuestionText}
            questionLabel={q.number}
          />
          {q.stem && (
            <div className="rounded-lg border border-indigo-100 bg-white px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 mb-1">Question Context / Stem</p>
              <AnswerBlock text={q.stem} blockKey={`${q.answerKey}-stem`} />
            </div>
          )}
          <AnswerBlock text={q.text} blockKey={`${q.answerKey}-qtext`} />
        </>
      )}
    </div>
  );
}