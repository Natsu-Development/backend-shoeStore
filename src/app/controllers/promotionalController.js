const Promotional = require("../models/promotional.model");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");

class promotionalController {
	// [GET] /promotional
	async manager(req, res, next) {
		// Can use lean() as a callback to change mongoooseList to Object
		Promotional.find()
			.then((promotes) => {
				res.render("adminPages/promotional/manager", {
					promotes: mutipleMongooseToObject(promotes),
					layout: "adminLayout",
				});
			})
			.catch((err) => {
				next(err);
			});
	}

	// [GET] /promotional/renderCreate
	renderCreate(req, res) {
		res.render("adminPages/promotional/addPromotional", {
			layout: "adminLayout",
		});
	}

	// [GET] /promotional/renderUpdate
	renderUpdate(req, res) {
		promotional
			.findById({ _id: req.params.id })
			.then((cateType) => {
				res.render("adminPages/promotional/promotionalUpdate", {
					cateType: mongooseToObject(cateType),
					labels: categoryHelp.setUpLabels(cateType.type),
					layout: "adminLayout",
				});
			})
			.catch((err) => console.log(err));
	}

	// [GET] /promotional/getAll
	getAll(req, res) {
		promotional.find().then((cateTypes) => {
			cateTypes = mutipleMongooseToObject(cateTypes);
			res.send(cateTypes);
		});
	}

	// [POST] /promotional/add
	create(req, res) {
		// req.body.type = req.query.type;
		const newCategory = req.body;
		const cate = new promotional(newCategory);
		cate
			.save()
			.then(() => {
				res.redirect("/admin/promotional");
			})
			.catch((err) => {
				console.log(err);
			});
	}

	//[PUT] /promotional/update/:id
	update(req, res) {
		console.log(req.body);
		promotional
			.updateOne({ _id: req.params.id }, req.body)
			.then(() => {
				res.redirect(`/admin/promotional`);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	//[DELETE] /promotional/delete/:id
	delete(req, res) {
		promotional
			.deleteOne({ _id: req.params.id })
			.then(() => {
				Category.deleteMany({ typeId: req.params.id }).then(() => {
					res.redirect("/admin/promotional");
				});
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
}

module.exports = new promotionalController();
