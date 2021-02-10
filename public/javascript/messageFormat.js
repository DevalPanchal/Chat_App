const moment = require('moment');

function formatOutputMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatOutputMessage;