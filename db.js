const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://igulmaliyev99:xKFuT2MDLNbSdk8x@cluster0.qzki9sf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB bağlantısı uğurlu");
  } catch (err) {
    console.error("MongoDB bağlantı xətası:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
