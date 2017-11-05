/**
 * fortnite-helper-bot
 * Token: xoxb-249002785873-1qrDiDgdxwLSNpiBJ08ezpl5
 * more information about additional params https://api.slack.com/methods/chat.postMessage
 */

var SlackBot = require("slackbots");

module.exports = function(weather) {
    const bot = new SlackBot({
        token: "xoxb-249002785873-1qrDiDgdxwLSNpiBJ08ezpl5",
        name: "fortnite-helper-bot"
    });

    bot.on("start", () => {
        var params = {
            icon_emoji: ":cat:"
        };

        // define channel, where bot exist. You can adjust it there https://my.slack.com/services
        // bot.postMessageToChannel("general", "meow!", params);

        // define existing username instead of 'user_name'
        bot.postMessageToUser("jinieren", "This is a test.", params);

        // If you add a 'slackbot' property,
        // you will post to another user's slackbot channel instead of a direct message
        // bot.postMessageToUser("user_name", "meow!", { slackbot: true, icon_emoji: ":cat:" });

        // define private group instead of 'private_group', where bot exist
        // bot.postMessageToGroup("private_group", "meow!", params);
    });
}
