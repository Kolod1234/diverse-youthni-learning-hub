import GeneratedDiagram from "@/components/solver/GeneratedDiagram";
import OpenSourceVisual from "@/components/solver/OpenSourceVisual";

export default function DiagramGenerator({ solution }) {
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <h3 className="font-semibold text-sky-900">Need a visual explanation?</h3>
      <p className="mt-1 text-xs text-sky-700">Use a verified open educational figure or create a question-specific schematic.</p>
      <div className="mt-3 grid gap-2">
        <OpenSourceVisual solution={solution} />
        <GeneratedDiagram solution={solution} />
      </div>
    </section>
  );
}