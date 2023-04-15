const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlug = require("mongoose-slug-generator");

mongoose.plugin(URLSlug);
const Product = new Schema({
	name: { type: String, maxLength: 255 },
	introduce: { type: String, maxLength: 255 },
	description: { type: String, maxLength: 255 },
	slug: { type: String, slug: "name", unique: true },
});

module.exports = mongoose.model("Product", Product);
