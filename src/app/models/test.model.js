const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Customer = new Schema(
	{
		cateId: { type: String, maxLength: 255, required: true },
		proId: { type: String, maxLength: 600, required: true },
		avatar: { type: String, default: undefined },
		listImgByColor: { type: Array, default: undefined },
		listSizeByColor: { type: Array, default: undefined },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Customer", Customer);
