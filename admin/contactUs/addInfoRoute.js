const express = require("express");
const router = express.Router();
const SiteInfo = require("./infoSchema");
const isAdmin = require("../../middleware/isAdmin"); 


router.get("/siteinfo", async (req, res) => {
  try {
    const siteInfo = await SiteInfo.findOne();
    if (!siteInfo) return res.status(404).json({ message: "Site info tapılmadı" });
    res.json(siteInfo);
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
});

router.post("/siteinfo", isAdmin, async (req, res) => {
  try {
    const { number, email, address } = req.body;

    let siteInfo = await SiteInfo.findOne();

    if (siteInfo) {
      siteInfo.number = number;
      siteInfo.email = email;
      siteInfo.address = address;
      await siteInfo.save();
      return res.json({ message: "Site məlumatları yeniləndi", siteInfo });
    }

    
    siteInfo = new SiteInfo({ siteName, number, email, address });
    await siteInfo.save();
    res.status(201).json({ message: "Site məlumatları yaradıldı", siteInfo });
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
});

module.exports = router;
