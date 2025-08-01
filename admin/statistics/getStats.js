const express = require('express');
const router = express.Router();
const User = require('../../user/UserSchema');
const Post = require('../../post/PostSchema');

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();

    // Son 7 gün əvvəlki tarix
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    // Ayın başı
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // İstifadəçi statistikası
    const userStats = await User.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          weeklyUsers: [
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $count: "count" }
          ],
          monthlyUsers: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" }
          ],
        },
      },
      {
        $project: {
          totalUsers: { $ifNull: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0] },
          weeklyUsers: { $ifNull: [{ $arrayElemAt: ["$weeklyUsers.count", 0] }, 0] },
          monthlyUsers: { $ifNull: [{ $arrayElemAt: ["$monthlyUsers.count", 0] }, 0] },
        },
      },
    ]);

    // Elan (post) statistikası
    const postStats = await Post.aggregate([
      {
        $facet: {
          totalPosts: [{ $count: "count" }],
          weeklyPosts: [
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $count: "count" }
          ],
          monthlyPosts: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" }
          ],
        },
      },
      {
        $project: {
          totalPosts: { $ifNull: [{ $arrayElemAt: ["$totalPosts.count", 0] }, 0] },
          weeklyPosts: { $ifNull: [{ $arrayElemAt: ["$weeklyPosts.count", 0] }, 0] },
          monthlyPosts: { $ifNull: [{ $arrayElemAt: ["$monthlyPosts.count", 0] }, 0] },
        },
      },
    ]);

    // Hər iki statistik nəticəni bir yerdə qaytar
    res.json({
      totalUsers: userStats[0].totalUsers,
      weeklyUsers: userStats[0].weeklyUsers,
      monthlyUsers: userStats[0].monthlyUsers,
      totalPosts: postStats[0].totalPosts,
      weeklyPosts: postStats[0].weeklyPosts,
      monthlyPosts: postStats[0].monthlyPosts,
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ error: "Statistikalar alınamadı" });
  }
});

module.exports = router;
