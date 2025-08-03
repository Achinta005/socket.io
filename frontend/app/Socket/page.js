"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Socket = () => {
  const [socket, setSocket] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [username, setUsername] = useState("");
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const s = io("https://socket-io-6ow3.onrender.com");
    setSocket(s);

    s.on("usercount", (count) => {
      setUserCount(count);
    });

    s.on("onlineUser", (users) => {
      console.log("Received online users:", users); // Debug log
      setOnlineUsers(users);
    });

    s.on("private message", ({ message, from }) => {
      setChatLog((prev) => [...prev, { from, message }]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleRegister = () => {
    if (socket && username.trim()) {
      socket.emit("register", username.trim());
      setIsRegistered(true);
    }
  };

  const sendPrivateMessage = () => {
    if (socket && message.trim() && toUser) {
      socket.emit("private message", {
        to: toUser,
        message: message.trim(),
        from: username,
      });
      setChatLog((prev) => [...prev, { from: username, message: message.trim() }]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 className="text-2xl font-bold text-center">Chat App using Socket.io</h1>
      <h2 className="font-bold p-4">Currently Online Users: {userCount}</h2>

      {!isRegistered ? (
        <div className="flex flex-col items-center justify-center">
          <input
            placeholder="Choose Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "8px", fontSize: "16px", marginRight: "8px" }}
            className="bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500"
          />
          <button 
            onClick={handleRegister} 
            disabled={!username.trim()}
            style={{ padding: "8px 16px", fontSize: "16px" }}
            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Register
          </button>
        </div>
      ) : (
        <div>
          <h3>Logged in as: {username}</h3>
          <p>Available users: {onlineUsers.length > 1 ? onlineUsers.filter(u => u !== username).join(", ") : "No other users online"}</p>

          <label style={{ display: "block", marginBottom: "8px" }}>
            Send To:
            <select
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              style={{ marginLeft: "8px", padding: "6px", fontSize: "16px" }}
            >
              <option value="">-- Select user --</option>
              {onlineUsers
                .filter((user) => user !== username)
                .map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
            </select>
          </label>

          <input
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ padding: "8px", fontSize: "16px", width: "300px", marginRight: "8px" }}
          />
          <button
            onClick={sendPrivateMessage}
            disabled={!toUser || !message.trim()}
            style={{ padding: "8px 16px", fontSize: "16px" }}
          >
            Send Private Message
          </button>

          <div style={{ marginTop: "20px" }}>
            <h4>Chat Log:</h4>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {chatLog.map((chat, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <b>{chat.from}</b>: {chat.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Socket;
