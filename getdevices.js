const mongoose = require("mongoose");
const Category = require("./Category/models/Category");

mongoose.connect("mongodb+srv://igulmaliyev99:xKFuT2MDLNbSdk8x@cluster0.qzki9sf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function insertIphoneModelsToSmartfonCategory() {
  try {
    const models = [
  "Pad 3 Pro",
  "Pad SE",
  "Pad 3 Pro",
  "Pad 3 Matte Display Edition",
  "Pad Neo",
  "Pad 2",
  "Pad Air"
    ];

    // Smartfon kategorisini tap
    const category = await Category.findOne({ name: "Planşet" });

    if (!category) {
      console.error("❌ 'Smartfon' kategoriyası tapılmadı.");
      return;
    }

    // Mövcud iPhone brendini tap
    const iphoneBrand = category.brands.find(b => b.name === "Oppo");

    if (!iphoneBrand) {
      console.error("❌ iPhone brendi 'Smartfon' kateqoriyasında mövcud deyil.");
      return;
    }

    // Dublikatları yoxla və yeni modelləri əlavə et
    const existingModelsSet = new Set(iphoneBrand.models || []);
    const newModels = models.filter(m => !existingModelsSet.has(m));

    if (newModels.length === 0) {
      console.log("ℹ️ Əlavə ediləcək yeni model yoxdur.");
    } else {
      iphoneBrand.models.push(...newModels);
      category.markModified("brands"); // <-- Əsas məqam
      await category.save();
      console.log("✅ Yeni iPhone modelləri uğurla əlavə olundu.");
    }
  } catch (err) {
    console.error("❌ Xəta baş verdi:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

insertIphoneModelsToSmartfonCategory();
