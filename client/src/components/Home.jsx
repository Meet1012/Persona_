import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

function NamePage() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const handleClick = useCallback((e) => {
    e.preventDefault();
    socket.emit("user:joined", name)
    navigate("/game");
  });

  useEffect(() => {
    socket.on("user:joined", handleClick);
    return () =>{
        socket.off("user:joined", handleClick)
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Welcome! Please Enter Your Name
        </h1>
        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button onClick={handleClick} className="w-full py-3 bg-blue-600 text-white rounded-md shadow-lg transform transition-all duration-300 hover:bg-blue-700 hover:scale-105">
          Join Game
        </button>
      </div>
    </div>
  );
}

export default NamePage;
