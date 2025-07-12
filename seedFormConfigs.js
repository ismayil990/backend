const mongoose = require("mongoose");
const FormConfig = require("./fields/FormConfigSchema");
const { fieldsConfig } = require("./fieldconfigs");
const connectDB = require("./db");

connectDB()

const seedConfigs = async () => {
  try {
    await FormConfig.deleteMany(); // Köhnələri silmək istəsən
    const categories = Object.keys(fieldsConfig);

    for (let category of categories) {
      const config = new FormConfig({
        category,
        fields: fieldsConfig[category],
      });
      await config.save();
    }

    console.log("Konfiqlər uğurla əlavə olundu!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Xəta:", err);
  }
};

seedConfigs();
