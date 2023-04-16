const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const CatePro = require("../models/cateProduct.model");
const Category = require("../models/category.model");
const Notification = require("../models/notification.model");
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
	async getCart(req, res) {
		try {
			// get userId from token
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);
			// get Cart from userId
			const results = await cartHelp.getCartByUserId(userId);
			if (!results) {
				return res.send({ message: "Cart empty" });
			}
			const notification = new Notification({
				type: "getOrder",
				data: results,
			});
			// await notification.save();
			req.io.sockets.emit("cart", results.results);
			res.json(results);
		} catch (err) {
			console.log(err);
		}
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
	 *                  example: 643bfd77d9b156fc7880676f
	 *                quantity:
	 *                  type: number
	 *                  description: Quantity of product want to add to cart.
	 *                  example: 1
	 *                sizeId:
	 *                  type: string
	 *                  description: Size id of product
	 *                  example: 637f3bae9c2b3199458fe823
	 *                colorId:
	 *                  type: string
	 *                  description: Color id
	 *                  example: 640d625ff2776e58f0ab4e28
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
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);
			// check this product and this size have existed
			const isDuplicateCart = await cartHelp.updateDuplicateCart(req, userId);
			if (isDuplicateCart.cartUpdated) {
				return res.status(200).send({
					cart: isDuplicateCart.cartUpdated,
					product: isDuplicateCart.product,
				});
			}

			// not existed duplicate cart
			const shoeInfo = await CatePro.findOne({
				proId: req.body.productId,
				cateId: req.body.colorId,
			});
			const infoBySizeId = shoeInfo.listSizeByColor.find(
				(size) => size.sizeId === req.body.sizeId
			);
			const size = await Category.findOne({ _id: infoBySizeId.sizeId });

			const cart = {
				userId: userId,
				productId: req.body.productId,
				quantity: req.body.quantity,
				size: size.name,
				total: infoBySizeId.price * req.body.quantity,
			};
			const addToCart = new Cart(cart);
			addToCart.save().then((newCart) => {
				res.status(200).send({ cart: newCart, product });
			});
		} catch (error) {
			console.log(error);
			res.status(200).send({
				message: "Invalid input",
			});
		}
	}

	/**
	 * @swagger
	 * /customer/cart/update/{id}:
	 *   put:
	 *
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
	 *                productId:
	 *                  type: string
	 *                  description: id of cart's product want to update.
	 *                  example: 617e9cb57b1ddb194ce46922
	 *                quantity:
	 *                  type: number
	 *                  description: quantity of cart want to update.
	 *                  example: 2
	 *                size:
	 *                  type: number
	 *                  description: size of cart want to update.
	 *                  example: 7.5
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
	async update(req, res) {
		try {
			const userId = jwtHelp.decodeTokenGetUserId(
				req.headers.authorization.split(" ")[1]
			);

			const product = await Product.findById({
				_id: req.body.productId,
			});

			const updated = await Cart.updateOne(
				{ $and: [{ _id: req.params.id }, { userId: userId }] },
				{ ...req.body, total: req.body.quantity * product.price }
			);

			if (updated.modifiedCount > 0) {
				res.status(200).send({ message: "Update successful" });
			} else {
				res.status(400).send({ message: "Invalid Input" });
			}
		} catch (error) {
			console.log(error);
			res.status(400).send({ message: "Invalid input" });
		}
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
