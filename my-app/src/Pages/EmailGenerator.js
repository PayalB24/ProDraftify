import React, { useState } from 'react';
import axios from 'axios';
import EmailForm from '../Components/EmailForm';
import ChatBox from '../Components/ChatBox';
import CopyDownloadButtons from '../Components/CopyDownloadButtons';

function EmailGenerator() {
  const [form, setForm] = useState({
    language: '',
    category: '',
    tone: '',
    topic: '',
    recipientTitle: '',
    customPrompt: '',
  });
  const [showCustomInput, setShowCustomInput] = useState({
    language: false,
    category: false,
    tone: false,
    topic: false,
    recipientTitle: false,
  });

  const [generatedEmail, setGeneratedEmail] = useState('');
  const [conversation, setConversation] = useState([]);
  const [canDownload, setCanDownload] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value === 'Other') {
      setShowCustomInput((prev) => ({ ...prev, [name]: true }));
      setForm((prev) => ({ ...prev, [name]: '' }));
    } else {
      setShowCustomInput((prev) => ({ ...prev, [name]: false }));
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrorMsg('');
  };

  const handleCustomInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const validateForm = () => {
    const fields = ['language', 'category', 'tone', 'topic', 'recipientTitle'];

    for (const field of fields) {
      if (showCustomInput[field]) {
        if (!form[field]?.trim()) {
          return `Please fill in the custom ${field}`;
        }
      } else {
        if (!form[field]) {
          return `Please select a ${field} from the list`;
        }
      }
    }
    if (Object.values(showCustomInput).some(Boolean) && !form.customPrompt.trim()) {
      return 'Please provide a message in "Your Message"';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg('');
    setGeneratedEmail('Generating...');
    setCanDownload(false);
    setConversation((prev) => [...prev, { message: 'Generating your email...', type: 'sent' }]);

    try {
      const res = await axios.post('http://localhost:8000/generate-email', form);
      const email = res.data.email;
      setGeneratedEmail(email);
      setCanDownload(true);
      setConversation((prev) => [...prev, { message: email, type: 'received' }]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error generating email.';
      setGeneratedEmail(errorMsg);
      setConversation((prev) => [...prev, { message: errorMsg, type: 'received' }]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
      .then(() => alert('Email copied to clipboard!'))
      .catch((err) => console.error('Failed to copy:', err));
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.post(
        'http://localhost:8000/download-pdf',
        { email: generatedEmail },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'generated_email.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
      console.error(err);
    }
  };

  return (
    <div className="chat-container">
      {generatedEmail && (
        <CopyDownloadButtons
          generatedEmail={generatedEmail}
          canDownload={canDownload}
          onCopy={copyToClipboard}
          onDownload={downloadPDF}
        />
      )}

      <ChatBox conversation={conversation} />

      <EmailForm
        form={form}
        showCustomInput={showCustomInput}
        onChange={handleChange}
        onCustomChange={handleCustomInputChange}
        onSubmit={handleSubmit}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default EmailGenerator;
