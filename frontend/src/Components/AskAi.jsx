import React, { useState, useEffect } from "react";

const AskAi = ({ aiResponse, onSendQuestion }) => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // Update chat history when new AI response comes in
  useEffect(() => {
    if (aiResponse.question || aiResponse.response) {
      setChatHistory((prev) => [...prev, aiResponse]);
    }
  }, [aiResponse]);

  const handleSend = () => {
    if (question.trim()) {
      onSendQuestion(question);
      setQuestion("");
    }
  };

  const handleClear = () => {
    setChatHistory([]);
  };

  const formatResponse = (text) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={index}>• {line.substring(2)}</li>; 
      } else if (/^\d+\./.test(line)) {
        return <li key={index}>{line.replace(/\./, " ")}</li>; 
      } else if (line.startsWith("```")) {
        return null;
      } else {
        return <p key={index}>{line}</p>;
      }
    });
  };

  return (
    <div className="ask-ai-container">
      <div className="chat-window">
        {chatHistory.map((chat, index) => (
          <div key={index} className="chat-message">
            <p className="user-message">You: {chat.question}</p>
            <div className="ai-message">
              {chat.response.split("```").map((segment, i) =>
                i % 2 === 1 ? (
                  <pre key={i} className="code-block">
                    <code>{segment}</code>
                  </pre>
                ) : (
                  <div key={i}>{formatResponse(segment)}</div>
                )
              )}
            </div>
          </div>
        ))}
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
        <button className="send-button" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default AskAi;
