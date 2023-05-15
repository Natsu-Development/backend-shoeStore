const express = require("express");
const router = express.Router();
const accountController = require("../app/controllers/accountController");
const orderController = require("../app/controllers/orderController");

router.get("/", (req, res) => {
	res.render("adminPages/adminLogin", { layout: false });
});

router.get("/result-paypal", orderController.handleResultPaypal);

router.get("/logoutAdmin", (req, res) => {
	res.clearCookie("Authorization");
	res.clearCookie("refreshToken");
	res.clearCookie("userInfo");

	res.redirect("/");
});
router.post("/handleAdminLogin", accountController.handleAdminLogin);

module.exports = router;
