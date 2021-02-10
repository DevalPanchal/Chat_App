const users = [];

function joinUser(id, username, room) {
    const user = { id, username, room };

    users.push(user);

    return user;
}

// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// get the users in the room
function getUsersInCurrentRoom(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    joinUser,
    getCurrentUser,
    userLeave,
    getUsersInCurrentRoom
}