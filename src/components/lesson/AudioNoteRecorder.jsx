import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Play, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AudioNoteRecorder({ lessonId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const queryClient = useQueryClient();

  const { data: audioNotes = [] } = useQuery({
    queryKey: ['audio-notes', lessonId],
    queryFn: () => base44.entities.AudioNote.filter({ lesson_id: lessonId }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (blob) => {
      const file = new File([blob], `audio-note-${Date.now()}.webm`, { type: 'audio/webm' });
      const { data } = await base44.integrations.Core.UploadFile({ file });
      return data.file_url;
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['audio-notes', lessonId]);
      toast.success('Audio note saved!');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['audio-notes', lessonId]);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    
    const audioUrl = await uploadMutation.mutateAsync(audioBlob);
    await createNoteMutation.mutateAsync({
      lesson_id: lessonId,
      audio_url: audioUrl,
      duration_seconds: 0,
      timestamp_position: window.scrollY,
    });
    
    setAudioBlob(null);
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-600" />
          <span className="font-semibold">Audio Notes</span>
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording && !audioBlob && (
          <Button onClick={startRecording} className="gap-2 bg-red-600 hover:bg-red-700">
            <Mic className="w-4 h-4" />
            Record
          </Button>
        )}
        
        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}
        
        {audioBlob && !isRecording && (
          <>
            <Button onClick={saveRecording} className="gap-2" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
            <Button onClick={() => setAudioBlob(null)} variant="outline">
              Cancel
            </Button>
          </>
        )}
      </div>

      {audioNotes.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {audioNotes.map((note) => (
            <div key={note.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <audio src={note.audio_url} controls className="flex-1 h-10" />
              <button
                onClick={() => deleteNoteMutation.mutate(note.id)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}