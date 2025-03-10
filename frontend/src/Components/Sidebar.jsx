
import React from "react";
import Logo from "../assets/logo.png";
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
}) => {
  return (
    <div className="sidebar">
      <div className="room-info">
        <img className="logo-dark-mode" src={Logo} alt="Logo" />
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
  );
};

export default Sidebar;