// Client side socket io applications //
// initializing variable socket and storing function io() invokes the socket to respond
const socket = io();

// Get the elements 
const chat_form = document.getElementById('chat-form');
const chat_messages = document.getElementById('chat-messages');
const room_name = document.getElementById('room-name');
const userListItem = document.getElementById('users');
const typingStatus = document.getElementById('type-status');
const messageInputBox = document.getElementById('message');
let timer, timeout = 3000;


// Declaring the query parameter's
let username = getUrlParameter('username');
let room = getUrlParameter('room');

/**
 * Let user join a room
 */
socket.emit('join-room', { username, room });

/**
 * user's in specific room
 */
socket.on('users-in-room', ({ room, users }) => {
    outputCurrentRoomName(room);
    outputCurrentUsers(users);
})

/**
 *   Handle message output to front end
 **/
socket.on('message', (message) => {
    console.log(message);
    displayMessage(message);
});

/**
 * Output user is typing message on DOM
 */
socket.on('typing', () => {
    typingStatus.innerText = `${username} is typing...`;
});
socket.on('not-typing', () => {
    typingStatus.innerText = ``;
})

/**
 * Adding event listener to the send button on chat.ejs to handle messages
 */
chat_form.addEventListener('submit', (e) => {
    e.preventDefault();

    // get message 
    const message = e.target.elements.message.value;

    // Emit the message to the server
    socket.emit('chat-message', message);

    // set the input field to empty value and have the focus on the input field
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
});

/**
 * Output message to DOM
 */
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-added');
    messageDiv.innerHTML = `<p class="message-info">${message.username} <span class="message-time">${message.time}</span></p><p>${message.text}</p>`;
    
    document.getElementById('chat-messages').appendChild(messageDiv);
}

/**
 * Get url query parameters
 */
function getUrlParameter(parameter_name) {
    parameter_name = parameter_name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + parameter_name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Output the current room name to DOM
 */
function outputCurrentRoomName(room) {
    room_name.innerText = room;
}

/**
 * Output the current user names to DOM
 */
function outputCurrentUsers(users) {
    userListItem.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

/**
 * Add event listener to message input when the user is typing
 */

messageInputBox.addEventListener('keypress', (e) => {
    window.clearTimeout(timer);
    socket.emit('typing', messageInputBox.value);
});

/**
 * Add event listener to message input when user is not typing
 */
messageInputBox.addEventListener('keyup', (e) => {
    window.clearTimeout(timer);
    
    timer = window.setTimeout(() => {
        socket.emit('not-typing', '');
    }, timeout);
});