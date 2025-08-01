const express = require('express');
const router = express.Router();
const Report = require('./reportSchema');


router.post('/reports', async (req, res) => {
  try {
    const { postId, reason } = req.body;

    if (!postId || !reason) {
      return res.status(400).json({ message: 'postId və reason tələb olunur' });
    }

    const report = new Report({ postId, reason });
    await report.save();

    res.status(201).json({ message: 'Şikayət göndərildi', report });
  } catch (err) {
    console.error('Şikayət xətası:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
});


router.delete("/reports/by-post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await Report.deleteMany({ postId });
    res.json({ message: "Şikayətlər silindi", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Silinmə zamanı xəta:", err);
    res.status(500).json({ message: "Server xətası" });
  }
});

module.exports = router;
