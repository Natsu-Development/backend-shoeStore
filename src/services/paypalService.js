const paypal = require("paypal-rest-sdk");
const URL_REDIRECTS = require("../constants/urlRedirect");

// paypal configure
paypal.configure({
	mode: "sandbox",
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET_KEY,
});

const setUpPayment = (listCart, discount, userId, orderId) => {
	let price = 0;
	const items = listCart.map((cart) => {
		if (!Number(discount.totalDiscount) > 0) {
			return {
				name: cart.productName,
				price: Number(cart.productPrice).toFixed(2),
				currency: "USD",
				quantity: cart.quantity,
			};
		}

		if (discount.totalDiscount > cart.productPrice) {
			discount.totalDiscount -= Number(cart.productPrice);
			return {
				name: cart.productName,
				price: Number(0).toFixed(2),
				currency: "USD",
				quantity: cart.quantity,
			};
		} else {
			price = Number(cart.productPrice) - Number(discount.totalDiscount);
			discount.totalDiscount = 0;
			return {
				name: cart.productName,
				price: Number(price).toFixed(2),
				currency: "USD",
				quantity: cart.quantity,
			};
		}
	});

	const create_payment_json = {
		intent: "sale",
		payer: {
			payment_method: "paypal",
		},
		redirect_urls: {
			return_url: URL_REDIRECTS.backendHost,
			cancel_url: URL_REDIRECTS.frontendHost,
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
