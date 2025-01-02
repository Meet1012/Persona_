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
    players[socket.id] = {
      id: socket.id,
      username: name,
      x: 100,
      y: 100,
      direction: "down",
    };
  });

  socket.on("main:player", () => {
    console.log("Main Player Socket", main_player);
    socket.emit("main:playerdone", { id: socket.id, name: main_player });
  });

  socket.on("current:players", () => {
    console.log("Current Players !", players);
    socket.emit("current:playersdone", {players, main_player});
  });

  socket.on("player:move", (position) => {
    if (players[socket.id]) {
      players[socket.id] = {
        id: socket.id,
        username: main_player,
        x: position.x,
        y: position.y,
        direction: position.direction,
      };
      console.log("Moved Player", players);
      socket.broadcast.emit("player:moved", players[socket.id]);
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
