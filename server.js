const express = require('express');
const path = require('path');
const app = express();

const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);

const { joinUser, getCurrentUser, userLeave, getUsersInCurrentRoom } = require('./public/javascript/users');
const formatOutputMessage = require('./public/javascript/messageFormat'); 


// declare chatadmin
const chatAdmin = "Chat Admin";
/**
 * Initialize view PORT
 */
const PORT = 80 || process.env.PORT;

/**
 * Telling server to listen to PORT
 */
server.listen(process.env.PORT || 3000, () => console.log(`App is listening on port 3000`));
let usernameQueryParameter = '';
let roomQueryParameter = '';

/**
 * Telling app.js to get styles(static) from directory 'public'
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Set the view engine -> ejs
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine" , "ejs");

/**
 * Set the homepage route
 */
app.get('/', (req, res) => {
    // render the index.ejs page
    res.render('index');
});

/**
 * Set the chat-room route
 */
app.get('/chat', (req, res) => {
    // render the chat.ejs page
    res.render('chat');
    usernameQueryParameter = req.query.username;
    roomQueryParameter = req.query.room;
});

/**
 * Server side socket.io applications
 */
io.on('connection', (socket) => {
    // When a user has connected to a socket, log to console
    console.log(`${usernameQueryParameter} has joined the chat in ${roomQueryParameter}`);

    socket.on('join-room', ({ username, room }) => {
        const user = joinUser(socket.id, username, room);
        // Join the room
        socket.join(user.room);

        // Welcome the current user by the "chatrooms admin"
        socket.emit('message', formatOutputMessage(chatAdmin, `Welcome to Coffee Chats`));
        
        // Let other's in the room know that a new user has joined the chat
        socket.broadcast.to(user.room).emit('message', formatOutputMessage(chatAdmin, `${user.username} has joined the chat!`));
    
        // Send users and room info to client side js
        io.to(user.room).emit('users-in-room', {
            room: user.room,
            users: getUsersInCurrentRoom(user.room)
        });
    });

    // When a user sends a chat log to brower tools and log to console
    socket.on('chat-message', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatOutputMessage(user.username, msg));
    });


    /**
     * handle typing event
     */
    socket.on('typing', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('typing', `${user.username}`);
    });

    socket.on('not-typing', () => {
        
        socket.broadcast.emit('not-typing', ``);
    });

    // when a user has left the socket, display the callback
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        // If user exists then disconnect the user from the chat
        if (user) {
            console.log(user.username + " has left the chat");
            io.to(user.room).emit('message', formatOutputMessage(chatAdmin ,`${usernameQueryParameter} has left the chat`));
        }

        // update the users in the room after they leave
        io.to(user.room).emit('users-in-room', {
            room: user.room,
            users: getUsersInCurrentRoom(user.room)
        });
    });
});
