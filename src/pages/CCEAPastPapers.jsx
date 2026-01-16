import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function CCEAPastPapers() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await base44.functions.invoke('getCCEACurriculum', {});
      setSubjects(response.data.subjects || []);
    } catch (err) {
      console.error(err);
      setError('Could not load subjects. Please try again.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectChange = async (e) => {
    const url = e.target.value;
    if (!url) return;
    
    const subject = subjects.find(s => s.url === url);
    setSelectedSubject(subject);
    setPapers([]);
    setLoadingPapers(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('getCCEAPastPapers', { url });
      setPapers(response.data.papers || []);
    } catch (err) {
      console.error(err);
      setError(`Failed to load papers for ${subject.name}`);
    } finally {
      setLoadingPapers(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          CCEA Past Papers
        </h1>
        <p className="text-lg text-slate-400">
          Instant access to GCSE questions and mark schemes.
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {/* Subject Selector */}
        <Card className="bg-slate-800/70 backdrop-blur-xl border-slate-700 p-6 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Subject</label>
          {loadingSubjects ? (
            <div className="animate-pulse h-10 bg-slate-700/50 rounded w-full"></div>
          ) : (
            <select 
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              onChange={handleSubjectChange}
              defaultValue=""
            >
              <option value="" disabled>Choose a subject...</option>
              {subjects.map((sub, idx) => (
                <option key={idx} value={sub.url}>{sub.name}</option>
              ))}
            </select>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </Card>

        {/* Results Area */}
        {loadingPapers && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <p className="text-slate-400 animate-pulse">Fetching papers from CCEA...</p>
          </div>
        )}

        {!loadingPapers && selectedSubject && papers.length === 0 && !error && (
          <div className="text-center py-12 text-slate-500">
            <p>No papers found. The page structure might be unique.</p>
          </div>
        )}

        {!loadingPapers && papers.length > 0 && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {papers.map((paper, idx) => (
              <Card key={idx} className="bg-slate-800/70 backdrop-blur-xl border-slate-700 p-4 hover:bg-slate-800/90 transition-all group flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:bg-red-500/20 transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-200 truncate pr-4" title={paper.title}>
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                    {paper.category}
                  </p>
                </div>
                <a 
                  href={paper.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="bg-slate-700 hover:bg-cyan-600 border-slate-600">
                    View PDF
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}