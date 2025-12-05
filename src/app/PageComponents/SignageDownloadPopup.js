'use client';

import { X } from 'lucide-react';
import React, {  useState } from 'react';
import PdfViewer from './PDFScrollViewer';

// SignageDownloadPopup.js
export default function SignageDownloadPopup({ file, show, onClose, label, form, setform, id }) {
  
  const [disabledAgreement, setDisabledAgreement] = useState(true);
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl relative">
        <h2 className="text-xl font-semibold mb-4">{`${label} Agreement`}</h2>

        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm mb-2 block"
        >
          View Fullscreen
        </a>

        <PdfViewer setDisabledAgreement={setDisabledAgreement} pdfUrl={file} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm text-gray-600 mt-4">
          By selecting I AGREE or downloading the software, you concur that you have read and received this license agreement and its mutual covenants and your responsibility to implement as described for Ginicoe products and services to be delivered to you, your customers, and affiliates.
        </p>
        <div className="flex justify-end">
          <button
            disabled={disabledAgreement}
            onClick={() => {
              setform((prev) => ({ ...prev, [id]: !prev[id] }));
              onClose();
            }}
            className={`bg-blue-500 text-white px-4 py-2 rounded-md mt-5 ${
              disabledAgreement ? 'opacity-50 !cursor-not-allowed' : ''
            }`}
          >
            {form[id] ? 'I Don\'t Agree' : 'I Agree'}
          </button>
        </div>
      </div>
    </div>
  );
}
