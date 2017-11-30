const http = require("http");
const fs = require("fs");
const cheerio = require("cheerio");

function gatherWeather() {
    // return new Promise((resolve, reject) => {
    // 	const fileName = "./mock/test1.html";
    // 	// const fileName = "./log.html";
    // 	fs.readFile(fileName, "utf-8", (err, data) => {
    // 		if (err) {
    // 			return reject(err);
    // 		} else {
    // 			resolve(data);
    // 		}
    // 	});
    // });

    return new Promise((resolve, reject) => {
        const options = {
            host: "www.stormshield.one",
            port: 80,
            path: "/fortnite/index.html"
        };

        http
            .get(options, res => {
                let data = "";
                if (res.statusCode !== 200) {
                    reject("Server unresponsive");
                }
                res.on("data", chunk => {
                    // let html = cheerio.load(chunk);
                    // // let html = cheerio.load(fs.readFileSync("./mock/test-vbuck-epic.html", "utf-8"));
                    // if (html("div[class=alerts-row]").html() !== null) {
                    // 	console.log("Alerts found.");
                    // 	resolve(chunk);
                    // } else {
                    // 	console.log("Alerts not found.");
                    // }
                    data += chunk;
                });
                setTimeout(() => {
                    resolve(data);
                }, 5000);
            })
            .on("error", e => {
                return reject(e);
            });
    });
}

function getData() {
    return new Promise((resolve, reject) => {
        gatherWeather()
            .then(html => {
                console.log("gatherWeather() executed successfully!");
                // fs.writeFile("./log.html", html, err => {
                //     if (err) {
                //         console.log("Error writing file: " + err);
                //     }
                // });
                const x = parseData(html);
                resolve(x);
            })
            .catch(reason => {
                console.log("Unable to resolve weather: " + reason);
            });
    });
}

function parseData(htmlData) {
    if (typeof htmlData !== "string") {
        throw "HTML data is wrong type";
    } else if (htmlData === "") {
        throw "HTML data is blank";
    }

    let html = cheerio.load(htmlData);

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
            const matches = expiresText.match(/Expire in(\n| )(.+)/);
            let expiresMinutes;
            try {
                expiresMinutes = parseTimeText(matches[2]);
            } catch (e) {
                throw e;
            }

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
                //  On Storm Shield One, the storm mutations are listed in the area reward section,
                //  but they have no associated level. Omit these rows from the search.
                if (level === "") {
                    return false;
                }
                const reward = html(rewardNode)
                    .children()
                    .first()
                    .next()
                    .text()
                    .trim();
                //  Find the rarity.
                const rarityMatch = reward.match(/\((Common|Uncommon|Rare|Epic|Legendary+)\)/);
                const rarity = rarityMatch === null ? "" : rarityMatch[1];
                //  Find the amount. 1 if it's not listed.
                const amountMatch = reward.match(/\(x(\d+)\)/);
                const amount = amountMatch === null ? 1 : amountMatch[1];

                areaRewards.push({
                    level: level,
                    reward: reward,
                    rarity: rarity,
                    amount: amount
                });
            });

            alertRewards.push({
                name: area,
                expires: expiresMinutes,
                rewards: areaRewards
            });
        });
    const report = {
        source: "Storm Shield One",
        alertRewards: alertRewards,
        created: new Date().getTime()
    };
    return report;
}

/**
 * Parses text for hours, minutes, and seconds in the following forms:
 *   4h 34m
 *   55m
 *   22s
 * @param {string} text The time in the format of something like "4h 34m", "55m", or "22s".
 * @returns {number} Sum of time in minutes.
 */
function parseTimeText(text) {
    if (typeof text !== "string" || text === "") {
        throw "No time defined";
    }

    const reg = /(\d+)(h|m|s)/g;
    let matches;
    let result = 0;
    while ((matches = reg.exec(text))) {
        if (matches[2] === "h") {
            result += parseInt(matches[1], 10) * 60;
        } else if (matches[2] === "m") {
            result += parseInt(matches[1], 10);
        }
    }
    return result;
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
