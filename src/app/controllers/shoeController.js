const Product = require("../models/product.model");
const CategoryProduct = require("../models/cateProduct.model");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const categoryHelp = require("../../utils/categoryHelp");
const productHelp = require("../../utils/productHelp");
const imageHelp = require("../../utils/imageHelp");
const upload = require("../middlewares/upload.mdw");

class shoeController {
	/**
	 * @swagger
	 * /admin/product:
	 *   get:
	 *     summary: List of products.
	 *     tags: [Admin Products]
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  _id:
	 *                    type: string
	 *                    example: 1.
	 *                  productName:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  price:
	 *                    type: integer
	 *                    example: 68$
	 *                  introduce:
	 *                    type: string
	 *                    example: The introduce of product
	 *                  arraySize:
	 *                    type: array
	 *                    items:
	 *                      example: [{size: 6, amount: 2}, {size: 7, amount: 3}]
	 *                  arrayImage:
	 *                    type: array
	 *                    items:
	 *                      example: [{position: 0, filename: imgName1}, {position: 1, filename: imgName2}]
	 *                  slug:
	 *                    type: string
	 *                    example: The slug of product
	 *       400:
	 *         description: Get list failed
	 */
	// [GET] /product
	manager(req, res) {
		Product.find({}).then((shoes) => {
			shoes = mutipleMongooseToObject(shoes);
			// res.render('adminPages/product/manager', {
			//     shoes,
			//     layout: 'adminLayout'
			// });
			res.json(shoes);
		});
	}

	// [GET] /product/add
	// create(req, res) {
	// 	if (req.query != "warning") delete req.session.errImage;
	// 	res.render("adminPages/product/productAdd", { layout: "adminLayout" });
	// }

	/**
	 * @swagger
	 * /admin/product/add:
	 *   post:
	 *     summary: Add products.
	 *     tags: [Admin Products]
	 *     security:
	 *        - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                  name:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  price:
	 *                    type: integer
	 *                    example: 68$
	 *                  introduce:
	 *                    type: string
	 *                    example: The introduce of product
	 *                  description:
	 *                    type: string
	 *                    example: The description of product
	 *                  arrayCategoryId:
	 *                    type: array
	 *                    example: [632c260d71e4353b5869f544, 632c268271e4353b5869f559]
	 *                  size:
	 *                    type: array
	 *                    example: [{cateId: 632c269a71e4353b5869f560, amount: 2}, {cateId: 632c302fedc8f3c521113457, amount: 3}]
	 *                  arrayImage:
	 *                    type: array
	 *                    example: [{position: 0, filename: imgName1}, {position: 1, filename: imgName2}]
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  _id:
	 *                    type: string
	 *                    example: 1.
	 *                  productName:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  price:
	 *                    type: integer
	 *                    example: 68$
	 *                  introduce:
	 *                    type: string
	 *                    example: The introduce of product
	 *                  arraySize:
	 *                    type: array
	 *                    items:
	 *                      example: [{size: 6, amount: 2}, {size: 7, amount: 3}]
	 *                  arrayImage:
	 *                    type: array
	 *                    items:
	 *                      example: [{position: 0, filename: imgName1}, {position: 1, filename: imgName2}]
	 *                  slug:
	 *                    type: string
	 *                    example: The slug of product
	 *       400:
	 *         description: Get list failed
	 */
	// [POST] /admin/product/create
	async create(req, res) {
		// upload("image")(req, res, async function (err) {
		// 	if (err) {
		// 		// url for redirect back
		// 		const backUrl = req.header("Referer") || "/";
		// 		//throw error for the view...
		// 		req.session.errImage = err;
		// 		return res.redirect(backUrl + "?warning");
		// 	}
		// 	const formData = req.body;
		// 	formData.arrayImage = imageHelp.createArrayImage(req.files);
		// 	formData.size = productHelp.setAmountForSize(
		// 		req.body.size,
		// 		req.body.amountOfSize
		// 	);
		// 	formData.amount = productHelp.setAmount(req.body.amountOfSize);
		// 	const product = new Product(formData);
		// 	await product
		// 		.save()
		// 		.then(() => {
		// 			res.redirect("/admin/product");
		// 		})
		// 		.catch((err) => console.log(err));
		// });
		try {
			const formData = req.body;
			const product = new Product(formData);
			const newProduct = await product.save();
			await Promise.all([
				...req.body.arrayCategoryId.map(async (cateId) => {
					const cateProduct = new CategoryProduct({
						cateId: cateId,
						proId: newProduct._id,
					});
					const result = await cateProduct.save();
				}),
				...req.body.size.map(async (size) => {
					const sizeProduct = new CategoryProduct({
						cateId: size.cateId,
						proId: newProduct._id,
						amount: size.amount,
					});
					const resultSize = await sizeProduct.save();
				}),
			]);
			return res.status(201).send("Success");
		} catch (err) {
			console.log(err);
			res.status(400);
		}
	}

	// [GET] /product/update/:id
	update(req, res, next) {
		// have err in process update image
		if (req.query != "warning") delete req.session.errImage;
		// display product need update to view...
		Product.findOne({ _id: req.params.id })
			.then((product) => {
				const result = mongooseToObject(product);
				res.render("adminPages/product/productUpdate", {
					result,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}
	// [PUT] /product/saveUpdate/:id
	update(req, res, next) {
		upload("image")(req, res, function (err) {
			if (err) {
				// url for redirect back
				const backUrl = req.header("Referer") || "/";
				//throw error for the view...
				req.session.errImage = err;
				return res.redirect(backUrl + "?warning");
			}
			// get information of product and update product
			Product.findOne({ _id: req.params.id })
				.then((product) => {
					product = mongooseToObject(product);
					req.body.arrayImage = imageHelp.handleImageUpdate(req, product);
					console.log(
						"🚀 ~ file: shoeController.js ~ line 82 ~ shoeController ~ .then ~ req.body.arrayImage",
						req.body.arrayImage
					);
					req.body.size = productHelp.setAmountForSize(
						req.body.size,
						req.body.amountOfSize
					);
					req.body.amount = productHelp.setAmount(req.body.amountOfSize);
					Product.updateOne({ _id: req.params.id }, req.body).then(() => {
						// res.redirect('/admin/product');
						console.log("done");
					});
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	// [DELETE] /product/delete/:id
	delete(req, res) {
		Product.deleteOne({ _id: req.params.id })
			.then(() => res.redirect("/admin/product"))
			.catch((err) => console.log(err));
	}

	// CLIENT
	/**
	 * @swagger
	 * /shoes/displayAllProducts:
	 *   get:
	 *     summary: List of products.
	 *     tags: [Products]
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  _id:
	 *                    type: string
	 *                    example: 1.
	 *                  productName:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  price:
	 *                    type: integer
	 *                    example: 68$
	 *                  introduce:
	 *                    type: string
	 *                    example: The introduce of product
	 *                  arraySize:
	 *                    type: array
	 *                    items:
	 *                      example: [{size: 6, amount: 2}, {size: 7, amount: 3}]
	 *                  arrayImage:
	 *                    type: array
	 *                    items:
	 *                      example: [{position: 0, filename: imgName1}, {position: 1, filename: imgName2}]
	 *                  slug:
	 *                    type: string
	 *                    example: The slug of product
	 *       400:
	 *         description: Get list failed
	 */
	// display product in home
	displayAllProduct(req, res) {
		// if have request search Product
		// if (req.body.search) {
		// 	let object = productHelp.setCondition(req.body, "search");
		// 	Product.find(object)
		// 		.then((shoes) => {
		// 			shoes = mutipleMongooseToObject(shoes);
		// 			if (
		// 				req.header("Referer") === "http://localhost:3000/" ||
		// 				req.header("Referer") === "http://localhost:3000/shoes/shoeByGender"
		// 			) {
		// 				res.json({
		// 					beforeUrl: req.header("Referer"),
		// 					data: shoes,
		// 				});
		// 			} else {
		// 				res.json({
		// 					search: req.body.search,
		// 				});
		// 			}
		// 		})
		// 		.catch((err) => console.log(err));
		// }
		// display all product
		// else {
		Product.find({})
			.then((shoes) => {
				shoes = mutipleMongooseToObject(shoes);
				// res.render("home", { shoes });
				res.json(shoes);
			})
			.catch((err) => {
				console.log(err);
				res.status(400);
			});
		// }
	}

	/**
	 * @swagger
	 * /shoes/{id}:
	 *   get:
	 *     summary: Details of products.
	 *     tags: [Products]
	 *     parameters:
	 *        - in: path
	 *          name: id
	 *          type: string
	 *          required: true
	 *          description: shoe ID of the shoe to get.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  _id:
	 *                    type: string
	 *                    example: 1.
	 *                  productName:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  price:
	 *                    type: integer
	 *                    example: 68$
	 *                  introduce:
	 *                    type: string
	 *                    example: The introduce of product
	 *                  arraySize:
	 *                    type: array
	 *                    items:
	 *                      example: [{size: 6, amount: 2}, {size: 7, amount: 3}]
	 *                  arrayImage:
	 *                    type: array
	 *                    items:
	 *                      example: [{position: 0, filename: imgName1}, {position: 1, filename: imgName2}]
	 *                  slug:
	 *                    type: string
	 *                    example: The slug of product
	 *       400:
	 *         description: Get item failed
	 */
	productDetail(req, res) {
		Product.findOne({ _id: req.params.id })
			.then((shoe) => {
				console.log(shoe);
				shoe = mongooseToObject(shoe);
				// res.render("productDetail", { shoe });
				res.json(shoe);
			})
			.catch((err) => {
				console.log(err);
				res.status(400);
			});
	}

	// display product in shoe By Gender
	displayShoeByGender(req, res) {
		// if have query search in another page throw it to shoeByGender
		if (req.query.search) {
			let object = productHelp.setCondition(req.body, "search");
			Product.find(object)
				.then((shoes) => {
					shoes = mutipleMongooseToObject(shoes);
					res.render("shoeByGender", { shoes });
				})
				.catch((err) => console.log(err));
		}
		// if have request filter product
		else if (req.body.brand || req.body.style) {
			let object = productHelp.setCondition(req.body, "filter");
			Product.find({ $and: [object] })
				.then((shoes) => {
					shoes = mutipleMongooseToObject(shoes);
					res.json({ msg: "success", data: shoes });
				})
				.catch((err) => console.log(err));
		}
		// display all product in shoes by gender
		else {
			Product.find({}).then((shoes) => {
				shoes = mutipleMongooseToObject(shoes);
				res.render("shoeByGender", { shoes });
			});
		}
	}
}

module.exports = new shoeController();
