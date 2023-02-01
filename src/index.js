//Create an express server
const express = require("express");
const app = express();

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
io.on("connection", () => {
  console.log("Just connected");
});

//Respond by logging that the server is listenfing to which port.
server.listen(port, () => {
  console.log(`Server is on port ${port}.`);
});
