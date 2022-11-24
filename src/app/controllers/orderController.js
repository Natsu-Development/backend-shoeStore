const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const cartHelp = require("../../utils/cartHelp");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const orderHelp = require("../../utils/orderHelp");
const jwt = require("jsonwebtoken");

class order {
	// [GET] /order
	manager(req, res) {
		Order.find({ confirmed: 1 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				res.render("adminPages/order/orders", {
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /orderNotConfirm
	orderNotConfirm(req, res) {
		Order.find({ confirmed: 0 })
			.then((orders) => {
				orders = mutipleMongooseToObject(orders);
				res.render("adminPages/order/orders", {
					notConfirm: true,
					orders,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /order/detailNotConfirm/:id
	viewOrderDetails(req, res) {
		OrderDetail.find({ orderDetailId: req.params.id })
			.then((orderDetails) => {
				orderDetails = mutipleMongooseToObject(orderDetails);
				res.render("adminPages/order/orderDetails", {
					orderDetails,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
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
			"🚀 ~ file: orderController.js ~ line 75 ~ order ~ saveUpdate ~ listSubOrder",
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

	//[PUT] /order/orderConfirm
	orderConfirm(req, res) {
		Order.updateMany(
			{ orderDetailId: req.params.id },
			{ $set: { confirmed: 1 } }
		).then(() => {
			console.log("oke");
		});
	}

	//[GET] /order/add
	create(req, res) {
		res.render("adminPages/order/orderAdd", { layout: "adminLayout" });
	}

	//[POST] /order/save
	async saveCreate(req, res) {
		console.log(req.body);
		var order = {
			customerId: req.body.customerId,
			date: new Date(),
			total: orderHelp.setTotal(req.body.price, req.body.quantity),
			confirmed: 1,
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
				console.log("done");
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
			console.log("userId: " + userId);
			const carts = await cartHelp.getCartByUserId(userId);
			if(carts.total === 0 || carts.results.length === 0) {
				return res.status(400).send({ 
					message: "Cart empty",
					status_code: 400
				});
			} 
			const arrCartId = [];
			//create new order
			const newOrder = new Order({
				customerId: userId,
				total: carts.totalCart,
				confirmed: 0,
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
}

module.exports = new order();
