const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // test secret key
const Post = require("../post/PostSchema");

// Payment intent yaradıb client secret göndərir
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { postId } = req.body;
    console.log(postId)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500, // 5 AZN
      currency: "azn",
      payment_method_types: ["card"],
      metadata: { postId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment intent xətası:", error);
    res.status(500).json({ error });
  }
});

// Webhook endpoint


router.post("/mark-premium", async (req, res) => {
  const { postId } = req.body;
 console.log("Mark premium üçün gələn postId:", postId);
  try {
    await Post.findByIdAndUpdate(postId, {
      premium: true,
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({ message: "Elan premium oldu" });
  } catch (error) {
    console.error("Premium etmə xətası:", error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
});

module.exports = router;