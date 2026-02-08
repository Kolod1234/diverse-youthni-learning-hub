import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintMode({ lesson, course }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <Printer className="w-4 h-4" />
        Print Lesson
      </Button>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #lesson-content, #lesson-content * {
            visibility: visible;
          }
          #lesson-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </>
  );
}