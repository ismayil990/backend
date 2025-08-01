// routes/about.js
const express = require("express");
const router = express.Router();
const Term= require("./termsSchema");
const isAdmin=require("../../middleware/isAdmin")
// Yeni "about" mətni əlavə et və ya mövcud olanı yenilə
router.post("/terms",isAdmin, async (req, res) => {
  const { terms } = req.body;

  if (!terms) {
    return res.status(400).json({ error: "Mətn göndərilməyib." });
  }

  try {
    // Mövcud about sənədi varsa onu yenilə, yoxdursa yenisini yarat
    const updated = await Term.findOneAndUpdate(
      {},
      { terms },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("About saxlanılarkən xəta:", error);
    res.status(500).json({ error: "Server xətası" });
  }
});


router.get("/terms", async (req, res) => {
  try {
    const terms = await Term.findOne({});
    if (!terms) {
      return res.status(404).json({ error: "Məlumatı tapılmadı" });
    }

    res.status(200).json({ terms: terms.terms });
  } catch (error) {
    console.error("About məlumatı alınarkən xəta:", error);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = router;
