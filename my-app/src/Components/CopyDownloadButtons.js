import React from 'react';

function CopyDownloadButtons({ generatedEmail, canDownload, onCopy, onDownload }) {
  return (
    <div className="copy-container">
      <button onClick={() => onCopy(generatedEmail)} className="copy-button">
        Copy Email
      </button>
      {canDownload && (
        <button onClick={onDownload} className="copy-button">
          Download PDF
        </button>
      )}
    </div>
  );
}

export default CopyDownloadButtons;
