const express = require('express');
const router = express.Router();
const SiteSettings = require('./sitesettings');

// Tek bir site ayarı kaydetme/güncelleme için:
router.post('/site-settings', async (req, res) => {
  try {
    // Eğer sadece 1 tane kayıt olacaksa, önce bul ve güncelle
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/site-settings', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();

    if (!settings) {
      return res.status(404).json({ success: false, message: 'Site ayarları bulunamadı' });
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
