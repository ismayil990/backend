const cron = require("node-cron");
const Post = require("./PostSchema");

// Hər gün saat 03:00-da 1 aydan köhnə elanları sil
cron.schedule("0 3 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await Post.deleteMany({
      createdAt: { $lt: oneMonthAgo },
    });

    console.log(`${result.deletedCount} 1 aydan köhnə elan silindi.`);
  } catch (err) {
    console.error("Cron job xətası:", err);
  }
});
