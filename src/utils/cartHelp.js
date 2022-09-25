const Cart = require("../app/models/cart.model");
const Product = require("../app/models/product.model");
const { mutipleMongooseToObject, mongooseToObject } = require("./mongoose");

class cartHelp {
	async updateDuplicateCart(req, userId) {
		let carts = await Cart.find({ userId: userId });
		carts = mutipleMongooseToObject(carts);
		await Promise.all(
			carts.map(async (cart) => {
				if (
					cart.productId == req.body.productId &&
					cart.size == req.body.size
				) {
					cart.quantity += req.body.quantity;
					const product = await Product.findOne({ _id: req.body.productId });
					const updateSuccess = await Cart.updateOne(
						{ _id: cart._id },
						{ quantity: cart.quantity, total: product.price * cart.quantity }
					);

					if (updateSuccess.modifiedCount === 1) return true;
					else return false;
				}
			})
		);
	}
}

module.exports = new cartHelp();
