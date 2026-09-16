import DiagramGenerator from "@/components/solver/DiagramGenerator";
import PracticeCheck from "@/components/solver/PracticeCheck";
import CourseRecommendations from "@/components/solver/CourseRecommendations";

export default function StudentExtensionPanel({ solution }) {
  return <div className="grid gap-4 border-t border-gray-100 pt-4 lg:grid-cols-2">
    <DiagramGenerator solution={solution} />
    <PracticeCheck solution={solution} />
    <div className="lg:col-span-2"><CourseRecommendations solution={solution} /></div>
  </div>;
}