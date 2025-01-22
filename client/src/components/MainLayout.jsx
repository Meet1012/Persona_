import React, { useEffect, useState } from "react";
import PhaserGame from "./PhaserConfig";
import ChatBox from "./ChatBox";
import WebRTC from "./WebRTC";

const MainLayout = () => {
  return (
    <>
      <PhaserGame />
      <div className="w-1/3 bg-gray-900 absolute right-0 top-0 h-screen">
        <ChatBox />
      </div>
      <WebRTC />
    </>
  );
};

export default MainLayout;
