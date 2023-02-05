const players = [];

const addPlayer = ({ id, playerName, room }) => {
  playerName = playerName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!playerName || !room) {
    return {
      error: new Error("Please enter a player name and room!"),
    };
  }

  const existingPlayer = players.find((player) => {
    return player.room === room && player.playerName === playerName;
  });

  if (existingPlayer) {
    return {
      error: new Error("Player name is in use!"),
    };
  }

  const newPlayer = { id, playerName, room };
  players.push(newPlayer);

  return { newPlayer };
};

const getPlayer = (id) => {
  const player = players.find((player) => player.id === id);

  if (!player) {
    return {
      error: new Error("Player not found!"),
    };
  }

  return { player };
};

const getAllPlayers = (room) => {
  return players.filter((player) => player.room === room);
};

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
