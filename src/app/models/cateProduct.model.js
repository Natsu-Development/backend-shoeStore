const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoryProduct = new Schema(
	{
		cateId: { type: String, maxLength: 255, required: true },
		proId: { type: String, maxLength: 600, required: true },
		amount: { type: Number },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("CategoryProduct", CategoryProduct);
