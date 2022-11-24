const Category = require("../models/category.model");
const CategoryType = require("../models/categoryType.model");
const CateProduct = require("../models/cateProduct.model");
const Product = require("../models/product.model");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
const categoryHelp = require("../../utils/categoryHelp");

class cateController {
	/**
	 * @swagger
	 * /admin/categoryByType/{typeId}:
	 *   get:
	 *     summary: List of category by type.
	 *     tags: [Admin Category]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: typeId
	 *          type: string
	 *          required: true
	 *          description: typeId of category to display.
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
	 *                  name:
	 *                    type: string
	 *                    example: Adidas's product name.
	 *                  description:
	 *                    type: string
	 *                    example: Description of category
	 *                  type:
	 *                    type: string
	 *                    example: The type of category
	 *                  slug:
	 *                    type: string
	 *                    example: The slug of category
	 *       400:
	 *         description: Get list failed
	 */
	async manager(req, res) {
		try {
			const catesByType = await Category.find({
				typeId: req.params.typeId,
			});
			const type = await CategoryType.findById(req.params.typeId);

			res.render("adminPages/category/manager", {
				catesByType: mutipleMongooseToObject(catesByType),
				type: mongooseToObject(type),
				labels: categoryHelp.setUpLabels(type.type),
				layout: "adminLayout",
			});
		} catch (err) {
			console.log(err);
			res.status(400).send("Invalid input");
		}
	}

	// [GET] /category/add
	async renderCreate(req, res, next) {
		const type = await CategoryType.findById(req.params.typeId);
		res.render("adminPages/category/addCategory", {
			type: mongooseToObject(type),
			labels: categoryHelp.setUpLabels(type.type),
			layout: "adminLayout",
		});
	}

	/**
	 * @swagger
	 * /admin/category/{typeId}/add:
	 *   post:
	 *     summary: Add category.
	 *     tags: [Admin Category]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: typeId
	 *          type: string
	 *          required: true
	 *          description: typeId of category to add.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                name:
	 *                  type: string
	 *                  description: Name of the category.
	 *                description:
	 *                  type: string
	 *                  description: Description of the category.
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
			// // check typeId have exist in category type
			// const typeIdExist = await CategoryType.findOne({
			// 	_id: req.params.typeId,
			// });
			// if (typeIdExist) {
			const newCategory = { ...req.body, typeId: req.params.typeId };
			const cate = new Category(newCategory);
			await cate.save();
			res.redirect(`/admin/category/${req.params.typeId}`);

			// res.status(200).send({ message: "Success!" });
			// } else {
			// 	res.status(400).send({ message: "Invalid input" });
			// }
		} catch (err) {
			console.log(err);
			// res.status(400).send({ message: "Invalid input" });
		}
	}

	// [GET] /category/update/:id
	async renderUpdate(req, res) {
		const type = await CategoryType.findById(req.params.typeId);
		Category.findById({ _id: req.params.cateId })
			.then((cate) => {
				res.render("adminPages/category/categoryUpdate", {
					cate: mongooseToObject(cate),
					labels: categoryHelp.setUpLabels(type.type),
					type: mongooseToObject(type),
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	/**
	 * @swagger
	 * /admin/category/update/{id}:
	 *   put:
	 *     summary: Update category.
	 *     tags: [Admin Category]
	 *     security:
	 *        - bearerAuth: []
	 *     parameters:
	 *        - in: path
	 *          name: id
	 *          type: string
	 *          required: true
	 *          description: category id to update.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                name:
	 *                  type: string
	 *                  description: Name of the category.
	 *                description:
	 *                  type: string
	 *                  description: Description of the category.
	 *                type:
	 *                  type: string
	 *                  description: Type of the category.
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
	//[PUT] /category/update/:id
	update(req, res, next) {
		Category.updateOne({ _id: req.params.cateId }, req.body)
			.then(() => {
				res.redirect(`/admin/category/${req.params.typeId}`);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	/**
	 * @swagger
	 * /admin/category/delete/{id}:
	 *   delete:
	 *     summary: Delete category.
	 *     tags: [Admin Category]
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
		Category.deleteOne({ _id: req.params.id })
			.then(() => {
				res.redirect("back");
			})
			.catch((err) => {
				console.log(err);
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

	async getAllTypes(req, res) {
		const typeList = await CategoryType.find({});
		const result = [];
		typeList.forEach((type) => {
			result.push({ type: type.type });
		});
		return result;
	}

	// CLIENT
	/**
	 * @swagger
	 * /category:
	 *   get:
	 *     summary: List of category.
	 *     tags: [Category]
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  brand:
	 *                    type: array
	 *                    items:
	 *                    example: [{"cateId": "632c260d71e4353b5869f544", "cateName": "Adidas"}, {"cateId": "635a9662e2d2ecfc5ae46158", "cateName": "Nike"}]
	 *                  style:
	 *                    type: array
	 *                    items:
	 *                    example: [{"cateId": "632c260d71e4353b5869f544", "cateName": "Sneaker"}, {"cateId": "635a9662e2d2ecfc5ae46158", "cateName": "Dad shoes"}]
	 *       400:
	 *         description: Get list failed
	 */
	async getAllCategory(req, res) {
		const categoryList = await CategoryType.aggregate([
			{ $addFields: { cateTypeId: { $toString: "$_id" } } },
			{
				$lookup: {
					from: "categories",
					localField: "cateTypeId",
					foreignField: "typeId",
					as: "result",
				},
			},
			{
				$unwind: {
					path: "$result",
					preserveNullAndEmptyArrays: false,
				},
			},
		]);

		let result = categoryList.reduce((c, v) => {
			c[v.type] = c[v.type] || [];
			c[v.type].push({ cateId: v.result._id, cateName: v.result.name });
			return c;
		}, {});

		res.status(200).send(result);
	}

	/**
	 * @swagger
	 * /category/filter:
	 *   post:
	 *     summary: List of category.
	 *     tags: [Category]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                arrayCateId:
	 *                  type: array
	 *                  example: ["632c260d71e4353b5869f544", "632c268271e4353b5869f559", "632c269a71e4353b5869f560", "632c302fedc8f3c521113457"]
	 *                  description: The array of categories to filter.
	 *     responses:
	 *       200:
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
	async filterByCategory(req, res) {
		const productList = await Product.aggregate([
			{ $addFields: { productId: { $toString: "$_id" } } },
			{
				$lookup: {
					from: "categoryproducts",
					localField: "productId",
					foreignField: "proId",
					as: "result",
				},
			},
			{
				$unwind: {
					path: "$result",
					preserveNullAndEmptyArrays: false,
				},
			},
		]);

		let results = [];
		results.push(productList.reduce((c, v) => {
			c[v.productId] = c[v.productId] || [];
			c[v.productId].push(v.result.cateId);
			return c;
		}, {}));
		console.log('Result', results);

		let test = [];
		for(let i = 0; i < results.length; i++) {
			// console.log(results[i]);
			// results[i] = Object.entries(results[i]);
			console.log(typeof results[i][0]);
			console.log(results[i][0]);
		}
		results.forEach((result) => {
			let flag = 0;
			console.log('test', result);
			console.log(typeof result);
			flag = result.every((element) => {
				if(req.arrayCateId.include(element)) {
					return true;
				}
				return false;
			});
			if(flag) {
				console.log(result);
				// test.push(result);
			}
		})
		// console.log('Result test', result[0]);
	}
}

module.exports = new cateController();
