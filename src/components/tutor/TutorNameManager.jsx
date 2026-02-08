import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Edit2 } from 'lucide-react';

export default function TutorNameManager({ user, onSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [instructorName, setInstructorName] = useState(user?.instructor_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!instructorName.trim()) {
      setMessage('Please enter a name');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({ instructor_name: instructorName.trim() });
      setMessage('Name updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
      onSuccess?.();
    } catch (error) {
      setMessage('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">
          <strong>Display Name:</strong> {user?.instructor_name || 'Not set'}
        </span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Your Instructor Name</label>
        <Input
          value={instructorName}
          onChange={(e) => setInstructorName(e.target.value)}
          placeholder="e.g., Dr. Ahmed Khan"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">This is how you'll appear to students in courses</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Save
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setInstructorName(user?.instructor_name || '');
            setMessage('');
          }}
        >
          Cancel
        </Button>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}