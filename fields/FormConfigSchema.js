const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  name: String,
  label: String,
  type: String,
  options: [String]
});

const formConfigSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  fields: [fieldSchema]
}, { timestamps: true });

module.exports = mongoose.model("FormConfig", formConfigSchema);
