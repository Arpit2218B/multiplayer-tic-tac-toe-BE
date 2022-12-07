const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const game = require('./game');

const app = express();
const server = http.Server(app);
const io = socketIO(server, { cors: {}});

app.use(cors);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('hello', (payload) => {
        console.log(`Hello from ${payload.name || 'Client'}`);
        io.emit('helloBack');
    });

    // create new room
    /*
        - create a new room object
        - join new room
        - send back join message
    */
    socket.on('createRoom', ({roomName, name, password}) => {
        try {
            const newRoom = game.createNewGame(name, roomName, password);
            socket.join(roomName);
            socket.emit('roomJoined', newRoom);
        }
        catch (err) {
            socket.emit('error', 'Error creating room. Please try again.');
        }
    });

    // join a room
    /*
        - check if 
            > room exists 
            > is password correct
            > has space
            > no other player with same name exists in the room
        - join room
        - send back join message
        - inform others that new player has joined
    */
    socket.on('joinRoom', ({roomName, name, password}) => {
        try {
            const { checkAndJoinRoom, room } = game.checkAndJoinRoom(name, roomName, password);
            if(!checkAndJoinRoom)
                socket.emit('error', 'Error joining room. Please check room name and password');
            socket.join(roomName);
            socket.broadcast.to(roomName).emit('roomUpdated', room);
            socket.emit('roomJoined', room);
        }
        catch (err) {
            socket.emit('error', 'Error joining room. Please check room name and password');
        }
    });

    // ready player
    socket.on('readyPlayer', ({roomName, name}) => {
        console.log(roomName, name)
        const newRoomState = game.readyPlayer(name, roomName);
        io.in(roomName).emit('roomUpdated', newRoomState);
    });

    // update board
    socket.on('updateBoard', ({roomName, turn, position}) => {
        const updatedBoard = game.updateBoard(roomName, turn, position);
        io.in(roomName).emit('roomUpdated', updatedBoard);
    });

    // send message
    socket.on('sendMessage', ({roomName, message}) => {
        const updatedBoard = game.addMessage(roomName, message);
        io.to(roomName).emit('roomUpdated', updatedBoard);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});