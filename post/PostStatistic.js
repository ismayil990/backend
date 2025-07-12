const express = require("express");
const Post = require("./PostSchema");
const authenticateToken = require("../middleware/authenticate");
const mongoose = require('mongoose');

const router = express.Router();
router.get("/views-stats", authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Bütün postları tapırıq
    const posts = await Post.find({ user: userId });

    // Total views hesablayırıq
    const totalViews = posts.reduce((sum, post) => {
      return sum + (post.views || 0);
    }, 0);

    // Total post sayı
    const totalPosts = posts.length;

    // Total contact count hesablayırıq
    const totalContacts = posts.reduce((sum, post) => {
      return sum + (post.contactCount || 0);
    }, 0);

    res.json({ totalViews, totalPosts, totalContacts });
  } catch (error) {
    console.error("Statistika alınarkən xəta:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});


router.post("/posts/:id/contact", async (req, res) => {
  try {
    const postId = req.params.id;

    // Contact sayını +1 artırırıq
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { contactCount: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json({ message: "Əlaqə sayısı artırıldı", contactCount: post.contactCount });
  } catch (error) {
    console.error("Əlaqə sayı artırıla bilmədi:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});

module.exports = router;