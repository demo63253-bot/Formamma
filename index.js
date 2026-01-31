const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
const path = require('path');

let users = new Set();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', (socket) => {
    // Presence Logic
    users.add(socket.id);
    io.emit('presence', users.size);

    socket.on('join', (room) => socket.join(room));

    // Fast Message Transfer
    socket.on('msg', (data) => {
        socket.to(data.room).emit('msg', data);
    });

    // Typing Indicator
    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', data.isTyping);
    });

    // Read Receipt (Double Tick)
    socket.on('read', (room) => {
        socket.to(room).emit('read-update');
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('presence', users.size);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Engine Online: ${PORT}`));
