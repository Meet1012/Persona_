import React, { useState } from "react";
import PhaserGame from "./PhaserConfig";
import ChatBox from "./ChatBox";
import WebRTC from "./WebRTC";
import {
  Send,
  Mic,
  Video as VideoIcon,
  VideoOff,
  Maximize2,
  UserCircle2,
} from "lucide-react";

const MainLayout = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Hey everyone! 👋" },
    { id: 2, user: "Bob", text: "Welcome to the space!" },
    { id: 3, user: "Charlie", text: "This is awesome!" },
  ]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, user: "You", text: message },
      ]);
      setMessage("");
    }
  };
  return (
    <div>
      {/* Left Side - Video Feeds */}
      <WebRTC />
      <div className="flex">
        <PhaserGame />
        <div className="w-1/3 bg-gray-900 absolute right-0 top-0 h-screen">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
