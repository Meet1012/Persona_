import { io } from "socket.io-client";

let socket = null;

export const getPlayerSocket = () => {
  if (!socket) {
    socket = io(`https://persona-zsjv.onrender.com`, {
      path: "/ws/",
    });
    // socket = io("http://localhost:8000", {
    //   path: "/ws/",
    // });
    console.log("New Socket---");
  }
  console.log("Reusing Socket---");
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
