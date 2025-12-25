import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, X, Download, Sparkles, Flag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LiveTranscription({ sessionId, user, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final = transcriptText;
          } else {
            interim = transcriptText;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          const newEntry = {
            id: Date.now(),
            speaker: user?.full_name || 'Speaker',
            text: final,
            timestamp: new Date().toLocaleTimeString()
          };
          
          setTranscript(prev => [...prev, newEntry]);
          setInterimTranscript('');

          // Save to backend
          await base44.functions.invoke('videoSignaling', {
            action: 'add-transcript',
            sessionId,
            entry: newEntry
          });

          // Detect key points using AI
          await detectKeyPoints(final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          if (isListening) {
            recognitionRef.current.start();
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    // Fetch existing transcript
    fetchTranscript();
    const interval = setInterval(fetchTranscript, 5000);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sessionId]);

  const fetchTranscript = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'get-transcript',
        sessionId
      });
      if (response.data.transcript) {
        setTranscript(response.data.transcript);
      }
      if (response.data.keyPoints) {
        setKeyPoints(response.data.keyPoints);
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  const detectKeyPoints = async (text) => {
    // Detect action items, decisions, and important points
    const keywords = ['action item', 'todo', 'next step', 'decide', 'decision', 'important', 'key point'];
    const lowerText = text.toLowerCase();
    
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      const keyPoint = {
        id: Date.now(),
        text,
        timestamp: new Date().toLocaleTimeString(),
        type: 'action_item'
      };
      
      setKeyPoints(prev => [...prev, keyPoint]);
      
      await base44.functions.invoke('videoSignaling', {
        action: 'add-keypoint',
        sessionId,
        keyPoint
      });
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const exportTranscript = () => {
    const content = transcript.map(entry => 
      `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`
    ).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSummary = async () => {
    try {
      const fullTranscript = transcript.map(e => `${e.speaker}: ${e.text}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this meeting transcript into key points, decisions, and action items:\n\n${fullTranscript}`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_decisions: { type: 'array', items: { type: 'string' } },
            action_items: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Save summary
      await base44.functions.invoke('videoSignaling', {
        action: 'save-summary',
        sessionId,
        summary: response
      });

      alert('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-500 to-teal-500">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Live Transcription
            </h3>
            {isListening && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white mr-2" />
                Recording
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleListening}
              className="text-white hover:bg-white/20"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={exportTranscript}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={generateSummary}
              disabled={transcript.length === 0}
              className="text-white hover:bg-white/20"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Transcript */}
          <div className="flex-1 border-r">
            <div className="p-3 bg-gray-50 border-b">
              <h4 className="font-semibold text-gray-900">Transcript</h4>
            </div>
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {transcript.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{entry.speaker}</span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.text}</p>
                  </div>
                ))}
                
                {interimTranscript && (
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-900">{user?.full_name || 'Speaker'}</span>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Speaking...</Badge>
                    </div>
                    <p className="text-sm text-blue-800 italic">{interimTranscript}</p>
                  </div>
                )}

                {transcript.length === 0 && !interimTranscript && (
                  <div className="text-center py-8 text-gray-500">
                    <Mic className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Start speaking to see live transcription</p>
                    <p className="text-xs mt-2">Click the mic button to start recording</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Key Points */}
          <div className="w-80">
            <div className="p-3 bg-amber-50 border-b">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-600" />
                Key Points & Action Items
              </h4>
            </div>
            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                {keyPoints.map((point) => (
                  <Card key={point.id} className="p-3 border-l-4 border-amber-400 bg-amber-50">
                    <div className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{point.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{point.timestamp}</p>
                      </div>
                    </div>
                  </Card>
                ))}

                {keyPoints.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Flag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No key points detected yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <span>Powered by Web Speech API & AI</span>
          <span>{transcript.length} entries • {keyPoints.length} key points</span>
        </div>
      </Card>
    </div>
  );
}