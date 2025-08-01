// routes/about.js
const express = require("express");
const router = express.Router();
const About = require("./aboutSchema");
const isAdmin=require("../../middleware/isAdmin")

router.post("/about",isAdmin, async (req, res) => {
  const { about } = req.body;

  if (!about) {
    return res.status(400).json({ error: "Mətn göndərilməyib." });
  }

  try {
    const updated = await About.findOneAndUpdate(
      {},
      { about },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("About saxlanılarkən xəta:", error);
    res.status(500).json({ error: "Server xətası" });
  }
});


router.get("/about", async (req, res) => {
  try {
    const aboutDoc = await About.findOne({});
    if (!aboutDoc) {
      return res.status(404).json({ error: "About məlumatı tapılmadı" });
    }

    res.status(200).json({ about: aboutDoc.about });
  } catch (error) {
    console.error("About məlumatı alınarkən xəta:", error);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = router;
