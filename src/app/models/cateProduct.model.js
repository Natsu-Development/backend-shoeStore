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

// sell for category
// articleSchema.pre("save", function(next) {
//     this.slug = this.title.split(" ").join("-");
//     next();
//   });

module.exports = mongoose.model("CategoryProduct", CategoryProduct);
