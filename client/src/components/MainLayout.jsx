import React, { useState } from "react";
import PhaserGame from "./PhaserConfig";
import ChatBox from "./ChatBox";
import WebRTC from "./WebRTC";
import SideBar from "./SideBar";

const MainLayout = () => {
  return (
    <div>
      <WebRTC />
      <SideBar />
      <PhaserGame />
      <ChatBox />
    </div>
  );
};

export default MainLayout;
