import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";

const ChatBox = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]); // Global messages
  const [privateMessages, setPrivateMessages] = useState({}); // {username: [messages]}
  const [currentMessage, setCurrentMessage] = useState("");
  const [username, setUsername] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState("global"); // 'global' or username

  console.log("ChatBox Socket: ", socket);

  const handleAccepted = useCallback(() => {
    console.log("Accepted the Request !!");
  }, []);

  const handleRecieveMessage = useCallback((message) => {
    if (message.recipient) {
      // Private message
      setPrivateMessages((prev) => ({
        ...prev,
        [message.author]: [...(prev[message.author] || []), message],
      }));
    } else {
      // Global message
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  }, []);

  useEffect(() => {
    const userName = sessionStorage.getItem("MainPlayer") || "Anonymous";
    setUsername(userName);
    socket.on("private:accepted", handleAccepted);
    socket.on("receive:message", handleRecieveMessage);

    return () => {
      socket.off("receive:message");
    };
  }, [socket, handleAccepted, handleRecieveMessage]);

  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        message: currentMessage,
        timestamp: new Date().toLocaleTimeString(),
        author: username,
        recipient: activeTab === "global" ? null : activeTab,
      };

      socket.emit("send:message", messageData);

      if (activeTab !== "global") {
        // Add to private messages
        setPrivateMessages((prev) => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), messageData],
        }));
      }

      setCurrentMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white text-lg font-bold px-4 py-3 border-b border-gray-700 flex justify-between">
        <span>Chat Box</span>
        <select
          className="bg-gray-700 text-white rounded-lg px-3 py-1 outline-none"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="global">Global Chat</option>

          {accepted && <option value="private">Private Chat</option>}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-900 p-4 overflow-y-auto space-y-6">
        {activeTab === "global"
          ? messages.map((msg, index) => (
              <div
                key={index}
                className={msg.author === username ? "text-right" : ""}
              >
                <p className="text-sm text-gray-400">{msg.author}</p>
                <div
                  className={`${
                    msg.author === username
                      ? "bg-blue-600 ml-auto"
                      : "bg-gray-800"
                  } text-white text-sm p-3 rounded-lg max-w-xs`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          : (privateMessages[activeTab] || []).map((msg, index) => (
              <div
                key={index}
                className={msg.author === username ? "text-right" : ""}
              >
                <p className="text-sm text-gray-400">{msg.author}</p>
                <div
                  className={`${
                    msg.author === username
                      ? "bg-blue-600 ml-auto"
                      : "bg-gray-800"
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
