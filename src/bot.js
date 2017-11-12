/**
 * fortnite-helper-bot
 * more information about additional params https://api.slack.com/methods/chat.postMessage
 */

const config = require("./config.json");

var SlackBot = require("slackbots");

// module.exports = function(message, attachments) {
//     const bot = new SlackBot({
//         token: config.slack.api_token,
//         name: config.slack.name
//     });

//     const epochTime = Math.floor(new Date().getTime() / 1000);
//     const params = {
//         as_user: true,
//         attachments: attachments
//     };
//     bot.postMessageToUser("jinieren", "*This only a test.*\n" + message, params);
//     // bot.postMessageToChannel(
//     //     "fortnite",
//     //     "*This only a test.*\n" + message,
//     //     params
//     // );
// };

module.exports = class FortniteBot {
    constructor(name, token, channel) {
        this.name = name;
        this.token = token;
        this.channel = channel;
        this.bot = new SlackBot({
            token: token,
            name: name
        });
    }

    postMessage(message, attachments) {
        const params = {
            as_user: true,
            attachments: attachments
        };
        this.bot.postMessageToUser("jinieren", message, params);
    }
}
