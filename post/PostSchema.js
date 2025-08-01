const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
views: { type: Number, default: 0 },
contactCount: { type: Number, default: 0 },
premium: { type: Boolean, default: false },
premiumExpiresAt: { type: Date },
 price: { type: Number },
 isApproved:{type:Boolean, default:false},
 bumpedAt: {
    type: Date,
    default: Date.now, // başlanğıc olaraq yaradılma anı
  }
}, { 
  strict: false,
  timestamps: true  
});

module.exports = mongoose.model("Post", postSchema);