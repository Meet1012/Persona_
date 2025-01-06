import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const players = {};
let main_player = "";

io.on("connection", (socket) => {
  socket.on("user:joined", (name) => {
    console.log(`${name} Connected`);
    main_player = name;
    players[name] = {
      x: 100,
      y: 100,
      direction: "down",
    };
  });
  console.log("Server Players: ", players);
  io.emit("current:players", players);

  socket.on("player:move", (position) => {
    if (players[position.name]) {
      players[position.name] = {
        x: position.x,
        y: position.y,
        direction: position.direction,
      };
      // console.log("Moved Player", players);
      // console.log("Moved Player Name: ", position.name);
      socket.broadcast.emit("player:moved", {
        playerMoved: players[position.name],
        playerName: position.name,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`${main_player} Disconnected !`);
    delete players[socket.id];
    socket.broadcast.emit("player:disconnected", socket.id);
  });
});

server.listen(8000, () => {
  console.log("Server Running on port 8000 !");
});
