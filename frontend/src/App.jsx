// App.js
import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setCode, setLanguage, setRoomId, setVersion } from "./Slice/CodeSlice";
import JoinRoom from "./Components/JoinRoom";
import Sidebar from "./Components/Sidebar";
import CodeEditor from "./Components/CodeEditor";
import OutputConsole from "./Components/OutputConsole";
import AskAi from "./Components/AskAi";

const socket = io("http://localhost:5050");

const App = () => {
  const dispatch = useDispatch();
  const { code, language, roomId, version } = useSelector(
    (state) => state.code
  );
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

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      dispatch(setLanguage(newLanguage));
    });

    socket.on("codeResponse", (response) => {
      setOutput(response.run.output);
    });

    socket.on("aiResponse", (data) => {
      setAiResponse(data);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
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
    socket.emit("askAI", { roomId, question, code });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    dispatch(setRoomId(""));
    setUserName("");
    dispatch(setCode("//Start code here"));
    dispatch(setLanguage("javascript"));
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => {
      setCopySuccess("");
    }, 2000);
  };

  const handleCodeChange = (newCode) => {
    dispatch(setCode(newCode));
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("userTyping", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    dispatch(setLanguage(newLanguage));
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, language, roomId, version });
  };

  const toggleAskAi = () => {
    setShowAskAi(!showAskAi);
  };

  const downloadCode = () => {
    const hardcodedData = `// Room ID: ${roomId}\n // User Name: ${userName}\n`;
    
    const finalCode = hardcodedData + code; 

    const blob = new Blob([finalCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const extensions = {
        javascript: "js",
        python: "py",
        c: "c",
        cpp: "cpp",
        java: "java",
    };

    a.download = `code.${extensions[language] || "txt"}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


  if (!joined) {
    return (
      <JoinRoom
        roomId={roomId}
        userName={userName}
        setRoomId={(e) => dispatch(setRoomId(e))}
        setUserName={setUserName}
        joinRoom={joinRoom}
      />
    );
  }

  return (
    <div className="editor-container">
      <Sidebar
        roomId={roomId}
        users={users}
        typing={typing}
        copyRoomId={copyRoomId}
        copySuccess={copySuccess}
        leaveRoom={leaveRoom}
        downloadCode={downloadCode}
        language={language}
        handleLanguageChange={handleLanguageChange}
      />
      <div className="editor-wrapper">
        <div className="editor-header">
          <button className="ask-ai-button" onClick={toggleAskAi}>
            {showAskAi ? "Hide" : "Ask AI"}
          </button>
        </div>
        <CodeEditor
          language={language}
          code={code}
          handleCodeChange={handleCodeChange}
        />
        <div className="run-container">
          <button className="run-btn" onClick={runCode}>
            Execute
          </button>
          <OutputConsole output={output} />
        </div>
      </div>
      {showAskAi && (
        <AskAi aiResponse={aiResponse} onSendQuestion={handleAskAI} />
      )}
    </div>
  );
};

export default App;
