import { Link } from "react-router-dom";
import usePastPaperSolverAccess from "@/components/solver/usePastPaperSolverAccess";

export default function SolverAccessGate({ children }) {
  const { canAccess, isLoading } = usePastPaperSolverAccess();

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Checking access…</div>;
  }

  if (!canAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground">DYNI Past Paper Solver</h1>
          <p className="mt-3 text-sm text-muted-foreground">This tool is available to administrators, tutors and students enrolled on a course.</p>
          <Link to="/Explore" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse courses</Link>
        </div>
      </div>
    );
  }

  return children;
}