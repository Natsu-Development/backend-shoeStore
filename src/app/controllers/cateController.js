const Category = require("../models/category.model");
const CategoryType = require("../models/categoryType.model");
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
			const catesByType = await Category.findOne({
				typeId: req.params.typeId,
			});
			console.log(
				"🚀 ~ file: cateController.js ~ line 54 ~ cateController ~ manager ~ catesByType",
				catesByType
			);
			// res.status(200).send(catesByType);
			res.render("adminPages/category/manager", {
				catesByType: catesByType,
				// labels: categoryHelp.setUpLabels(req.query.type),
				layout: "adminLayout",
			});
		} catch (err) {
			console.log(err);
			res.status(400).send("Invalid input");
		}
	}

	// // [GET] /category/add
	// create(req, res, next) {
	// 	res.render("adminPages/category/addCategory", {
	// 		type: req.query.type,
	// 		labels: categoryHelp.setUpLabels(req.query.type),
	// 		layout: "adminLayout",
	// 	});
	// }

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
			console.log("test api");
			// check typeId have exist in category type
			const typeIdExist = await CategoryType.findOne({
				_id: req.params.typeId,
			});
			if (typeIdExist) {
				const newCategory = { ...req.body, typeId: req.params.typeId };
				const cate = new Category(newCategory);
				await cate.save();
				res.status(200).send({ message: "Success!" });
			} else {
				res.status(400).send({ message: "Invalid input" });
			}
		} catch (err) {
			console.log(err);
			res.status(400).send({ message: "Invalid input" });
		}
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
		Category.updateOne({ _id: req.params.id }, req.body)
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

		let i = 1;
		let result = categoryList.reduce((c, v) => {
			c[v.type] = c[v.type] || {};
			// console.log("test", v);
			c[v.type]["cateId" + i] = v.result._id;
			// console.log("_id", v.result._id);
			c[v.type]["cateName" + i] = v.result.name;
			i++;
			// console.log("_id", v.result.name);
			return c;
		}, {});

		// let result = categoryList.reduce((c, v) => {
		// 	c[v.type]['item'] = c[v.type]['item'] || i = 1;
		// 	// console.log("test", v);
		// 	c[v.type]['item'] = v.result._id;
		// 	// console.log("_id", v.result._id);
		// 	c[v.type]["cateName" + i] = v.result.name;
		// 	i++;
		// 	// console.log("_id", v.result.name);
		// 	return c;
		// }, {});

		console.log("test", result);

		// console.log(categoryList);
	}
}

module.exports = new cateController();
