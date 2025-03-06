import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import AskAi from "./Components/AskAi";

const socket = io("http://localhost:5050");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("//Start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState("*");
  const [showAskAi, setShowAskAi] = useState(false); 
  const [aiResponse, setAiResponse] = useState({ question: "", response: "" });

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });
    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutput(response.run.output);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);
  
  useEffect(() => {
    socket.on("aiResponse", (data) => {
      setAiResponse(data); // Update the AI response state
    });
  
    return () => {
      socket.off("aiResponse");
    };
  }, []);
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const handleAskAI = (question) => {
    socket.emit("askAI", { roomId, question });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("//Start code here");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => {
      setCopySuccess("");
    }, 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("userTyping", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, language, roomId, version });
  };

  const toggleAskAi = () => {
    setShowAskAi(!showAskAi); // Toggle AskAi visibility
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          ></input>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          ></input>
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Room Id: {roomId}</h2>
          <select
            className="language-selector"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        </div>
        <h3 className="room-title">Members in Room:{"  "}{users.length}</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.slice(0, 20)}</li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>

        <button onClick={copyRoomId} className="copy-button">
          Copy Room Id
        </button>
        {copySuccess && <span className="copy-success">{copySuccess}</span>}
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="editor-wrapper">
        <div className="editor-header">
           <button className="ask-ai-button" onClick={toggleAskAi}>
            {showAskAi ? "Hide" : "Ask AI"}
          </button>
        </div>
        <Editor
          height={"70%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: 16,
          }}
        />
        <div className="run-container">
          <button className="run-btn" onClick={runCode}>
            Execute
          </button>
          <textarea
            className="output-console"
            value={output}
            readOnly
            placeholder="Output will appear here"
          />
        </div>
      </div>
      {showAskAi && (
      <AskAi aiResponse={aiResponse} onSendQuestion={handleAskAI} />
    )}
    </div>
  );
};

export default App;