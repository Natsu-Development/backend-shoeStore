const Account = require("../app/models/account.model");
const jwtHelp = require("./jwtHelp");

module.exports = {
	hasExistAccountName: (req, res, next) => {
		Account.find({
			$and: [{ accountName: req.body.accountName }, { permission: "2" }],
		})
			.then((accounts) => {
				if (accounts) {
					const backUrl = req.header("Referer") || "/";
					req.session.registerErr =
						"This accountName is existing. Please choose a other accountName";
					return res.redirect(backUrl + "?warning");
				}
				next();
			})
			.catch((err) => console.log(err));
	},
	handleLoginOauth: async (req, res, authType) => {
		try {
			//User exist
			const existUser = await Account.findOne({ userId: req.body.userId });
			if (existUser) {
				const token = jwtHelp.createAccessToken(
					existUser.userId,
					existUser.permission,
					existUser.fullname
				);
				res.json({ token, existUser });
			} else {
				const newUser = new Account({
					fullname: req.body.fullname,
					userId: req.body.userId,
					email: req.body.email,
					address: "",
					numberPhone: "",
					permission: "2",
					authType: authType,
					picture: req.body.picture,
				});
				await newUser.save();
				const token = jwtHelp.createAccessToken(
					newUser.userId,
					newUser.permission,
					newUser.fullname
				);
				res.json({ token, newUser });
			}
		} catch (err) {
			res.status(400).send();
		}
	},
};
