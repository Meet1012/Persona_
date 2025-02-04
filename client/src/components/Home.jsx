import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();

      sessionStorage.setItem("MainPlayer", name);
      navigate("/game");
    },
    [name, navigate]
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-black flex flex-col justify-between ">
      {/* Header with Logo and Sign In Button */}
      <header className="flex justify-between items-center p-4">
        <img src="../src/assets/logo/Logo.png" alt="Logo" className="w-24 h-16" />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transform hover:scale-105 transition duration-300">
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow space-y-6 px-6">
        <h1 className="text-4xl font-extrabold text-[#F801C1] text-center tracking-wider font-retro">
          Welcome to Persona !
        </h1>
        <p className="text-xl text-[#8B7BE6] text-center max-w-md font-retro">
          Join the adventure, create new connections, and embark on an exciting journey. Enter your name and let’s get started!
        </p>
        
        {/* Input Field */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full max-w-sm p-4 mt-4 border-2 border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-500"
        />

        {/* Join Button */}
        <button
          onClick={handleClick}
          className="w-full max-w-sm bg-blue-600 text-white py-3 mt-6 rounded-md text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition duration-300"
        >
          Join Game
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 text-sm font-retro mb-0">
        © 2025 Persona - All Rights Reserved
      </footer>
    </div>
  );
}

export default NamePage;
