const cron = require("node-cron");
const Post = require("./PostSchema");

// Hər gün saat 03:00-da bütün elanların tarixini yenilə
cron.schedule("* * * * *", async () => {
  try {
    const allPosts = await Post.find();

    for (let post of allPosts) {
      post.createdAt = new Date(); // cari tarixi yaz
      await post.save();
    }

    console.log(`${allPosts.length} elan yeniləndi (önə çıxarıldı).`);
  } catch (err) {
    console.error("Cron job xətası:", err);
  }
});
