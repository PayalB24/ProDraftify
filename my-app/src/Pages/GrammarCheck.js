import React, { useState } from 'react';
import axios from 'axios';

function GrammarCheck() {
  const [inputText, setInputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://prodraftify-4.onrender.com/grammar-check',
        { text: inputText }
      );
      setCorrectedText(res.data.correctedText);
    } catch (err) {
      console.error(err);
      setCorrectedText("Error: Could not check grammar or format.");
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.post(
        'https://prodraftify-4.onrender.com/download-pdf',
        { email: correctedText },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'corrected_email.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your message, draft, or notes here..."
        rows="8"
        className="textarea"
      ></textarea>
      <button onClick={handleCheck} className="button" style={{ marginTop: '10px' }}>
        {loading ? "Processing..." : "Check Grammar & Format"}
      </button>

      {correctedText && (
        <div className="output" style={{
          marginTop: '20px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}>
          <h4 style={{ marginBottom: '15px' }}>Formatted Professional Email:</h4>
          {correctedText}
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button onClick={downloadPDF} className="button">
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarCheck;
