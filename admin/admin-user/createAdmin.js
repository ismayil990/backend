const express = require("express");
const router = express.Router();
const AdminUser = require("./AdminSchema"); // Schema yolunu düz yaz
const bcrypt = require("bcryptjs");
const isAdmin = require("../../middleware/isAdmin");

// Yeni admin yaratma endpointi
router.post("/create-admin",  isAdmin, async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "İstifadəçi adı və şifrə tələb olunur." });
  }

  try {
    const existingAdmin = await AdminUser.findOne({ name });
    if (existingAdmin) {
      return res.status(409).json({ message: "Bu istifadəçi adı ilə admin artıq mövcuddur." });
    }


    const newAdmin = new AdminUser({
      name,
      password,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Yeni admin uğurla yaradıldı.", admin: { name: newAdmin.name } });
  } catch (err) {
    console.error("Yeni admin yaratma xətası:", err);
    res.status(500).json({ message: "Server xətası." });
  }
});

module.exports = router;
