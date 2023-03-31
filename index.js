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

const { setGame } = require("./utils/game.js");

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

  socket.on("sendMessage", (message, callback) => {
    const { error, player } = getPlayer(socket.id);

    if (error) return callback(error.message);

    if (player) {
      io.to(player.room).emit(
        "message",
        formatMessage(player.playerName, message)
      );
      callback(); // invoke the callback to trigger event acknowledgment
    }
  });
  socket.on("getQuestion", (data, callback) => {
    const { error, player } = getPlayer(socket.id);

    if (error) return callback(error.message);

    if (player) {
      // Pass in a callback function to handle the promise that's returned from the API call
      setGame((game) => {
        // Emit the "question" event to all players in the room
        io.to(player.room).emit("question", {
          playerName: player.playerName,
          ...game.prompt,
        });
      });
    }
  });
  const { setGame, setGameStatus } = require("./utils/game.js");

  socket.on("sendAnswer", (answer, callback) => {
    const { error, player } = getPlayer(socket.id);

    if (error) return callback(error.message);

    if (player) {
      const { isRoundOver } = setGameStatus({
        event: "sendAnswer",
        playerId: player.id,
        room: player.room,
      });

      // Since we want to show the player's submission to the rest of the players,
      // we have to emit an event (`answer`) to all the players in the room along
      // with the player's answer and `isRoundOver`.
      io.to(player.room).emit("answer", {
        ...formatMessage(player.playerName, answer),
        isRoundOver,
      });

      callback();
    }
  });
});

//Respond by logging that the server is listenfing to which port.
server.listen(port, () => {
  console.log(`Server is on port ${port}.`);
});
