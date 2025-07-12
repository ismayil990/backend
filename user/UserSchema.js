const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);