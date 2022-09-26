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

	async getCartByUserId(userId) {
		let carts = await Cart.find({ userId: userId });
		carts = mutipleMongooseToObject(carts);
		let totalCart = 0;
		// get info of product
		const results = [];
		await Promise.all(
			carts.map(async (cart) => {
				await Product.findOne({ _id: cart.productId }).then((product) => {
					cart.image = product.arrayImage[0].filename;
					cart.productName = product.name;
					cart.productPrice = product.price;
					totalCart += cart.quantity * product.price;
					results.push(cart);
				});
			})
		);
		return { results, totalCart };
	}

	async deleteCart(arrCartId) {
		const deletedCart = await Cart.deleteMany({ _id: { $in: arrCartId } });
		if (deletedCart.modifiedCount > 0) {
			return true;
		} else return false;
	}
}

module.exports = new cartHelp();
