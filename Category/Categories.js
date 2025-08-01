// routes/categories.js
const express = require("express");
const router = express.Router();
const Category=require("../Category/models/Category")
const isAdmin = require("../middleware/isAdmin");

// Kategori listele


router.get("/categories/full", async (req, res) => {
  try {
    const categories = await Category.find();

    const fullData = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      brands: cat.brands.map(brand => ({
        _id: brand._id,
        name: brand.name,
        models: brand.models
      }))
    }));

    res.json(fullData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Sunucu hatası", error: e.message });
  }
});



router.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Yeni kategori ekle
router.post("/categories",isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Kategori zaten var" });

    const category = new Category({ name, brands: [] });
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Marka ekle
router.post("/:categoryId/brands",isAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { brandName } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Kategori bulunamadı" });

    if (category.brands.some(b => b.name === brandName)) {
      return res.status(400).json({ message: "Marka zaten var" });
    }

    category.brands.push({ name: brandName, models: [] });
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Model ekle
router.post("/:categoryId/brands/:brandId/models",isAdmin, async (req, res) => {
  try {
    const { categoryId, brandId } = req.params;
    const { modelName } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Kategori bulunamadı" });

    const brand = category.brands.id(brandId);
    if (!brand) return res.status(404).json({ message: "Marka bulunamadı" });

    if (brand.models.includes(modelName)) {
      return res.status(400).json({ message: "Model zaten var" });
    }

    brand.models.push(modelName);
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Diğer update/delete endpoint'leri benzer şekilde yapılabilir

module.exports = router;