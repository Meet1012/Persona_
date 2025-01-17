import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { closeSocket, getPlayerSocket } from "../scenes/getPlayerSocket";

const ChatBox = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // Global messages
  const [currentMessage, setCurrentMessage] = useState("");
  const [username, setUsername] = useState("");

  const handleReceiveMessage = useCallback((message) => {
    console.log("Global Message Received:", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const userName = sessionStorage.getItem("MainPlayer") || "Anonymous";
    setUsername(userName);
    console.log("[ChatBox] Socket ID: ", socket.id);

    socket.on("receive:message", handleReceiveMessage);
    console.log("receive:message set")

    return () => {
      socket.off("receive:message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        message: currentMessage,
        timestamp: new Date().toLocaleTimeString(),
        author: username,
        recipient: null, // Always global
      };
      console.log("Send Message: ", messageData);

      socket.emit("send:message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const sock = getPlayerSocket();
    console.log("Socket created at chatbox")
    setSocket(sock);

    return () => {
      console.log("Closing Socket !!")
      closeSocket();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white text-lg font-bold px-4 py-3 border-b border-gray-700">
        <span>Global Chat</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-900 p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.author === username ? "text-right" : ""}
          >
            <p className="text-sm text-gray-400">{msg.author}</p>
            <div
              className={`${
                msg.author === username ? "bg-blue-600 ml-auto" : "bg-gray-800"
              } text-white text-sm p-3 rounded-lg max-w-xs`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="bg-gray-800 p-4 flex items-center gap-3 border-t border-gray-700">
        <input
          type="text"
          className="flex-1 bg-gray-700 text-white p-3 rounded-lg outline-none placeholder-gray-400"
          placeholder="Type your message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              sendMessage();
            } else if (e.key === "Escape") {
              e.target.blur();
            }
          }}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
