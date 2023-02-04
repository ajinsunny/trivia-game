const players = [];

//Add a new player to the game
const addPlayer = ({ id, playerName, room }) => {
  if (!playerName || !room) {
    return {
      error: new Error("Please enter a player name "),
    };
  }

  playerName = playerName.trim().toLowerCase();
  room = room.trim().toLocaleLowerCase();

  const existingPlayer = players.find((player) => {
    return player.room === room && player.playerName === playerName;
  });

  if (existingPlayer) {
    return {
      error: new Error("Player name is already in use"),
    };
  }

  const newPlayer = { id, playerName, room };
  players.push(newPlayer);

  return { newPlayer };
};

//Get Player by id
const getPlayer = (id) => {
  const player = player.find((player) => player.id === id);

  if (!player) {
    return {
      error: new Error("Player not found!"),
    };
  }
  return { player };
};

// Get all the players in the room

const getAllPlayers = (room) => {
  return players.filter((player) => player.room === room);
};

//Remove a player by id
const removePlayer = (id) => {
  return players.find((player, index) => {
    if (player.id === id) {
      return players.splice(index, 1)[0];
    }
    return false;
  });
};

module.exports = {
  addPlayer,
  getPlayer,
  getAllPlayers,
  removePlayer,
};
