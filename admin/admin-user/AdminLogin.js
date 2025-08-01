const express = require("express");
const router = express.Router();
const AdminUser = require("./AdminSchema"); 
const jwt = require("jsonwebtoken");

// Admin login
router.post("/admin/login", async (req, res) => {
  const { name, password } = req.body;
console.log("Gelen name:", name);
console.log("DB admin:", password);
  try {
    const admin = await AdminUser.findOne({ name });
    console.log(admin)
    if (!admin) {
      return res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }
    const token = jwt.sign(
      { id: admin._id, name: admin.name, role: admin.role },
      process.env.JWT_SECRET, // ENV üzerinden alınabilir
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.get("/verify-admin", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token yoxdur" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin deyilsiniz" });
    }

    // Uğurlu
    res.status(200).json({ message: "Admin təsdiqləndi", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Token etibarsızdır" });
  }
});

module.exports = router;
