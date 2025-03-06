import React from 'react';

const AskAi = () => {
  return (
    <div className="ask-ai-container">
      <div className="chat-window">
        {/* Chat content will be displayed here */}
      </div>
      <div className="input-area">
        <input type="text" placeholder="Ask AI..." className="chat-input" />
        <button className="send-button">Send</button>
      </div>
    </div>
  );
};

export default AskAi;