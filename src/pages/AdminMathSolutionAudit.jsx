import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2, Loader2, Play, RotateCcw, ScanSearch, ShieldCheck } from 'lucide-react';

const COURSE_ID = '698a3d721a8a90bcc13737e2';

const TOPICS = [
  { name: 'AS1: Algebra and Functions', from: 1, to: 18 },
  { name: 'AS1: Coordinate Geometry', from: 19, to: 25 },
  { name: 'AS1: Sequences and Series', from: 26, to: 31 },
  { name: 'AS1: Exponentials and Logarithms', from: 32, to: 35 },
  { name: 'AS1: Trigonometry', from: 36, to: 45 },
  { name: 'AS1: Calculus', from: 46, to: 59 },
  { name: 'AS2: Kinematics', from: 60, to: 67 },
  { name: 'AS2: Forces', from: 68, to: 74 },
  { name: 'AS2: Statistics', from: 75, to: 84 }
];

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

function ResultRow({ result }) {
  const ok = result.success && result.after_structural_failures === 0 && (result.failures || []).length === 0;
  return (
    <div className={`rounded-xl border p-4 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-start gap-3">
        {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900">{result.order}. {result.title}</div>
          <div className="mt-1 text-sm text-slate-700">
            {result.saved_units ?? 0}/{result.solution_units ?? 0} solution units saved ·
            {' '}{result.verifier_corrections ?? 0} second-examiner corrections ·
            {' '}{result.after_structural_failures ?? result.issues ?? 0} structural failures remain
          </div>
          {(result.failures || []).length > 0 && (
            <details className="mt-2 text-sm text-amber-900">
              <summary className="cursor-pointer font-medium">{result.failures.length} rejected unit(s)</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.failures.map((failure, index) => (
                  <li key={index}>{failure.id}: {failure.stage} — {failure.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMathSolutionAudit() {
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const failedOrders = useMemo(
    () => results.filter((result) => !result.success || result.after_structural_failures > 0 || (result.failures || []).length > 0).map((result) => result.order),
    [results]
  );

  async function runOrders(orders, scanOnly = false) {
    if (running || orders.length === 0) return;
    setRunning(true);
    setError('');
    const nextResults = [];
    try {
      for (let index = 0; index < orders.length; index++) {
        const order = orders[index];
        setCurrent(`${scanOnly ? 'Scanning' : 'Auditing'} lesson ${order} of ${orders[orders.length - 1]} (${index + 1}/${orders.length})`);
        const response = await base44.functions.invoke('auditASMathSolutions', {
          course_id: COURSE_ID,
          order,
          scan_only: scanOnly,
          batch_size: 2
        });
        const result = response?.data || response;
        if (result?.error) throw new Error(`Lesson ${order}: ${result.error}`);
        nextResults.push(result);
        setResults((previous) => {
          const withoutOrder = previous.filter((item) => item.order !== order);
          return [...withoutOrder, result].sort((a, b) => a.order - b.order);
        });
        if (!scanOnly && (!result.success || result.after_structural_failures > 0 || (result.failures || []).length > 0)) {
          throw new Error(`Lesson ${order} did not pass every audit gate. Review the failure details before continuing.`);
        }
      }
    } catch (runError) {
      setError(runError?.message || String(runError));
    } finally {
      setCurrent('');
      setRunning(false);
    }
    return nextResults;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-slate-950 p-7 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-8 w-8 text-cyan-300" />
            <div>
              <h1 className="text-2xl font-bold">AS Mathematics Solution Audit</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Every labelled solution is independently recomputed, rewritten into one continuously numbered micro-step list,
                checked by a second examiner, and structurally rejected if any step is compressed or unexplained.
              </p>
            </div>
          </div>
          {current && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              {current}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <div className="font-semibold">Audit stopped safely</div>
            <div className="mt-1">{error}</div>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runOrders(range(1, 84), false)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Audit all 84 lessons
            </button>
            <button
              onClick={() => runOrders([5], false)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-900 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Test Factorising lesson
            </button>
            <button
              onClick={() => runOrders(range(1, 84), true)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              <ScanSearch className="h-4 w-4" />
              Structural scan only
            </button>
            <button
              onClick={() => runOrders(failedOrders, false)}
              disabled={running || failedOrders.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retry failed lessons ({failedOrders.length})
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {TOPICS.map((topic) => (
              <div key={topic.name} className="rounded-xl border border-slate-200 p-4">
                <div className="font-semibold">{topic.name}</div>
                <div className="mt-1 text-xs text-slate-500">Lessons {topic.from}–{topic.to}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => runOrders(range(topic.from, topic.to), false)}
                    disabled={running}
                    className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Audit topic
                  </button>
                  <button
                    onClick={() => runOrders(range(topic.from, topic.to), true)}
                    disabled={running}
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Scan topic
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-3">
          {results.length > 0 && (
            <div className="mb-2 text-sm font-semibold text-slate-700">
              {results.length} lesson report{results.length === 1 ? '' : 's'}
            </div>
          )}
          {results.map((result) => <ResultRow key={result.order} result={result} />)}
        </section>
      </div>
    </main>
  );
}
