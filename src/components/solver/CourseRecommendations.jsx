import { Link } from "react-router-dom";
import useCourseRecommendations from "@/components/solver/useCourseRecommendations";

export default function CourseRecommendations({ solution }) {
  const { courses, loading } = useCourseRecommendations(solution);
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <h3 className="font-semibold text-emerald-900">Continue reading in your courses</h3>
    {loading ? <p className="mt-2 text-xs text-emerald-700">Finding matching course topics…</p> : courses.length ? <div className="mt-3 grid gap-2">{courses.map(course => <Link key={course.id} to={`/CourseDetails?id=${course.id}`} className="rounded-lg border border-emerald-200 bg-card p-3 no-underline hover:border-emerald-400"><p className="text-sm font-semibold text-gray-800">{course.title}</p><p className="mt-1 text-xs text-gray-600 line-clamp-2">{course.description}</p></Link>)}</div> : <p className="mt-2 text-xs text-emerald-700">No matching published course was found for this subject and level.</p>}
  </div>;
}