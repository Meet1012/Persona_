import React, { createContext, useContext, useEffect, useState } from "react";
import { getPlayerSocket, closeSocket } from "../scenes/getPlayerSocket";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = null;
    // console.log("Socket created in socket provider")
    setSocket(socketInstance);

    return () => {
      // closeSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
