const express = require("express");
const router = express.Router();
const cateController = require("../app/controllers/cateController");
const cateTypeController = require("../app/controllers/cateTypeController");
const shoeController = require("../app/controllers/shoeController");
const accountController = require("../app/controllers/accountController");
const orderController = require("../app/controllers/orderController");

// //ACCOUNT
// router.get('/adminLogin', accountController.adminLogin);
// router.post('/account/handleAdminLogin', accountController.handleAdminLogin);
// router.get('/account/renewAccessToken', accountController.renewAccessToken);

// CATEGORY
router.get("/category/add/:typeId", cateController.renderCreate);
router.get("/category/update/:typeId/:cateId", cateController.renderUpdate);
// Handle
router.get("/category/:typeId", cateController.manager);
router.post("/category/:typeId/add", cateController.create);
router.put("/category/update/:typeId/:cateId", cateController.update);
router.delete("/category/delete/:id", cateController.delete);
router.get("/category/:slug", cateController.findCategoryByName);

// CATEGORY TYPE
// interface for category type
router.get("/categoryType/addType", cateTypeController.renderCreate);
router.get("/categoryType/update/:id", cateTypeController.renderUpdate);
// API
router.get("/categoryType", cateTypeController.manager);
router.get("/categoryType/getAll", cateTypeController.getAll);
router.post("/categoryType/add", cateTypeController.create);
router.put("/categoryType/update/:id", cateTypeController.update);
router.delete("/categoryType/delete/:id", cateTypeController.delete);
router.get("/categoryType/:slug", cateTypeController.findCategoryByName);

//PRODUCT
router.get("/product", shoeController.manager);
router.get("/product/add", shoeController.renderCreate);
router.post("/product/save", shoeController.create);
router.get("/product/update/:id", shoeController.renderUpdate);
router.put("/product/saveUpdate/:id", shoeController.update);
router.delete("/product/delete/:id", shoeController.delete);
// router.get('/category/:slug', shoeController.findShoeByName);

//ORDER AND ORDERDETAILS
router.get("/order", orderController.manager);
router.get("/orderNotConfirm", orderController.orderNotConfirm);
router.get("/orderInTransit", orderController.orderInTransit);
router.get("/orderConfirmed", orderController.orderConfirmed);
router.get("/order/add", orderController.create);
router.post("/order/save", orderController.saveCreate);
router.get("/order/orderDetails/:id", orderController.viewOrderDetails);
router.get("/order/orderUpdate/:id", orderController.orderUpdate);
router.put(
	"/order/changeOrderStatus/:id/:currentStatus",
	orderController.changeOrderStatus
);
router.put("/order/saveUpdate/:id", orderController.saveUpdate);

//dashboard
router.get("/", (req, res) => {
	res.render("adminPages/", { layout: "adminLayout" });
});

module.exports = router;
