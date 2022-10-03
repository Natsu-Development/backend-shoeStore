const Account = require("../models/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const accountHelp = require("../../utils/accountHelp");
require("dotenv").config();

class accountController {
	/**
	 * @swagger
	 * components:
	 *   schemas:
	 *     handleLogin:
	 *       type: object
	 *       properties:
	 *         email:
	 *           type: string
	 *           description: The account's email'.
	 *           example: catle4551@gmail.com
	 *         password:
	 *           type: string
	 *           description: The account's password.
	 *           example: 12345678
	 */
	// [GET] /account/adminLogin
	adminLogin(req, res) {
		res.render("adminPages/adminLogin", { layout: false });
	}

	// [POST] /account/handleAdminLogin
	handleAdminLogin(req, res) {
		Account.findOne({ email: req.body.email }).then(async (account) => {
			//check account
			account = mongooseToObject(account);
			const result = bcrypt.compareSync(req.body.password, account.password);
			if (result) {
				jwtHelp.encodeAndStoreToken(
					account.userId,
					account.permission,
					account.fullname,
					account.picture,
					res
				);
				return res.redirect("/admin");
			}
		});
	}

	//CUSTOMER
	//[GET] /account/login
	customLogin(req, res) {
		res.render("customerLogin", { layout: false });
	}

	/**
	 * @swagger
	 * /auth/login:
	 *   post:
	 *     summary: User Login.
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/handleLogin'
	 *     responses:
	 *       201:
	 *         description: Login payload.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: The accessToken.
	 *                  refreshToken:
	 *                    type: string
	 *                    description: The refreshToken to refresh token.
	 *       400:
	 *         description: Login failed
	 */
	async handleCustomerLogin(req, res) {
		try {
			console.log("Body", req.body);
			let user = await Account.findOne({ email: req.body.email });
			if (user) {
				user = mongooseToObject(user);
				const result = bcrypt.compareSync(req.body.password, user.password);
				if (result) {
					const tokens = jwtHelp.encodeAndStoreToken(
						user._id,
						user.permission,
						user.fullname
					);
					const expired_at = new Date().setDate(new Date().getDate() + 3);
					// console.log(
					// 	"🚀 ~ file: accountController.js ~ line 102 ~ accountController ~ handleCustomerLogin ~ expired_at",
					// 	expired_at
					// );
					res.status(200).send({ tokens, user, expired_at });
				} else {
					res.status(400).send("Your password is incorrect. Please try again");
				}
			} else {
				res.status(400).send("Your email is incorrect. Please try again");
			}
		} catch (err) {
			console.log(err);
			res.status(400).send("Invalid input");
		}
	}

	//[GET] /account/register
	customerRegister(req, res) {
		if (!req.query.warning) delete req.session.registerErr;
		res.render("customerRegis", { layout: false });
	}

	//[POST] /account/saveRegister
	handleCustomerRegister(req, res) {
		req.body.permission = "2";
		const newAccount = new Account(req.body);
		newAccount
			.save()
			.then(res.render("customerLogin", { layout: false }))
			.catch((err) => console.log(err));
	}

	/**
	 * @swagger
	 * /auth/google:
	 *   post:
	 *     summary: Login by Google.
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                userId:
	 *                  type: string
	 *                  description: The user's id.
	 *                fullname:
	 *                  type: string
	 *                  description: Full name of user.
	 *                email:
	 *                  type: string
	 *                  description: Email's account.
	 *                picture:
	 *                  type: string
	 *                  description: Account's avatar.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                  user:
	 *                    type: object
	 *                    properties:
	 *                       userId:
	 *                         type: string
	 *                       email:
	 *                         type: string
	 *                       fullname:
	 *                         type: string
	 *                       picture:
	 *                         type: string
	 *                       permission:
	 *                         type: integer
	 *       400:
	 *         description: Error
	 */
	async handleLoginGoogle(req, res) {
		accountHelp.handleLoginOauth(req, res, "google");
	}

	/**
	 * @swagger
	 * /auth/facebook:
	 *   post:
	 *     summary: Login by facebook.
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                userId:
	 *                  type: string
	 *                  description: The user's id.
	 *                fullname:
	 *                  type: string
	 *                  description: Full name of user.
	 *                email:
	 *                  type: string
	 *                  description: Email's account.
	 *                picture:
	 *                  type: string
	 *                  description: Account's avatar.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                  user:
	 *                    type: object
	 *                    properties:
	 *                       userId:
	 *                         type: string
	 *                       email:
	 *                         type: string
	 *                       fullname:
	 *                         type: string
	 *                       picture:
	 *                         type: string
	 *                       permission:
	 *                         type: integer
	 *       400:
	 *         description: Error
	 */
	async handleLoginFacebook(req, res) {
		console.log("Test access in facebook function");
		accountHelp.handleLoginOauth(req, res, "facebook");
	}

	/**
	 * @swagger
	 * /auth/verifyToken:
	 *   post:
	 *     summary: Verify accessToken.
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                token:
	 *                  type: string
	 *                  description: The access token.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: Verify access token success.
	 *       400:
	 *         description: Verify access token failed
	 */
	authAccessToken(req, res) {
		jwtHelp.authAccessToken(req, res);
	}
	/**
	 * @swagger
	 * /auth/refreshToken:
	 *   post:
	 *     summary: Refresh accessToken.
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                refreshToken:
	 *                  type: string
	 *                  description: The refresh token.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: The accessToken from refresh.
	 *       400:
	 *         description: Refresh failed
	 */
	renewAccessToken(req, res) {
		jwtHelp.renewAccessToken(req, res);
	}

	// encode token of user when they authenticate successful from facebook or google
	encodeAndStoreToken(req, res) {
		// encode token and store accessToken and refreshToken to cookie
		jwtHelp.encodeAndStoreToken(
			req.user.userId,
			req.user.permission,
			req.user.fullname,
			req.user.picture,
			res
		);
		res.redirect("/auth/testAuth");
	}
	// after authenticate successful by google account
	testAuth(req, res) {
		res.json(req.cookies.userInfo);
	}

	//logout function
	logout(req, res) {
		// req.logout();
		res.clearCookie("Authorization");
		res.clearCookie("refreshToken");
		res.clearCookie("userInfo");
		res.redirect("/");
	}
}

module.exports = new accountController();
