const express = require("express");
const router = express.Router();
const Report = require("../../reports/reportSchema");

// GET /reports - Bütün şikayətləri siyahıla
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Şikayətlər alınarkən xəta:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

// POST /reports - Yeni şikayət əlavə 

// DELETE /reports/:id - Şikayəti sil
router.delete("/delete-report:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.sendStatus(204); // No Content
  } catch (err) {
    console.error("Şikayət silinərkən xəta:", err);
    res.status(500).json({ error: "Silme xətası" });
  }
});

module.exports = router;
