'use client';
import React, { useEffect } from 'react';

// PdfViewer component
// This component renders a PDF viewer using an iframe, allowing users to view PDF documents.
const PdfViewer = ({ pdfUrl, setDisabledAgreement }) => {
  const viewerUrl = `/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;
  // Handle scroll event to enable agreement button when at the bottom of the PDF
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'pdf-scroll') {
        if (event.data.atBottom) {
          setDisabledAgreement(false);
        } 
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setDisabledAgreement]);

  return (
    <div className='border border-gray-300 p-1 h-64'>
      <iframe
        id="documentIFrame"
        src={viewerUrl}
        width="100%"
        height="100%"
        title="PDF Viewer"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default PdfViewer;
