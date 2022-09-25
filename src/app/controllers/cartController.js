const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const jwtHelp = require("../../utils/jwtHelp");
const cartHelp = require("../../utils/cartHelp");
const mongoose = require("mongoose");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");

class cartController {
	/**
	 * @swagger
	 * /customer/cart:
	 *   get:
	 *     summary: List Cart of user.
	 *     tags: [Cart]
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  image:
	 *                    type: string
	 *                    example: image.
	 *                  productName:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  size:
	 *                    type: string
	 *                    example: Size of product
	 *                  price:
	 *                    type: number
	 *                    example: Price of product
	 *                  quantity:
	 *                    type: number
	 *                    example: Quantity of product
	 *       400:
	 *         description: Get list failed
	 */
	getCart(req, res, next) {
		// get userId from token
		const userId = jwtHelp.decodeTokenGetUserId(
			req.headers.authorization.split(" ")[1]
		);
		// get Cart from userId
		Cart.find({ userId: userId })
			.then(async (carts) => {
				// cast to object to add value image and productName
				carts = mutipleMongooseToObject(carts);
				// get info of product
				const results = [];
				await Promise.all(
					carts.map(async (cart) => {
						await Product.findOne({ _id: cart.productId }).then((product) => {
							cart.image = product.arrayImage[0].filename;
							cart.productName = product.name;
							cart.productPrice = product.price;
							results.push(cart);
						});
					})
				);
				res.json(results);
			})
			.catch((err) => {
				// next(err);
				console.log(err);
				res.status(400).send("Invalid input");
			});
	}

	/**
	 * @swagger
	 * /customer/cart/add:
	 *   post:
	 *     summary: Add cart.
	 *     tags: [Cart]
	 *     security:
	 *        - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                productId:
	 *                  type: string
	 *                  description: Id of product.
	 *                quantity:
	 *                  type: number
	 *                  description: Quantity of product want to add to cart.
	 *                size:
	 *                  type: number
	 *                  description: Size of product
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  message:
	 *                    type: string
	 *       400:
	 *         description: Error
	 */
	async create(req, res) {
		const userId = jwtHelp.decodeTokenGetUserId(
			req.headers.authorization.split(" ")[1]
		);
		// check this product and this size have existed
		const checkDuplicateCart = cartHelp.updateDuplicateCart(req, userId);
		if (checkDuplicateCart) {
			return res.status(200).send("Update successful");
		}

		// not existed duplicate cart
		Product.findOne({ _id: req.body.productId })
			.then((product) => {
				const cart = {
					userId: userId,
					productId: req.body.productId,
					quantity: req.body.quantity,
					size: req.body.size,
					total: product.price * req.body.quantity,
				};
				const addToCart = new Cart(cart);
				addToCart.save().then(() => {
					res.status(200).send("Success");
				});
			})
			.catch((error) => {
				console.log(error);
				res.status(400).send({
					message: "Invalid input",
					status: 400,
				});
			});
	}

	/**
	 * @swagger
	 * /customer/cart/update/{id}:
	 *   put:
	 *     summary: Update cart.
	 *     tags: [Cart]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: id
	 *          type: string
	 *          required: true
	 *          description: id of Cart want to update.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                quantity:
	 *                  type: number
	 *                  description: quantity of cart want to update.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  message:
	 *                    type: string
	 *       400:
	 *         description: Error
	 */
	update(req, res, next) {
		Cart.updateOne({ _id: req.params.id }, req.body)
			.then(() => {
				// res.redirect(`/admin/category?type=${req.query.type}`);
				res.status(200).send({ message: "Update successful" });
			})
			.catch((err) => {
				console.log(err);
				res.status(400).send({ message: "Invalid input" });
			});
	}

	/**
	 * @swagger
	 * /customer/cart/delete/{cartId}:
	 *   delete:
	 *     summary: Delete cart.
	 *     tags: [Cart]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: cartId
	 *          type: string
	 *          required: true
	 *          description: cart ID to delete.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  message:
	 *                    type: string
	 *       400:
	 *         description: Error
	 */
	delete(req, res) {
		// cast to arrObjectId
		const arrObjectId = req.params.cartId
			.replace(/\s+/g, "")
			.split(",")
			.map((cartId) => mongoose.Types.ObjectId(cartId));

		Cart.deleteMany({ _id: { $in: arrObjectId } })
			.then(() => {
				res.status(200).send({ message: "Deleted" });
			})
			.catch((err) => {
				console.log(err);
				res.status(400).send({ message: "Invalid input" });
			});
	}

	// FIND Category
	// [GET] /category/:slug
	async findCategoryByName(req, res, next) {
		let object = {};
		// string don't have upperCase
		object.name = new RegExp(req.params.slug, "i");
		await Category.find(object)
			.then((cates) => {
				res.render("adminPages/category/manager", {
					cates: mutipleMongooseToObject(cates),
					labels: categoryHelp.setUpLabels(req.query.type),
					layout: "adminLayout",
				});
			})
			.catch((err) => {
				next(err);
			});
	}
}

module.exports = new cartController();
