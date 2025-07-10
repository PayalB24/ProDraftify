import React from 'react';

function EmailForm({ form, showCustomInput, onChange, onCustomChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="input-form">
      <div className="row mb-4">
        {['language', 'category', 'tone', 'topic', 'recipientTitle'].map((field) => (
          <div className="col-md-2" key={field}>
            <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <select
              name={field}
              onChange={onChange}
              className="form-select"
              value={form[field]}
            >
              <option value="">Select {field}</option>
              {getOptions(field).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {showCustomInput[field] && (
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={onCustomChange}
                placeholder={`Enter custom ${field}`}
                className="form-input"
              />
            )}
          </div>
        ))}
      </div>

      <div className="col-12">
        <label htmlFor="customPrompt">Your Message:</label>
        <textarea
          name="customPrompt"
          value={form.customPrompt}
          onChange={onCustomChange}
          placeholder="Write your custom message (e.g., I am going to Goa for five days)"
          className="form-input"
          rows={4}
          
        />
      </div>

      <div className="col-12">
        <button type="submit" className="submit-button">Generate</button>
      </div>
    </form>
  );
}

function getOptions(field) {
  const options = {
    language: ['English', 'Hindi', 'French', 'Spanish', 'German'],
    category: ['Leave', 'Inquiry', 'Complaint', 'Request', 'Feedback'],
    tone: ['Formal', 'Informal', 'Polite', 'Apologetic', 'Friendly'],
    topic: ['Sick Leave', 'Vacation Leave', 'Work from Home', 'Salary Delay', 'Meeting Request'],
    recipientTitle: ['Boss', 'Father', 'Manager', 'Teacher', 'HR'],
  };
  return options[field] || [];
}

export default EmailForm;
