//  Standard packages.
const schedule = require("node-schedule");
//  Custom packages.
const bot = require("./bot.js");
const fortnite = require("./fortnite.js");
//  Configuration files.
const config = require("./config.json");
const secure = require("./secure.json");

main();

function main() {
    let fbot = new bot(config.slack.name, secure.slack.api_token, config.slack.channel);
    let oldFilteredData = null;

    let scheduledJob = schedule.scheduleJob("0 0 * * * *", () => {
        fortnite
            .requestData()
            .then(data => {
                let filteredData = filterData(data);

                if (!isWeatherTheSame(oldFilteredData, filteredData)) {
                    oldFilteredData = JSON.parse(JSON.stringify(filteredData));
                    reportAllData(fbot, filteredData);
                }else{
                    console.log("Nothing new to report");
                }
            })
            .catch(reason => {
                console.log("Unable to resolve weather: " + reason);
            });
    });
}

function isWeatherTheSame(oldData, newData) {
    if (oldData === null) {
        return false;
    }

    for (let x = 0; x < oldData.alertRewards.length; x++) {
        const oldArea = oldData.alertRewards[x];
        const newArea = newData.alertRewards[x];
        if (JSON.stringify(oldArea.rewards) !== JSON.stringify(newArea.rewards)) {
            return false;
        }
    }
    return true;
}

function reportAllData(fortniteBot, data) {
    if (data.alertRewards.length === 0) {
        console.log("Nothing to report.");
        return;
    }
    const message = createSlackMessage(data);
    const attachments = createSlackAttachments(data);
    console.log("Message: " + message);
    console.log("Attachments:");
    console.log(attachments);

    if (message !== "") {
        fortniteBot.postMessage(message, attachments);
        console.log("Message sent to Slack.");
    }
}

function filterData(data) {
    if (data === null) {
        return {};
    }
    console.log(JSON.stringify(data));
    data.alertRewards.forEach(area => {
        area.rewards = area.rewards.filter(reward => {
            if (reward.reward.indexOf("vBucks") !== -1) {
                return true;
            } else if (reward.reward.indexOf("(Epic)") !== -1) {
                return true;
            } else if (reward.reward.indexOf("(Legendary)") !== -1) {
                return true;
            }
            return false;
        });
    });
    data.alertRewards = data.alertRewards.filter(area => {
        return area.rewards.length !== 0;
    });
    return data;
}

function createSlackMessage(data) {
    if (data === {}) {
        return "";
    }
    return "*Special Weather Alert*";
}

function createSlackAttachments(data) {
    if (data === {}) {
        return [];
    }
    const epochTime = Math.floor(new Date().getTime() / 1000);
    let attachments = [];
    data.alertRewards.forEach(area => {
        area.rewards.forEach(reward => {
            const expires = Math.floor(data.created / 1000) + area.expires * 60;
            console.log("Area: " + area.name);
            console.log("  Created: " + data.created);
            console.log("  Expires in: " + area.expires + " minutes");
            console.log("  Expires at: " + expires);
            const color =
                config.fortnite.colors[
                    reward.rarity.length !== 0 ? reward.rarity.toLowerCase() : "vbucks"
                ];

            attachments.push({
                text:
                    area.name +
                    " (" +
                    reward.level +
                    ")" +
                    " - " +
                    reward.reward +
                    " - Expires <!date^" +
                    expires +
                    "^at {time}|in " +
                    area.expires +
                    " minutes>",
                color: color
            });
        });
    });
    return attachments;
}

function analyzeData(data) {
    if (data === null) {
        return "";
    }
    let message = "";
    data.alertRewards.forEach(area => {
        area.rewards.forEach(reward => {
            if (reward.reward.indexOf("vBucks") !== -1) {
                message +=
                    area.name +
                    " (" +
                    reward.level +
                    ")" +
                    " - " +
                    reward.reward +
                    " - Expires in " +
                    area.expires +
                    " minutes\n";
            } else if (reward.reward.indexOf("(Epic)") !== -1) {
                message +=
                    area.name +
                    " (" +
                    reward.level +
                    ")" +
                    " - " +
                    reward.reward +
                    " - Expires in " +
                    area.expires +
                    " minutes\n";
            } else if (reward.reward.indexOf("(Legendary)") !== -1) {
                message +=
                    area.name +
                    " (" +
                    reward.level +
                    ")" +
                    " - " +
                    reward.reward +
                    " - Expires in " +
                    area.expires +
                    " minutes\n";
            }
        });
    });
    // console.log(message.trim());
    return message.trim();
}
