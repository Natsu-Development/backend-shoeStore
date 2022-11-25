const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const cartController = require("../app/controllers/cartController");

router.get("/cart", cartController.getCart);
router.post("/cart/add", cartController.create);
router.put("/cart/update/:id", cartController.update);
router.delete("/cart/delete/:cartId", cartController.delete);

// check out
router.post("/checkout", orderController.checkout);

// get all order
router.get("/myOrder", orderController.getMyOrder);

// get my order
router.get("/myOrderDetail/:orderDetailId", orderController.getMyOrderDetail);

router.get("/checkoutComplete", (req, res) => {
	res.render("checkoutComplete");
});
router.get("/wishList", (req, res) => {
	res.render("wishList");
});

module.exports = router;
