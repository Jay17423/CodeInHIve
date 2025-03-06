import React, { useState } from 'react';

const AskAi = ({ aiResponse, onSendQuestion }) => {
  const [question, setQuestion] = useState("");

  const handleSend = () => {
    if (question.trim()) {
      onSendQuestion(question); 
      setQuestion(""); 
    }
  };

  return (
    <div className="ask-ai-container">
      <div className="chat-window">
        {aiResponse.question && (
          <div className="chat-message">
            <strong>You:</strong> {aiResponse.question}
          </div>
        )}
        {aiResponse.response && (
          <div className="chat-message">
            <strong>AI:</strong> {aiResponse.response}
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Ask AI..."
          className="chat-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AskAi;