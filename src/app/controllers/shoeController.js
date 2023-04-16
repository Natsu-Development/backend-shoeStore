const _ = require("lodash");

const Product = require("../models/product.model");
const Category = require("../models/category.model");
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
			res.render("adminPages/product/manager", {
				shoes,
				layout: "adminLayout",
			});
		});
	}

	// [GET] /product/add
	renderCreate(req, res) {
		if (req.query != "warning") delete req.session.errImage;
		res.render("adminPages/product/productAdd", { layout: "adminLayout" });
	}

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
		try {
			upload("image")(req, res, async function (err) {
				if (err) {
					// url for redirect back
					const backUrl = req.header("Referer") || "/";
					//throw error for the view...
					req.session.errImage = err;
					console.log("error", err);
					return res.redirect(backUrl + "?warning");
				}
				// console.log("Req Body", req.body);
				const formData = req.body;
				formData.arrayCategoryId = productHelp.setArrayCategory(req.body);
				formData.listImgWithColor = [
					{
						colorId: "640d625ff2776e58f0ab4e28",
						listImg: [
							{
								position: 1,
								filename: "air-force-1-07-shoe-NMmm1B (1).png",
							},
							{
								position: 2,
								filename: "air-force-1-07-shoe-NMmm1B (2).png",
							},
						],
						listSize: [
							{
								sizeId: "637f3bae9c2b3199458fe823",
								amount: 10,
								price: 89,
							},
							{
								sizeId: "637f3bc39c2b3199458fe843",
								amount: 10,
								price: 80,
							},
							{
								sizeId: "632c302fedc8f3c521113457",
								amount: 10,
								price: 93,
							},
						],
					},
					{
						colorId: "643a5eb8783226aca7829987",
						listImg: [
							{
								position: 1,
								filename: "air-force-1-shadow-shoe-jcctFq (1).png",
							},
							{
								position: 2,
								filename: "air-force-1-shadow-shoe-jcctFq (2).png",
							},
						],
						listSize: [
							{
								sizeId: "637f3bca9c2b3199458fe853",
								amount: 10,
								price: 89,
							},
							{
								sizeId: "637f3d272012561b75b522f5",
								amount: 10,
								price: 89,
							},
							{
								sizeId: "632c302fedc8f3c521113457",
								amount: 10,
								price: 93,
							},
						],
					},
				];
				formData.arrayImage = imageHelp.createArrayImage(req.files);
				formData.size = productHelp.setAmountForSize(
					req.body.size,
					req.body.amountOfSize
				);
				formData.cateIds = formData.cateIds.filter((cate) => cate.length > 0);
				const product = new Product(formData);
				const newProduct = await product.save();
				await Promise.all([
					formData.cateIds.map(async (cateId) => {
						const cateProduct = new CategoryProduct({
							cateId: cateId,
							proId: newProduct._id,
						});
						await cateProduct.save();
					}),
					formData.listImgWithColor.map(async (color) => {
						const colorProduct = new CategoryProduct({
							proId: newProduct._id,
							cateId: color.colorId,
							listImgByColor: color.listImg,
							listSizeByColor: color.listSize,
						});
						await colorProduct.save();
					}),
				]);
				res.redirect("/admin/product");
			});
		} catch (err) {
			console.log(err);
			res.status(400);
		}
	}

	// [GET] /product/update/:id
	// optimize code in here
	async renderUpdate(req, res, next) {
		// have err in process update image
		if (req.query != "warning") delete req.session.errImage;

		// get all Cate of product
		const cateIdsProduct = await CategoryProduct.find({ proId: req.params.id });
		var arrCateId = [];
		cateIdsProduct.forEach((cateId) => {
			arrCateId.push(cateId.cateId);
		});

		// get category of Product from CateIdsProduct
		const resultCate = await Category.find({
			_id: {
				$in: arrCateId,
			},
		});

		// group Cate Type Id and extract cate key
		const groupByCateTypeId = _(resultCate)
			.groupBy("typeId")
			.map((cate, typeId) => {
				return {
					typeId: typeId,
					cate: _.map(cate, (cate) => {
						return cate;
					}),
				};
			})
			.value();
		console.log(
			"🚀 ~ file: shoeController.js:211 ~ shoeController ~ renderUpdate ~ groupByCateTypeId:",
			groupByCateTypeId
		);

		// get size of shoe
		var listSize = [],
			listSizeAdded = res.locals.listSizeAdded,
			listAnotherCate = [],
			amountOfSize;

		console.log("List Size", listSizeAdded);

		await Promise.all(
			groupByCateTypeId.map((item) => {
				if (item.cate.length > 1) {
					listSizeAdded.forEach(async (cateSizeAdded) => {
						//get amount of size of shoe
						amountOfSize = await CategoryProduct.findOne({
							cateId: cateSizeAdded.cateId.toString(),
							proId: req.params.id,
						});

						listSize.push({
							sizeId: cateSizeAdded.cateId.toString(),
							size: cateSizeAdded.cateName,
							amount: amountOfSize?.amount ? amountOfSize.amount : 0,
						});
					});
				} else {
					item.cate.forEach((anotherCate) => {
						listAnotherCate.push({
							typeId: anotherCate.typeId,
							cateId: anotherCate._id.toString(),
						});
					});
				}
			})
		);
		// console.log("List Cate of Product", listAnotherCate);
		// display product need update to view...
		Product.findOne({ _id: req.params.id })
			.then((product) => {
				const result = mongooseToObject(product);
				console.log;
				res.render("adminPages/product/productUpdate", {
					result,
					// extract key[position] is key of object groupByCateTypeId to get name of this key(typeId)
					listAnotherCate: listAnotherCate,
					listSize: listSize,
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [PUT] /product/saveUpdate/:id
	update(req, res, next) {
		upload("image")(req, res, async function (err) {
			if (err) {
				// url for redirect back
				const backUrl = req.header("Referer") || "/";
				//throw error for the view...
				req.session.errImage = err;
				return res.redirect(backUrl + "?warning");
			}

			// update category for Product
			// get all Cate of product
			const cateIdsProduct = await CategoryProduct.find({
				proId: req.params.id,
			});
			var arrCateId = [];
			cateIdsProduct.forEach((cateId) => {
				arrCateId.push(cateId.cateId);
			});

			// get category of Product from CateIdsProduct
			const resultCate = await Category.find({
				_id: {
					$in: arrCateId,
				},
			});

			// group Cate Type Id and extract cate key
			const groupByCateTypeId = _(resultCate)
				.groupBy("typeId")
				.map((cate, typeId) => {
					return {
						typeId: typeId,
						cate: _.map(cate, (cate) => {
							return cate;
						}),
					};
				})
				.value();

			const listAnotherCateAdded = res.locals.listAnotherCateAdded;
			let arrayIdUpdate = req.body.cateIds;
			let listSizeUpdate = productHelp.setAmountForSize(
				req.body.sizeId,
				req.body.amountOfSize
			);

			// update category for Product(create new or update)
			await Promise.all([
				req.body.cateIds.map((idUpdate) => {
					// update new cate
					for (let typeId in listAnotherCateAdded) {
						groupByCateTypeId.forEach(async (oldCate) => {
							const existedCate =
								listAnotherCateAdded[typeId].find(
									(cate) => cate.cateId.toString() === idUpdate
								) &&
								listAnotherCateAdded[typeId].find(
									(cate) =>
										cate.cateId.toString() === oldCate.cate[0]._id.toString()
								);
							// Have a one case not have check in here insert a new cate for product ....

							if (existedCate) {
								arrayIdUpdate = arrayIdUpdate.filter(
									(newId) => newId !== idUpdate
								);

								await CategoryProduct.findOneAndUpdate(
									{
										proId: req.params.id,
										cateId: oldCate.cate[0]._id.toString(),
									},
									{ cateId: idUpdate }
								);
							}
						});
					}
				}),
			]);

			await Promise.all([
				arrayIdUpdate.forEach((newCate) => {
					for (let typeId in listAnotherCateAdded) {
						listAnotherCateAdded[typeId].forEach(async (cate) => {
							if (cate.cateId.toString() === newCate) {
								await CategoryProduct.findOneAndUpdate(
									{ proId: req.params.id, cateId: newCate },
									{ cateId: newCate },
									{ upsert: true }
								);
							}
						});
					}
				}),
				listSizeUpdate.forEach(async (size) => {
					await CategoryProduct.findOneAndUpdate(
						{ proId: req.params.id, cateId: size.sizeId },
						{ amount: size.amount }
					);
				}),
			]);

			// get information of product and update product
			Product.findOne({ _id: req.params.id })
				.then((product) => {
					product = mongooseToObject(product);
					req.body.arrayImage = imageHelp.handleImageUpdate(req, product);
					// console.log("Req.body", req.body);
					Product.updateOne({ _id: req.params.id }, req.body).then(() => {
						res.redirect("/admin/product");
					});
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	// [DELETE] /product/delete/:id
	delete(req, res) {
		//also delete category of product check in here
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
	 *     parameters:
	 *        - in: query
	 *          name: search
	 *          type: string
	 *          description: shoe name of the shoe to get.
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
	async displayAllProduct(req, res) {
		// if have request search Product
		if (req.query.search) {
			let object = productHelp.setCondition(req.query, "search");
			let products = await Product.find(object);
			products = mutipleMongooseToObject(products);
			return res.status(200).send(products);
		}
		// display all product
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
	 *          example: 6380e790ad8a239b8c5166a2
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
	async productDetail(req, res) {
		const listCatePro = await CategoryProduct.find({ proId: req.params.id });
		let listCateId = [],
			listAnotherCate = [],
			listInfoByColor = [];

		listCatePro.forEach((catePro) => {
			if (catePro?.listImgByColor || catePro.listSizeByColor) {
				listInfoByColor.push({
					id: catePro._id,
					images: catePro.listImgByColor,
					sizes: catePro.listSizeByColor,
				});
			} else {
				listCateId.push(catePro.cateId);
			}
		});

		const listCate = await Category.find({ _id: { $in: listCateId } });
		listCate.forEach((cate) => {
			listAnotherCate.push(cate.name);
		});

		let sizeName;
		// get size of color
		await Promise.all(
			listInfoByColor.map((color) => {
				color.sizes.map(async (size) => {
					sizeName = await Category.findOne({ _id: size.sizeId });
					size.sizeName = sizeName.name;
				});
			})
		);

		Product.findOne({ _id: req.params.id })
			.then((shoe) => {
				shoe = mongooseToObject(shoe);
				shoe.color = listInfoByColor; // TODO: Have a bugs in here
				shoe.listAnotherCate = listAnotherCate;
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
