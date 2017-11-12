const http = require("http");
const fs = require("fs");
const cheerio = require("cheerio");

var gatherWeather = () => {
	let options = {
		host: "www.google.com",
		port: 80,
		path: "/index.html"
	};

	http
		.get(options, res => {
			console.log("Got response: " + res.statusCode);
			res.on("data", chunk => {
				console.log("BODY: " + chunk);
			});
		})
		.on("error", e => {
			console.log("Got error: " + e.message);
		});
};

function getData() {
	// let html = cheerio.load(fs.readFileSync("./mock/test1.html", "utf-8"));
	let html = cheerio.load(fs.readFileSync("./mock/test-vbuck-epic.html", "utf-8"));
	let alerts = html("div[class=alerts-row]");
	// let x = html().find("div[class=row][class=alerts]").length;
	let alertRewards = [];
	html(alerts)
		.find("div[class='alert-post']")
		.each((x, alertNode) => {
			//  Get the area (eg. Stonewood, Plankerton, Canny Valley, Twine Peaks)
			const area = html("h2", alertNode).text();

			//  Get the expiration.
			const expiresText = html("p", alertNode).text();
			let matches = expiresText.match(/Expire in (\d+)h (\d+)m/);
			let expiresMinutes = parseInt(matches[1], 10) * 60 + parseInt(matches[2]);

			//  Find the rewards for the area.
			let areaRewards = [];
			html("tr", alertNode).each((y, rewardNode) => {
				const level = html(rewardNode)
					.children()
					.first()
					.contents()
					.first()
					.text()
					.trim();
				if (level === "") {
					return false;
				}
				const reward = html(rewardNode)
					.children()
					.first()
					.next()
					.text()
					.trim();
				const rarityMatch = reward.match(/\((Common|Uncommon|Rare|Epic|Legendary+)\)/);
				const rarity = rarityMatch === null ? "" : rarityMatch[1];
				areaRewards.push({
					level: level,
					reward: reward,
					rarity: rarity
				});
			});

			alertRewards.push({
				name: area,
				expires: expiresMinutes,
				rewards: areaRewards
			});
		});
	return { alertRewards: alertRewards };
}

exports.requestData = () => {
	try {
		let data = getData();
		return data;
	} catch (e) {
		console.log("An error has occurred.");
		console.log(e);
		return null;
	}
};
