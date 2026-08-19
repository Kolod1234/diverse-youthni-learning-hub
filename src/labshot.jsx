/**
 * Standalone entry used only to render the 3D laboratory for screenshots.
 * It mounts TitrationLab directly so no authentication or routing is involved.
 * Not referenced by the application; safe to delete.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import TitrationLab from '@/components/lab3d/TitrationLab';

function Shot() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TitrationLab />
    </div>
  );
}

createRoot(document.getElementById('labroot')).render(<Shot />);
