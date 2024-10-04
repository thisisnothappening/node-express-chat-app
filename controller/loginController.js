const jwt = require('jsonwebtoken');
const User = require('../model/User.js');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
	try {
		const { emailOrUsername, password } = req.body;
		if (!emailOrUsername) {
			throw new Error("Email or username cannot be null");
		}
		if (!password) {
			throw new Error("Password cannot be null");
		}

		let user;
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailOrUsername))
			user = await User.findOne({ email: emailOrUsername });
		else
			user = await User.findOne({ username: emailOrUsername });

		if (!user) {
			throw new Error("User not found");
		}
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			throw new Error("Incorrect password");
		}

		const accessToken = jwt.sign(
			{ id: user.id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: '30m' }
		);
		const refreshToken = jwt.sign(
			{ id: user.id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: '1d' }
		);
		user.refreshToken = refreshToken;
		await user.save();

		// if you have an SSL certificate, and want to test the website on a URL other than localhost,
		// then set `secure: true` and `sameSite: "None"`,
		// and do the same for the logout function
		res.cookie("token", refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: "Lax",
			maxAge: 24 * 60 * 60 * 1000
		})
			.status(200)
			.send({ accessToken });
	} catch (err) {
		console.error(err);
		return res.status(err.status || 500).send({ error: err.message });
	}
};

module.exports = {
	login
};
