import React, { useState } from "react";
import "./App.css";
import io from "socket.io-client";

const soket = io("http://localhost:5050");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState(null);
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
            onChange={(e) => setRoomId(e.target.value)}
          ></input>
          <button>Join Room</button>
        </div>
      </div>
    );
  }

  return <div>User Joined</div>;
};

export default App;
