const shoeRouter = require("./shoes.route");
const siteRouter = require("./site.route");
const cusRouter = require("./cus.route");
const accountRouter = require("./account.route");
const adminRouter = require("./admin.route");
const siteAdminRouter = require("./siteAdmin.route");

// models and help of Category
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../utils/mongoose");
const CategoryType = require("../app/models/categoryType.model");
const Category = require("../app/models/category.model");
const categoryHelp = require("../utils/categoryHelp");
const Shoe = require("../app/models/product.model");
const Account = require("../app/models/account.model");
const passportConfig = require("../app/middlewares/passport.mdw");

// const verify = require('../app/middlewares/auth.mdw');
function route(app) {
	// locals, why session not access in handlebars?
	app.use(async (req, res, next) => {
		// await Category.find({}).then((cates) => {
		// 	cates = mutipleMongooseToObject(cates);
		// 	var resultFilter = categoryHelp.filterCategory(cates);
		// 	res.locals.listBrand = resultFilter.listBrand;
		// 	res.locals.listStyle = resultFilter.listStyle;
		// 	res.locals.listSize = categoryHelp.sortSize(resultFilter.listSize);
		// });
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

		var resultFilter = categoryHelp.filterCategory(result);
		res.locals.listBrand = resultFilter.value0;
		res.locals.listStyle = resultFilter.value1;
		// res.locals.listSize = categoryHelp.sortSize(value2);
		res.locals.listSize = categoryHelp.sortSize(resultFilter.value2);

		await Shoe.find({}).then((shoes) => {
			shoes = mutipleMongooseToObject(shoes);
			res.locals.listShoe = shoes;
		});
		// edit condition
		await Account.find().then((accounts) => {
			accounts = mutipleMongooseToObject(accounts);
			res.locals.listCustomer = accounts;
		});
		res.locals.errImage = req.session.errImage;
		res.locals.registerErr = req.session.registerErr;
		res.locals.loginErr = req.session.loginErr;
		next();
	});
	// admin routes api
	// app.use("/api/v1/admin", passportConfig.authAdmin, adminRouter);
	// admin routes handlebars
	app.use("/admin", passportConfig.authAdmin, adminRouter);

	// shoe
	app.use("/api/v1/shoes", shoeRouter);

	// account
	app.use("/api/v1/auth", accountRouter);

	// cart and checkout
	app.use("/api/v1/customer", passportConfig.authCustomer, cusRouter);

	// site and index
	app.use("/api/v1", siteRouter);

	//admin login page and handle login
	app.use("/", siteAdminRouter);
}
module.exports = route;
