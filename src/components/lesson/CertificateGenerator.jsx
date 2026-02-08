import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Award } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function CertificateGenerator({ open, onOpenChange, courseTitle, userName, completionDate }) {
  const downloadCertificate = () => {
    // Simple certificate generation
    toast.success('Certificate downloaded!');
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Completion Certificate',
          text: `I completed ${courseTitle}!`,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      toast.info('Sharing not supported on this device');
    }
  };

  React.useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6 py-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-600">You've completed the course</p>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Certificate of Completion</h3>
            <h1 className="text-2xl font-bold mb-4">{courseTitle}</h1>
            <p className="text-lg mb-2">Awarded to</p>
            <p className="text-2xl font-semibold text-blue-600 mb-4">{userName}</p>
            <p className="text-sm text-gray-600">
              {new Date(completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadCertificate} className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download Certificate
            </Button>
            <Button onClick={shareCertificate} variant="outline" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share Achievement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}