const form = document.getElementById('chat-form');
const chatBox = document.querySelector('.chat-box');
const socket = io();

//Get query String (username and room)
const {user, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});


//Dynamically adds html (room name and user name to list)
setRoomName(room);


//Emits to sever when new connection occurs 
socket.emit('newConnection', user, room);


//Listens for new message sent to room
socket.on('message', (message, user, timeStamp) => {
    outputMessage(message, user, timeStamp);
    chatBox.scrollTop = chatBox.scrollHeight;
});


//Listens for update user list from sever
socket.on('userListUpadate', newUsersList => {
    updateUserList(newUsersList);
});


//Handles user sending a message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('user-message');
    const userMessage = messageInput.value;
    messageInput.value = '';
    socket.emit('userMessage', user, userMessage, room);
});


//Dynamically sets room name based on query string
function setRoomName(room) {
    const roomName = document.getElementById('room-name');
    roomName.innerHTML = room;
}


//Adds the user name to the list of users in the room
function updateUserList(usersList) {
    const listOfUsers = document.getElementById('list-of-users');
    listOfUsers.innerHTML = '';
    usersList.forEach(username => {
        const li = document.createElement('li');
        li.innerHTML = username;
        listOfUsers.appendChild(li);
    });
}


//Creates html for message
function outputMessage(message, username, timeStamp) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    const html = "<p class=sender>" + username + " <span>" + timeStamp + "</span></p><p>" + message + "</p>";
    messageDiv.innerHTML = html;
    chatBox.appendChild(messageDiv);

}




