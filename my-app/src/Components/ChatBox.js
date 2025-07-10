import React from 'react';

function ChatBox({ conversation }) {
  return (
    <div className="chat-box">
      {conversation.map((msg, idx) => (
        <div key={idx} className={`chat-message ${msg.type}`}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
        </div>
      ))}
    </div>
  );
}

export default ChatBox;
