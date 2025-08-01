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
const Category = require("../Category/models/Category");

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
      from:"+12316818115"
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
 // bunu yuxarıda import etməyi unutma

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

router.post("/posts", upload.array("images"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    const { contact, name, email, otp, price, category, brand, model, ...rest } = formData;

    const priceNum = price && !isNaN(price) ? Number(price) : undefined;

    if (!verifyOtp(contact, otp)) {
      return res.status(400).json({ message: "OTP səhvdir və ya müddəti bitib" });
    }
    deleteOtp(contact);

    let user = await User.findOne({ contact });
    if (!user) {
      user = new User({ contact, name, email });
      await user.save();
    }

    let imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    
 if (category && brand && model && brand !== "Digər") {
  let formattedModel = capitalizeWords(model);

  const categoryDoc = await Category.findOne({ name: category });

  if (categoryDoc) {
    const brandObj = categoryDoc.brands.find((b) => b.name === brand);

    if (brandObj) {
      const modelExists = brandObj.models.some(
        (m) => m.toLowerCase() === formattedModel.toLowerCase()
      );

      if (!modelExists) {
        brandObj.models.push(formattedModel);
        await categoryDoc.save();
      }
    }
  }
}
    const newPost = new Post({
      ...rest,
      contact,
      name,
      email,
      price: priceNum,
      category,
      brand,
      model,
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

    const filter = { isApproved: true }; // ✅ Yalnız təsdiqlənmiş elanlar

    if (categoryName.toLowerCase() !== "bütün elanlar") {
      filter.category = categoryName;
    }

    const posts = await Post.aggregate([
      { $match: filter },
      { $sort: { premium: -1, bumpedAt: -1 } },
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





router.post("/search-advanced", async (req, res) => {
  try {
    const filters = req.body;
    console.log("Filters:", filters);

    const query = {};

    // Qiymət intervalı (minprice və maxprice)
    if (filters.minprice || filters.maxprice) {
      const min = Number(filters.minprice);
      const max = Number(filters.maxprice);

      query.price = {};

      if (!isNaN(min)) {
        query.price.$gte = min;
      }

      if (!isNaN(max)) {
        query.price.$lte = max;
      }

      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Digər sahələri regex ilə dinamik əlavə et, mecburi etmədən
    for (const key in filters) {
      if (
        filters[key] &&
        key !== "minprice" &&
        key !== "maxprice"
      ) {
        query[key] = {
          $regex: new RegExp("^" + filters[key] + "$", "i"),
        };
      }
    }

    console.log("Query:", query);

    const results = await Post.find(query).sort({premium:-1, createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/delete-post/:id", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;

    // Elanı tapırıq
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post tapılmadı" });
    }

    // İstəyə bağlı olaraq postun sahibini yoxlamaq olar, məsələn:
    // if (post.user.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Sizin icazəniz yoxdur" });
    // }

    // Şəkilləri Cloudinary-dən silək
    if (post.images && post.images.length > 0) {
      for (const imageUrl of post.images) {
        const urlParts = imageUrl.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const fileName = fileWithExt.split(".")[0];
        const folder = urlParts[urlParts.length - 2];
        const publicId = folder ? `${folder}/${fileName}` : fileName;

        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(`Cloudinary şəkil silmə xətası: ${publicId}`, err);
        }
      }
    }

    // Elanı DB-dən silək
    await Post.deleteOne({ _id: postId });

    res.status(200).json({ message: "Post uğurla silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xətası" });
  }
});





module.exports = router;
