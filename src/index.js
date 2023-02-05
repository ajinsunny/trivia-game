//Create an express server
const express = require("express");
const app = express();

const formatMessage = require("./utils/formatMessage.js");

const {
  addPlayer,
  getPlayer,
  getAllPlayers,
  removePlayer,
} = require("./utils/players.js");

//Connect the socket.io to Express server
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app); // create the HTTP sever using the Expres app created.
const io = socketio(server); //connect socketio to http server

const path = require("path");

// Define port
const port = process.env.PORT || 8080;

//Set up the public directory path for the server to access files.
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

//listen to the new connections from the socketio
io.on("connection", (socket) => {
  console.log("A new player just connected");

  socket.on("join", ({ playerName, room }, callback) => {
    const { error, newPlayer } = addPlayer({ id: socket.id, playerName, room });

    if (error) return callback(error.message);
    callback();

    socket.join(newPlayer.room);

    socket.emit("message", formatMessage("Admin", "Welcome!"));

    socket.broadcast
      .to(newPlayer.room)
      .emit(
        "message",
        formatMessage("Admin", `${newPlayer.playerName} has joined the game!`)
      );

    io.in(newPlayer.room).emit("room", {
      room: newPlayer.room,
      players: getAllPlayers(newPlayer.room),
    });
  });
socket.on("disconnect", () => {
  console.log("A player is disconnected.");

  const disconnectedPlayer = removePlayer(socket.id);

  if (disconnectedPlayer) {
    const { playerName, room } = disconnectedPlayer;
    io.in(room).emit(
      "message",
      formatMessage("Admin", `${playerName} has left!`)
    );

    io.in(room).emit("room", {
      room,
      players: getAllPlayers(room),
    });
  }
});

});

//Respond by logging that the server is listenfing to which port.
server.listen(port, () => {
  console.log(`Server is on port ${port}.`);
});
