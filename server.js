const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Store rooms and their hosts
const rooms = {}; // { roomCode: { hostId: socket.id, players: { socketId: { color: 'red', name: 'Player 1' } } } }

function generateRoomCode() {
    let code;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms[code]);
    return code;
}

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3'];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // HOST ACTIONS
    socket.on('create_room', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            hostId: socket.id,
            players: {}
        };
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    // CONTROLLER ACTIONS
    socket.on('join_room', (roomCode, playerName) => {
        if (rooms[roomCode]) {
            socket.join(roomCode);
            const playerColor = colors[Object.keys(rooms[roomCode].players).length % colors.length];
            
            const playerInfo = {
                id: socket.id,
                name: playerName || `Player ${Object.keys(rooms[roomCode].players).length + 1}`,
                color: playerColor
            };
            
            rooms[roomCode].players[socket.id] = playerInfo;
            
            // Tell the controller they joined successfully
            socket.emit('joined_room', playerInfo);
            
            // Tell the host a new player joined
            io.to(rooms[roomCode].hostId).emit('player_joined', playerInfo);
            
            console.log(`${socket.id} joined room ${roomCode}`);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('player_action', (data) => {
        // data: { roomCode, action: 'up'/'down'/'left'/'right'/'buttonA' }
        if (rooms[data.roomCode]) {
            io.to(rooms[data.roomCode].hostId).emit('player_action', {
                playerId: socket.id,
                action: data.action
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find if they were a host or a player
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            
            if (room.hostId === socket.id) {
                // Host disconnected, close the room
                io.to(roomCode).emit('host_disconnected');
                delete rooms[roomCode];
                break;
            } else if (room.players[socket.id]) {
                // Player disconnected
                delete room.players[socket.id];
                io.to(room.hostId).emit('player_disconnected', socket.id);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
