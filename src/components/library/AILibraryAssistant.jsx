import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import { Send, Sparkles, BookOpen, HelpCircle, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function AILibraryAssistant({ resources = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('answer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedResources, setSelectedResources] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const modes = [
    { id: 'answer', label: 'Answer Questions', icon: HelpCircle, description: 'Get answers to your questions with book references' },
    { id: 'search', label: 'Search Topics', icon: BookOpen, description: 'Find relevant books and topics' },
    { id: 'generateQuestions', label: 'Generate Questions', icon: Settings, description: 'Create study questions on a topic' }
  ];

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question or topic');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('libraryAIAssistant', {
        query: query.trim(),
        mode,
        resourceIds: selectedResources.length > 0 ? selectedResources : []
      });

      if (response.data.success) {
        setResult(response.data.result);
        setTabValue(1);
        toast.success('AI analysis complete!');
      } else {
        toast.error(response.data.error || 'Failed to process request');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      handleSubmit();
    }
  };

  const renderAnswer = () => {
    if (!result) return null;

    switch (mode) {
      case 'answer':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result.image_url && (
              <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <img 
                  src={result.image_url} 
                  alt="Answer illustration" 
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                />
              </Box>
            )}
            {result.answer && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                      a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{children}</a>,
                      ul: ({ children }) => <ul className="list-disc list-inside ml-2 text-gray-700">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside ml-2 text-gray-700">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700 mb-1">{children}</li>,
                      h4: ({ children }) => <h4 className="font-semibold text-gray-900 mt-3 mb-2">{children}</h4>,
                    }}
                  >
                    {result.answer}
                  </ReactMarkdown>
                </div>
              </Box>
            )}
            {result.relevantBooks && result.relevantBooks.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Relevant Books</h3>
                <div className="space-y-2">
                  {result.relevantBooks.map((book, idx) => {
                    const matchedBook = resources.find(r => r.title.toLowerCase().includes(book.title.toLowerCase()));
                    const handleClick = () => {
                      if (matchedBook) {
                        // Store book ID in sessionStorage for Library page to open
                        sessionStorage.setItem('openLibraryBookId', matchedBook.id);
                        setOpen(false);
                        // Small delay to ensure dialog closes before navigation
                        setTimeout(() => {
                          window.location.href = createPageUrl('Library');
                        }, 200);
                      }
                    };
                    return (
                      <Box 
                        key={idx} 
                        onClick={handleClick}
                        sx={{ 
                          p: 2, 
                          bgcolor: matchedBook ? '#dbeafe' : '#f3f4f6', 
                          borderRadius: 1, 
                          border: matchedBook ? '1.5px solid #3b82f6' : '1px solid #e5e7eb',
                          cursor: matchedBook ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          '&:hover': matchedBook ? { 
                            bgcolor: '#bfdbfe', 
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                          } : {}
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className={`font-medium ${matchedBook ? 'text-blue-600 underline' : 'text-gray-900'}`}>
                              {book.title}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{book.author}</div>
                            <div className="text-sm text-gray-700 mb-1">{book.why}</div>
                            {matchedBook && <div className="text-xs text-blue-600 mt-1">📖 Click to view in library</div>}
                          </div>
                          {matchedBook && <ExternalLink className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />}
                        </div>
                      </Box>
                    );
                  })}
                </div>
              </Box>
            )}
            {result.keyConcepts && result.keyConcepts.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keyConcepts.map((concept, idx) => (
                    <Chip key={idx} label={concept} size="small" variant="outlined" />
                  ))}
                </div>
              </Box>
            )}
          </Box>
        );

      case 'search':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result.matchedBooks && result.matchedBooks.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Matched Books</h3>
                <div className="space-y-2">
                  {result.matchedBooks.map((book, idx) => (
                    <Box key={idx} sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-900">{book.title}</div>
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{book.matchScore}%</span>
                      </div>
                      <div className="text-sm text-gray-600">{book.author}</div>
                      <div className="text-sm text-gray-700 mt-1">{book.reason}</div>
                    </Box>
                  ))}
                </div>
              </Box>
            )}
            {result.relatedTopics && result.relatedTopics.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {result.relatedTopics.map((topic, idx) => (
                    <Chip 
                      key={idx} 
                      label={topic}
                      size="small"
                      onClick={() => setQuery(topic)}
                      variant="filled"
                      sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </Box>
            )}
            {result.suggestedLearningPath && result.suggestedLearningPath.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Suggested Learning Path</h3>
                <ol className="space-y-1">
                  {result.suggestedLearningPath.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {idx + 1}. {step}
                    </li>
                  ))}
                </ol>
              </Box>
            )}
          </Box>
        );

      case 'generateQuestions':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result.topicOverview && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Topic Overview</h3>
                <p className="text-gray-700">{result.topicOverview}</p>
              </Box>
            )}
            {result.questions && result.questions.length > 0 && (
              <Box>
                <h3 className="font-semibold text-gray-900 mb-2">Generated Questions</h3>
                <div className="space-y-3">
                  {result.questions.map((q, idx) => (
                    <Box key={idx} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #e5e7eb' }}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-gray-900">{q.question}</div>
                        <Chip 
                          label={q.difficulty}
                          size="small"
                          sx={{
                            bgcolor: q.difficulty === 'beginner' ? '#d1fae5' : q.difficulty === 'intermediate' ? '#fef3c7' : '#fee2e2',
                            color: q.difficulty === 'beginner' ? '#065f46' : q.difficulty === 'intermediate' ? '#92400e' : '#991b1b'
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Expected length: <strong>{q.expectedLength}</strong></div>
                      {q.relevantBooks && q.relevantBooks.length > 0 && (
                        <div className="text-xs text-gray-600 mb-2">
                          <strong>Relevant books:</strong> {q.relevantBooks.join(', ')}
                        </div>
                      )}
                      {q.learningObjectives && q.learningObjectives.length > 0 && (
                        <div className="text-xs space-y-1">
                          <strong className="text-gray-700">Learning objectives:</strong>
                          <ul className="list-disc list-inside">
                            {q.learningObjectives.map((obj, i) => (
                              <li key={i} className="text-gray-600">{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Box>
                  ))}
                </div>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          px: 4,
          py: 2,
          bgcolor: 'rgba(229, 231, 235, 0.8)',
          color: '#6b7280',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          fontSize: '0.875rem',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            bgcolor: 'rgba(243, 244, 246, 0.9)'
          }
        }}
      >
        Ask me
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f9fafb', borderBottom: 1, borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Library Assistant
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: '#e5e7eb' }}>
            <Tab label="Input" />
            <Tab label="Results" disabled={!result} />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Mode Selection */}
              <Box>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Select Assistance Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {modes.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          mode === m.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{m.label}</div>
                      </button>
                    );
                  })}
                </div>
              </Box>

              {/* Resource Selection */}
              {resources.length > 0 && (
                <Box>
                  <label className="text-sm font-semibold text-gray-900 block mb-2">Filter by Books (Optional)</label>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 150, overflowY: 'auto', p: 1, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    {resources.map(r => (
                      <Chip
                        key={r.id}
                        label={r.title}
                        onClick={() => {
                          setSelectedResources(prev =>
                            prev.includes(r.id)
                              ? prev.filter(id => id !== r.id)
                              : [...prev, r.id]
                          );
                        }}
                        sx={{
                          bgcolor: selectedResources.includes(r.id) ? '#4f46e5' : '#e5e7eb',
                          color: selectedResources.includes(r.id) ? 'white' : '#1f2937',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Query Input */}
              <Box>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  {mode === 'answer' && 'Ask a Question'}
                  {mode === 'search' && 'Search Topic'}
                  {mode === 'generateQuestions' && 'Enter Topic'}
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    mode === 'answer' ? 'What would you like to know?' :
                    mode === 'search' ? 'What topic would you like to explore?' :
                    'What topic should we create questions about?'
                  }
                  disabled={loading}
                  sx={{ bgcolor: '#f9fafb' }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !query.trim()}
                fullWidth
                sx={{
                  bgcolor: '#4f46e5',
                  color: 'white',
                  py: 1.5,
                  '&:hover': { bgcolor: '#4338ca' },
                  '&:disabled': { bgcolor: '#d1d5db' }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Get Answer
                  </>
                )}
              </Button>
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3, maxHeight: 500, overflowY: 'auto' }}>
              {result ? renderAnswer() : <p className="text-gray-500">No results yet</p>}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: '#e5e7eb' }}>
          <Button onClick={() => { setOpen(false); setTabValue(0); }} color="inherit">
            Close
          </Button>
          {result && (
            <Button
              onClick={() => setTabValue(0)}
              sx={{ bgcolor: '#4f46e5', color: 'white' }}
            >
              New Query
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}