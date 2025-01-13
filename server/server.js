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
    console.log("Player Confirmation ", !players[name]);
    if (!players[name]) {
      players[name] = {
        socketId: socket.id,
        x: 100,
        y: 100,
        direction: "down",
      };
      socket.broadcast.emit("new:player", [players[name], name]);
    }
  });
  console.log("Server Players: ", players);
  io.to(socket.id).emit("current:players", players);

  socket.on("player:move", (position) => {
    if (players[position.name]) {
      players[position.name] = {
        socketId: socket.id,
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

  // Handle interaction request
  socket.on("interact:request", ({ from, to }) => {
    console.log(`Interaction request from ${from} to ${to}`);
    console.log(`Players: `, players);
    const recipient = Object.values(players).find(
      (player) => player.socketId === players[to]?.socketId
    );
    if (recipient) {
      io.to(recipient.socketId).emit("interaction:request", { from });
    } else {
      console.log(`Player ${to} not found or disconnected.`);
    }
  });

  // Handle interaction response
  socket.on("interact:response", ({ accepted, from, to }) => {
    console.log(
      `Interaction response: ${
        accepted ? "Accepted" : "Rejected"
      } by ${to} for ${from}`
    );
    const requester = Object.values(players).find(
      (player) => player.socketId === players[from]?.socketId
    );
    let toUser = players[to].socketId;
    console.log("To User: ", toUser);
    if (requester) {
      io.to(requester.socketId).emit("interaction:response", {
        fromSocket: players[from].socketId,
        toSocket: toUser,
        from: to,
        accepted,
      });
    } else {
      console.log(`Player ${from} not found or disconnected.`);
    }
  });

  socket.on("new:private", ({ fromSocket, toSocket }) => {
    console.log(`From Socket: ${fromSocket}, To Socket: ${toSocket}`);
    io.to(fromSocket).emit("private:accepted");
    io.to(toSocket).emit("private:accepted");
    console.log("Emit Completed !")
  });

  socket.on("send:message", (messageData) => {
    let message = { ...messageData };
    console.log("Message Sent !!", message);
    io.emit("receive:message", message);
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
