const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  id: Number,
  imageUrl: String,
  link: String,
});

const SiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  logoUrl: String,
  contactEmail: String,
  adsBanners: [BannerSchema],
  staticPages: {
    about: String,
    privacyPolicy: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
