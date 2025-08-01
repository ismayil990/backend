// models/About.js
const mongoose = require("mongoose");

const termSchema = new mongoose.Schema(
  {
    terms: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Terms", termSchema);
