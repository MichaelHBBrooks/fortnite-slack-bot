const schedule = require("node-schedule");

const config = require("./config.json");
const secure = require("./secure.json");

const bot = require("./bot.js");
const fortnite = require("./fortnite.js");

const data = fortnite.requestData();
const filteredData = filterData(data);
const message = createSlackMessage(filteredData);
const attachments = createSlackAttachments(filteredData);
console.log("Message: " + message);
console.log("Attachments:");
console.log(attachments);

if (message !== "") {
	var fbot = new bot(config.slack.name, secure.slack.api_token, config.slack.channel);
	fbot.postMessage(message, attachments);
	console.log("message sent.");
}

function filterData(data) {
	if (data === null) {
		return {};
	}
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
	// console.log(JSON.stringify(data));
	return data;
}

function createSlackMessage(data) {
	if (data === {}) {
		return "";
	}
	return "*Fortnite Special Weather Alert*";
}

function createSlackAttachments(data) {
	if (data === {}) {
		return [];
	}
	const epochTime = Math.floor(new Date().getTime() / 1000);
	let attachments = [];
	data.alertRewards.forEach(area => {
		area.rewards.forEach(reward => {
			const expires = epochTime + area.expires * 60;
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
					epochTime +
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
