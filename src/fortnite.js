const http = require("http");
const fs = require("fs");

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

exports.init = async () => {
	try{
		let html = fs.readFileSync("./mock/test1.html","utf-8");
		console.log(html);
	}catch(e){
		console.log("An error has occurred.");
		console.log(e);
	}
	console.log("yay?");
};

function getData() {
	return new Promise((resolve, reject) => {
		fs.readFile("./src/test1.html", (err, data) => {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
}
