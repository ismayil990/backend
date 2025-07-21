const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
views: { type: Number, default: 0 },
contactCount: { type: Number, default: 0 },
premium: { type: Boolean, default: false },
premiumExpiresAt: { type: Date },
 price: { type: Number },

}, { 
  strict: false,
  timestamps: true  
});

module.exports = mongoose.model("Post", postSchema);