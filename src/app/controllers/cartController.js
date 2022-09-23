const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");

class cateController {
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
			.then((carts) => {
				// cast to object to add value image and productName
				carts = mutipleMongooseToObject(carts);
				// get info of product
				var results = [];
				carts.forEach(async (cart) => {
					const product = await Product.findOne({ _id: cart.productId });
					cart.image = product.arrayImage[0].filename;
					cart.productName = product.name;
					results.push(cart);
					// console.log("test", results);
					res.json(results);
				});
				// console.log("Result", results);
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
	create(req, res) {
		Product.findOne({ _id: req.body.productId })
			.then((product) => {
				const cart = {
					userId: jwtHelp.decodeTokenGetUserId(
						req.headers.authorization.split(" ")[1]
					),
					productId: req.body.productId,
					quantity: req.body.quantity,
					size: req.body.size,
					total: product.price * req.body.quantity,
				};
				const addToCart = new Cart(cart);
				addToCart.save().then(() => {
					res.status(401).send("Success");
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

	// [GET] /category/update/:id
	// async update(req, res, next) {
	// 	await Category.findById({ _id: req.params.id })
	// 		.then((cate) => {
	// 			res.render("adminPages/category/categoryUpdate", {
	// 				cate: mongooseToObject(cate),
	// 				labels: categoryHelp.setUpLabels(req.query.type),
	// 				type: req.query.type,
	// 				layout: "adminLayout",
	// 			});
	// 		})
	// 		.catch((err) => console.log(err));
	// }

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
	 * /customer/cart/delete/{id}:
	 *   delete:
	 *     summary: Delete cart.
	 *     tags: [Cart]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: id
	 *          type: string
	 *          required: true
	 *          description: category ID to delete.
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
	//[DELETE] /category/delete/:id
	delete(req, res) {
		Cart.deleteOne({ _id: req.params.id })
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

module.exports = new cateController();
