const cron = require("node-cron");
const Post = require("./PostSchema");

// Hər gün saat 03:00-da bütün elanların tarixini yenilə
cron.schedule("* * * * *", async () => { // hər gün saat 3-də
  try {
    const allPosts = await Post.find();

    for (let post of allPosts) {
      post.bumpedAt = new Date(); // bumpedAt-ı cari tarixə yenilə
      await post.save();
    }

    console.log(`${allPosts.length} elan bumpedAt tarixi yeniləndi.`);
  } catch (err) {
    console.error("Cron job xətası:", err);
  }
});
