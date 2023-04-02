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
		if (req.query != "warning") delete req.session.errImage;
		res.render("adminPages/promotional/promoAdd", {
			layout: "adminLayout",
		});
	}

	// [GET] /promotional/renderUpdate
	renderUpdate(req, res) {
		Promotional.findById({ _id: req.params.id })
			.then((promo) => {
				res.render("adminPages/promotional/promoUpdate", {
					promo: mongooseToObject(promo),
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
		const newPromo = req.body;
		const promo = new Promotional(newPromo);
		if (this.isExitedPromo(promo.code)) {
			const backUrl = req.header("Referer") || "/";
			//throw error for the view...
			req.session.errText = "This promotion already existed. Please try again.";
			return res.redirect(backUrl + "?warning");
		}
		promo
			.save()
			.then(() => {
				res.redirect("/admin/promotional");
			})
			.catch((err) => {
				console.log(err);
			});
	}

	//[PUT] /promotional/saveUpdate/:id
	update(req, res) {
		if (this.isExitedPromo(req.body.code)) {
			const backUrl = req.header("Referer") || "/";
			//throw error for the view...
			req.session.errText = "This promotion already existed. Please try again.";
			return res.redirect(backUrl + "?warning");
		}
		Promotional.updateOne({ _id: req.params.id }, req.body)
			.then(() => {
				res.redirect(`/admin/promotional`);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	//[DELETE] /promotional/delete/:id
	delete(req, res) {
		Promotional.deleteOne({ _id: req.params.id })
			.then(() => {
				res.redirect("/admin/promotional");
			})
			.catch((err) => {
				console.log(err);
			});
	}

	/**
	 * @swagger
	 * /customer/promotion:
	 *   get:
	 *     summary: List of Promotion.
	 *     tags: [Customer Service]
	 *     security:
	 *        - bearerAuth: []
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  listPromotion:
	 *                    type: array
	 *                    example: []
	 *       400:
	 *         message: Error
	 */
	async availablePromotion(req, res) {
		const currentDate = new Date();
		const listPromotion = await Promotional.find({
			$and: [
				{ startDate: { $lte: currentDate } },
				{ endDate: { $gte: currentDate } },
				{ amount: { $gt: 0 } },
			],
		});
		res.status(200).send({ listPromotion });
	}

	/**
	 * @swagger
	 * /customer/applyPromo:
	 *   put:
	 *     summary: Apply promo.
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
	 *                cartTotal:
	 *                  type: number
	 *                  description: Cart Total.
	 *                  example: 150
	 *                listPromoCode:
	 *                  type: array
	 *                  description: List Promo Code.
	 *                  example: ['EVENT', 'TEST']
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  cartTotal:
	 *                    type: number
	 *       400:
	 *         message: Error
	 */
	// apply promotional in cart
	async applyPromo(req, res) {
		try {
			let totalCart = req.body.cartTotal;

			const listPromoCode = req.body.listPromoCode;

			const resultHandle = await this.handlePromo(
				listPromoCode,
				totalCart,
				"checkPromo"
			);

			if (resultHandle?.invalid) {
				return res.status(200).send({ message: resultHandle.message });
			}

			return res.status(200).send({
				totalCart: resultHandle.totalMoney,
				discount: resultHandle.totalDiscount,
			});
		} catch (err) {
			console.log(err);
			res.status(400);
		}
	}

	async handlePromo(listPromoCode, totalMoney, action) {
		let promo,
			totalDiscount = 0,
			invalidPromo,
			listPromoApplied = [];

		const currentDate = new Date();
		// TODO: Can fix return map function
		// find promo and check promo is valid
		await Promise.all(
			listPromoCode.map(async (promoCode) => {
				promo = await Promotional.findOne({
					$and: [
						{ code: promoCode },
						{ startDate: { $lte: currentDate } },
						{ endDate: { $gte: currentDate } },
						{ amount: { $gt: 0 } },
					],
				});

				// invalid promoCode
				if (!promo) {
					invalidPromo = promoCode;
					return;
				}
				totalMoney = totalMoney * (Number(promo?.discount) / 100);
				totalDiscount += Number(promo.discount);
				if (action == "checkout") {
					listPromoApplied.push({ id: promo._id, amount: promo.amount });
				}
			})
		);

		if (invalidPromo) {
			return {
				invalid: true,
				message: `Promo ${invalidPromo} is expired or out of stock. Please try again`,
			};
		}

		await Promise.all(
			listPromoApplied.map(async (promoApplied) => {
				await Promotional.updateOne(
					{ _id: promoApplied.id },
					{ amount: promoApplied.amount - 1 }
				);
			})
		);

		return { totalMoney, totalDiscount };
	}

	async isExitedPromo(promoCode) {
		const isExited = Promotional.findOne({ code: promoCode });
		if (isExited) return true;
		return false;
	}
}

module.exports = new promotionalController();
