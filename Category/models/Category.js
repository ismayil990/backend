// models/Category.js
const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  models: { type: [String], default: [] },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  brands: { type: [BrandSchema], default: [] },
});

module.exports = mongoose.model("Category", CategorySchema);
