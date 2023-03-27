const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Promotional = new Schema(
	{
		code: { type: String, maxLength: 255 },
		percent: { type: Number, maxLength: 10 },
		expiredAt: { type: Date },
		userId: { type: String, maxLength: 255 },
		amount: { type: Number },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("promotional", Promotional);
