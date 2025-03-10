import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import AskAi from "./Components/AskAi";
import Logo from "./assets/logo.png";
import { useDispatch,useSelector } from "react-redux";
import { setCode,setLanguage,setRoomId,setVersion } from "./Slice/CodeSlice";


const socket = io("http://localhost:5050");

const App = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const { code, language, roomId, version } = useSelector((state) => state.code); // Get state from Redux
  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [output, setOutput] = useState("");
  const [showAskAi, setShowAskAi] = useState(false);
  const [aiResponse, setAiResponse] = useState({ question: "", response: "" });



  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users); 
    });

    socket.on("codeUpdate", (newCode) => {
      dispatch(setCode(newCode));
    });

    // Listen for typing indicators
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    // Listen for language changes
    socket.on("languageUpdate", (newLanguage) => {
      dispatch(setLanguage(newLanguage));
    });

    // Listen for code execution output
    socket.on("codeResponse", (response) => {
      setOutput(response.run.output);
    });

    // Listen for AI responses
    socket.on("aiResponse", (data) => {
      setAiResponse(data); // Update the AI response state
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("aiResponse");
    };
  }, []);

  // Handle leaving the room when the user closes the tab or refreshes
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Join a room
  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  // Ask AI for assistance
  const handleAskAI = (question) => {
    socket.emit("askAI", { roomId, question, code });
  };

  // Leave the room
  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    dispatch(setRoomId(""));
    setUserName("");
    dispatch(setCode("//Start code here"));
    dispatch(setLanguage("javascript"));
  };

  // Copy the room ID to the clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => {
      setCopySuccess("");
    }, 2000);
  };

  // Handle code changes and broadcast them to the room
  const handleCodeChange = (newCode) => {
    dispatch(setCode(newCode));
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("userTyping", { roomId, userName });
  };

  // Handle language changes and broadcast them to the room
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    dispatch(setLanguage(newLanguage));
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  // Execute the code
  const runCode = () => {
    socket.emit("compileCode", { code, language, roomId, version });
  };

  // Toggle the Ask AI component visibility
  const toggleAskAi = () => {
    setShowAskAi(!showAskAi);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    if (language === "javascript") a.download = "code.js";
    else if (language === "python") a.download = "code.py";
    else if (language === "c") a.download = "code.c";
    else if (language === "cpp") a.download = "code.cpp";
    else if (language === "java") a.download = "code.java";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // Render the join form if the user hasn't joined a room yet
  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <img className="logo" src={Logo}></img>
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => dispatch(setRoomId(e.target.value))}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  // Render the main editor interface
  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <img className="logo-dark-mode" src={Logo}></img>
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
        <h3 className="room-title">Members in Room: {users.length}</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              {user.name} (ID: {user.id.slice(0, 6)})
            </li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>

        <button onClick={copyRoomId} className="copy-button">
        📋 Copy Room ID
        </button>
        {copySuccess && <span className="copy-success">{copySuccess}</span>}
        <button className="leave-button" onClick={leaveRoom}>
        🚪 Leave Room
        </button>
        <button className="download-button" onClick={downloadCode}>
          📥 Download Code
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
