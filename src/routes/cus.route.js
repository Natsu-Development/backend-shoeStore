const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const cartController = require("../app/controllers/cartController");

router.get("/cart", cartController.getCart);
router.post("/cart/add", cartController.create);
// check out
router.post("/checkout", orderController.checkout);

router.get("/checkoutComplete", (req, res) => {
	res.render("checkoutComplete");
});
router.get("/wishList", (req, res) => {
	res.render("wishList");
});

module.exports = router;
