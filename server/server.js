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

io.on("connection", (socket) => {
  socket.on("user:joined", (name) => {
    console.log(`${name} Connected`);
    console.log("Player Confirmation ", !players[socket.id]);
    io.to(socket.id).emit("current:players", players);
    if (!players[socket.id]) {
      players[socket.id] = {
        username: name,
        x: 100,
        y: 100,
        direction: "down",
      };
      socket.broadcast.emit("new:player", [players[socket.id], name]);
    }
  });
  console.log("Server Players: ", players);

  socket.on("player:move", (position) => {
    if (players[position.socketID]) {
      players[position.socketID] = {
        username: position.username,
        x: position.x,
        y: position.y,
        direction: position.direction,
      };
      // console.log("Moved Player", players);
      // console.log("Moved Player Name: ", position.name);
      socket.broadcast.emit("player:moved", {
        playerMoved: players[position.socketID],
        playerName: position.username,
      });
    }
  });

  socket.on("player:left", () => {
    socket.emit("remove:private");
  });

  // Handle interaction request
  socket.on("interact:request", ({ from, to }) => {
    console.log(`Interaction request from ${from} to ${to}`);
    console.log(`Players: `, players);

    // Find the socketId of the recipient (to)
    const recipientSocketId = Object.keys(players).find(
      (socketId) => players[socketId]?.username === to
    );

    if (recipientSocketId) {
      // Emit the interaction request to the recipient
      io.to(recipientSocketId).emit("interaction:request", { from });
    } else {
      console.log(`Player ${to} not found or disconnected.`);
    }
  });

  // Handle interaction response
  socket.on("interact:response", ({ accepted, from, to }) => {
    // console.log(
    //   `Interaction response: ${
    //     accepted ? "Accepted" : "Rejected"
    //   } by ${to} for ${from}`
    // );

    // Find the socketId of the requester (from)
    const requesterSocketId = Object.keys(players).find(
      (socketId) => players[socketId]?.username === from
    );

    // Find the socketId of the recipient (to)
    const recipientSocketId = Object.keys(players).find(
      (socketId) => players[socketId]?.username === to
    );

    if (requesterSocketId) {
      io.to(requesterSocketId).emit("interaction:response", {
        fromSocket: requesterSocketId,
        toSocket: recipientSocketId,
        from: to,
        accepted,
      });
    } else {
      console.log(`Player ${from} not found or disconnected.`);
    }
  });

  socket.on("new:private", ({ fromSocket, toSocket }) => {
    // console.log(
    //   ` NEW Private From Socket: ${fromSocket}, To Socket: ${toSocket}`
    // );
    io.to(fromSocket).emit("private:accepted", { to: toSocket, flag: true });
    io.to(toSocket).emit("private:accepted", { to: fromSocket, flag: false });
  });

  socket.on("send:message", (messageData) => {
    let message = { ...messageData };
    console.log("Message Sent !!", message);
    io.emit("receive:message", message);
  });

  socket.on("ice:candidate", ({ candidate, to }) => {
    console.log(`Received ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit("ice:candidate", { candidate, from: socket.id });
  });

  socket.on("created:offer", ({ offer, to }) => {
    console.log(`Received offer from ${socket.id} to ${to}`);
    console.log("Offer Generated is: ", { offer });
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("created:answer", ({ answer, to }) => {
    console.log(`Received answer from ${socket.id} to ${to}`);
    console.log("Answer Generated is: ", { answer });
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("Disconnect in Server! ");
    if (players[socket.id]) {
      io.emit("player:disconnected", players[socket.id].username);
    }
    delete players[socket.id];
    socket.disconnect(true);
  });
});

server.listen(8000, () => {
  console.log("Server Running on port 8000 !");
});
