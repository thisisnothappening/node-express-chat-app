const User = require('../model/User.js');

const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies?.token || "";
		const user = await User.findOne({ refreshToken: refreshToken });
		if (!user) {
			return res.clearCookie("token", { httpOnly: true, secure: false, sameSite: 'Lax' })
				.sendStatus(204);
		}
		user.refreshToken = "";
		await user.save();

		return res.clearCookie("token", { httpOnly: true, secure: false, sameSite: 'Lax' })
			.sendStatus(204);
	} catch (err) {
		console.error(err);
		return res.status(err.status || 500).json({ error: err.message });
	}
};

module.exports = {
	logout
};
