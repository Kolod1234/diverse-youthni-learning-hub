import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function UnsavedChangesModal({ open, onSave, onDiscard, onCancel, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </motion.div>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>You have unsaved changes. What would you like to do?</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={onDiscard}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Discard Changes
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}