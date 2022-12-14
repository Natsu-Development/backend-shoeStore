const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const Account = require("../models/account.model");
const Product = require("../models/product.model");
const cartHelp = require("../../utils/cartHelp");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const orderHelp = require("../../utils/orderHelp");
const jwt = require("jsonwebtoken");
const { Mongoose } = require("mongoose");

class order {
	// [GET] /order
	manager(req, res) {
		Order.find({ status: 3 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				orders.forEach(async (order) => {
					const account = await Account.findById(order.customerId);
					order.customerName = account.fullname;
					order.createdAt = orderHelp.formatDate(order.createdAt);
				});
				res.render("adminPages/order/orders", {
					orderCompleted: true,
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /orderNotConfirm
	orderNotConfirm(req, res) {
		Order.find({ status: 0 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				orders.forEach(async (order) => {
					const account = await Account.findById(order.customerId);
					order.customerName = account.fullname;
					order.createdAt = orderHelp.formatDate(order.createdAt);
				});
				res.render("adminPages/order/orders", {
					notConfirm: true,
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /orderInTransit
	orderInTransit(req, res) {
		Order.find({ status: 2 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				orders.forEach(async (order) => {
					const account = await Account.findById(order.customerId);
					order.customerName = account.fullname;
					order.createdAt = orderHelp.formatDate(order.createdAt);
				});
				res.render("adminPages/order/orders", {
					inTransit: true,
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /orderConfirmed
	orderConfirmed(req, res) {
		Order.find({ status: 1 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				orders.forEach(async (order) => {
					const account = await Account.findById(order.customerId);
					order.customerName = account.fullname;
					order.createdAt = orderHelp.formatDate(order.createdAt);
				});
				res.render("adminPages/order/orders", {
					confirmed: true,
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /order/orderDetails/:id
	async viewOrderDetails(req, res) {
		try {
			let orderDetails = await OrderDetail.find({
				orderDetailId: req.params.id,
			});
			orderDetails = mutipleMongooseToObject(orderDetails);

			// get info of product
			const results = [];
			await Promise.all(
				orderDetails.map(async (orderDetail) => {
					await Product.findOne({ _id: orderDetail.shoeId }).then((product) => {
						orderDetail.image = product.arrayImage[0].filename;
						orderDetail.productName = product.name;
						console.log(orderDetail);
						results.push(orderDetail);
					});
				})
			);
			res.render("adminPages/order/orderDetails", {
				orderDetails: results,
				layout: "adminLayout",
			});
		} catch (error) {}
	}

	//[GET] /order/orderUpdate/:id
	orderUpdate(req, res) {
		OrderDetail.find({ orderDetailId: req.params.id }).then((orderDetails) => {
			orderDetails = mutipleMongooseToObject(orderDetails);
			res.render("adminPages/order/orderUpdate", {
				orderDetails,
				orderId: req.params.id,
				layout: "adminLayout",
			});
		});
	}

	//[PUT] order/saveUpdate/:id
	async saveUpdate(req, res) {
		var listForUpdate = orderHelp.trimArray(req.query.updateSubOrder);
		var listForAdd = orderHelp.trimArray(req.query.newSubOrder);
		var listForDelete = orderHelp.trimArray(req.query.deleteSubOrder);

		// update sub order
		var listSubOrder = orderHelp.formatOrder(
			req.body.shoeId,
			req.body.size,
			req.body.quantity,
			req.body.price
		);
		console.log(
			"???? ~ file: orderController.js ~ line 75 ~ order ~ saveUpdate ~ listSubOrder",
			listSubOrder
		);

		// subOrder Update
		await orderHelp.handleSubOrderUpdate(listForUpdate, listSubOrder);

		// new subOrder
		await orderHelp.handleNewSubOrder(listForAdd, listSubOrder, req.params.id);

		// subOrder Delete
		await orderHelp.handleSubOrderDelete(listForDelete);
		// setTotal
		await orderHelp.setTotalForOrderUpdate(req.params.id);
	}

	//[PUT] /order/changeStatus
	async changeOrderStatus(req, res) {
		// order be confirmed
		if (req.params.currentStatus == 0) {
			const orders = await OrderDetail.find({ orderDetailId: req.params.id });
			orders.forEach((order) => {
				orderHelp.decreaseAmountProduct(order);
			});
		}

		Order.updateOne(
			{ _id: req.params.id },
			{ $set: { status: Number(req.params.currentStatus) + 1 } }
		).then(() => {
			if (Number(req.params.currentStatus) + 1 == 1) {
				res.redirect("/admin/orderConfirmed");
			} else if (Number(req.params.currentStatus) + 1 == 2) {
				res.redirect("/admin/orderInTransit");
			} else if (Number(req.params.currentStatus) + 1 == 3) {
				res.redirect("/admin/order");
			} else {
				res.redirect("/admin/orderNotConfirm");
			}
		});
	}

	//[GET] /order/add
	create(req, res) {
		res.render("adminPages/order/orderAdd", { layout: "adminLayout" });
	}

	//[POST] /order/save
	async saveCreate(req, res) {
		var order = {
			customerId: req.body.customerId,
			total: orderHelp.setTotalForNewOrder(req.body.price, req.body.quantity),
			status: 1,
		};
		var listOrderDetails = orderHelp.formatOrder(
			req.body.shoeId,
			req.body.size,
			req.body.quantity,
			req.body.price
		);
		const nextOrderId = await orderHelp.getOrderId(); // orderId
		for (var i = 0; i < listOrderDetails.length; i++) {
			orderHelp.decreaseAmountProduct(listOrderDetails[i]);
			listOrderDetails[i].orderDetailId = nextOrderId;
			const newOrderDetail = new OrderDetail(listOrderDetails[i]);
			await newOrderDetail.save();
		}
		const newOrder = new Order(order);
		newOrder
			.save()
			.then(() => {
				res.redirect("/admin/orderConfirmed");
			})
			.catch((err) => console.log(err));
	}

	/**
	 * @swagger
	 * /customer/checkout:
	 *   post:
	 *     summary: Checkout cart.
	 *     tags: [Customer Service]
	 *     security:
	 *        - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                  fullname:
	 *                    type: string
	 *                    example: Zion Le.
	 *                  address:
	 *                    type: string
	 *                    example: Ho Chi Minh City
	 *                  numberPhone:
	 *                    type: string
	 *                    example: 0924714552
	 *                  email:
	 *                    type: string
	 *                    example: zion.l@itcgroup.io
	 *     responses:
	 *       201:
	 *         description: Checkout success
	 *       400:
	 *         description: Get list failed
	 */
	async checkout(req, res) {
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);
			await Account.updateOne({ _id: userId }, req.body);
			const carts = await cartHelp.getCartByUserId(userId);
			if (carts.total === 0 || carts.results.length === 0) {
				return res.status(400).send({
					message: "Cart empty",
					status_code: 400,
				});
			}
			const arrCartId = [];
			//create new order
			const newOrder = new Order({
				customerId: userId,
				total: carts.totalCart,
				status: 0,
			});

			const newOrderCreated = await newOrder.save();

			// create new order details
			await Promise.all(
				carts.results.map(async (cart) => {
					const newOrderDetail = new OrderDetail({
						orderDetailId: newOrderCreated._id,
						shoeId: cart.productId,
						size: cart.size,
						quantity: cart.quantity,
						price: cart.productPrice,
					});
					arrCartId.push(cart._id);
					await newOrderDetail.save();
				})
			);

			//delete cart
			const deletedCart = cartHelp.deleteCart(arrCartId);
			if (deletedCart) {
				res.status(200).send({
					message: "Checkout success",
					status_code: 200,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400);
		}
	}

	/**
	 * @swagger
	 * /customer/myOrder:
	 *   get:
	 *     summary: Get my Order.
	 *     tags: [Customer Service]
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Checkout success
	 *       400:
	 *         description: Get list failed
	 */
	async getMyOrder(req, res) {
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);

			let myOrders = await Order.find({ customerId: userId });
			myOrders = mutipleMongooseToObject(myOrders);

			myOrders.forEach((myOrder) => {
				myOrder.createdAt = orderHelp.formatDate(myOrder.createdAt);
			});

			res.status(200).send(myOrders);
		} catch (err) {
			console.log(err);
			res.status(400).send({ message: "Invalid input" });
		}
	}

	/**
	 * @swagger
	 * /customer/myOrderDetail/{orderDetailId}:
	 *   get:
	 *     summary: Get my Order Detail.
	 *     tags: [Customer Service]
	 *     parameters:
	 *        - in: path
	 *          name: orderDetailId
	 *          type: string
	 *          required: true
	 *          description: order ID of the order to get orderDetail.
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Checkout success
	 *       400:
	 *         description: Get list failed
	 */
	async getMyOrderDetail(req, res) {
		try {
			let orderDetails = await OrderDetail.find({
				orderDetailId: req.params.orderDetailId,
			});
			orderDetails = mutipleMongooseToObject(orderDetails);

			// get info of product
			const results = [];
			await Promise.all(
				orderDetails.map(async (orderDetail) => {
					await Product.findOne({ _id: orderDetail.shoeId }).then((product) => {
						orderDetail.image = product.arrayImage[0].filename;
						orderDetail.productName = product.name;
						console.log(orderDetail);
						results.push(orderDetail);
					});
				})
			);
			res.status(200).send(results);
		} catch (err) {
			console.log(err);
			res.status(400).send({ message: "Invalid input" });
		}
	}

	/**
	 * @swagger
	 * /customer/confirmDelivered/{orderId}:
	 *   post:
	 *     summary: Change status order(in_transit -> completed).
	 *     tags: [Customer Service]
	 *     parameters:
	 *        - in: path
	 *          name: orderId
	 *          type: string
	 *          required: true
	 *          description: order ID of the order to get orderDetail.
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Confirmed successful
	 *       400:
	 *         description: Get list failed
	 */
	async customerConfirmedDelivered(req, res) {
		try {
			// get status of order
			const order = await Order.findOne({ _id: req.params.orderId });

			if (order.status !== 2) {
				return res.status(403).send({ message: "Forbidden request" });
			}

			console.log("test", order);

			Order.updateOne(
				{ _id: req.params.orderId },
				{ $set: { status: order.status + 1 } }
			).then(() => {
				res.status(200).send({ message: "Success" });
			});
		} catch (err) {
			console.log(err);
			res.status(200).send({ message: "Invalid input" });
		}
	}

	/**
	 * @swagger
	 * /customer/cancelOrder/{orderId}:
	 *   delete:
	 *     summary: Cancel order.
	 *     tags: [Customer Service]
	 *     parameters:
	 *        - in: path
	 *          name: orderId
	 *          type: string
	 *          required: true
	 *          description: order ID of the order to get orderDetail.
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Cancel successful
	 *       400:
	 *         description: Get list failed
	 */
	async cancelOrder(req, res) {
		const orders = await Order.findById(req.params.orderId);
		if (orders.status !== 0) {
			return res
				.status(403)
				.send({ message: "Order be confirmed not allow to cancel" });
		}

		//delete
		await OrderDetail.deleteMany({ orderDetailId: req.params.orderId });
		await Order.deleteOne({ _id: req.params.orderId });
		res.status(200).send({ message: "Success" });
	}
}

module.exports = new order();
