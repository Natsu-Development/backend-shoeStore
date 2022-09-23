const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlug = require("mongoose-slug-generator");

mongoose.plugin(URLSlug);
const Product = new Schema({
	name: { type: String, maxLength: 255 },
	// arrayCategoryId: [],
	introduce: { type: String, maxLength: 255 },
	description: { type: String, maxLength: 255 },
	arrayImage: [],
	amount: { type: Number },
	// size: [],
	price: { type: String },
	slug: { type: String, slug: "name", unique: true },
});

module.exports = mongoose.model("Product", Product);
