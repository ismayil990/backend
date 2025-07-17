const express = require("express");
const multer = require("multer");
const Post = require("./PostSchema");
const User = require("../user/UserSchema");
const cloudinary = require("./cloudinary");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { saveOtp, verifyOtp, deleteOtp } = require("./otpstore");
const authenticateToken = require("../middleware/authenticate");
const mongoose = require('mongoose');

// Twilio import
const twilio = require("twilio"); 

// Twilio credentials
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = twilio(accountSid, authToken);

// Cloudinary upload helper
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "elanlar" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

// Twilio ilə OTP göndərən endpoint
router.post("/send-otp", async (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ message: "Nömrə göndərilməyib" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await client.messages.create({
      body: `Sizin OTP kodunuz: ${otp}`,
      to: contact, 
      from:"+12312273565"// mütləq +99450xxxxxxx formatında olmalıdır // <-- Buraya öz Twilio nömrəni yaz
    });

    console.log(`OTP ${contact} nömrəsinə göndərildi: ${otp}`);

    saveOtp(contact, otp);

    res.json({ message: "OTP göndərildi" });
  } catch (error) {
    console.error("OTP göndərmə xətası:", error);
    res.status(500).json({ message: "OTP göndərilə bilmədi", error });
  }
});

// Elan əlavə etmə endpointi (OTP yoxlaması ilə)
router.post("/posts", upload.array("images"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    const { contact, name, email, otp } = formData;

    if (!verifyOtp(contact, otp)) {
      return res.status(400).json({ message: "OTP səhvdir və ya müddəti bitib" });
    }
    deleteOtp(contact);

    let user = await User.findOne({ contact });

    if (!user) {
      user = new User({
        contact,
        name,
        email,
      });
      await user.save();
    }

    let imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    const newPost = new Post({
      ...formData,
      images: imageUrls,
      user: user._id,
    });

    await newPost.save();

    res.status(201).json({
      message: "Elan uğurla əlavə olundu",
      post_id: newPost._id,
    });
  } catch (error) {
    console.error("Elan əlavə olunarkən xəta:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});

// Elanları çəkmə endpointi
router.get("/posts", async (req, res) => {
  try {
    const categoryName = req.query.category || "Bütün elanlar";
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 2;

    // filter obyektini hazırla
    const filter = {};

    if (categoryName.toLowerCase() !== "bütün elanlar") {
      filter.category = categoryName;
    }
    // əks halda filter boş qalacaq və bütün elanlar gələcək

    const posts = await Post.aggregate([
  { $match: filter },
  { $addFields: { premiumValue: { $ifNull: ["$premium", false] } } },
  { $sort: { premiumValue: -1, createdAt: -1 } },
  { $skip: skip },
  { $limit: limit }
]);

    res.json(posts);
  } catch (error) {
    console.error("Elanlar alınarkən xəta:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});




router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Elan detayı alınarkən xəta:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});

router.get("/my-posts", authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);;

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error("Postlar alına bilmədi:", error);
    res.status(500).json({ message: "Postlar alına bilmədi", error });
  }
});


router.get('/favorite-posts', async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(',') : [];
  if (!ids.length) return res.json([]);
  const posts = await Post.find({ _id: { $in: ids } });
  res.json(posts);
});



router.get("/search", async (req, res) => {
  const { q } = req.query;
console.log(q)
  if (!q) {
    return res.status(400).json({ error: "Arama terimi gereklidir." });
  }

  try {
    const results = await Post.find({
      post_title: { $regex: `^${q}`, $options: "i" }
    }).sort({ premium: -1 }); 

    res.json(results);
  } catch (err) {
    console.error("Arama hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});


module.exports = router;
