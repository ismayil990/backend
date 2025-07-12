const express = require("express");
const router = express.Router();
const FormConfig = require("./FormConfigSchema");

// Bütün konfiqləri gətir
router.get("/formconfigs", async (req, res) => {
  const configs = await FormConfig.find();
  res.json(configs);
});

// Bir category konfiqini gətir
router.get("/formconfigs/:category", async (req, res) => {
  console.log(req.params.categoryId)
  try {
    const config = await FormConfig.findOne({ category: req.params.category});
    if (!config) return res.status(404).json({ error: "Tapılmadı" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Server xətası" });
  }
});

// Yeni category config əlavə et
router.post("/formconfigs", async (req, res) => {
  const newConfig = new FormConfig(req.body);
  await newConfig.save();
  res.status(201).json(newConfig);
});

// Mövcud category config-i update et
router.put("/formconfigs/:category", async (req, res) => {
  const updatedConfig = await FormConfig.findOneAndUpdate(
    { category: req.params.category },
    { $set: req.body },
    { new: true }
  );
  res.json(updatedConfig);
});

router.patch("/formconfigs/:category/removeField", async (req, res) => {
  const { fieldIndex } = req.body;

  const config = await FormConfig.findOne({ category: req.params.category });
  if (!config) return res.status(404).json({ error: "Config tapılmadı" });

  config.fields.splice(fieldIndex, 1);
  await config.save();

  res.json(config);
});


router.patch("/formconfigs/:category/updateOptions", async (req, res) => {


  const { fieldIndex, options } = req.body;
  const category = req.params.category;

  const config = await FormConfig.findOne({ category });
  if (!config) {
    console.log("Config tapılmadı:", category);
    return res.status(404).json({ error: "Config tapılmadı" });
  }

  if (!config.fields[fieldIndex]) {
    console.log("Field tapılmadı:", fieldIndex);
    return res.status(404).json({ error: "Field tapılmadı" });
  }

  config.fields[fieldIndex].options = options;
  await config.save();

  res.json(config);
});
module.exports = router;
