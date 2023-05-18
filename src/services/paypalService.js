const paypal = require("paypal-rest-sdk");

// paypal configure
paypal.configure({
	mode: "sandbox",
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET_KEY,
});

const urlRedirect = {
	backendHost: "https://shoestore-backend-tjms.onrender.com/result-paypal",
	frontendHost: "https://shoe-store-fe.vercel.app/checkout",
	backendLocal: "http://localhost:3010/result-paypal",
	frontendLocal: "https://localhost:3001/checkout",
};

const setUpPayment = (listCart, discount, userId, orderId) => {
	let isFirstElement = true;
	const items = listCart.map((cart) => {
		if (isFirstElement) {
			isFirstElement = false;
			return {
				name: cart.productName,
				price: Number(cart.productPrice - discount.totalDiscount).toFixed(2),
				currency: "USD",
				quantity: cart.quantity,
			};
		}

		return {
			name: cart.productName,
			price: Number(cart.productPrice).toFixed(2),
			currency: "USD",
			quantity: cart.quantity,
		};
	});

	const create_payment_json = {
		intent: "sale",
		payer: {
			payment_method: "paypal",
		},
		redirect_urls: {
			return_url: urlRedirect.backendHost,
			cancel_url: urlRedirect.frontendHost,
		},
		transactions: [
			{
				item_list: {
					items,
				},
				amount: {
					currency: "USD",
					total: discount.totalMoney.toFixed(2),
				},
				description: `This is the payment for orderId: ${orderId}.`,
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
