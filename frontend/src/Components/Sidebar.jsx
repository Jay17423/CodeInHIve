import React, { useState } from "react";
import Logo from "../assets/logo.png";
import MemberInfo from "./MemberInfo";

const Sidebar = ({
  roomId,
  users,
  typing,
  copyRoomId,
  copySuccess,
  leaveRoom,
  downloadCode,
  language,
  handleLanguageChange,
  toggleChat,
  toggleBoard,
  Board,
  
}) => {
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  return (
    <div className="sidebar">
      <div className="room-info">
        <img className="logo-dark-mode" src={Logo} alt="Logo" />
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

      {showMemberInfo ? (
        <div className="member-overlay">
          <MemberInfo users={users} />
          <button
            className="close-overlay-button"
            onClick={() => setShowMemberInfo(false)}
          >
            ❌
          </button>
        </div>
      ) : (
        <>
          <h3 className="room-title">Members in Room: {users.length}</h3>
          <button
            className="member-button"
            onClick={() => setShowMemberInfo(true)}
          >
            👥 Members
          </button>
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
          <button className="chatbox-button" onClick={toggleChat}>
            💬 Chat
          </button>
          <button className="Drawing-button" onClick={toggleBoard}>
            {Board ? "🎨 Stop Drawing" : "🎨 Start Drawing"}
          </button>
        </>
      )}
    </div>
  );
};

export default Sidebar;