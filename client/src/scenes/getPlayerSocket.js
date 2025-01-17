import { io } from "socket.io-client";

let socket = null;

export const getPlayerSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000"); // Replace with your server URL
    console.log("New Socket---")
  }
  console.log("Reusing Socket---")
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
