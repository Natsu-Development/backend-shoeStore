const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const Account = require("../models/account.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const CatePro = require("../models/cateProduct.model");
const cartHelp = require("../../utils/cartHelp");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const mailService = require("../../services/mailService");
const paypalService = require("../../services/paypalService");
const orderHelp = require("../../utils/orderHelp");
const promoController = require("../controllers/promotionalController");
const shoeController = require("../controllers/shoeController");
const jwt = require("jsonwebtoken");
const { Mongoose } = require("mongoose");
const commonHelp = require("../../utils/commonHelp");

class order {
	// [GET] /order
	manager(req, res) {
		orderHelp.getOrderByStatus(3, res);
	}

	// [GET] /orderNotConfirm
	orderNotConfirm(req, res) {
		orderHelp.getOrderByStatus(0, res);
	}

	// [GET] /orderInTransit
	orderInTransit(req, res) {
		orderHelp.getOrderByStatus(2, res);
	}

	// [GET] /orderConfirmed
	orderConfirmed(req, res) {
		orderHelp.getOrderByStatus(1, res);
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
					const { shoeInfo, infoBySizeId, size } = await cartHelp.getShoeInfo(
						orderDetail.shoeId,
						orderDetail.colorId,
						orderDetail.sizeId
					);
					const product = await Product.findOne({ _id: orderDetail.shoeId });

					orderDetail.image = shoeInfo.avatar;
					orderDetail.productName = product.name;
					orderDetail.productPrice = infoBySizeId.price;
					orderDetail.sizeName = size.name;

					results.push(orderDetail);
				})
			);
			res.render("adminPages/order/orderDetails", {
				orderDetails: results,
				layout: "adminLayout",
			});
		} catch (error) {
			console.log(error);
		}
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

	//[PUT] /order/changeStatus
	async changeOrderStatus(req, res) {
		let flag = 0,
			messageErr;
		// order be confirmed
		if (req.params.currentStatus == 0) {
			const orders = await OrderDetail.find({ orderDetailId: req.params.id });
			await Promise.all(
				orders.map(async (order) => {
					const handle = await orderHelp.decreaseAmountProduct(order);
					if (handle?.isError) {
						flag = 1;
						messageErr = handle?.message;
					}
				})
			);
		}
		if (flag == 1) {
			return await orderHelp.getOrderByStatus(0, res, messageErr);
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

	// [PUT] /order/revertStatus
	async revertOrderStatus(req, res) {
		// if order is confirmed, can't revert status, check again ???
		// if have gonna increaseAmountProduct from amount of order.

		// start to revert status
		Order.updateOne(
			{ _id: req.params.id },
			{ $set: { status: Number(req.params.currentStatus) - 1 } }
		).then(() => {
			if (Number(req.params.currentStatus) - 1 == 1) {
				res.redirect("/admin/orderConfirmed");
			} else if (Number(req.params.currentStatus) - 1 == 2) {
				res.redirect("/admin/orderInTransit");
			} else {
				res.redirect("/admin/order");
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
	 *                    example: storage Byme.
	 *                  address:
	 *                    type: string
	 *                    example: Ho Chi Minh City
	 *                  numberPhone:
	 *                    type: string
	 *                    example: 0924714552
	 *                  email:
	 *                    type: string
	 *                    example: storage1520@gmail.com
	 *                  listPromoCode:
	 *                    type: array
	 *                    example: ['EVENT', 'NEWORDER']
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
			// update info of user such as update number phone and address
			const userAccount = await Account.findOneAndUpdate(
				{ _id: userId },
				req.body,
				{ new: true }
			);
			const carts = await cartHelp.getCartByUserId(userId);
			if (!carts?.totalCart || carts.results.length === 0) {
				return res.status(200).send({
					message: "Cart empty",
				});
			}
			const arrCartId = [];
			const discount = await promoController.handlePromo(
				req.body.listPromoCode,
				carts.totalCart,
				"checkout",
				userId
			);
			if (discount?.invalid) {
				return res.status(200).send({
					message: discount.message,
				});
			}

			//create new order
			const newOrder = new Order({
				customerId: userId,
				total: discount.totalMoney,
				status: 0,
			});

			const newOrderCreated = await newOrder.save();

			// create new order details and handle amount of product
			await Promise.all(
				carts.results.map(async (cart) => {
					const newOrderDetail = new OrderDetail({
						orderDetailId: newOrderCreated._id,
						shoeId: cart.productId,
						sizeId: cart.sizeId,
						colorId: cart.colorId,
						quantity: cart.quantity,
						price: cart.productPrice,
					});
					arrCartId.push(cart._id);
					await newOrderDetail.save();

					const catePro = await CatePro.findOne({
						cateId: cart.colorId,
						proId: cart.productId,
					});

					if (catePro) {
						// get the size of shoe and eliminate amount of it
						catePro.listSizeByColor.forEach((size) => {
							if (size.sizeId === cart.sizeId) {
								size.amount -= cart.quantity;
							}
						});
						// update
						await CatePro.updateOne(
							{
								cateId: cart.colorId,
								proId: cart.productId,
							},
							{ listSizeByColor: catePro.listSizeByColor }
						);
					}
				})
			);

			//send mail and coupon code for next order to customer
			const promoCode = await promoController.promoCheckoutSuccess(
				userId,
				newOrderCreated._id
			);
			mailService.sendMailAfterCheckout(userAccount.email, promoCode);

			//delete cart
			const deletedCart = cartHelp.deleteCart(arrCartId);
			if (deletedCart) {
				res.status(200).send({
					message: "Checkout success",
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400);
		}
	}

	/**
	 * @swagger
	 * /customer/checkout-paypal:
	 *   post:
	 *     summary: Checkout cart with Paypal method.
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
	 *                    example: storage Byme.
	 *                  address:
	 *                    type: string
	 *                    example: Ho Chi Minh City
	 *                  numberPhone:
	 *                    type: string
	 *                    example: 0924714552
	 *                  email:
	 *                    type: string
	 *                    example: storage1520@gmail.com
	 *                  listPromoCode:
	 *                    type: array
	 *                    example: ['EVENT', 'NEWORDER']
	 *     responses:
	 *       201:
	 *         description: Checkout success
	 *       400:
	 *         description: Get list failed
	 */
	async checkoutPaypal(req, res) {
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);
			const carts = await cartHelp.getCartByUserId(userId);

			if (!carts?.totalCart || carts.results.length === 0) {
				return res.status(200).send({
					message: "Cart empty",
				});
			}

			const payment = paypalService.setUpPayment(carts, userId);

			paypalService.paypal.payment.create(payment, function (error, payment) {
				if (error) {
					throw error;
				} else {
					for (let i = 0; i < payment.links.length; i++) {
						if (payment.links[i].rel === "approval_url") {
							return res.status(200).send({ url: payment.links[i].href });
						}
					}
				}
			});
		} catch (err) {
			console.error(err);
			res.status(200).send(err);
		}
	}

	async handleResultPaypal(req, res) {
		try {
			const payerId = req.query.PayerID;
			const paymentId = req.query.paymentId;

			paypalService.paypal.payment.get(paymentId, function (error, payment) {
				if (error) {
					// Handle the error
					throw new Error(error);
				}
				console.log(payment.transactions);
				const transaction = payment.transactions[0];
				const userId = payment.transactions[0].custom;
				const execute_payment_json = {
					payer_id: payerId,
					transactions: [
						{
							amount: {
								currency: transaction.amount.currency,
								total: transaction.amount.total,
							},
						},
					],
				};

				paypalService.paypal.payment.execute(
					paymentId,
					execute_payment_json,
					async (error, payment) => {
						if (error) {
							console.log(error.response);
							throw new Error(error.response);
						}
						console.log(payment);

						const account = await Account.findOne({ _id: userId });

						if (
							!account.payments.find((item) => item.paymentId === payment.id)
						) {
							account.payments.push({
								paymentId: payment.id,
								status: payment.status,
								method: payment.payer.payment_method,
								payerInfo:
									payment.payer.payer_info.first_name +
									payment.payer.payer_info.last_name,
								total: payment.transactions[0].amount.total,
								description: payment.transactions[0].description,
								time: payment.create_time,
							});

							await Account.updateOne(
								{ _id: userId },
								{ payments: account.payments }
							);
						}

						res.redirect("https://localhost:3001/order-complete");
					}
				);
			});
		} catch (err) {
			console.error(err);
			res.status(200).send(err);
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

			const myOrders = await Order.find({
				customerId: userId,
			})
				.sort({ createdAt: -1 })
				.lean();

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
	 *         description: list Order Details
	 *       400:
	 *         description: Get list failed
	 */
	async getMyOrderDetail(req, res) {
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization?.split(" ")[1]
			);

			let order = await Order.findOne({
				_id: req.params.orderDetailId,
				customerId: userId,
			});

			if (!order) {
				return res.status(200).send({ message: "Order not found" });
			}

			let orderDetails = await OrderDetail.find({
				orderDetailId: req.params.orderDetailId,
			});
			orderDetails = mutipleMongooseToObject(orderDetails);

			// get info of product
			const results = [];
			await Promise.all(
				orderDetails.map(async (orderDetail) => {
					const { shoeInfo, infoBySizeId, size } = await cartHelp.getShoeInfo(
						orderDetail.shoeId,
						orderDetail.colorId,
						orderDetail.sizeId
					);

					const product = await Product.findOne({ _id: orderDetail.shoeId });
					const existComment = product.commentAndRate.find(
						(rate) => rate.userId === userId
					);
					if (existComment) {
						orderDetail.comment = existComment.comment;
						orderDetail.rateScore = existComment.rating;
					}

					orderDetail.image = shoeInfo.avatar;
					orderDetail.productName = product.name;
					orderDetail.productPrice = infoBySizeId.price;
					orderDetail.sizeName = size.name;

					results.push(orderDetail);
				})
			);

			res.status(200).send({ results, total: order?.total });
		} catch (err) {
			console.log(err);
			res.status(200).send({ message: "Invalid input" });
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
