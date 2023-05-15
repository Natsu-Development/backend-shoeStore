const paypal = require("paypal-rest-sdk");

// paypal configure
paypal.configure({
	mode: "sandbox",
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET_KEY,
});

const setUpPayment = (carts, userId) => {
	const items = carts.results.map((cart) => ({
		name: cart.productName,
		price: Number(cart.productPrice).toFixed(2),
		currency: "USD",
		quantity: cart.quantity,
	}));

	const create_payment_json = {
		intent: "sale",
		payer: {
			payment_method: "paypal",
		},
		redirect_urls: {
			return_url: "https://shoestore-backend-tjms.onrender.com/result-paypal",
			// return_url: "http://localhost:3010/result-paypal",
			cancel_url: "https://localhost:3001/my-orders",
		},
		transactions: [
			{
				item_list: {
					items,
				},
				amount: {
					currency: "USD",
					total: carts.totalCart.toFixed(2),
				},
				description: "This is the payment description.",
				custom: userId,
			},
		],
	};

	return create_payment_json;
};

module.exports = {
	paypal,
	setUpPayment,
};
