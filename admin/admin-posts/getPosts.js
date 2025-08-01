// routes/admin.js və ya hər hansı admin route faylına əlavə et
const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const nodemailer = require("nodemailer");
const Post = require("../../post/PostSchema"); // Post modeli
const isAdmin=require("../../middleware/isAdmin")

// Əgər populate edəcəksənsə

// Admin üçün bütün elanları gətir
router.get("/admin/posts", async (req, res) => {
  try {
    const posts = await Post.find({isApproved:true})// istifadəçi adı və emailini əlavə et
      .sort({ createdAt: -1 }); // yeni elanlar əvvəl

    res.json(posts);
  } catch (err) {
    console.error("Elanlar alınamadı:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});


router.get("/admin/new-posts", async (req, res) => {
  try {
    const posts = await Post.find({isApproved:false})// istifadəçi adı və emailini əlavə et
      .sort({ createdAt: -1 }); // yeni elanlar əvvəl

    res.json(posts);
  } catch (err) {
    console.error("Elanlar alınamadı:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});


//Elan tesdiqləmə endpointi 
router.put("/admin/posts/:id/approve",isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const updated = await Post.findByIdAndUpdate(
      postId,
      { isApproved: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Post tapılmadı" });

    // İstifadəçi emaili varsa, email göndər
    if (updated.email) {
      // Nodemailer transporter (öz SMTP məlumatlarınla əvəz et)
      const transporter = nodemailer.createTransport({
        service: "gmail", // və ya "yandex", "outlook", öz SMTP
        auth: {
          user: "shiwakitv956@gmail.com", // öz email
          pass: "fdtm olna aedg drko",   // Gmail üçün App Password
        },
      });

      const mailOptions = {
        from: "shiwakitv956@gmail.com",
        to: updated.email,
        subject: "Elanınız təsdiqləndi ✔️",
        text: `Salam, ${updated.name}!\n\n Mobi-X saytında yerləşdirdiyiniz ${updated.post_title} adlı elanınız təsdiqləndi və saytda aktivdir.
        ELana baxmaq üçün linkə keçid edin:
        ${`http://localhost:5174/product/${updated._id}`}
        \n\nTəşəkkür edirik.`,
      };

      await transporter.sendMail(mailOptions);
    }
    res.json({ message: "Təsdiqləndi və email göndərildi", post: updated });
  } catch (err) {
    console.error("Təsdiqləmə/email xətası:", err);
    res.status(500).json({ message: "Xəta baş verdi" });
  }
});




router.post("/posts/:id/reject", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    // Cloudinary şəkillərini sil
    if (post.images && post.images.length > 0) {
      for (const imageUrl of post.images) {
        // URL-dən public_id çıxarılması (cloudinary URL formata görə)
        // Misal URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/imageName.jpg
        const urlParts = imageUrl.split("/");
        const fileWithExt = urlParts[urlParts.length - 1]; // imageName.jpg
        const fileName = fileWithExt.split(".")[0];         // imageName
        const folder = urlParts[urlParts.length - 2];       // folder (əgər varsa)

        // public_id qururuq: folder/imageName və ya sadəcə imageName
        const publicId = folder ? `${folder}/${fileName}` : fileName;

        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(`Cloudinary şəkil silinmə xətası: ${publicId}`, err);
          // Burada xətanı qeyd edib davam edə bilərsən, post silinməsini dayandırmayaq
        }
      }
    }

    // Postu DB-dən sil
    await Post.deleteOne({ _id: id });

    // Email göndər
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shiwakitv956@gmail.com",
        pass: "fdtm olna aedg drko",
      },
    });

    const mailOptions = {
      from: "shiwakitv956@gmail.com",
      to: post.email,
      subject: "Elanınız rədd edildi",
      html: `<p>Salam, ${post.name}</p>
             <p>“${post.post_title}” başlıqlı elanınız moderator tərəfindən rədd edildi.</p>
             <p><b>Səbəb:</b> ${reason}</p>
             <p>Əlavə sualınız varsa bizimlə əlaqə saxlayın <a href="tel://+994773184121">+994773184121</a>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Elan silindi, şəkillər Cloudinary-dən silindi və email göndərildi" });
  } catch (err) {
    console.error("Rədd edilmə xətası:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});



function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // regex-də xüsusi simvolları escape edir
}

router.get("/admin/posts/search-by-contact", async (req, res) => {
  const number = req.query.number;
  if (!number) return res.status(400).json({ error: "Number is required" });
console.log(req.query.number)
  try {
const safeNumber = escapeRegex(number);
const posts = await Post.find({
  contact: { $exists: true, $type: "string", $regex: safeNumber, $options: "i" }
}).sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    console.log(err)
  }
});

router.get("/admin/posts/search-by-id", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "ID daxil edilməyib." });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Elan tapılmadı." });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error("ID ilə axtarış xətası:", err.message);
    return res.status(500).json({ message: "Server xətası." });
  }
});

function getPublicIdFromUrl(url) {
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex === -1) return null;

  const publicIdParts = parts.slice(uploadIndex + 1);

 
  if (publicIdParts[0].startsWith('v')) {
    publicIdParts.shift();
  }


  const fileName = publicIdParts.pop();
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

  publicIdParts.push(fileNameWithoutExt);

  return publicIdParts.join('/');
}

router.delete('/admin/posts/:id', isAdmin, async (req, res) => {
  const postId = req.params.id;

  try {
    const deletedPost = await Post.findById(postId);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Elan tapılmadı' });
    }

    // Cloudinary şəkillərini sil
  if (deletedPost.images && deletedPost.images.length > 0) {
  for (const imageUrl of deletedPost.images) {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error("Public ID tapılmadı:", imageUrl);
      continue;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Şəkil uğurla silindi: ${publicId}`);
    } catch (err) {
      console.error(`Cloudinary şəkil silmə xətası: ${publicId}`, err);
    }
  }
}

 
    await Post.deleteOne({ _id: postId });

    res.json({ message: 'Elan uğurla silindi' });
  } catch (err) {
    console.error('Elan silmə xətası:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
});

module.exports = router;
