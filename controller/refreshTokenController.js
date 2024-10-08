const jwt = require('jsonwebtoken');
const User = require('../model/User.js');

const refreshToken = async (req, res) => {
	try {
		const cookies = req.cookies;
		if (!cookies?.token) {
			// throw new Error("Token not found");
			return;
		}
		const refreshToken = cookies.token;
		console.log(refreshToken);

		const user = await User.findOne({ refreshToken: refreshToken });
		if (!user) {
			throw new Error("User not found");
		}
		const id = user.id;
		const email = user.email;
		const username = user.username;

		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			(err, decoded) => {
				if (err || user.id !== decoded.id) {
					return res.status(403);
				}
				const accessToken = jwt.sign(
					{ id: user.id },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "30m" }
				);
				res.json({ accessToken, id, email, username });
			}
		);
	} catch (err) {
		console.error(err);
		return res.status(err.status || 500).send({ error: err.message });
	}
};

module.exports = {
	refreshToken
};
