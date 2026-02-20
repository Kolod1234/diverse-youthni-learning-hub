import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { Plus, X, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function PollCreator({ sessionId, onCreated }) {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const createPollMutation = useMutation({
    mutationFn: async (pollData) => {
      const response = await base44.functions.invoke('createSessionPoll', {
        sessionId,
        question: pollData.question,
        options: pollData.options
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Poll created!');
      setQuestion('');
      setOptions(['', '']);
      onCreated?.();
    }
  });

  const handleCreate = () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }

    createPollMutation.mutate({ question, options: validOptions });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <BarChart3 className="w-5 h-5" />
        <Typography variant="h6">Create Poll</Typography>
      </Box>

      <TextField
        label="Poll Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Options</Typography>
      {options.map((option, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            placeholder={`Option ${idx + 1}`}
            value={option}
            onChange={(e) => {
              const updated = [...options];
              updated[idx] = e.target.value;
              setOptions(updated);
            }}
            fullWidth
          />
          {options.length > 2 && (
            <IconButton
              size="small"
              onClick={() => setOptions(options.filter((_, i) => i !== idx))}
            >
              <X className="w-4 h-4" />
            </IconButton>
          )}
        </Box>
      ))}

      <Button
        size="small"
        onClick={() => setOptions([...options, ''])}
        sx={{ mb: 2 }}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Option
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={handleCreate}
        disabled={createPollMutation.isPending}
      >
        {createPollMutation.isPending ? 'Creating...' : 'Launch Poll'}
      </Button>
    </Card>
  );
}