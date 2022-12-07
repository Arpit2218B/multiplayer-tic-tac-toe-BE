const games = {};

const CREATED = 'CREATED'
const STARTED = 'STARTED'
const OVER = 'OVER'
const WINNER = 'WINNER'

const createNewGame = (name, roomName, password) => {
    if (games.hasOwnProperty(roomName))
        return 'Room name already exist'
    const newGame = {
        name: roomName,
        password: password,
        boardState: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        players: {
            [name]: {
                joined: true,
                ready: false,
                player: 0,
            }
        },
        gameState: 'CREATED',
        turn: null,
        messages: ['Welcome to the game']
    }
    games[roomName] = newGame;
    return newGame;
}

const getAllGames = () => {
    return games;
}

const checkAndJoinRoom = (name, roomName, password) => {
    if (!games.hasOwnProperty(roomName))
        return { checkAndJoinRoom: false, room: null }
    if (games[roomName].password !== password)
        return { checkAndJoinRoom: false, room: null }
    if (Object.keys(games[roomName].players).length === 2)
        return { checkAndJoinRoom: false, room: null }
    if (games[roomName].players.hasOwnProperty(name))
        return { checkAndJoinRoom: false, room: null }
    const playerTwo = {
        ready: false,
        joined: true,
        player: 1
    }
    games[roomName].players[name] = playerTwo;
    return { checkAndJoinRoom: true, room: games[roomName] };
}

const readyPlayer = (name, roomName) => {
    games[roomName].players[name].ready = true;
    const playerList = Object.keys(games[roomName].players);
    if (games[roomName].players[playerList[0]]?.ready &&
        games[roomName].players[playerList[1]]?.ready) {
        games[roomName].gameState = STARTED;
        games[roomName].turn = 0;
    }
    return games[roomName];
}

const updateBoard = (roomName, turn, position) => {
    games[roomName].boardState[position] = turn;
    // check for game over (draw, win) and update game state
    const verdict = checkWinner(games[roomName].boardState);
    console.log(verdict);
    if (verdict === 0 || verdict === 1)
        games[roomName].gameState = WINNER;
    else if (verdict === 'DRAW')
        games[roomName].gameState = OVER;
    else
        games[roomName].turn = (games[roomName].turn + 1) % 2;
    return games[roomName];
}

const addMessage = (roomName, message) => {
    games[roomName].messages.push(message);
    return games[roomName];
}

const checkWinner = (board) => {
    console.log(board);

    // rows
    if(board[0] == board[1] && board[1] === board[2] && board[0] !== 4) {
        return board[0];
    }

    if(board[3] == board[4] && board[4] === board[5] && board[3] !== 4) {
        return board[3];
    }

    if(board[6] == board[7] && board[7] === board[8] && board[6] !== 4) {
        return board[6];
    }

    // columns
    if(board[0] == board[3] && board[3] === board[6] && board[0] !== 4) {
        return board[0];
    }

    if(board[1] == board[4] && board[4] === board[7] && board[1] !== 4) {
        return board[1];
    }

    if(board[2] == board[6] && board[6] === board[8] && board[2] !== 4) {
        return board[0];
    }

    // Check diagonals
    if (board[0] === board[4] && board[4] === board[8] && board[0] !== 4) {
        return board[0];
    }
    if (board[2] === board[4] && board[4] === board[6] && board[2] !== 4) {
        return board[2];
    }

    if (!board.includes(4))
        return 'DRAW'

    return null;
}

module.exports = {
    createNewGame,
    getAllGames,
    checkAndJoinRoom,
    readyPlayer,
    updateBoard,
    addMessage,
}