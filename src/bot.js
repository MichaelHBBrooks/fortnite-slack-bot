"use strict";
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
        if (typeof config.slack === "undefined") {
            throw "no 'slack' section defined in config file";
        } else if (typeof config.slack.recipients === "undefined") {
            throw "no recipients defined in config file";
        }

        const params = {
            as_user: true,
            attachments: attachments
        };
        let users = config.slack.recipients.users;
        if (typeof users !== "undefined") {
            for (let x = 0; x < users.length; x++) {
                this.bot.postMessageToUser(users[x], message, params);
            }
        }
        let channels = config.slack.recipients.channels;
        if (typeof channels !== "undefined") {
            for (let x = 0; x < channels.length; x++) {
                this.bot.postMessageToChannel(channels[x], message, params);
            }
        }
    }
};
