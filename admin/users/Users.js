const express = require('express')
const router = express.Router()
const User = require('../../user/UserSchema') // ← kendi path'ine göre düzelt
const isAdmin=require("../../middleware/isAdmin")

// Tüm kullanıcıları getir
// Express endpoint örnəyi
router.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().skip(skip).limit(limit);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
  });
});

router.get('/users/search-by-number', async (req, res) => {
  const number = req.query.number;
  if (!number) return res.status(400).json({ error: 'Number is required' });

  try {
    const users = await User.find({ contact: { $regex: number, $options: 'i' } }); // çarpaz uyğunluq üçün
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



router.delete('/users/:id',isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
    }
    res.json({ message: 'İstifadəçi uğurla silindi' });
  } catch (err) {
    console.error('İstifadəçi silmə xətası:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
});



module.exports = router
