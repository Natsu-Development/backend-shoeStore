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
			const expired_at = new Date().setDate(new Date().getDate() + 3);
			if (existUser) {
				// always update info of user when account user is exist
				Account.findOneAndUpdate(
					{ userId: req.body.userId },
					req.body,
					{
						returnDocument: "after",
					},
					(err, userUpdated) => {
						const token = jwtHelp.createAccessToken(
							userUpdated.userId,
							userUpdated.permission,
							userUpdated.fullname
						);
						res.json({ token, userUpdated, expired_at });
					}
				);
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
				console.log(newUser);
				await newUser.save();
				const token = jwtHelp.createAccessToken(
					newUser.userId,
					newUser.permission,
					newUser.fullname
				);
				res.json({ token, newUser, expired_at });
			}
		} catch (err) {
			res.status(400).send();
		}
	},
};
