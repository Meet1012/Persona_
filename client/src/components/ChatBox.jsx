import React, { useState, useEffect, useCallback, useRef } from "react";
import { closeSocket, getPlayerSocket } from "../scenes/getPlayerSocket";
import { Send, X, MessageCircle } from "lucide-react";

const ChatBox = () => {
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [globalmessages, setglobalMessages] = useState([]);
  const [privatemessages, setprivateMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [globalmessages, privatemessages, activeTab]);

  const handleReceiveMessage = useCallback((message) => {
    if (message.recipient === "private") {
      setprivateMessages((prev) => [...prev, message]);
    } else {
      setglobalMessages((prev) => [...prev, message]);
    }
  }, []);

  const handlePrivateAccepted = () => {
    if (!socket) return;
    setAccepted(true);
    socket.emit("join:room");
  };

  const handleLeave = useCallback(() => {
    setAccepted(false);
    setActiveTab("global");
  }, []);

  const handleRoomJoined = () => {
    if (!socket) return;
    socket.emit("private:message", "Welcome to the Private Room !!");
  };

  useEffect(() => {
    if (!socket) return;

    const userName = sessionStorage.getItem("MainPlayer") || "Anonymous";
    setUsername(userName);

    socket.on("receive:message", handleReceiveMessage);
    socket.on("private:accepted", handlePrivateAccepted);
    socket.on("room:joined", handleRoomJoined);
    socket.on("private:response", (message) =>
      console.log("Private Message:", message)
    );
    socket.on("remove:private", handleLeave);

    return () => {
      socket.off("receive:message");
      socket.off("private:accepted");
      socket.off("room:joined");
      socket.off("private:response");
      socket.off("remove:private");
    };
  }, [socket, handleReceiveMessage, handleLeave]);

  const sendMessage = () => {
    if (currentMessage.trim() === "") return;

    const messageData = {
      message: currentMessage,
      timestamp: new Date().toLocaleTimeString(),
      author: username,
      recipient: activeTab === "global" ? null : "private",
    };

    socket.emit("send:message", messageData);
    setCurrentMessage("");
  };

  useEffect(() => {
    const sock = getPlayerSocket();
    setSocket(sock);
    return () => {};
  }, []);

  return (
    <div
      className={`fixed right-0 top-0 h-screen flex flex-col transition-all duration-300 ${
        isOpen ? "w-96 bg-[#8E6BC5]" : "w-16"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-3 top-3 p-2 hover:bg-[#8E6BC5] rounded-full transition-colors"
      >
        {isOpen ? (
          <X size={24} className="text-[#D3C5E5]" />
        ) : (
          <MessageCircle size={24} className="text-[#D3C5E5]" />
        )}
      </button>

      {isOpen && (
        <div className="h-full flex flex-col pt-16">
          {/* Header */}
          <div className="px-4 py-3 mx-3 mb-4 bg-[#D3C5E5] rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2D1B4E]">Game Chat</h2>
              <select
                className="bg-[#735DA5] text-white px-3 py-1 rounded-md outline-none"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="global">Global</option>
                {accepted && <option value="private">Private</option>}
              </select>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-thin scrollbar-track-[#2D1B4E] scrollbar-thumb-[#D3C5E5] scrollbar-thumb-rounded-full scroll"
          >
            {activeTab === "global" &&
              globalmessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.author === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.author === username ? "bg-[#451f82]" : "bg-[#4A2B7F]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#D3C5E5]">
                      {msg.author}
                    </p>
                    <p className="text-white mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}

            {activeTab === "private" &&
              privatemessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.author === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.author === username ? "bg-[#6d3cbc]" : "bg-[#4A2B7F]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#D3C5E5]">
                      {msg.author}
                    </p>
                    <p className="text-white mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="sticky bottom-0 p-4 bg-[#735DA5] border-t border-[#8E6BC5]">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-[#4A2B7F] text-white px-4 py-2 rounded-lg outline-none placeholder:text-[#D3C5E5]/60"
                placeholder="Type a message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-[#D3C5E5] rounded-lg hover:bg-[#be9ce9] transition-colors"
              >
                <Send className="w-5 h-5 text-[#4A2B7F]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
