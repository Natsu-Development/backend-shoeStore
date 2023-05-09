const Account = require("../app/models/account.model");

module.exports = {
	// set amount for order
	setAmountForSize: (size, amountOfSize) => {
		var result = [],
			i = 0;
		while (size[i] != undefined) {
			if (amountOfSize[i] === "") {
				result.push(`${size[i]}:0`);
				i++;
				continue;
			}
			result.push({
				sizeId: size[i],
				amount: amountOfSize[i],
			});
			i++;
		}
		return result;
	},

	setArrayCategory: (request) => {
		var result = [];
		result.push(request.brand);
		result.push(request.style);
		return result;
	},

	setAmount: (amountOfSize) => {
		var amount = 0;
		amountOfSize = amountOfSize.map(Number);
		for (var i = 0; i < amountOfSize.length; i++) {
			amount += amountOfSize[i];
		}
		return amount;
	},

	// set condition for search or filter product
	setCondition: (condition, action) => {
		if (action === "search") {
			let object = {};
			object.name = new RegExp(condition.search, "i");
			return object;
		} else {
			if (condition.brand != "") {
				return { brand: condition.brand };
			} else if (condition.style != "") {
				return { style: condition.style };
			} else {
				return {
					brand: condition.brand,
					style: condition.style,
				};
			}
		}
	},

	async handleRating(listRate) {
		if (!listRate || listRate.length === 0) {
			return 0;
		}

		let totalRate = 0,
			account,
			listUserComment = [];

		await Promise.all(
			listRate.map(async (rate) => {
				account = await Account.findOne({ _id: rate.userId });
				listUserComment.push({
					picture: account?.picture,
					name: account.fullname,
					score: rate.rating,
					comment: rate.comment,
				});
				totalRate += Number(rate.rating);
			})
		);

		const averageScore = Number(totalRate / listRate.length);

		return { listUserComment, averageScore };
	},
};
