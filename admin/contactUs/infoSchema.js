const mongoose = require("mongoose");

const siteInfoSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt sahələri əlavə edir
  }
);

module.exports = mongoose.model("SiteInfo", siteInfoSchema);
