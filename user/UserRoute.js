const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const User = require("./UserSchema");
const Post = require("../post/PostSchema");
const { saveOtp, verifyOtp, deleteOtp } = require("../post/otpstore");
const authenticateToken = require("../middleware/authenticate");
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET;


// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const fromNumber = "+12316818115"; // Twilio'dan aldığın nömrə

// 📌 1️⃣ OTP göndər
router.post("/send-otp-number", upload.none(), async (req, res) => {
  const { contact } = req.body;
  if (!contact)
    return res.status(400).json({ message: "Nömrə tələb olunur" });

  // 📌 Əvvəl user yoxla
  const user = await User.findOne({ contact });
  if (!user)
    return res.status(404).json({ message: "Bu nömrə ilə istifadəçi tapılmadı.Hesab açmaq üçün bir elan yerləşdirin" });

  // 📌 OTP yaradıb göndər
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  client.messages
    .create({
      body: `Sizin OTP kodunuz: ${otp}`,
      from: fromNumber,
      to: contact,
    })
    .then(() => {
      saveOtp(contact, otp);
      res.json({ message: "OTP göndərildi" });
    })
    .catch((err) => {
      console.error("OTP göndərmə xətası:", err);
      res.status(500).json({ message: "OTP göndərilə bilmədi"});
    });
});

// 📌 2️⃣ OTP yoxla və login et
router.post("/verify-otp", upload.none(), async (req, res) => {
  const { contact, otp } = req.body;
  if (!contact || !otp)
    return res.status(400).json({ message: "Əlaqə və OTP lazımdır" });

  if (!verifyOtp(contact, otp))
    return res.status(400).json({ message: "OTP səhvdir və ya vaxtı bitib" });

  let user = await User.findOne({ contact });

  if (!user) {
    user = await User.create({ contact }); // Elan zamanı ad və email update olunar
  }

  const token = jwt.sign(
    { id: user._id, contact: user.contact,email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  deleteOtp(contact);

  res.json({ message: "Daxil oldunuz", token, user });
});

router.get("/verify-user", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Token yoxdur" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Token etibarsızdır" });

      const userContact = decoded.contact;  // token-dən contact al

      // contact sahəsinə görə user tap
      const user = await User.findOne({ contact: userContact }).select("-password");

      if (!user)
        return res.status(404).json({ message: "İstifadəçi tapılmadı" });

      res.json({
        email: user.email,
        name: user.name,
        contact: user.contact,
        // lazım olsa başqa sahələr
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xətası" });
  }
});


router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Token-dən gələn user ID

    // 1. İstifadəçini sil
    await User.findByIdAndDelete(userId);

    // 2. O istifadəçiyə aid bütün postları sil
   await Post.deleteMany({ user: mongoose.Types.ObjectId(userId) });

    res.status(200).json({ message: "Hesab və elanlar uğurla silindi" });
  } catch (error) {
    console.error("Hesab silmə xətası:", error);
    res.status(500).json({ message: "Serverdə xəta baş verdi" });
  }
});

module.exports = router;