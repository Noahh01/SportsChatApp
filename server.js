const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Global variables
const chatAppName = 'ChatAppBot';
const room_users= {'Basketball': [], 'Football': [], 'Soccer': [], 'Baseball': [], 'Hockey': []};

function getTimeStamp() {
    return moment().format('h:mm a');
}

//Gets a list of usernames in room
function getUsersInRoom(roomName) {
    const userObjs = room_users[roomName];
    const users = [];
    userObjs.forEach(user => {
        users.push(user.username);
    });
    return users;
}


//Removes userObj from room list
function removeUserFromRoom(socket_id) {
    for (const [roomName, users] of Object.entries(room_users)) {
        const index = users.findIndex(user => user.id === socket_id);
  
        if (index !== -1) {
            const userObj = room_users[roomName].splice(index, 1)[0];
            userObj.room = roomName;
            return userObj;
        }
    }
}


//Setting static folder
app.use(express.static(path.join(__dirname, 'client')));


io.on('connection', socket => {
    //Listens for new client connection
    socket.on('newConnection', (user, room) => {
        socket.join(room);
        room_users[room].push({'username': user, 'id': socket.id});

        io.emit('userListUpadate', getUsersInRoom(room));
        const time = getTimeStamp()
        socket.emit('message', 'Welcome to the sports chatApp!', chatAppName, time);
        socket.broadcast.to(room).emit('message', user + ' has joined the room!', chatAppName, time);
    });
    
    //Listens for user message
    socket.on('userMessage', (user, userMessage, room) => {
        io.to(room).emit('message', userMessage, user, getTimeStamp());
    });
    
    //Listen for client disconnect 
    socket.on('disconnect', () => {
        const userObj = removeUserFromRoom(socket.id);
        const room = userObj.room

        socket.broadcast.to(room).emit('message', userObj.username + ' has left the room!', chatAppName, getTimeStamp());
        socket.broadcast.to(room).emit('userListUpadate', getUsersInRoom(room));
    });
});


const PORT = 3000 || process.env.PORT;


server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});


