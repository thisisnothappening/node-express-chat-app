const mongoose = require("mongoose");
require("dotenv").config();

const dbUri = process.env.DATABASE_URI;

const connect = () => {
	return mongoose.connect(dbUri)
		.then(() => {
			console.log("Database connected...");
		})
		.catch((err) => {
			console.error("Error: " + err);
			console.log("Retrying in 3 seconds...");
			setTimeout(connect, 3000);
		});
};

connect();

module.exports = mongoose;
