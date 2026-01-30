import React from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { FileText } from 'lucide-react';

export default function DocumentViewer({ fileUrl, fileType }) {
  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>No document available</p>
        </div>
      </div>
    );
  }

  const docs = [{ 
    uri: fileUrl,
    fileType: fileType || fileUrl.split('.').pop()
  }];

  return (
    <div className="w-full h-full bg-white">
      <DocViewer
        documents={docs}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: false,
            disableFileName: false,
          },
        }}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}